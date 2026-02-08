/* ===============================
   VARIABLES
================================ */

let productos = [];
let carrito = [];
let ventas = [];


/* ===============================
   ELEMENTOS DOM
================================ */

const tablaProductos = document.getElementById("tablaProductos");
const listaCarrito = document.getElementById("listaCarrito");

const subtotalSpan = document.getElementById("subtotal");
const igvSpan = document.getElementById("igv");
const totalSpan = document.getElementById("total");

const buscarInput = document.getElementById("buscarProducto");

const modalPago = document.getElementById("modalPago");
const montoRecibidoInput = document.getElementById("montoRecibido");
const cambioInput = document.getElementById("cambio");

const toast = document.getElementById("toast");


/* ===============================
   CONFIG
================================ */

const IGV = 0.18;


/* ===============================
   DATOS DE PRUEBA (CAMBIAR POR API)
================================ */

productos = [
  { id: "P001", nombre: "Arroz 1kg", precio: 4.8, stock: 50 },
  { id: "P002", nombre: "Aceite 1L", precio: 10.5, stock: 30 },
  { id: "P003", nombre: "Leche 1L", precio: 4.5, stock: 40 },
  { id: "P004", nombre: "Gaseosa 2L", precio: 7.0, stock: 60 }
];


/* ===============================
   INICIO
================================ */

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarStats();
  cargarVentasRecientes();
});


/* ===============================
   PRODUCTOS
================================ */

function cargarProductos() {

  tablaProductos.innerHTML = "";

  productos.forEach(p => {

    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>S/ ${p.precio.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="agregarCarrito('${p.id}')">
          +
        </button>
      </td>
    `;

    tablaProductos.appendChild(fila);

  });

}


/* ===============================
   CARRITO
================================ */

function agregarCarrito(id) {

  const producto = productos.find(p => p.id === id);

  if (!producto || producto.stock <= 0) {
    mostrarToast("❌ Sin stock disponible");
    return;
  }

  let item = carrito.find(i => i.id === id);

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }

  producto.stock--;

  renderCarrito();
  cargarProductos();
  mostrarToast("✅ Producto agregado");

}


function renderCarrito() {

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<p class="empty-cart">No hay productos agregados</p>`;
  }

  carrito.forEach(item => {

    const div = document.createElement("div");

    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad}</span>
      <span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
    `;

    listaCarrito.appendChild(div);

  });

  calcularTotales();

}


/* ===============================
   TOTALES
================================ */

function calcularTotales() {

  let subtotal = 0;

  carrito.forEach(i => {
    subtotal += i.precio * i.cantidad;
  });

  const igv = subtotal * IGV;
  const total = subtotal + igv;

  subtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
  igvSpan.textContent = `S/ ${igv.toFixed(2)}`;
  totalSpan.textContent = `S/ ${total.toFixed(2)}`;

}


/* ===============================
   VENTA
================================ */

function procesarVenta() {

  if (carrito.length === 0) {
    mostrarToast("⚠️ Agrega productos primero");
    return;
  }

  abrirModalPago();

}


function nuevaVenta() {
  limpiarVenta();
}


function cancelarVenta() {
  limpiarVenta();
  mostrarToast("❌ Venta cancelada");
}


function limpiarVenta() {

  carrito = [];

  renderCarrito();
  calcularTotales();

}


/* ===============================
   PAGO
================================ */

function abrirModalPago() {

  modalPago.style.display = "flex";

  montoRecibidoInput.value = "";
  cambioInput.value = "";

}


function cerrarModalPago() {
  modalPago.style.display = "none";
}


document.getElementById("formPago").addEventListener("submit", e => {

  e.preventDefault();

  const recibido = parseFloat(montoRecibidoInput.value);
  const total = parseFloat(totalSpan.textContent.replace("S/ ", ""));

  if (recibido < total) {
    mostrarToast("❌ Monto insuficiente");
    return;
  }

  const cambio = recibido - total;
  cambioInput.value = `S/ ${cambio.toFixed(2)}`;

  registrarVenta(total);

  setTimeout(() => {
    cerrarModalPago();
    limpiarVenta();
  }, 1000);

});


/* ===============================
   REGISTRO
================================ */

function registrarVenta(total) {

  const venta = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    total,
    items: [...carrito]
  };

  ventas.push(venta);

  actualizarStats();
  cargarVentasRecientes();

  mostrarToast("💾 Venta registrada");

}


/* ===============================
   STATS
================================ */

function actualizarStats() {

  document.getElementById("totalVentas").textContent = ventas.length;

  let monto = 0;
  let productosVendidos = 0;

  ventas.forEach(v => {
    monto += v.total;

    v.items.forEach(i => {
      productosVendidos += i.cantidad;
    });
  });

  document.getElementById("montoTotal").textContent = `S/ ${monto.toFixed(2)}`;
  document.getElementById("productosVendidos").textContent = productosVendidos;

  document.getElementById("totalClientes").textContent = ventas.length;

}


/* ===============================
   HISTORIAL
================================ */

function cargarVentasRecientes() {

  const cont = document.getElementById("ventasRecientes");

  cont.innerHTML = "";

  if (ventas.length === 0) {
    cont.innerHTML = "<p class='loading'>Sin ventas</p>";
    return;
  }

  ventas.slice(-5).reverse().forEach(v => {

    const div = document.createElement("div");

    div.className = "cart-item";

    div.innerHTML = `
      <span>${v.fecha}</span>
      <span>S/ ${v.total.toFixed(2)}</span>
    `;

    cont.appendChild(div);

  });

}


function verHistorial() {
  mostrarToast("📄 Historial en desarrollo");
}


/* ===============================
   BUSCADOR
================================ */

buscarInput.addEventListener("keyup", () => {

  const texto = buscarInput.value.toLowerCase();

  document.querySelectorAll("#tablaProductos tr").forEach(fila => {

    fila.style.display = fila.innerText.toLowerCase().includes(texto)
      ? ""
      : "none";

  });

});


/* ===============================
   TOAST
================================ */

function mostrarToast(msg) {

  toast.textContent = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);

}


/* ===============================
   NAVEGACIÓN
================================ */

function volverDashboard() {
  console.log("Intentando volver al dashboard...");
  window.location.href = "dashboard.html";
}