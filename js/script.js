// I18N: diccionarios y función apply (comentarios en español)
const I18N = (() => {
	const dict = {
		es: {
			"meta.title":"Portafolio — Elvin (M09)",
			"header.name":"&lt;Elvin /&gt;",
			"header.course":"Lenguajes de marcas — M09",
			"header.instructor":"DAM01 — Profesora: Alicia Vázquez",
			"controls.theme":"Tema",
			"intro.title":"Organizador de prácticas",
			"intro.description":"Plantilla para organizar por temas los trabajos realizados en la asignatura.",
			"modules.title":"Módulos y temas",
			"module.js.badge":"M09","module.js.title":"JavaScript","module.js.sub":"Interactividad y DOM","module.js.desc":"Ejercicios con DOM, fetch, módulos ES y prácticas de M09.",
			"module.html.badge":"M04","module.html.title":"HTML / Lenguaje de marcas","module.html.sub":"Semántica y accesibilidad","module.html.desc":"Trabajos sobre semántica, validación y DTD.",
			"module.css.badge":"M09","module.css.title":"CSS Moderno","module.css.sub":"Layouts y variables","module.css.desc":"Plantillas, variables y animaciones responsivas.",
			"module.data.badge":"M09","module.data.title":"JSON / DTD","module.data.sub":"Intercambio y definición","module.data.desc":"Ejemplos de JSON para APIs y ejercicios con DTD/XML.",
			"module.link.notes":"Apuntes","module.link.git":"Deberes",
			"footer.author":"Código realizado por Elvin","footer.cc":"Profesor/a"
		},
		en: {
			"meta.title":"Portfolio — Elvin (M09)",
			"header.name":"&lt;Elvin /&gt;",
			"header.course":"Markup Languages — M09",
			"header.instructor":"DAM01 — Instructor: Alicia Vázquez",
			"controls.theme":"Theme",
			"intro.title":"Practices organizer",
			"intro.description":"Template to organize by topics all the works done in the subject.",
			"modules.title":"Modules & topics",
			"module.js.badge":"M09","module.js.title":"JavaScript","module.js.sub":"Interactivity & DOM","module.js.desc":"Exercises with DOM, fetch, ES modules and M09 practices.",
			"module.html.badge":"M04","module.html.title":"HTML / Markup Language","module.html.sub":"Semantics & accessibility","module.html.desc":"Tasks about semantics, validation and DTD.",
			"module.css.badge":"M09","module.css.title":"Modern CSS","module.css.sub":"Layouts & variables","module.css.desc":"Templates, variables and responsive animations.",
			"module.data.badge":"M09","module.data.title":"JSON / DTD","module.data.sub":"Exchange & definitions","module.data.desc":"JSON examples for APIs and exercises with DTD/XML.",
			"module.link.notes":"Notes","module.link.git":"Assignments",
			"footer.author":"Code by Elvin","footer.cc":"Instructor"
		},
		fr: {
			"meta.title":"Portfolio — Elvin (M09)",
			"header.name":"&lt;Elvin /&gt;",
			"header.course":"Langages de balisage — M09",
			"header.instructor":"DAM01 — Professeur: Alicia Vázquez",
			"controls.theme":"Thème",
			"intro.title":"Organisateur de pratiques",
			"intro.description":"Modèle pour organiser par thèmes tous les travaux réalisés dans la matière.",
			"modules.title":"Modules & sujets",
			"module.js.badge":"M09","module.js.title":"JavaScript","module.js.sub":"Interactivité & DOM","module.js.desc":"Exercices avec DOM, fetch, modules ES et pratiques M09.",
			"module.html.badge":"M04","module.html.title":"HTML / Langage de balisage","module.html.sub":"Sémantique & accessibilité","module.html.desc":"Travaux sur sémantique, validation et DTD.",
			"module.css.badge":"M09","module.css.title":"CSS moderne","module.css.sub":"Layouts & variables","module.css.desc":"Templates, variables et animations responsives.",
			"module.data.badge":"M09","module.data.title":"JSON / DTD","module.data.sub":"Échange & définitions","module.data.desc":"Exemples JSON pour APIs y ejercicios DTD/XML.",
			"module.link.notes":"Notes","module.link.git":"Devoirs",
			"footer.author":"Code par Elvin","footer.cc":"Enseignant"
		}
	};

	function apply(lang = 'es') {
		const translations = dict[lang] || dict.es;
		document.querySelectorAll('[data-i18n]').forEach(el => {
			const key = el.getAttribute('data-i18n');
			if (!key) return;
			const value = translations[key];
			if (value !== undefined) {
				// mantener HTML en elementos code/title si es necesario
				if (el.tagName.toLowerCase() === 'code' || el.tagName.toLowerCase() === 'title') el.innerHTML = value;
				else el.textContent = value;
			}
		});
		document.documentElement.lang = lang;
	}

	return { apply };
})();

// Gestión de tema (comentarios en español)
const Theme = (() => {
	const key = 'pref-theme';
	function systemPrefersDark() {
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	function getStored() { return localStorage.getItem(key); }
	function setTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem(key, theme);
		const btn = document.getElementById('themeToggle');
		if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
	}
	function init() {
		const stored = getStored();
		setTheme(stored || (systemPrefersDark() ? 'dark' : 'light'));
	}
	return { init, setTheme };
})();

/* Animación inicial de entrada con stagger (comentarios en español) */
function animacionInicial() {
	const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		document.body.classList.add('is-ready');
		return;
	}

	const baseDelay = 80;
	const stagger = 80;
	const tarjetas = Array.from(document.querySelectorAll('.tarjeta'));
	const header = document.querySelector('.encabezado-sitio');
	const intro = document.querySelector('.introduccion');

	// aplicar delays escalonados (inline) y pequeños delays para header/intro
	tarjetas.forEach((t, i) => t.style.transitionDelay = `${baseDelay + i * stagger}ms`);
	if (header) header.style.transitionDelay = '20ms';
	if (intro) intro.style.transitionDelay = '40ms';

	// activar la clase que dispara transiciones
	requestAnimationFrame(() => {
		setTimeout(() => {
			document.body.classList.add('is-ready');

			// limpiar inline styles tras la animación (margen de seguridad)
			const total = baseDelay + tarjetas.length * stagger + 600;
			setTimeout(() => {
				tarjetas.forEach(t => t.style.transitionDelay = '');
				if (header) header.style.transitionDelay = '';
				if (intro) intro.style.transitionDelay = '';
			}, total);
		}, 60);
	});
}

/* Inicializar efecto "tilt" en tarjetas (comentarios en español) */
function initTilt() {
	// respetar preferencia de reducir movimiento
	const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) return;

	const tarjetas = Array.from(document.querySelectorAll('.tarjeta'));
	if (!tarjetas.length) return;

	tarjetas.forEach(tarjeta => {
		let rect = null;
		const maxRotateY = 10; // grados
		const maxRotateX = 8;  // grados
		const popDist = 20;    // px para elementos internos

		function handleMove(evt) {
			const clientX = evt.clientX ?? (evt.touches && evt.touches[0]?.clientX);
			const clientY = evt.clientY ?? (evt.touches && evt.touches[0]?.clientY);
			if (clientX == null || clientY == null) return;
			rect = rect || tarjeta.getBoundingClientRect();

			const dx = clientX - (rect.left + rect.width / 2);
			const dy = clientY - (rect.top + rect.height / 2);

			const ry = (dx / (rect.width / 2)) * maxRotateY;
			const rx = (-dy / (rect.height / 2)) * maxRotateX;

			// aplicar transform directamente (JS override)
			tarjeta.style.transform = `translateY(-8px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
			tarjeta.style.transition = 'transform 120ms cubic-bezier(.2,.9,.2,1)';

			// pop-out elementos internos
			const distintivo = tarjeta.querySelector('.distintivo');
			const titulo = tarjeta.querySelector('.titulo-tarjeta');
			if (distintivo) distintivo.style.transform = `translateZ(${popDist}px) translateY(-3px)`;
			if (titulo) titulo.style.transform = `translateZ(${Math.round(popDist * 0.6)}px)`;
		}

		function handleLeave() {
			// suavemente restablecer
			tarjeta.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
			tarjeta.style.transform = '';
			const distintivo = tarjeta.querySelector('.distintivo');
			const titulo = tarjeta.querySelector('.titulo-tarjeta');
			if (distintivo) distintivo.style.transform = '';
			if (titulo) titulo.style.transform = '';
			rect = null;
		}

		// eventos del ratón
		tarjeta.addEventListener('mousemove', handleMove);
		tarjeta.addEventListener('mouseleave', handleLeave);
		// soporte táctil básico
		tarjeta.addEventListener('touchstart', (e) => { rect = tarjeta.getBoundingClientRect(); }, { passive: true });
		tarjeta.addEventListener('touchmove', (e) => handleMove(e.touches[0]), { passive: true });
		tarjeta.addEventListener('touchend', handleLeave);
	});
}

/* Inicialización: I18N, tema, controles y animación (comentarios en español) */
document.addEventListener('DOMContentLoaded', () => {
	// idioma (persistencia)
	const langKey = 'pref-lang';
	const storedLang = localStorage.getItem(langKey) || (navigator.language?.startsWith('en') ? 'en' : navigator.language?.startsWith('fr') ? 'fr' : 'es');
	I18N.apply(storedLang);

	// tema
	Theme.init();

	// controles
	const themeBtn = document.getElementById('themeToggle');
	const langBtn = document.getElementById('langToggle');

	themeBtn?.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		Theme.setTheme(next);
	});

	langBtn?.addEventListener('click', () => {
		const orden = ['es','en','fr'];
		const cur = document.documentElement.lang || 'es';
		const next = orden[(orden.indexOf(cur) + 1) % orden.length] || 'es';
		localStorage.setItem(langKey, next);
		I18N.apply(next);
		if (langBtn) langBtn.textContent = next.toUpperCase();
	});

	if (langBtn) langBtn.textContent = document.documentElement.lang.toUpperCase();

	// animación inicial
	animacionInicial();

	// iniciar efecto tilt en tarjetas
	initTilt();

	// Easter egg: mensaje estilizado en consola
	console.log('%c👋 Hecho con pasión por el código', 'background: linear-gradient(90deg,#0b6efd,#ff7a18); color: white; padding:8px 12px; border-radius:8px; font-weight:700;');
});