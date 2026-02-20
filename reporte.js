let fileA = null;
let fileB = null;

let dataA = [];
let dataB = [];

let resultadoA = [];
let resultadoB = [];
let duplicados = [];


// ----------------------------
// DRAG & DROP
// ----------------------------
function setupDrop(id, assign) {
  const zone = document.getElementById(id);

  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("dragover");
    assign(e.dataTransfer.files[0]);
    zone.innerHTML = e.dataTransfer.files[0].name;
  });
}

setupDrop("dropA", f => fileA = f);
setupDrop("dropB", f => fileB = f);


// ----------------------------
// LEER ARCHIVO
// ----------------------------
function leerArchivo(file) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      resolve(json);
    };

    reader.readAsArrayBuffer(file);
  });
}


// ----------------------------
// NORMALIZAR VALOR
// ----------------------------
function normalizar(valor) {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}


// ----------------------------
// ENCONTRAR COLUMNA CLAVE
// ----------------------------
function encontrarColumna(data) {

  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  const posibles = ["poliza", "policy", "police", "POLIZA", "Policy Number"];

  for (let h of headers) {
    const limpio = normalizar(h);

    for (let p of posibles) {
      if (limpio.includes(p)) {
        return h;
      }
    }
  }

  return null;
}


// ----------------------------
// COMPARAR
// ----------------------------
async function comparar() {

  if (!fileA || !fileB) {
    alert("Debe cargar ambos archivos");
    return;
  }

  dataA = await leerArchivo(fileA);
  dataB = await leerArchivo(fileB);

  const columnaA = encontrarColumna(dataA);
  const columnaB = encontrarColumna(dataB);

  if (!columnaA || !columnaB) {
    alert("No se encontró columna de póliza en uno de los archivos");
    return;
  }

  const mapA = new Map();
  const mapB = new Map();

  const duplicadosTemp = new Set();

  // Procesar A
  dataA.forEach(registro => {
    const clave = normalizar(registro[columnaA]);
    if (!clave) return;

    if (mapA.has(clave)) {
      duplicadosTemp.add(clave);
    }

    mapA.set(clave, registro);
  });

  // Procesar B
  dataB.forEach(registro => {
    const clave = normalizar(registro[columnaB]);
    if (!clave) return;

    if (mapB.has(clave)) {
      duplicadosTemp.add(clave);
    }

    mapB.set(clave, registro);
  });

  // A que no están en B
  resultadoA = [];
  mapA.forEach((registro, clave) => {
    if (!mapB.has(clave)) {
      resultadoA.push(registro);
    }
  });

  // B que no están en A
  resultadoB = [];
  mapB.forEach((registro, clave) => {
    if (!mapA.has(clave)) {
      resultadoB.push(registro);
    }
  });

  // Duplicados
  duplicados = [];
  duplicadosTemp.forEach(clave => {
    if (mapA.has(clave)) duplicados.push(mapA.get(clave));
  });

  renderResultados();
}


// ----------------------------
// RENDER
// ----------------------------
function renderResultados() {

  document.getElementById("tab0").innerHTML =
    generarHTML("Registros CRM que no están en Google Drive: " + resultadoA.length, "A");

  document.getElementById("tab1").innerHTML =
    generarHTML("Registros en Google Drive que no están en CRM: " + resultadoB.length, "B");

  document.getElementById("tab2").innerHTML =
    generarHTML("Duplicados encontrados: " + duplicados.length, "DUP");
}


function generarHTML(titulo, tipo) {
  return `
    <div class="counter">${titulo}</div>
    <button class="export-btn" onclick="exportar('${tipo}')">
      Exportar Registro Completo
    </button>
  `;
}


// ----------------------------
// EXPORTAR COMPLETO
// ----------------------------
function exportar(tipo) {

  let dataExportar = [];
  let nombre = "";

  if (tipo === "A") {
    dataExportar = resultadoA;
    nombre = "A_no_B.xlsx";
  }

  if (tipo === "B") {
    dataExportar = resultadoB;
    nombre = "B_no_A.xlsx";
  }

  if (tipo === "DUP") {
    dataExportar = duplicados;
    nombre = "Duplicados.xlsx";
  }

  if (!dataExportar.length) {
    alert("No hay datos para exportar");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(dataExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, nombre);
}


// ----------------------------
// TABS
// ----------------------------
function showTab(index) {
  document.querySelectorAll(".tab-btn").forEach((b,i)=>{
    b.classList.toggle("active", i===index);
  });

  document.querySelectorAll(".tab-content").forEach((c,i)=>{
    c.classList.toggle("active", i===index);
  });
}