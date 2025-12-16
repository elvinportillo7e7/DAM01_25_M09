const I18N = (() => {
	const translations = {
		es: {
			"meta.title":"Portafolio M09 — Pedro",
			"header.name":"<Pedro />",
			"header.tagline":"Desarrollador — Me encanta JS moderno",
			"controls.theme":"Tema",
			"controls.lang":"EN",
			"about.title":"Sobre mí",
			"about.body":"Estudiante de DAM. Este portafolio muestra proyectos y ejercicios de M09 con una estética inspirada en editores de código.",
			"projects.title":"Proyectos",
			"projects.project1.title":"Proyecto 1",
			"projects.project1.desc":"Descripción breve del proyecto — tecnologías: HTML, CSS, JS.",
			"projects.project2.title":"Proyecto 2",
			"projects.project2.desc":"Ejercicio M09 — prácticas con APIs y DOM.",
			"projects.project3.title":"Proyecto 3",
			"projects.project3.desc":"Mini app con interacción avanzada y animaciones CSS.",
			"projects.view":"Ver",
			"footer.copyright":"© 2025 — Portafolio M09"
		},
		en: {
			"meta.title":"M09 Portfolio — Pedro",
			"header.name":"<Pedro />",
			"header.tagline":"Developer — I love modern JS",
			"controls.theme":"Theme",
			"controls.lang":"ES",
			"about.title":"About",
			"about.body":"DAM student. This portfolio showcases M09 projects and exercises with an editor-inspired aesthetic.",
			"projects.title":"Projects",
			"projects.project1.title":"Project 1",
			"projects.project1.desc":"Short project description — tech: HTML, CSS, JS.",
			"projects.project2.title":"Project 2",
			"projects.project2.desc":"M09 exercise — API and DOM practices.",
			"projects.project3.title":"Project 3",
			"projects.project3.desc":"Mini app with advanced interactions and CSS animations.",
			"projects.view":"View",
			"footer.copyright":"© 2025 — Portfolio M09"
		}
	};

	const get = (lang = 'es') => translations[lang] || translations.es;

	function apply(lang = 'es') {
		const dict = get(lang);
		document.querySelectorAll('[data-i18n]').forEach(el => {
			const key = el.getAttribute('data-i18n');
			if (!key) return;
			if (dict[key]) {
				// preserve original tags for code element
				if (el.tagName.toLowerCase() === 'code') el.innerHTML = dict[key];
				else el.textContent = dict[key];
			}
		});
		document.documentElement.lang = lang;
	}

	return { apply };
})();

const Theme = (() => {
	const key = 'pref-theme';
	function detectSystemDark() {
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	function getStored() {
		return localStorage.getItem(key);
	}
	function setTheme(theme) {
		if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
		else document.documentElement.removeAttribute('data-theme');
		localStorage.setItem(key, theme);
		const btn = document.getElementById('themeToggle');
		if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
	}
	function init() {
		const stored = getStored();
		if (stored) setTheme(stored);
		else setTheme(detectSystemDark() ? 'dark' : 'light');
	}
	return { init, setTheme, getStored };
})();

/* UI wiring */
document.addEventListener('DOMContentLoaded', () => {
	// i18n
	const langKey = 'pref-lang';
	const storedLang = localStorage.getItem(langKey) || (navigator.language?.startsWith('en') ? 'en' : 'es');
	I18N.apply(storedLang);

	// theme
	Theme.init();

	// controls
	const themeBtn = document.getElementById('themeToggle');
	const langBtn = document.getElementById('langToggle');

	themeBtn?.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
		const next = current === 'dark' ? 'light' : 'dark';
		Theme.setTheme(next);
	});

	langBtn?.addEventListener('click', () => {
		const current = document.documentElement.lang || 'es';
		const next = current === 'es' ? 'en' : 'es';
		localStorage.setItem('pref-lang', next);
		I18N.apply(next);
		langBtn.textContent = next === 'es' ? 'EN' : 'ES';
	});

	// set initial label for lang button
	langBtn && (langBtn.textContent = document.documentElement.lang === 'es' ? 'EN' : 'ES');

	// Easter egg: styled console message
	console.log(
		'%c👋 Hecho con pasión por el código',
		'background: linear-gradient(90deg,#61dafb,#ff79c6); color: #071022; padding:8px 12px; border-radius:8px; font-weight:700;'
	);
});
