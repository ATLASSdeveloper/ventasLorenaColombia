// ================== ELEMENTOS ==================
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const especificaciones = document.getElementById("especificaciones");
const btnEnviar = document.getElementById("btnEnviar");

const fuente = document.getElementById("fuente");
const extraRedSocial = document.getElementById("extraRedSocial");
const extraSubcategoria = document.getElementById("extraSubcategoria");
const extraReferido = document.getElementById("extraReferido");
const extraReferidoCompartido = document.getElementById("extraReferidoCompartido");
const extraEspecificaciones = document.getElementById("extraEspecificaciones");
const redSocial = document.getElementById("redSocial");
const referidos = document.getElementById("referidos");
const subcategoria = document.getElementById("subcategoria");
const nombreReferido = document.getElementById("nombreReferido");
const telefonoReferido = document.getElementById("telefonoReferido");
const medioReferido = document.getElementById("medioReferido");
const mesGestion = document.getElementById("mesGestion");
const mesVenta = document.getElementById("mesVenta");
const estado = document.getElementById("estado");

const extraDetalleCategoria = document.getElementById("extraDetalleCategoria");
const detalleCategoria = document.getElementById("detalleCategoria");
const modoRapido = document.getElementById("modoRapido");
const camposFormulario = document.getElementById("camposFormulario");

const extraEvidencia = document.getElementById("extraEvidencia");
const evidencia = document.getElementById("evidencia");
const evidenciaEstado = document.getElementById("evidenciaEstado");

const FUENTE_CROSS_SELLING_CLIENTE_PROPIO = "Cross Selling - Cliente Propio";
const MAX_EVIDENCIA_UPLOAD_BYTES = 4 * 1024 * 1024;
const TARGET_EVIDENCIA_BYTES = Math.floor(3.8 * 1024 * 1024);
const TIPOS_EVIDENCIA_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
let evidenciaUrlSubida = "";

// ================== DATA ==================
const dataSelects = {
    "clientes antiguos": {
        categorias: [
            "Pólizas Comerciales",
            "Pólizas Auto (Cotizando & Tomando PAGO)",
            "Pólizas Arrendamiento"
        ],
        especificaciones: [
            "Pólizas Nuevas Greenville",
            "Pólizas Nuevas Tenesse",
            "Cliente Superior - AÑO 10.000 USD",
            "Cliente Superior - AÑO 15.000 USD"
        ]
    },
    "clientes nuevos": {
        categorias: [
            "Pólizas Comerciales",
            "Pólizas Auto (Cotizando & Tomando PAGO)",
            "Pólizas Arrendamiento"
        ],
        especificaciones: [
            "Pólizas Nuevas Greenville",
            "Pólizas Nuevas Tenesse",
            "Cliente Superior - AÑO 10.000 USD",
            "Cliente Superior - AÑO 15.000 USD"
        ]
    },
    "renovaciones": {
        categorias: [
            "Renovación Base Asignada - CRM",
            "Renovación Cliente Propio"
        ],
        especificaciones: [
            "Renovación Cliente Superior - AÑO 15.000 USD",
            "Renovación Cliente Superior - AÑO 10.000 USD"
        ]
    }
};

const detalleCategorias = {
    "Pólizas Auto (Cotizando & Tomando PAGO)": [
        "Progressive",
        "Assurance",
        "National General",
        "Gainsco",
        "Verve",
        "Kemper",
        "Otro"
    ],

    "Pólizas Comerciales": [
        "Guard",
        "Jencap",
        "Birbek",
        "Progressive",
        "Assurance",
        "National General",
        "Otro"
    ]
};

// ================== NORMALIZADOR ==================
function normalizarTexto(texto) {
    return texto
        .replace(/[áÁ]/g, "a")
        .replace(/[éÉ]/g, "e")
        .replace(/[íÍ]/g, "i")
        .replace(/[óÓ]/g, "o")
        .replace(/[úÚ]/g, "u")
        .toUpperCase();
}

function esCrossSellingClientePropio() {
    return !modoRapido.checked && fuente.value === FUENTE_CROSS_SELLING_CLIENTE_PROPIO;
}

function actualizarCampoEvidencia() {
    const mostrar = esCrossSellingClientePropio();
    extraEvidencia.style.display = mostrar ? "flex" : "none";
    evidencia.required = mostrar;

    if (!mostrar) {
        evidencia.value = "";
        evidenciaEstado.textContent = "";
        evidenciaUrlSubida = "";
    }
}

function restaurarBotonEnviar() {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "GUARDAR VENTA";
}

// ================== SELECTS ==================
function cargarSelect(select, opciones) {
    select.innerHTML = `<option value="">Seleccione</option>`;
    opciones.forEach(op => {
        const option = document.createElement("option");
        option.textContent = op;
        select.appendChild(option);
    });
    select.disabled = false;
}

function cargarMultiple(select, opciones) {
    select.innerHTML = "";
    opciones.forEach(op => {
        const option = document.createElement("option");
        option.textContent = op;
        select.appendChild(option);
    });
    select.disabled = false;
}

// ================== EVENTOS ==================
tipo.addEventListener("change", () => {
    categoria.innerHTML = "";
    especificaciones.innerHTML = "";
    categoria.disabled = true;
    especificaciones.disabled = true;
    extraSubcategoria.style.display = "none";
    subcategoria.selectedIndex = 0;
    extraEspecificaciones.style.display = "none";

    if (!tipo.value) return;

    cargarSelect(categoria, dataSelects[tipo.value].categorias);
    cargarMultiple(especificaciones, dataSelects[tipo.value].especificaciones);
});

fuente.addEventListener("change", () => {
    extraRedSocial.style.display = "none";
    extraReferido.style.display = "none";
    extraReferidoCompartido.style.display = "none";
    redSocial.selectedIndex = 0;
    referidos.selectedIndex = 0;
    nombreReferido.value = "";

    if (fuente.value === "Redes Sociales") {
        extraRedSocial.style.display = "flex";
    }

    if (fuente.value === "Referido Cliente Propio") {
        extraReferido.style.display = "flex";
    }

    if (fuente.value === "Referido - Compartido Afiliado") {
        extraReferidoCompartido.style.display = "flex";
    }

    actualizarCampoEvidencia();
});

categoria.addEventListener("change", () => {

    extraSubcategoria.style.display = "none";
    subcategoria.selectedIndex = 0;

    extraEspecificaciones.style.display = "none";
    especificaciones.selectedIndex = 0;

    extraDetalleCategoria.style.display = "none";

    // LIMPIAR SELECT
    detalleCategoria.innerHTML = `<option value="">Seleccione</option>`;
    detalleCategoria.disabled = true;

    // SUBCATEGORIA
    if (categoria.value === "Pólizas Comerciales") {
        extraSubcategoria.style.display = "flex";
    }

    // ESPECIFICACIONES
    if (
        categoria.value === "Pólizas Comerciales" ||
        categoria.value === "Renovación Base Asignada - CRM" ||
        categoria.value === "Renovación Cliente Propio"
    ) {
        extraEspecificaciones.style.display = "flex";
    }

    // DETALLE CATEGORIA
    if (detalleCategorias[categoria.value]) {

        extraDetalleCategoria.style.display = "flex";
        detalleCategoria.disabled = false;

        detalleCategorias[categoria.value].forEach(op => {

            const option = document.createElement("option");

            option.value = op;
            option.textContent = op;

            detalleCategoria.appendChild(option);
        });
    }
});

modoRapido.addEventListener("change", () => {
    camposFormulario.style.display = modoRapido.checked ? "none" : "block";
    actualizarCampoEvidencia();
});

evidencia.addEventListener("change", () => {
    const file = evidencia.files?.[0];
    evidenciaUrlSubida = "";
    evidenciaEstado.textContent = file ? `Seleccionada: ${file.name}` : "";
});

// ================== EVIDENCIA / BLOB ==================
function cargarImagen(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("No se pudo leer la imagen seleccionada."));
        };

        img.src = url;
    });
}

function canvasABlob(canvas, calidad) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen.")),
            "image/jpeg",
            calidad
        );
    });
}

async function comprimirEvidencia(file) {
    if (!TIPOS_EVIDENCIA_PERMITIDOS.includes(file.type)) {
        throw new Error("La evidencia debe ser una imagen JPG, PNG o WEBP.");
    }

    if (file.size <= TARGET_EVIDENCIA_BYTES) {
        return file;
    }

    const img = await cargarImagen(file);
    let ancho = img.naturalWidth;
    let alto = img.naturalHeight;
    const maxDimension = 1920;

    if (Math.max(ancho, alto) > maxDimension) {
        const escala = maxDimension / Math.max(ancho, alto);
        ancho = Math.round(ancho * escala);
        alto = Math.round(alto * escala);
    }

    let calidad = 0.86;
    let blob = null;

    for (let intento = 0; intento < 6; intento++) {
        const canvas = document.createElement("canvas");
        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("El navegador no pudo preparar la evidencia.");
        }

        ctx.drawImage(img, 0, 0, ancho, alto);
        blob = await canvasABlob(canvas, calidad);

        if (blob.size <= TARGET_EVIDENCIA_BYTES) {
            break;
        }

        calidad = Math.max(0.55, calidad - 0.08);
        ancho = Math.max(1, Math.round(ancho * 0.85));
        alto = Math.max(1, Math.round(alto * 0.85));
    }

    if (!blob || blob.size > MAX_EVIDENCIA_UPLOAD_BYTES) {
        throw new Error("La evidencia es demasiado pesada. Seleccione una imagen más pequeña.");
    }

    const nombreBase = (file.name || "evidencia").replace(/\.[^.]+$/, "");
    return new File([blob], `${nombreBase}.jpg`, { type: "image/jpeg" });
}

async function subirEvidenciaBlob(file) {
    const archivo = await comprimirEvidencia(file);
    const params = new URLSearchParams({
        filename: archivo.name,
        vendedor: vendedor.value || "sin-vendedor",
        cliente: cliente.value.trim() || "sin-cliente"
    });

    evidenciaEstado.textContent = "Subiendo evidencia...";
    btnEnviar.textContent = "SUBIENDO EVIDENCIA...";

    const response = await fetch(`/api/upload-evidencia?${params.toString()}`, {
        method: "POST",
        headers: {
            "Content-Type": archivo.type
        },
        body: archivo
    });

    let result = null;
    try {
        result = await response.json();
    } catch (_) {
        // La respuesta puede no contener JSON si Vercel rechaza la petición antes de ejecutar la función.
    }

    if (!response.ok || !result?.url) {
        throw new Error(result?.error || "No se pudo subir la evidencia a Vercel Blob.");
    }

    evidenciaEstado.textContent = "Evidencia cargada ✔";
    return result.url;
}

// ================== ENVÍO ==================
async function enviar() {

    if (
        !modoRapido.checked &&
        (
            !cliente.value.trim() ||
            !poliza.value.trim() ||
            !fee.value ||
            !tipo.value ||
            !categoria.value ||
            !fuente.value
        )
    ) {
        alert("COMPLETA TODOS LOS CAMPOS OBLIGATORIOS");
        return;
    }

    if (esCrossSellingClientePropio() && !evidencia.files?.length) {
        alert("DEBE ADJUNTAR UNA FOTO / EVIDENCIA PARA CROSS SELLING - CLIENTE PROPIO");
        evidencia.focus();
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "GUARDANDO...";

    const data = new FormData();

    data.append("sheet", sheet.value);
    data.append("vendedor", vendedor.value);
    data.append("cliente", normalizarTexto(cliente.value));
    data.append("poliza", normalizarTexto(poliza.value));
    data.append("pago", normalizarTexto(pago.value));
    data.append("fee", fee.value);
    data.append("tipo", normalizarTexto(tipo.value));
    data.append("categoria", normalizarTexto(categoria.value));
    data.append("compania", normalizarTexto(detalleCategoria.value));
    data.append("fuente", normalizarTexto(fuente.value));
    data.append("mes_G", normalizarTexto(mesGestion.value));
    data.append("mes_V", normalizarTexto(mesVenta.value));
    data.append("estado", normalizarTexto(estado.value));

    if (!modoRapido.checked && fuente.value === "Redes Sociales") {
        if (!redSocial.value) {
            alert("SELECCIONE LA RED SOCIAL");
            restaurarBotonEnviar();
            return;
        }
        data.append("detalle_fuente", normalizarTexto(redSocial.value));
    }

    if (!modoRapido.checked && fuente.value === "Referido Cliente Propio") {

        const nombre = nombreReferido.value.trim().replace(/\s+/g, " ");

        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            alert("INGRESE EL NOMBRE DEL REFERIDO");
            restaurarBotonEnviar();
            return;
        }

        const telefono = telefonoReferido.value.trim();

        if (!/^[0-9+\s]{7,20}$/.test(telefono) || telefono.replace(/\D/g, "").length < 7) {
            alert("INGRESE UN TELÉFONO VÁLIDO (NÚMEROS, ESPACIOS O +)");
            restaurarBotonEnviar();
            return;
        }

        if (!medioReferido.value) {
            alert("SELECCIONE EL MEDIO DE CONTACTO");
            restaurarBotonEnviar();
            return;
        }

        data.append(
            "detalle_fuente",
            [
                normalizarTexto(nombre),
                telefono,
                medioReferido.value
            ].join("|")
        );
    }

    if (!modoRapido.checked && fuente.value === "Referido - Compartido Afiliado") {
        const referido = referidos.value.trim();

        if (!referido) {
            alert("SELECCIONE EL REFERIDO");
            restaurarBotonEnviar();
            return;
        }

        data.append("referido", normalizarTexto(referido));
    }

    const specs = Array.from(especificaciones.selectedOptions)
        .map(o => normalizarTexto(o.value))
        .join(", ");

    data.append("especificaciones", specs);

    if (!modoRapido.checked && categoria.value === "Pólizas Comerciales") {
        if (!subcategoria.value) {
            alert("SELECCIONE LA SUBCATEGORÍA");
            restaurarBotonEnviar();
            return;
        }
        data.append("subcategoria", normalizarTexto(subcategoria.value));
    }

    try {
        if (esCrossSellingClientePropio()) {
            if (!evidenciaUrlSubida) {
                evidenciaUrlSubida = await subirEvidenciaBlob(evidencia.files[0]);
            }
            data.append("evidencia_url", evidenciaUrlSubida);
        }

        btnEnviar.textContent = "GUARDANDO...";

        await fetch("https://script.google.com/macros/s/AKfycbyhrOus2CEBdHSLLnn1hSNAyQevXOZEk5kkqx9m8BR0JCILLeDuQqe0MEuG9zU3LHdX/exec", {
            method: "POST",
            mode: "no-cors",
            body: data
        });

        alert("GUARDADO ✔");
        limpiarFormulario();
    } catch (error) {
        console.error(error);
        evidenciaEstado.textContent = "Error al cargar la evidencia";
        alert(error?.message || "NO SE PUDO GUARDAR LA VENTA");
    } finally {
        restaurarBotonEnviar();
    }
}

function limpiarFormulario() {
    document.getElementById("cliente").value = "";
    document.getElementById("poliza").value = "";
    document.getElementById("fee").value = "";
    document.getElementById("pago").selectedIndex = 0;
    document.getElementById("fuente").selectedIndex = 0;
    document.getElementById("mesGestion").selectedIndex = 0;
    document.getElementById("mesVenta").selectedIndex = 0;
    document.getElementById("estado").selectedIndex = 0;
    document.getElementById("tipo").selectedIndex = 0;
    categoria.innerHTML = "";
    categoria.disabled = true;

    especificaciones.innerHTML = "";
    especificaciones.disabled = true;

    // limpiar dinámicos
    redSocial.selectedIndex = 0;
    referidos.selectedIndex = 0;
    nombreReferido.value = "";
    telefonoReferido.value = "";
    medioReferido.selectedIndex = 0;
    subcategoria.selectedIndex = 0;
    extraRedSocial.style.display = "none";
    extraReferidoCompartido.style.display = "none";
    extraReferido.style.display = "none";
    extraSubcategoria.style.display = "none";
    extraEspecificaciones.style.display = "none";
    extraDetalleCategoria.style.display = "none";
    detalleCategoria.selectedIndex = 0;

    evidencia.value = "";
    evidencia.required = false;
    evidenciaEstado.textContent = "";
    evidenciaUrlSubida = "";
    extraEvidencia.style.display = "none";
}
