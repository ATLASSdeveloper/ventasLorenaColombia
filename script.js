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
        "Kemper"
    ],

    "Pólizas Comerciales": [
        "Guard",
        "Jencap",
        "Birbek",
        "Progressive",
        "Assurance",
        "National General"
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
        extraReferidoCompartido.style.display = "flex"
    }
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

    camposFormulario.style.display =
        modoRapido.checked ? "none" : "block";
});

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
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }
        data.append("detalle_fuente", normalizarTexto(redSocial.value));
    }

    if (!modoRapido.checked && fuente.value === "Referido Cliente Propio") {

        const nombre = nombreReferido.value.trim().replace(/\s+/g, " ");

        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            alert("INGRESE EL NOMBRE DEL REFERIDO");
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }

        const telefono = telefonoReferido.value.trim();

        if (!/^[0-9+\s]{7,20}$/.test(telefono) || telefono.replace(/\D/g, "").length < 7) {
            alert("INGRESE UN TELÉFONO VÁLIDO (NÚMEROS, ESPACIOS O +)");
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }

        if (!medioReferido.value) {
            alert("SELECCIONE EL MEDIO DE CONTACTO");
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
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
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
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
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }
        data.append("subcategoria", normalizarTexto(subcategoria.value));
    }

    await fetch("https://script.google.com/macros/s/AKfycbyISI3K-arRdfDwNVRMk0K9T6R3W5qIvRxBt7kS3o6s-0Zy7t1Y43Q7_2G19Bb87I-m/exec", {
        method: "POST",
        mode: "no-cors",
        body: data
    });

    alert("GUARDADO ✔");
    limpiarFormulario();
    btnEnviar.disabled = false;
    btnEnviar.textContent = "GUARDAR VENTA";
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

    // 🔽 limpiar dinámicos
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
}
