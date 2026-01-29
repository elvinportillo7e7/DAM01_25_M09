// --- CONFIGURACIÓN ---
const GITHUB_USERNAME = 'elvinportillo7e7'; 
const REPO_NAME = 'DAM01_25_M09';           
const BRANCH = 'main';

// --- ESTADO ---
let currentPath = '';
// Recuperamos el token. Si no hay, es null (Modo Profesor/Invitado)
let token = localStorage.getItem('elvin_dam_token');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    checkAuth(); // Verifica si el token sigue vivo
    loadContent('');
});

// --- LÓGICA PRINCIPAL DE VISUALIZACIÓN ---

async function loadContent(path) {
    currentPath = path;
    const grid = document.getElementById('file-grid');
    const loader = document.getElementById('loader');
    
    grid.innerHTML = '';
    loader.classList.remove('hidden');
    updateBreadcrumbs();

    try {
        const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`;
        // Si hay token, lo usamos. Si no, entramos como público (solo lectura)
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('No se pudo cargar contenido o carpeta vacía');
        
        const data = await response.json();
        loader.classList.add('hidden');

        // Ordenar: Carpetas primero, luego archivos
        const sortedData = Array.isArray(data) ? data.sort((a, b) => (a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1)) : [];

        if (sortedData.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500 mt-10">Carpeta vacía</p>';
            return;
        }

        sortedData.forEach(item => {
            // Filtros visuales (ocultar archivos de sistema)
            if (item.name.startsWith('.') || item.name === 'index.html' || item.name === 'css' || item.name === 'js') return;

            const card = document.createElement('div');
            const isFolder = item.type === 'dir';
            
            // Estilos base
            card.className = 'file-card rounded-xl p-6 flex flex-col items-center gap-4 group animate-fade-in relative';
            
            // --- SEGURIDAD Y PERMISOS ---
            // Solo si eres ADMIN (tienes token) puedes arrastrar
            if (token) {
                card.draggable = true; 
                card.classList.add('cursor-grab'); // Icono de manita
                
                // Evento: Empezar a arrastrar
                card.ondragstart = (e) => dragStart(e, item.path, item.name, item.type, item.sha);

                // Evento: Recibir soltada (solo carpetas)
                if (isFolder) {
                    card.ondragover = (e) => dragOver(e, card);
                    card.ondragleave = (e) => dragLeave(e, card);
                    card.ondrop = (e) => dropItem(e, item.path);
                }
            } else {
                card.draggable = false; // Los profes no pueden arrastrar
            }

            const icon = isFolder ? 'folder' : 'file-code';
            const color = isFolder ? 'text-cyan-400' : 'text-purple-400';
            // Acción al hacer click normal (Navegar o Ver)
            const clickAction = isFolder ? `loadContent('${item.path}')` : `openPreview('${item.name}', '${item.download_url}')`;

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
        grid.innerHTML = '<p class="col-span-full text-center text-red-400">Error de conexión o carpeta privada.</p>';
    }
}

// --- LÓGICA DRAG & DROP (SOLO ADMIN) ---

function dragStart(e, path, name, type, sha) {
    // Guardamos los datos del objeto que se arrastra
    const dragData = { path, name, type, sha };
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    e.target.classList.add('dragging');
}

function dragOver(e, card) {
    if (!token) return; // Seguridad extra
    e.preventDefault(); 
    card.classList.add('drag-over');
}

function dragLeave(e, card) {
    card.classList.remove('drag-over');
}

async function dropItem(e, targetFolderPath) {
    e.preventDefault();
    const card = e.target.closest('.file-card');
    if (card) card.classList.remove('drag-over');
    
    if (!token) return alert("Solo el administrador puede mover archivos.");

    try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        
        // 1. Evitar mover carpeta dentro de sí misma
        if (data.type === 'dir' && targetFolderPath.startsWith(data.path)) {
            return alert("❌ No puedes mover una carpeta dentro de sí misma.");
        }
        
        // 2. Evitar mover al mismo sitio
        const currentParent = data.path.substring(0, data.path.lastIndexOf('/'));
        if (currentParent === targetFolderPath) return;

        if (confirm(`¿Mover "${data.name}" dentro de la carpeta seleccionada?`)) {
            const newPath = `${targetFolderPath}/${data.name}`;
            await performMove(data.path, newPath, data.type, data.sha);
        }
    } catch (err) {
        console.error("Error al soltar:", err);
    }
}

// --- FUNCIÓN MAESTRA DE MOVER (Renombrar y Arrastrar) ---
async function performMove(oldPath, newPath, type, sha) {
    const grid = document.getElementById('file-grid');
    // Mostrar pantalla de carga bloqueante
    grid.innerHTML = `
        <div class="col-span-full text-center py-20 animate-pulse">
            <div class="inline-block p-4 rounded-full bg-cyan-900/30 mb-4">
                <i data-lucide="loader-2" class="w-10 h-10 text-cyan-400 animate-spin"></i>
            </div>
            <h3 class="text-xl font-bold text-white">Moviendo archivos...</h3>
            <p class="text-slate-400 mt-2">GitHub está procesando el cambio. Por favor espera.</p>
        </div>
    `;
    lucide.createIcons();

    try {
        if (type === 'file') {
            await moveFile(oldPath, newPath, sha);
        } else {
            await moveFolderRecursive(oldPath, newPath);
        }
        
        // Esperamos un poco para que la API de GitHub se refresque
        setTimeout(() => loadContent(currentPath), 2500);
        
    } catch (e) {
        alert('❌ Error al mover: ' + e.message);
        loadContent(currentPath); // Restaurar vista
    }
}

// --- OPERACIONES ATÓMICAS (API GITHUB) ---

// Mover Carpeta = Copiar todo el contenido recursivamente y borrar lo viejo
async function moveFolderRecursive(oldPath, newPath) {
    // 1. Leer contenido de la carpeta vieja
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${oldPath}`, {
        headers: { 'Authorization': `token ${token}` }
    });
    if (!res.ok) throw new Error("No se pudo leer la carpeta origen");
    
    const items = await res.json();

    // 2. Procesar cada item
    for (const item of items) {
        const itemNewPath = `${newPath}/${item.name}`;
        if (item.type === 'file') {
            await moveFile(item.path, itemNewPath, item.sha);
        } else if (item.type === 'dir') {
            await moveFolderRecursive(item.path, itemNewPath);
        }
    }
    // Nota: No se borra la carpeta "padre" explícitamente porque en Git las carpetas vacías desaparecen solas.
}

// Mover Archivo = Copiar (PUT) + Borrar (DELETE)
async function moveFile(oldPath, newPath, sha) {
    // A. Obtener contenido raw
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${oldPath}`, {
        headers: { 'Authorization': `token ${token}` }
    });
    const data = await res.json();
    
    // B. Crear copia en nuevo lugar
    await uploadToGithub(newPath, data.content, `Mover ${oldPath} a ${newPath}`);
    
    // C. Borrar original
    await deleteFromGithub(oldPath, sha);
}

// --- FUNCIONES DE GESTIÓN (ADMIN) ---

async function createFolder() {
    if (!token) return alert("Acceso denegado");
    let name = prompt("Nombre de la carpeta:");
    if (!name) return;
    name = sanitizeName(name); 
    
    const path = currentPath ? `${currentPath}/${name}/.keep` : `${name}/.keep`;
    await uploadToGithub(path, btoa('keep'), `Crear carpeta ${name}`);
    setTimeout(() => loadContent(currentPath), 1500);
}

async function handleUpload() {
    if (!token) return alert('Modo Admin Requerido');
    const input = document.getElementById('file-upload');
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function() {
        const base64Content = reader.result.split(',')[1];
        const safeName = sanitizeName(file.name);
        const path = currentPath ? `${currentPath}/${safeName}` : safeName;

        await uploadToGithub(path, base64Content, `Subido ${safeName}`);
        setTimeout(() => loadContent(currentPath), 1500);
        input.value = '';
    };
}

async function deleteItem(path, sha) {
    if (!token) return;
    if (!confirm('¿Estás seguro de borrar esto permanentemente?')) return;
    await deleteFromGithub(path, sha);
    setTimeout(() => loadContent(currentPath), 1500); 
}

async function renameItemPrompt(oldPath, oldName, type, sha) {
    if (!token) return;
    let newName = prompt(`Renombrar "${oldName}" a:`, oldName);
    if (!newName || newName === oldName) return;
    
    newName = sanitizeName(newName);
    const basePath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;

    performMove(oldPath, newPath, type, sha);
}

// --- COMUNICACIÓN CON API ---

async function uploadToGithub(path, content, message) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, content, branch: BRANCH })
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`GitHub: ${errorData.message}`);
    }
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

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al borrar: ${errorData.message}`);
    }
}

// Limpia caracteres prohibidos en Windows para evitar errores al clonar
function sanitizeName(name) {
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

// --- AUTENTICACIÓN SEGURA (VERIFICADA) ---

function toggleLoginModal() { 
    document.getElementById('login-modal').classList.toggle('hidden'); 
}

async function saveToken() {
    const input = document.getElementById('github-token');
    const tokenValue = input.value.trim();
    const loginBtn = document.querySelector('#login-modal button:last-child');
    
    if (!tokenValue) return alert("Por favor, escribe el token.");

    // Feedback visual
    const originalText = loginBtn.innerText;
    loginBtn.innerText = "Verificando...";
    loginBtn.disabled = true;
    loginBtn.classList.add('opacity-50', 'cursor-not-allowed');

    try {
        // Verificar contra la API de GitHub
        const response = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${tokenValue}` }
        });

        if (response.status === 200) {
            localStorage.setItem('elvin_dam_token', tokenValue);
            
            loginBtn.innerText = "¡Correcto!";
            loginBtn.classList.remove('bg-cyan-600');
            loginBtn.classList.add('bg-green-500');
            
            setTimeout(() => location.reload(), 500);
        } else {
            throw new Error('Token inválido');
        }

    } catch (error) {
        alert("❌ ACCESO DENEGADO\nToken incorrecto o expirado.");
        loginBtn.innerText = originalText;
        loginBtn.disabled = false;
        loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        input.value = '';
        input.focus();
    }
}

function logout() {
    if(confirm("¿Cerrar sesión de administrador?")) {
        localStorage.removeItem('elvin_dam_token');
        location.reload();
    }
}

function checkAuth() {
    if (token) {
        // Validación silenciosa en segundo plano
        fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${token}` } })
            .then(res => {
                if (res.status !== 200) {
                    // Si el token caducó, cerramos sesión automáticamente
                    localStorage.removeItem('elvin_dam_token');
                    location.reload();
                } else {
                    // Si es válido, mostramos controles Admin
                    document.getElementById('admin-controls').classList.remove('hidden');
                    document.getElementById('login-btn').classList.add('hidden');
                }
            })
            .catch(() => {
                // Si no hay internet, asumimos que está logueado visualmente
                document.getElementById('admin-controls').classList.remove('hidden');
                document.getElementById('login-btn').classList.add('hidden');
            });
    }
}