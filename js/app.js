// --- CONFIGURACIÓN ---
const GITHUB_USERNAME = 'elvinportillo7e7'; // <--- CAMBIA ESTO
const REPO_NAME = 'DAM01_25_M09';          // <--- CAMBIA ESTO (Ej: 'mis-deberes')
const BRANCH = 'main';                          // Normalmente es 'main' o 'master'

// --- ESTADO ---
let currentPath = '';
let token = localStorage.getItem('nebula_token');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    checkAuth();
    loadContent('');
});

// --- LÓGICA DE ARCHIVOS ---

async function loadContent(path) {
    currentPath = path;
    const grid = document.getElementById('file-grid');
    const loader = document.getElementById('loader');
    
    grid.innerHTML = '';
    loader.classList.remove('hidden');
    updateBreadcrumbs();

    try {
        // Usamos la API de GitHub para leer el contenido
        const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`;
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) throw new Error('No se pudo cargar contenido');
        
        const data = await response.json();
        loader.classList.add('hidden');

        // Ordenar: Carpetas primero
        const sortedData = Array.isArray(data) ? data.sort((a, b) => (a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1)) : [];

        if (sortedData.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500 mt-10">Carpeta vacía</p>';
            return;
        }

        sortedData.forEach(item => {
            // Ignorar archivos del sistema
            if (item.name.startsWith('.') || item.name === 'index.html' || item.name === 'css' || item.name === 'js') return;

            const card = document.createElement('div');
            card.className = 'file-card rounded-xl p-6 flex flex-col items-center gap-4 group animate-fade-in';
            
            const isFolder = item.type === 'dir';
            const icon = isFolder ? 'folder' : 'file-code';
            const color = isFolder ? 'text-cyan-400' : 'text-purple-400';

            // Acción al hacer click
            const clickAction = isFolder 
                ? `loadContent('${item.path}')` 
                : `openPreview('${item.name}', '${item.download_url}')`;

            card.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition cursor-pointer" onclick="${clickAction}">
                    <i data-lucide="${icon}" class="${color} w-6 h-6"></i>
                </div>
                <div class="text-center w-full">
                    <p class="text-sm font-medium truncate cursor-pointer hover:text-cyan-300 transition" onclick="${clickAction}">${item.name}</p>
                    <p class="text-xs text-slate-500 mt-1">${isFolder ? 'Carpeta' : formatSize(item.size)}</p>
                </div>
                
                ${token ? `
                <button onclick="deleteItem('${item.path}', '${item.sha}')" class="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                ` : ''}
            `;
            grid.appendChild(card);
        });
        lucide.createIcons();

    } catch (error) {
        console.error(error);
        loader.classList.add('hidden');
        grid.innerHTML = '<p class="col-span-full text-center text-red-400">Error al cargar o repositorio privado.</p>';
    }
}

// --- FUNCIONES DE ADMIN (REQUIEREN TOKEN) ---

async function handleUpload() {
    if (!token) return alert('Modo Admin Requerido');
    
    const input = document.getElementById('file-upload');
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function() {
        const base64Content = reader.result.split(',')[1];
        const safeFileName = sanitizeName(file.name);
        const path = currentPath ? `${currentPath}/${safeFileName}` : safeFileName;

        // PUT a la API de GitHub para crear/actualizar archivo
        await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Subido ${file.name} desde Nebula App`,
                content: base64Content,
                branch: BRANCH
            })
        });

        setTimeout(() => loadContent(currentPath), 1000); // Recargar
        input.value = '';
    };
}

async function createFolder() {
    if (!token) return;
    let name = prompt("Nombre de la carpeta:"); // Usamos let, no const
    if (!name) return;

    // --- AÑADIR ESTO ---
    name = sanitizeName(name); 
    // -------------------
    const path = currentPath ? `${currentPath}/${name}/.keep` : `${name}/.keep`;
    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Crear carpeta ${name}`,
            content: btoa('keep'), // base64 simple
            branch: BRANCH
        })
    });
    
    setTimeout(() => loadContent(currentPath), 1000);
}

async function deleteItem(path, sha) {
    if (!confirm('¿Borrar definitivamente?')) return;

    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Borrar ${path}`,
            sha: sha,
            branch: BRANCH
        })
    });
    
    setTimeout(() => loadContent(currentPath), 1000);
}

// --- UTILIDADES ---

function openPreview(name, url) {
    // Si es HTML, usamos un truco para renderizarlo
    if (name.endsWith('.html')) {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        document.getElementById('preview-title').innerText = name;
        
        // GitHub sirve el HTML como texto "raw". Para verlo renderizado usamos un proxy o un truco.
        // Opción PRO: Usar htmlpreview.github.io para desarrollo
        frame.src = `https://htmlpreview.github.io/?${url}`;
        
        modal.classList.remove('hidden');
    } else {
        window.open(url, '_blank');
    }
}

function closePreview() {
    document.getElementById('preview-modal').classList.add('hidden');
    document.getElementById('preview-frame').src = '';
}

function updateBreadcrumbs() {
    const container = document.getElementById('breadcrumbs');
    if (!currentPath) {
        container.innerHTML = `<span class="text-cyan-400 font-medium">Root</span>`;
        return;
    }
    
    const parts = currentPath.split('/');
    let html = `<span class="cursor-pointer hover:text-white" onclick="loadContent('')">Root</span>`;
    let accum = '';
    
    parts.forEach((p, i) => {
        accum += (i === 0 ? '' : '/') + p;
        html += ` <i data-lucide="chevron-right" class="w-3 h-3"></i> <span class="cursor-pointer hover:text-cyan-400 ${i === parts.length -1 ? 'text-white font-medium' : ''}" onclick="loadContent('${accum}')">${p}</span>`;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// --- AUTH ---

function toggleLoginModal() {
    document.getElementById('login-modal').classList.toggle('hidden');
}

function saveToken() {
    const input = document.getElementById('github-token');
    if (input.value) {
        localStorage.setItem('nebula_token', input.value);
        location.reload();
    }
}

function logout() {
    localStorage.removeItem('nebula_token');
    location.reload();
}

function checkAuth() {
    if (token) {
        document.getElementById('admin-controls').classList.remove('hidden');
        document.getElementById('login-btn').classList.add('hidden');
    }
}
function sanitizeName(name) {
    // Reemplaza : / \ * ? " < > | por un guion
    return name.replace(/[:\/\\*?"<>|]/g, '-');
}