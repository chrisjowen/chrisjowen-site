// The theme switch. The saved theme is applied before first paint by the inline script in <head>.
const root = document.documentElement;
document.getElementById('theme').addEventListener('click', () => {
	root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
	try {
		localStorage.setItem('theme', root.dataset.theme);
	} catch {}
});
