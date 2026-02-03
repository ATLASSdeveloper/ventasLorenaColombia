// ================== ELEMENTOS ==================
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const especificaciones = document.getElementById("especificaciones");
const btnEnviar = document.getElementById("btnEnviar");

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
        .normalize("NFD")                    // separa acentos
        .replace(/[\u0300-\u036f]/g, "")     // elimina acentos
        .toUpperCase()
        .trim();
}

// ================== FUNCIONES ==================
function cargarSelect(select, opciones, placeholder = "Seleccione") {
    select.innerHTML = `<option value="">${placeholder}</option>`;
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

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("poliza").value = "";
    document.getElementById("fee").value = "";
    document.getElementById("pago").selectedIndex = 0;
    document.getElementById("fuente").selectedIndex = 0;
    tipo.selectedIndex = 0;

    categoria.innerHTML = "";
    categoria.disabled = true;

    especificaciones.innerHTML = "";
    especificaciones.disabled = true;
}

// ================== EVENTOS ==================
tipo.addEventListener("change", () => {
    const value = tipo.value;

    categoria.innerHTML = "";
    especificaciones.innerHTML = "";
    categoria.disabled = true;
    especificaciones.disabled = true;

    if (!value) return;

    cargarSelect(categoria, dataSelects[value].categorias);
    cargarMultiple(especificaciones, dataSelects[value].especificaciones);
});

// ================== ENVÍO ==================
async function enviar() {

    if (
        !document.getElementById("nombre").value.trim() ||
        !document.getElementById("poliza").value.trim() ||
        !document.getElementById("fee").value.trim() ||
        !tipo.value ||
        !categoria.value ||
        !document.getElementById("fuente").value
    ) {
        alert("COMPLETA TODOS LOS CAMPOS OBLIGATORIOS");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = "GUARDANDO...";

    const data = new FormData();

    data.append("sheet", document.getElementById("sheet").value);
    data.append("vendedor", document.getElementById("vendedor").value);

    data.append("nombre", normalizarTexto(document.getElementById("nombre").value));
    data.append("poliza", normalizarTexto(document.getElementById("poliza").value));
    data.append("pago", normalizarTexto(document.getElementById("pago").value));

    const feeValue = parseFloat(document.getElementById("fee").value);
    if (isNaN(feeValue) || feeValue <= 0) {
        alert("EL VALOR FEE DEBE SER NUMERICO");
        btnEnviar.disabled = false;
        btnEnviar.textContent = "GUARDAR VENTA";
        return;
    }

    data.append("fee", feeValue);

    data.append("tipo", normalizarTexto(tipo.value));
    data.append("categoria", normalizarTexto(categoria.value));
    data.append("fuente", normalizarTexto(document.getElementById("fuente").value));

    const specs = Array.from(especificaciones.selectedOptions)
        .map(o => normalizarTexto(o.value))
        .join(", ");

    data.append("especificaciones", specs);

    await fetch(
        "https://script.google.com/macros/s/AKfycbyZGAd6wvtlMXGS6dXl-fGzRu3Soh5uLfGYifIDakAilVDKmRIymlcXCoeMO3pEmsg/exec",
        {
            method: "POST",
            mode: "no-cors",
            body: data
        }
    );

    alert("GUARDADO ✔");

    limpiarFormulario();

    btnEnviar.disabled = false;
    btnEnviar.textContent = "GUARDAR VENTA";
}
