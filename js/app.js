const numero = "59164216262";

let productos = [];
let filtrados = [];

let pagina = 0;
const POR_PAGINA = 24;
let cargando = false;

// 🔥 NORMALIZADOR
function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim();
}

// 🔥 LIMPIAR DATOS
function limpiarDatos(data) {
    return data.map((p, index) => {
        const nombre = p.producto || "";

        return {
            nombre,
            nombreNormalizado: normalizar(nombre),
            precio: Number(p.precio) || 0,

            // 🔥 USA TU IMAGEN REAL + FALLBACK
            imagen: p.imagen && p.imagen !== ""
                ? p.imagen
                : `https://picsum.photos/300?random=${index + 1}`,

            oferta: p.oferta == "1",
            top: p.top == "1",
            stock: Number(p.stock) || 0
        };
    });
}

// 🔥 CARGAR PRODUCTOS
fetch("productos.json")
    .then(res => res.json())
    .then(data => {
        productos = limpiarDatos(data);
        aplicarBusqueda();
    })
    .catch(() => {
        document.getElementById("catalogo").innerHTML = "<p>Error al cargar productos</p>";
    });

// 🔥 CREAR TARJETA
function crearCard(p) {
    const div = document.createElement("div");
    div.className = "producto";

    const textoOferta = p.oferta ? "Este producto está en oferta." : "";

    const msg = encodeURIComponent(
        `Hola, quiero este producto:

Producto: ${p.nombre}
Precio: ${p.precio} Bs

${textoOferta}

¿Está disponible?`
    );

    div.innerHTML = `
        <img 
            src="${p.imagen}" 
            loading="lazy"
            onerror="this.src='https://picsum.photos/300?random=1'"
        >

        <h3>${p.nombre}</h3>
        <p class="precio">${p.precio} Bs</p>

        ${p.oferta ? '<span class="oferta">OFERTA</span>' : ""}
        ${p.top ? '<span class="top">TOP</span>' : ""}
        ${p.stock > 0 && p.stock <= 5 ? '<span class="stock">Pocas unidades</span>' : ""}
        ${p.stock === 0 ? '<span class="agotado">Agotado</span>' : ""}

        <a class="btn" href="https://wa.me/${numero}?text=${msg}" target="_blank">
            <i class="fab fa-whatsapp"></i>
            Comprar por WhatsApp
        </a>
    `;

    return div;
}

// 🔥 RENDER POR BLOQUES
function renderMas() {
    if (cargando) return;

    const catalogo = document.getElementById("catalogo");

    const inicio = pagina * POR_PAGINA;
    const fin = inicio + POR_PAGINA;

    const bloque = filtrados.slice(inicio, fin);

    if (bloque.length === 0) return;

    cargando = true;

    const fragment = document.createDocumentFragment();

    bloque.forEach(p => {
        fragment.appendChild(crearCard(p));
    });

    catalogo.appendChild(fragment);

    pagina++;
    cargando = false;
}

// 🔥 BUSCADOR + RESET
function aplicarBusqueda() {
    const input = document.getElementById("buscador");
    const texto = normalizar(input?.value || "");

    if (texto === "") {
        filtrados = [...productos];
    } else {
        const palabras = texto.split(" ");

        filtrados = productos.filter(p =>
            palabras.every(palabra =>
                p.nombreNormalizado.includes(palabra)
            )
        );
    }

    // 🔥 ORDEN
    filtrados.sort((a, b) => {
        return (
            (b.top - a.top) ||
            (b.oferta - a.oferta) ||
            a.precio - b.precio
        );
    });

    // 🔥 RESET
    pagina = 0;
    document.getElementById("catalogo").innerHTML = "";

    renderMas();
}

// 🔥 EVENTO BUSCADOR
const buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("input", aplicarBusqueda);
}

// 🔥 SCROLL INFINITO
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const altura = document.documentElement.scrollHeight;
    const pantalla = window.innerHeight;

    if (scrollTop + pantalla >= altura - 200) {
        renderMas();
    }
});