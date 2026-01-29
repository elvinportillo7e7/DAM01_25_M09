// --- CONFIGURACIÓN ---
const GITHUB_USERNAME = 'elvinportillo7e7'; // <--- TU USUARIO
const REPO_NAME = 'DAM01_25_M09';           // <--- TU REPO
const BRANCH = 'master';

// --- ESTADO ---
let currentPath = '';
let token = localStorage.getItem('nebula_token');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    checkAuth();
    loadContent('');
});

// --- LÓGICA DE VISUALIZACIÓN ---

async function loadContent(path) {
    currentPath = path;
    const grid = document.getElementById('file-grid');
    const loader = document.getElementById('loader');
    
    grid.innerHTML = '';
    loader.classList.remove('hidden');
    updateBreadcrumbs();

    try {
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
            card.className = 'file-card rounded-xl p-6 flex flex-col items-center gap-4 group animate-fade-in relative';
            
            const isFolder = item.type === 'dir';
            const icon = isFolder ? 'folder' : 'file-code';
            const color = isFolder ? 'text-cyan-400' : 'text-purple-400';
            const clickAction = isFolder ? `loadContent('${item.path}')` : `openPreview('${item.name}', '${item.download_url}')`;

            // HTML de la Tarjeta con Botones de Admin
            card.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition cursor-pointer" onclick="${clickAction}">
                    <i data-lucide="${icon}" class="${color} w-6 h-6"></i>
                </div>
                <div class="text-center w-full overflow-hidden">
                    <p class="text-sm font-medium truncate cursor-pointer hover:text-cyan-300 transition" onclick="${clickAction}" title="${item.name}">${item.name}</p>
                    <p class="text-xs text-slate-500 mt-1">${isFolder ? 'Carpeta' : formatSize(item.size)}</p>
                </div>
                
                ${token ? `
                <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-slate-900/80 rounded-lg p-1 backdrop-blur-sm z-10">
                    <button onclick="renameItemPrompt('${item.path}', '${item.name}', '${item.type}', '${item.sha}')" class="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded transition" title="Renombrar">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteItem('${item.path}', '${item.sha}')" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded transition" title="Borrar">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
        lucide.createIcons();

    } catch (error) {
        console.error(error);
        loader.classList.add('hidden');
        grid.innerHTML = '<p class="col-span-full text-center text-red-400">Error o repositorio privado.</p>';
    }
}

// --- FUNCIONES DE GESTIÓN (ADMIN) ---

// 1. Crear Carpeta
async function createFolder() {
    if (!token) return;
    let name = prompt("Nombre de la carpeta:");
    if (!name) return;
    
    // AQUÍ ESTÁ EL FILTRO PARA WINDOWS
    name = sanitizeName(name); 

    const path = currentPath ? `${currentPath}/${name}/.keep` : `${name}/.keep`;
    
    // Subir archivo dummy .keep para crear la carpeta
    await uploadToGithub(path, btoa('keep'), `Crear carpeta ${name}`);
    setTimeout(() => loadContent(currentPath), 1500);
}

// 2. Subir Archivo
async function handleUpload() {
    if (!token) return alert('Modo Admin Requerido');
    const input = document.getElementById('file-upload');
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function() {
        const base64Content = reader.result.split(',')[1];
        
        // AQUÍ ESTÁ EL FILTRO PARA WINDOWS
        const safeName = sanitizeName(file.name); 
        
        const path = currentPath ? `${currentPath}/${safeName}` : safeName;

        await uploadToGithub(path, base64Content, `Subido ${safeName}`);
        setTimeout(() => loadContent(currentPath), 1500);
        input.value = '';
    };
}

// 3. Borrar Item
async function deleteItem(path, sha) {
    if (!confirm('¿Estás seguro de borrar esto permanentemente?')) return;
    await deleteFromGithub(path, sha);
    setTimeout(() => loadContent(currentPath), 1500); 
}

// 4. RENOMBRAR (COMPLEJO: Mover y Borrar)
async function renameItemPrompt(oldPath, oldName, type, sha) {
    let newName = prompt(`Renombrar "${oldName}" a:`, oldName);
    if (!newName || newName === oldName) return;
    
    // AQUÍ ESTÁ EL FILTRO PARA WINDOWS
    newName = sanitizeName(newName); 
    
    const basePath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;

    // Mostrar loading
    const grid = document.getElementById('file-grid');
    grid.innerHTML = '<div class="col-span-full text-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div><p class="mt-4 text-slate-400">Renombrando... esto puede tardar unos segundos.</p></div>';

    try {
        if (type === 'file') {
            await moveFile(oldPath, newPath, sha);
        } else {
            await moveFolder(oldPath, newPath);
        }
        setTimeout(() => loadContent(currentPath), 2000);
    } catch (e) {
        alert('Error al renombrar: ' + e.message);
        loadContent(currentPath);
    }
}

// Lógica interna para mover archivo (Copiar -> Borrar)
async function moveFile(oldPath, newPath, sha) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${oldPath}`, {
        headers: { 'Authorization': `token ${token}` }
    });
    const data = await res.json();
    
    await uploadToGithub(newPath, data.content, `Renombrado ${oldPath} a ${newPath}`);
    await deleteFromGithub(oldPath, sha);
}

// Lógica interna para mover carpeta (Recursivo)
async function moveFolder(oldPath, newPath) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${oldPath}`, {
        headers: { 'Authorization': `token ${token}` }
    });
    const items = await res.json();

    for (const item of items) {
        const itemNewPath = `${newPath}/${item.name}`;
        if (item.type === 'file') {
            await moveFile(item.path, itemNewPath, item.sha);
        } else if (item.type === 'dir') {
            await moveFolder(item.path, itemNewPath);
        }
    }
}

// --- AYUDANTES DE API ---

async function uploadToGithub(path, content, message) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, content, branch: BRANCH })
    });
    if (!res.ok) throw new Error('Fallo al subir/crear');
    return res.json();
}

async function deleteFromGithub(path, sha) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: `Borrar ${path}`, sha, branch: BRANCH })
    });
    if (!res.ok) throw new Error('Fallo al borrar');
}

// --- FUNCIÓN CLAVE: LIMPIEZA DE NOMBRES ---
function sanitizeName(name) {
    // Reemplaza caracteres prohibidos en Windows por un guion
    return name.replace(/[:\/\\*?"<>|]/g, '-');
}

// --- UTILIDADES ---

function openPreview(name, url) {
    if (name.endsWith('.html')) {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        document.getElementById('preview-title').innerText = name;
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

function toggleLoginModal() { document.getElementById('login-modal').classList.toggle('hidden'); }
function saveToken() {
    const input = document.getElementById('github-token');
    if (input.value) { localStorage.setItem('nebula_token', input.value); location.reload(); }
}
function logout() { localStorage.removeItem('nebula_token'); location.reload(); }
function checkAuth() {
    if (token) {
        document.getElementById('admin-controls').classList.remove('hidden');
        document.getElementById('login-btn').classList.add('hidden');
    }
}