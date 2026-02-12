# 📄 CHULETA MAESTRA DE JAVASCRIPT (MODO EXAMEN)

---
## 1. ESTRUCTURA BÁSICA (HTML + JS)
COPIAR EN: index.html
-------------------------------------------------------------------------
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Examen</title>
    <style>
        .card { border: 1px solid #ccc; padding: 10px; margin: 10px; }
        .oculto { display: none; }
        .rojo { background-color: #ffcccc; } /* Para lógica de stock/error */
    </style>
    <script src="script.js" defer></script>
</head>
<body>
    <nav>
        <input type="text" id="buscador" placeholder="Filtrar...">
    </nav>

    <section>
        <form id="formulario">
            <input type="text" id="input-nombre" placeholder="Nombre" required>
            <input type="number" id="input-precio" placeholder="Precio">
            <button type="submit">Agregar</button> </form>
    </section>

    <main id="contenedor-items"></main>
</body>
</html>

---
## 2. SELECCIÓN DE ELEMENTOS (DOM)
COPIAR AL INICIO DE: script.js
-------------------------------------------------------------------------
// REGLA DE ORO: Crea constantes (const) para todo lo que vayas a usar.
const contenedor = document.querySelector('#contenedor-items'); // El padre de las tarjetas
const formulario = document.querySelector('#formulario');       // El form completo
const inputBusqueda = document.querySelector('#buscador');      // El input de filtrar

// SI NECESITAS SELECCIONAR VARIOS (ej. para borrar clases a todos)
const todosLosItems = document.querySelectorAll('.card'); // Devuelve una lista (NodeList)

---
## 3. LA MÁQUINA DE PINTAR (RENDERIZADO DE ARRAY A HTML)
ESTO ES EL 80% DEL EXAMEN. Memoriza esta función.
-------------------------------------------------------------------------
// 1. Datos iniciales (Array de Objetos)
let misDatos = [
    { id: 1, nombre: "Portátil", precio: 500, stock: 5 },
    { id: 2, nombre: "Ratón", precio: 20, stock: 0 }
];

// 2. Función que recibe datos y pinta HTML
function pintarTarjetas(listaDatos) {
    contenedor.innerHTML = ''; // LIMPIEZA: Borra lo anterior para no duplicar

    listaDatos.forEach(elemento => {
        // A) Crear el envoltorio (div)
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('card'); // Añadir clase CSS base

        // B) Lógica condicional (CSS Dinámico)
        // Ej: Si no hay stock, poner fondo rojo
        if (elemento.stock === 0) {
            tarjeta.classList.add('rojo'); 
            // O estilo directo: tarjeta.style.opacity = '0.5';
        }

        // C) Rellenar el HTML (Template String ``)
        // Nota: Añadimos un botón con data-id para poder borrarlo luego
        tarjeta.innerHTML = `
            <h3>${elemento.nombre}</h3>
            <p>Precio: ${elemento.precio} €</p>
            <p>Estado: ${elemento.stock > 0 ? 'Disponible' : 'Agotado'}</p>
            <button class="btn-borrar" data-id="${elemento.id}">Eliminar</button>
        `;

        // D) Inyectar en el DOM
        contenedor.appendChild(tarjeta);
    });
}

// 3. Llamada inicial para que se vea algo al abrir
pintarTarjetas(misDatos);

---
## 4. GESTIÓN DE EVENTOS (INTERACCIÓN)
CÓMO HACER QUE LOS BOTONES FUNCIONEN
-------------------------------------------------------------------------

### A) AGREGAR ELEMENTO (Formulario)
formulario.addEventListener('submit', (e) => {
    e.preventDefault(); // ¡OBLIGATORIO! Evita que la página se recargue

    // 1. Capturar valores de los inputs
    const nuevoNombre = document.querySelector('#input-nombre').value;
    const nuevoPrecio = Number(document.querySelector('#input-precio').value);

    // 2. Crear objeto nuevo
    const nuevoObjeto = {
        id: Date.now(), // Truco para ID único basado en la hora
        nombre: nuevoNombre,
        precio: nuevoPrecio,
        stock: 10 // Valor por defecto
    };

    // 3. Meter en el array y repintar
    misDatos.push(nuevoObjeto);
    pintarTarjetas(misDatos);

    // 4. Limpiar formulario
    formulario.reset();
});

### B) ELIMINAR ELEMENTO (Delegación de Eventos)
// Truco Pro: Escuchamos al padre (contenedor) para pillar clicks en los hijos (botones)
contenedor.addEventListener('click', (e) => {
    // ¿He hecho click en algo que tenga la clase 'btn-borrar'?
    if (e.target.classList.contains('btn-borrar')) {
        // 1. Obtener el ID que guardamos en el HTML (data-id)
        const idParaBorrar = Number(e.target.dataset.id);

        // 2. Filtrar el array (Me quedo con todos MENOS el que quiero borrar)
        misDatos = misDatos.filter(item => item.id !== idParaBorrar);

        // 3. Repintar la lista actualizada
        pintarTarjetas(misDatos);
    }
});

### C) FILTRAR / BUSCAR (Evento 'input' o 'keyup')
inputBusqueda.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase(); // Pasamos a minúsculas para comparar bien

    // 1. Crear array temporal filtrado
    const filtrados = misDatos.filter(item => 
        item.nombre.toLowerCase().includes(texto)
    );

    // 2. Pintar SOLO los filtrados (No modificamos misDatos original)
    pintarTarjetas(filtrados);
});

---
## 5. EXTRAS IMPRESCINDIBLES (JSON Y LÓGICA)
COSAS QUE SALEN EN EL PDF Y DAN PUNTOS EXTRA
-------------------------------------------------------------------------

### JSON (Texto <-> Objeto)
// Si te dan un string y tienes que convertirlo a array:
const datosRecibidos = '[{"nombre": "Pepe"}]';
const datosUsables = JSON.parse(datosRecibidos); // Ahora ya puedes hacer forEach

// Si tienes que guardar o enviar datos:
const textoParaEnviar = JSON.stringify(misDatos);

### Modificar CSS desde JS
elemento.style.display = 'none';      // Ocultar
elemento.style.backgroundColor = 'red'; 
elemento.classList.toggle('activo');  // Interruptor (si está la quita, si no la pone)

### Array Methods (Chuleta rápida)
- array.push(x)      -> Añade al final.
- array.map(...)     -> Transforma datos (ej. subir precios).
- array.filter(...)  -> Selecciona datos (ej. solo los baratos).
- array.find(...)    -> Busca UNO solo (el primero que coincida).

---
## 6. PERSISTENCIA DE DATOS (LOCALSTORAGE)
PARA QUE NO SE BORRE TODO AL RECARGAR LA PÁGINA
-------------------------------------------------------------------------
// 1. GUARDAR (Al final de agregar/borrar)
// localStorage solo guarda TEXTO, así que usamos JSON.stringify
function guardarEnLocal() {
    localStorage.setItem('misDatosGuardados', JSON.stringify(misDatos));
}

// 2. CARGAR (Al inicio del script)
function cargarDeLocal() {
    const datosGuardados = localStorage.getItem('misDatosGuardados');
    if (datosGuardados) {
        misDatos = JSON.parse(datosGuardados);
        pintarTarjetas(misDatos); // Repintar con lo recuperado
    }
}

// Dónde ponerlo:
// - Llama a cargarDeLocal() nada más empezar el script.
// - Llama a guardarEnLocal() dentro del submit y del botón borrar.

---
## 7. PROGRAMACIÓN ORIENTADA A OBJETOS (POO)
SI TE PIDEN "CLASES", "HERENCIA" O "MÉTODOS" (Págs. 173-175 del PDF)
-------------------------------------------------------------------------

// A) Definir una Clase Básica
class Producto {
    constructor(nombre, precio, stock) {
        this.id = Date.now();
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    // Método propio (función dentro de la clase)
    vender() {
        if (this.stock > 0) {
            this.stock--;
            console.log(`Vendido ${this.nombre}. Quedan ${this.stock}`);
        }
    }
    
    // Método para formatear datos
    getInfo() {
        return `${this.nombre} - ${this.precio}€`;
    }
}

// B) Uso en el código principal
// En el evento del formulario, en lugar de crear un objeto a mano {}:
const nuevoProducto = new Producto("Teclado", 25, 10);
nuevoProducto.vender(); // Ejecuta el método

// C) Herencia (Si te piden tipos específicos)
class ProductoDigital extends Producto {
    constructor(nombre, precio, enlaceDescarga) {
        super(nombre, precio, 9999); // Llama al constructor del padre
        this.enlace = enlaceDescarga;
    }
}

---
## 8. VENTANAS MODALES (DIALOG)
COMO HACER UN POPUP NATIVO (SIN LIBRERÍAS) (Pág. 2 del PDF)
-------------------------------------------------------------------------
<dialog id="mi-modal">
    <h2>Atención</h2>
    <p>Producto añadido con éxito</p>
    <button id="btn-cerrar-modal">Cerrar</button>
</dialog>

/* EN CSS (Centrado automático) */
dialog::backdrop {
    background: rgba(0, 0, 0, 0.5); /* Fondo oscuro */
}

// EN JS
const modal = document.querySelector('#mi-modal');
const btnCerrar = document.querySelector('#btn-cerrar-modal');

// Para ABRIR
// modal.show();       -> Abre (permite interactuar con el fondo)
// modal.showModal();  -> Abre TIPO POPUP (bloquea el fondo, recomendado)
function mostrarMensaje() {
    modal.showModal();
}

// Para CERRAR
btnCerrar.addEventListener('click', () => {
    modal.close();
});

---
## 9. TRUCOS PRO Y SINTAXIS MODERNA
COSAS QUE DAN PUNTOS EXTRA O SALVAN ERRORES
-------------------------------------------------------------------------

### A) Desestructuración (Sacar datos rápido)
const item = { nombre: "A", precio: 20 };
// En vez de item.nombre, item.precio:
const { nombre, precio } = item; 

### B) Spread Operator (Copiar Arrays sin romper nada)
// Forma segura de añadir sin push (crea copia nueva)
misDatos = [...misDatos, nuevoObjeto]; 

### C) Validaciones de Formulario (HTML5 + JS)
// input.checkValidity() devuelve true/false según los atributos HTML (required, min, etc)
if (!formulario.checkValidity()) {
    alert("Rellena bien los campos");
    return; // Para la ejecución
}

### D) Ordenar Arrays (Sort)
// Ordenar por precio (de menor a mayor)
// OJO: sort modifica el array original
misDatos.sort((a, b) => a.precio - b.precio);
pintarTarjetas(misDatos);

### E) Fechas (Date)
const ahora = new Date();
const fechaLegible = ahora.toLocaleDateString(); // "12/02/2024"
const horaLegible = ahora.toLocaleTimeString();  // "10:30:00"

---
## 10. CHECKLIST DE ERRORES TÍPICOS (DEBUGGING)
SI ALGO NO VA, MIRA ESTO PRIMERO
-------------------------------------------------------------------------
1. [ ] ¿Has puesto <script ... defer>? Si no, el JS no encuentra el HTML.
2. [ ] ¿Estás leyendo .value en el input? (document.getElementById('x') da el elemento, no el texto).
3. [ ] ¿Parseaste el JSON del localStorage? (Sale como string, hay que hacer JSON.parse).
4. [ ] ¿Los números se suman como texto? ("10" + "10" = "1010"). Usa Number() o parseInt().
5. [ ] ¿El botón dentro del form recarga la página? Usa e.preventDefault().

---
## 11. MÓDULOS (IMPORT / EXPORT)
SI TE PIDEN SEPARAR EL CÓDIGO EN VARIOS ARCHIVOS
-------------------------------------------------------------------------

/* 1. EN EL HTML (IMPORTANTE: type="module") */
<script type="module" src="main.js"></script>

/* 2. ARCHIVO funciones.js (El que exporta) */
export const impuesto = 0.21;

export function calcularTotal(precio) {
    return precio * (1 + impuesto);
}

/* 3. ARCHIVO main.js (El que importa) */
import { calcularTotal, impuesto } from './funciones.js';

console.log(calcularTotal(100));

---
## 12. PETICIONES DE DATOS (FETCH)
SI EN VEZ DE UN JSON TEXTO, TE PIDEN CARGAR UN ARCHIVO 'datos.json'
-------------------------------------------------------------------------
// Plantilla estándar con Async/Await (Más fácil que .then)
async function cargarDatos() {
    try {
        const respuesta = await fetch('datos.json'); // O la URL que te den
        
        if (!respuesta.ok) throw new Error("Error al cargar");
        
        const datos = await respuesta.json(); // Convierte a Array/Objeto real
        
        // Aquí ya puedes llamar a tu función de pintar
        pintarTarjetas(datos); 
        
    } catch (error) {
        console.error("Algo falló:", error);
        contenedor.innerHTML = "<p>Error cargando productos</p>";
    }
}

// Llamar al inicio
cargarDatos();

---
## 13. INYECCIÓN DE DEPENDENCIAS (EJERCICIO ARMAS - PÁG 173)
ESTO ES ESPECÍFICO DE TU PDF. SI SALE EL EJERCICIO DE "GUERREROS"
-------------------------------------------------------------------------
// Concepto: El personaje NO crea el arma, se la das tú desde fuera.

// 1. Clases de Armas (Simples)
class Espada {
    atacar() { return 10; }
}
class Hacha {
    atacar() { return 20; }
}

// 2. Clase Personaje (Recibe el arma en el constructor)
class Guerrero {
    // INYECCIÓN DE DEPENDENCIAS: Pasamos el objeto arma aquí
    constructor(nombre, armaInicial) {
        this.nombre = nombre;
        this.arma = armaInicial; 
    }

    atacarEnemigo() {
        // Usamos el método del arma que tengamos equipada
        const daño = this.arma.atacar(); 
        console.log(`${this.nombre} ataca y hace ${daño} de daño.`);
    }

    // Método para cambiar de arma en caliente
    cambiarArma(nuevaArma) {
        this.arma = nuevaArma;
    }
}

// 3. USO (Examen)
const miEspada = new Espada();
const miHacha = new Hacha();

// "Inyectamos" la espada al crear al guerrero
const conan = new Guerrero("Conan", miEspada); 
conan.atacarEnemigo(); // Daño: 10

conan.cambiarArma(miHacha); // Cambiamos dependencia
conan.atacarEnemigo(); // Daño: 20

---
## 14. EXPRESIONES REGULARES (VALIDACIÓN EXTRA)
PARA VALIDAR EMAILS O DNI EN EL FORMULARIO
-------------------------------------------------------------------------
const inputEmail = document.querySelector('#email');

// Regex simple para email
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (regexEmail.test(inputEmail.value)) {
    console.log("Email válido");
} else {
    alert("Email incorrecto");
}

---
## 15. MÉTODOS "RÁPIDOS" DE ARRAY (PARA PREGUNTAS TEÓRICAS)
SI TE PREGUNTAN: "¿CÓMO SABER SI TODOS TIENEN STOCK?"
-------------------------------------------------------------------------
// .some() -> Devuelve TRUE si AL MENOS UNO cumple la condición
const hayBaratos = misDatos.some(prod => prod.precio < 10);

// .every() -> Devuelve TRUE si TODOS cumplen la condición
const todoConStock = misDatos.every(prod => prod.stock > 0);

// .reduce() -> Sumar totales (El acumulador)
// (acc = acumulado, prod = item actual, 0 = valor inicial)
const precioTotalInventario = misDatos.reduce((acc, prod) => acc + prod.precio, 0);