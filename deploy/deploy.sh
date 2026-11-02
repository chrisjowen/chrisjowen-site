#!/usr/bin/env bash
# Builds the site's image, imports it into the k3s node's containerd over SSH, applies the
# manifests with that image, waits for the rollout and checks the site.
#
# Usage: deploy/deploy.sh
# Needs: docker (with linux/amd64 builds), ssh access to the node, kubectl.
#   KUBECONFIG   the cluster's kubeconfig (default ~/.kube/hostinger-k3s.yaml)
#   DEPLOY_SSH   the node, as user@host (default root@72.62.255.106)
set -euo pipefail

cd "$(dirname "$0")/.."
export KUBECONFIG="${KUBECONFIG:-$HOME/.kube/hostinger-k3s.yaml}"
DEPLOY_SSH="${DEPLOY_SSH:-root@72.62.255.106}"
NODE="${DEPLOY_SSH#*@}"
HOST=chrisjowen.net
NS=chrisjowen-site

tag="$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
[ -z "$(git status --porcelain)" ] || tag="$tag-dirty"
image="chrisjowen-site:$tag"

echo "→ building $image"
docker build --platform linux/amd64 -f deploy/Dockerfile -t "$image" .

echo "→ importing it on $DEPLOY_SSH"
docker save "$image" | ssh "$DEPLOY_SSH" k3s ctr images import -

echo "→ applying deploy/k8s/site.yaml"
sed "s|image: chrisjowen-site:latest|image: $image|" deploy/k8s/site.yaml | kubectl apply -f -
kubectl -n "$NS" rollout status deploy/web --timeout=180s

# Through the node itself first, so this works before DNS points at the cluster.
echo "→ checking $HOST through $NODE"
for i in $(seq 1 12); do
	if curl -ksf -o /dev/null --resolve "$HOST:443:$NODE" "https://$HOST/healthz"; then break; fi
	[ "$i" = 12 ] && { echo "Traefik on $NODE does not route $HOST to the site" >&2; exit 1; }
	sleep 5
done
page="$(curl -ksSf --resolve "$HOST:443:$NODE" "https://$HOST/")"
[[ "$page" == *"<title>Chris Owen"* ]] || { echo "$NODE does not serve the site for $HOST" >&2; exit 1; }
www="$(curl -ksS -o /dev/null -w '%{http_code} %{redirect_url}' --resolve "www.$HOST:443:$NODE" "https://www.$HOST/")"
[ "$www" = "301 https://$HOST/" ] || { echo "www.$HOST answers '$www', not a redirect to https://$HOST/" >&2; exit 1; }
echo "✓ $NODE serves $image for $HOST and www.$HOST"

# Then the public address, which needs DNS and the certificate.
if [ "$(dig +short "$HOST" A | tail -1)" != "$NODE" ]; then
	echo "! $HOST does not resolve to $NODE yet; once DNS points here, cert-manager issues the certificate"
	echo "  (kubectl -n $NS get certificate chrisjowen-net-tls) and https://$HOST/ goes live"
	exit 0
fi
echo "→ checking https://$HOST/"
for i in $(seq 1 30); do
	if curl -fs -o /dev/null "https://$HOST/healthz"; then break; fi
	[ "$i" = 30 ] && { echo "https://$HOST/ is not answering over a valid certificate" >&2; exit 1; }
	sleep 10
done
echo "✓ https://$HOST/ serves $image"
