// The site's structured content: links, logos, icons, skills and repositories. The prose is in
// src/page.mjs. Facts still to come from Chris are listed in CONTENT-TODO.md.

export const SITE = {
	url: 'https://chrisjowen.net',
	name: 'Chris Owen',
	title: 'Chris Owen · AI platforms and agentic engineering',
	description:
		'Chris Owen, software architect in Singapore, on the AI platform team at GIC. Writing about AI agents and building Wheelhouse, docket and improve.',
	linkedin: 'https://www.linkedin.com/in/christopher-owen-70768013/',
	github: 'https://github.com/chrisjowen',
	medium: 'https://medium.com/@cowen'
};

// Employer and client logos for the "Worked at and with" strip, in order. `h` is the display height in
// pixels. `colour` says where hovering may show the original colours: on the dark theme, the light
// theme, both, or `badge` (a dark badge that stays greyscale until hovered). See assets/README.md for sources.
export const LOGOS = [
	{ key: 'gic', name: 'GIC', file: 'gic.svg', h: 30, colour: ['light'] },
	{ key: 'citi', name: 'Citi', file: 'citi.svg', h: 28, colour: ['dark', 'light'] },
	{ key: 'standardchartered', name: 'Standard Chartered', file: 'standardchartered.svg', h: 32, colour: ['dark', 'light'] },
	{ key: 'uncharted', name: 'Uncharted', wordmark: 'UNCHARTED' },
	{ key: 'thoughtworks', name: 'Thoughtworks', file: 'thoughtworks.png', h: 22, colour: ['light'] },
	{ key: 'mckinsey', name: 'McKinsey & Company', file: 'mckinsey.svg', h: 20, colour: ['light'] },
	{ key: 'sky', name: 'Sky', file: 'sky.svg', h: 40, colour: ['light'] },
	{ key: 'guardian', name: 'The Guardian', file: 'guardian.svg', h: 28, colour: ['light'] },
	{ key: 'equalexperts', name: 'Equal Experts', file: 'equalexperts.svg', h: 28, colour: ['dark'] },
	{ key: 'sensis', name: 'Sensis', file: 'sensis.png', h: 34, colour: 'badge' }
];

// Brand icons (simple-icons, in assets/icons/) and the colour each shows in the skills list.
export const ICONS = {
	github: null,
	linkedin: null,
	medium: null,
	claude: '#d97757',
	temporal: null,
	amazonwebservices: '#ff9900',
	databricks: '#ff3621',
	typescript: '#3178c6',
	nodedotjs: '#5fa04e',
	scala: '#dc322f',
	dotnet: '#8a6ee8',
	elixir: '#a07cc5',
	phoenixframework: '#fd4f00',
	ruby: '#cc342d',
	python: '#4b8bbe',
	svelte: '#ff3e00',
	vuedotjs: '#42b883',
	googlecloud: '#4285f4',
	docker: '#2496ed',
	kubernetes: '#4f7fe0',
	istio: '#466bb0',
	k3s: '#ffc61c',
	terraform: '#844fba',
	ansible: '#e00',
	jenkins: '#d24939',
	teamcity: '#4ba3f5'
};

// Skills, by group. An entry with an icon shows it; a plain string gets an amber dot.
export const SKILLS = [
	{
		group: 'AI and agents',
		items: [
			['Claude Code', 'claude'],
			'Agent skills and evals',
			'Agent memory',
			'MCP',
			'Multi-agent workflows',
			['Temporal', 'temporal'],
			['AgentCore', 'amazonwebservices'],
			['Databricks', 'databricks']
		]
	},
	{
		group: 'Languages and frameworks',
		items: [
			['TypeScript', 'typescript'],
			['Node.js', 'nodedotjs'],
			['Scala / JVM', 'scala'],
			['.NET / C#', 'dotnet'],
			['Elixir', 'elixir'],
			['Phoenix', 'phoenixframework'],
			['Ruby', 'ruby'],
			['Python', 'python'],
			['Svelte', 'svelte'],
			['Vue', 'vuedotjs']
		]
	},
	{
		group: 'Cloud, DevOps and automation',
		items: [
			['AWS', 'amazonwebservices'],
			['Google Cloud', 'googlecloud'],
			['Docker', 'docker'],
			['Kubernetes', 'kubernetes'],
			['Istio', 'istio'],
			['k3s', 'k3s'],
			['Terraform', 'terraform'],
			['Ansible', 'ansible'],
			['Jenkins', 'jenkins'],
			['TeamCity', 'teamcity']
		]
	},
	{
		group: 'Practice',
		items: [
			'Architecture and system design',
			'Internal developer platforms',
			'Innersource',
			'TDD, BDD and ATDD',
			'Agile coaching',
			'Mentoring',
			'Technical analysis'
		]
	}
];

// GitHub's language colours, for the repository cards.
export const LANGS = {
	TypeScript: '#3178c6',
	Shell: '#89e051',
	JavaScript: '#f1e05a',
	'C#': '#178600',
	Elixir: '#a07cc5'
};

export const REPOS = [
	{
		name: 'casebook',
		url: 'https://github.com/chrisjowen/casebook',
		text: 'Define, visualise and run human-in-the-loop business processes as cases, with agents working cases over MCP.',
		lang: 'TypeScript',
		meta: '2026'
	},
	{
		name: 'skill-evaluator',
		url: 'https://github.com/chrisjowen/skill-evaluator',
		text: 'Create, evaluate and promote Anthropic skills through performance-based assessment in simulated environments.',
		lang: 'Shell',
		meta: '2026'
	},
	{
		name: 'share-previews-wheelhouse',
		url: 'https://github.com/chrisjowen/share-previews-wheelhouse',
		text: 'Wheelhouse plugin: share a live preview as a password-protected HTTPS link through your own k3s cluster.',
		meta: 'plugin · 2026'
	},
	{
		name: 'pr-review-wheelhouse',
		url: 'https://github.com/chrisjowen/pr-review-wheelhouse',
		text: 'Wheelhouse plugin: PR review as a guided, staged discussion with a local model.',
		lang: 'JavaScript',
		meta: 'plugin'
	},
	{
		name: 'dotless',
		url: 'https://github.com/dotless/dotless',
		text: '.NET port of the Ruby Less CSS library. Contributor, with 95 commits.',
		lang: 'C#',
		meta: '★ 694'
	},
	{
		name: 'Annotatable',
		url: 'https://github.com/chrisjowen/Annotatable',
		text: 'Add simple annotations to Elixir functions, to read and act on later.',
		lang: 'Elixir',
		meta: '★ 20'
	}
];
