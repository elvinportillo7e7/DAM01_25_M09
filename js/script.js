// Módulo i18n: diccionarios y aplicación de traducciones (comentarios en español)
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
			"module.js.badge":"M09",
			"module.js.title":"JavaScript",
			"module.js.sub":"Interactividad y DOM",
			"module.js.desc":"Ejercicios con DOM, fetch, módulos ES y prácticas de M09.",
			"module.html.badge":"M04",
			"module.html.title":"HTML / Lenguaje de marcas",
			"module.html.sub":"Semántica y accesibilidad",
			"module.html.desc":"Trabajos sobre semántica, validación y DTD.",
			"module.css.badge":"M09",
			"module.css.title":"CSS Moderno",
			"module.css.sub":"Layouts y variables",
			"module.css.desc":"Plantillas, variables y animaciones responsivas.",
			"module.data.badge":"M09",
			"module.data.title":"JSON / DTD",
			"module.data.sub":"Intercambio y definición",
			"module.data.desc":"Ejemplos de JSON para APIs y ejercicios con DTD/XML.",
			"module.link.notes":"Apuntes",
			"module.link.git":"Deberes", // traducido a "Deberes" en español
			"footer.author":"Código realizado por Elvin",
			"footer.cc":"Profesor/a"
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
			"module.js.badge":"M09",
			"module.js.title":"JavaScript",
			"module.js.sub":"Interactivity & DOM",
			"module.js.desc":"Exercises with DOM, fetch, ES modules and M09 practices.",
			"module.html.badge":"M04",
			"module.html.title":"HTML / Markup Language",
			"module.html.sub":"Semantics & accessibility",
			"module.html.desc":"Tasks about semantics, validation and DTD.",
			"module.css.badge":"M09",
			"module.css.title":"Modern CSS",
			"module.css.sub":"Layouts & variables",
			"module.css.desc":"Templates, variables and responsive animations.",
			"module.data.badge":"M09",
			"module.data.title":"JSON / DTD",
			"module.data.sub":"Exchange & definitions",
			"module.data.desc":"JSON examples for APIs and exercises with DTD/XML.",
			"module.link.notes":"Notes",
			"module.link.git":"Assignments", // texto en inglés
			"footer.author":"Code by Elvin",
			"footer.cc":"Instructor"
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
			"module.js.badge":"M09",
			"module.js.title":"JavaScript",
			"module.js.sub":"Interactivité & DOM",
			"module.js.desc":"Exercices avec DOM, fetch, modules ES et pratiques M09.",
			"module.html.badge":"M04",
			"module.html.title":"HTML / Langage de balisage",
			"module.html.sub":"Sémantique & accessibilité",
			"module.html.desc":"Travaux sur sémantique, validation et DTD.",
			"module.css.badge":"M09",
			"module.css.title":"CSS moderne",
			"module.css.sub":"Layouts & variables",
			"module.css.desc":"Templates, variables et animations responsives.",
			"module.data.badge":"M09",
			"module.data.title":"JSON / DTD",
			"module.data.sub":"Échange & définitions",
			"module.data.desc":"Exemples JSON pour APIs y ejercicios DTD/XML.",
			"module.link.notes":"Notes",
			"module.link.git":"Devoirs", // texto en francés
			"footer.author":"Code par Elvin",
			"footer.cc":"Enseignant"
		}
	};

	// Aplica traducciones a todos los elementos con data-i18n
	function apply(lang='es'){
		const trans = dict[lang] || dict.es;
		document.querySelectorAll('[data-i18n]').forEach(el=>{
			const key = el.getAttribute('data-i18n');
			if(!key) return;
			const val = trans[key];
			if(val!==undefined){
				if(el.tagName.toLowerCase()==='code' || el.tagName.toLowerCase()==='title') el.innerHTML = val;
				else el.textContent = val;
			}
		});
		document.documentElement.lang = lang;
	}

	return { apply };
})();

// Gestión del tema: detecta preferencia y persiste en localStorage (comentarios en español)
const Theme = (() => {
	const key = 'pref-theme';
	function prefersDark(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
	function get(){ return localStorage.getItem(key); }
	function set(name){
		document.documentElement.setAttribute('data-theme', name);
		localStorage.setItem(key, name);
		const btn = document.getElementById('themeToggle');
		if(btn) btn.setAttribute('aria-pressed', name === 'dark' ? 'true' : 'false');
	}
	function init(){
		const stored = get();
		if(stored) set(stored);
		else set(prefersDark() ? 'dark' : 'light');
	}
	return { init, set };
})();

/* Animación inicial de entrada (comentarios en español) */
function animacionInicial() {
	// Si el usuario prefiere reducir movimiento, activamos estado final sin animar
	const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		document.body.classList.add('is-ready');
		return;
	}

	// pequeños delays
	const baseDelay = 80; // ms antes de empezar
	const stagger = 80; // ms entre tarjetas

	// aplicar delays escalonados a cada tarjeta para un efecto "stagger"
	const tarjetas = Array.from(document.querySelectorAll('.tarjeta'));
	tarjetas.forEach((tarjeta, i) => {
		// aplicar transition-delay inline (sobre escribe fallback CSS)
		tarjeta.style.transitionDelay = `${baseDelay + i * stagger}ms`;
	});

	// también dar un pequeño delay a header/intro para que precedan a las tarjetas
	const header = document.querySelector('.encabezado-sitio');
	const intro = document.querySelector('.introduccion');
	if (header) header.style.transitionDelay = '20ms';
	if (intro) intro.style.transitionDelay = '40ms';

	// forzar un frame para que las transiciones tomen el estado inicial antes de añadir la clase
	requestAnimationFrame(() => {
		setTimeout(() => {
			document.body.classList.add('is-ready');

			// Limpiar delays inline tras la animación inicial para no interferir con hover/otras animaciones.
			const totalDuration = baseDelay + tarjetas.length * stagger + 300; // margen
			setTimeout(() => {
				tarjetas.forEach(t => t.style.transitionDelay = '');
				if (header) header.style.transitionDelay = '';
				if (intro) intro.style.transitionDelay = '';
			}, totalDuration);
		}, 60);
	});
}

/* Inicialización y eventos (comentarios en español) */
document.addEventListener('DOMContentLoaded', () => {
	// idioma
	const langKey = 'pref-lang';
	const savedLang = localStorage.getItem(langKey) || (navigator.language?.startsWith('en') ? 'en' : navigator.language?.startsWith('fr') ? 'fr' : 'es');
	I18N.apply(savedLang);

	// tema
	Theme.init();

	// controles
	const themeBtn = document.getElementById('themeToggle');
	const langBtn = document.getElementById('langToggle');

	// alternar tema claro/oscuro
	themeBtn?.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		Theme.set(next);
	});

	// ciclo de idiomas ES -> EN -> FR
	langBtn?.addEventListener('click', () => {
		const order = ['es','en','fr'];
		const cur = document.documentElement.lang || 'es';
		const next = order[(order.indexOf(cur) + 1) % order.length] || 'es';
		localStorage.setItem('pref-lang', next);
		I18N.apply(next);
		langBtn.textContent = next.toUpperCase();
	});

	// etiqueta inicial del botón de idioma
	if(langBtn) langBtn.textContent = document.documentElement.lang.toUpperCase();

	// inicializar animación de entrada
	animacionInicial();

	// Easter egg: mensaje estilizado en consola
	console.log('%c👋 Hecho con pasión por el código', 'background: linear-gradient(90deg,#0b6efd,#ff7a18); color: white; padding:8px 12px; border-radius:8px; font-weight:700;');
});