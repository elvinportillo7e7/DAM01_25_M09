document.addEventListener('DOMContentLoaded', function() {
    initPageTransitions();
    initLazyAnimations();
    initParallaxEffect();
    initCursorEffect();
});

function initPageTransitions() {
    const links = document.querySelectorAll('a[href^="index.html"], a[href^="pages/"], a[href^="../"]');
    
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = link.getAttribute('href');
            
            if (href && !href.startsWith('#') && !link.target) {
                e.preventDefault();
                
                const overlay = document.createElement('div');
                overlay.className = 'page-transition active';
                document.body.appendChild(overlay);
                
                document.body.style.overflow = 'hidden';
                
                setTimeout(function() {
                    window.location.href = href;
                }, 600);
            }
        });
    });
}

function initLazyAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                if (entry.target.classList.contains('stagger-parent')) {
                    const children = entry.target.children;
                    Array.from(children).forEach(function(child, index) {
                        setTimeout(function() {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
                
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.features, .categories-preview, .content-section, .hero-visual'
    );
    
    animatedElements.forEach(function(el) {
        fadeObserver.observe(el);
    });
}

function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.floating-card, .hero-visual');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(function(el) {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}

function initCursorEffect() {
    if (window.innerWidth <= 768) return;
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #6366f1;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: transform 0.15s ease, opacity 0.15s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursor);
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    cursorDot.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: #6366f1;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        transition: transform 0.05s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorDot);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
    });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        cursorDot.style.left = dotX - 2 + 'px';
        cursorDot.style.top = dotY - 2 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    const interactiveElements = document.querySelectorAll(
        'a, button, .feature-card, .category-card, .apunte-card, .deber-card, input, .filter-tab'
    );
    
    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.borderColor = '#ec4899';
            cursorDot.style.transform = 'scale(2)';
            cursorDot.style.background = '#ec4899';
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.style.transform = 'scale(1)';
            cursor.style.borderColor = '#6366f1';
            cursorDot.style.transform = 'scale(1)';
            cursorDot.style.background = '#6366f1';
        });
    });
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.insertBefore(particlesContainer, document.body.firstChild);
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const x = Math.random() * window.innerWidth;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${x}px;
            bottom: -10px;
            animation: floatUp ${duration}s linear ${delay}s infinite;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function initCardTiltEffect() {
    const cards = document.querySelectorAll('.apunte-card, .deber-card');
    
    cards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #ec4899);
    z-index: 10000;
    transition: width 0.1s ease;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

function initTextRevealAnimation() {
    const textElements = document.querySelectorAll('h1, h2, h3');
    
    textElements.forEach(function(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        const words = text.split(' ');
        words.forEach(function(word, index) {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.style.opacity = '0';
            span.style.display = 'inline-block';
            span.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
            element.appendChild(span);
        });
    });
}

window.addEventListener('load', function() {
    createParticles();
    initCardTiltEffect();
    
    setTimeout(function() {
        document.body.classList.add('loaded');
    }, 100);
});