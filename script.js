// ================== ELEMENTOS ==================
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const especificaciones = document.getElementById("especificaciones");
const btnEnviar = document.getElementById("btnEnviar");

const fuente = document.getElementById("fuente");
const extraRedSocial = document.getElementById("extraRedSocial");
const extraReferido = document.getElementById("extraReferido");
const redSocial = document.getElementById("redSocial");
const nombreReferido = document.getElementById("nombreReferido");

// ================== DATA ==================
const dataSelects = {
    "clientes antiguos": {
        categorias: [
            "Pólizas Comerciales - Comerciales",
            "Pólizas Comerciales - Auto Comerciales",
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
            "Pólizas Comerciales - Comerciales",
            "Pólizas Comerciales - Auto Comerciales",
            "Pólizas Auto (Cotizando & Tomando PAGO)"
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

// ================== NORMALIZADOR ==================
function normalizarTexto(texto) {
    return texto
        .toString()
        .normalize("NFD")
        .replace(/([^\u00f1\u00d1])[\u0300-\u036f]/g, "$1")
        .toUpperCase()
        .trim();
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

    if (!tipo.value) return;

    cargarSelect(categoria, dataSelects[tipo.value].categorias);
    cargarMultiple(especificaciones, dataSelects[tipo.value].especificaciones);
});

fuente.addEventListener("change", () => {
    extraRedSocial.style.display = "none";
    extraReferido.style.display = "none";
    redSocial.selectedIndex = 0;
    nombreReferido.value = "";

    if (fuente.value === "Redes Sociales") {
        extraRedSocial.style.display = "flex";
    }

    if (fuente.value === "Referido Cliente Propio") {
        extraReferido.style.display = "flex";
    }
});

// ================== ENVÍO ==================
async function enviar() {

    if (
        !nombre.value.trim() ||
        !poliza.value.trim() ||
        !fee.value ||
        !tipo.value ||
        !categoria.value ||
        !fuente.value
    ) {
        alert("COMPLETA TODOS LOS CAMPOS OBLIGATORIOS");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "GUARDANDO...";

    const data = new FormData();

    data.append("sheet", sheet.value);
    data.append("vendedor", vendedor.value);
    data.append("nombre", normalizarTexto(nombre.value));
    data.append("poliza", normalizarTexto(poliza.value));
    data.append("pago", normalizarTexto(pago.value));
    data.append("fee", fee.value);
    data.append("tipo", normalizarTexto(tipo.value));
    data.append("categoria", normalizarTexto(categoria.value));
    data.append("fuente", normalizarTexto(fuente.value));

    if (fuente.value === "Redes Sociales") {
        if (!redSocial.value) {
            alert("SELECCIONE LA RED SOCIAL");
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }
        data.append("detalle_fuente", normalizarTexto(redSocial.value));
    }

    if (fuente.value === "Referido Cliente Propio") {
        if (!nombreReferido.value.trim()) {
            alert("INGRESE EL NOMBRE DEL REFERIDO");
            btnEnviar.disabled = false;
            btnEnviar.textContent = "GUARDAR VENTA";
            return;
        }
        data.append("detalle_fuente", normalizarTexto(nombreReferido.value));
    }

    const specs = Array.from(especificaciones.selectedOptions)
        .map(o => normalizarTexto(o.value))
        .join(", ");

    data.append("especificaciones", specs);

    await fetch("https://script.google.com/macros/s/AKfycbx7fGn5Ug3ayn69DMZ_8B7r3bJZqlbdfLQ3e-ZM9xZERwymKqQn7KMuKHSLJV16/exec", {
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
    document.getElementById("nombre").value = "";
    document.getElementById("poliza").value = "";
    document.getElementById("fee").value = "";
    document.getElementById("pago").selectedIndex = 0;
    document.getElementById("fuente").selectedIndex = 0;

    document.getElementById("tipo").selectedIndex = 0;
    categoria.innerHTML = "";
    categoria.disabled = true;

    especificaciones.innerHTML = "";
    especificaciones.disabled = true;

    // 🔽 limpiar dinámicos
    redSocial.selectedIndex = 0;
    nombreReferido.value = "";
    extraRedSocial.style.display = "none";
    extraReferido.style.display = "none";
}
