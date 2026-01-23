import { 
  verificarAutenticacion, 
  cerrarSesion as cerrarSesionUtil,
  formatearMoneda 
} from '../utils/helpers.js';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProveedores
} from '../utils/api.js';

// Verificar autenticación
const usuario = verificarAutenticacion();
if (usuario) {
  document.getElementById('nombreUsuario').textContent = usuario.nombre_completo;
}

// Variables globales
let productos = [];
let categorias = [];
let proveedores = [];
let productoEditando = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  inicializarMenu();
  cargarDatos();
  configurarEventos();
});

// Configurar navegación del menú
function inicializarMenu() {
  const menuLinks = document.querySelectorAll('.menu a');
  const sections = document.querySelectorAll('.section');

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetSection = link.dataset.section;
      
      // Actualizar menú activo
      menuLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Mostrar sección correspondiente
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(targetSection).classList.add('active');
    });
  });
}

// Cargar datos iniciales
async function cargarDatos() {
  await Promise.all([
    cargarProductos(),
    cargarCategorias(),
    cargarProveedores()
  ]);
  actualizarDashboard();
}

// Cargar productos
async function cargarProductos() {
  productos = await obtenerProductos();
  renderizarProductos();
}

// Cargar categorías
async function cargarCategorias() {
  categorias = await obtenerCategorias();
  const select = document.getElementById('categoria_id');
  select.innerHTML = '<option value="">Seleccionar</option>';
  categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
  });
}

// Cargar proveedores
async function cargarProveedores() {
  proveedores = await obtenerProveedores();
  const select = document.getElementById('proveedor_id');
  select.innerHTML = '<option value="">Seleccionar</option>';
  proveedores.forEach(prov => {
    select.innerHTML += `<option value="${prov.id}">${prov.nombre}</option>`;
  });
}

// Renderizar productos en tabla
function renderizarProductos() {
  const tbody = document.getElementById('listaProductos');
  
  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr ${p.stock <= p.stock_minimo ? 'class="stock-bajo"' : ''}>
      <td>${p.codigo || '-'}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '-'}</td>
      <td>${formatearMoneda(p.precio_venta)}</td>
      <td>
        <span class="badge ${p.stock <= p.stock_minimo ? 'badge-danger' : 'badge-success'}">
          ${p.stock}
        </span>
      </td>
      <td>
        <button class="btn-edit" onclick="editarProducto(${p.id})">✏️</button>
        <button class="btn-delete" onclick="eliminarProductoConfirm(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Configurar eventos
function configurarEventos() {
  const form = document.getElementById('productoForm');
  form.addEventListener('submit', guardarProducto);

  const buscar = document.getElementById('buscarProducto');
  buscar.addEventListener('input', filtrarProductos);
}

// Guardar producto (crear o actualizar)
async function guardarProducto(e) {
  e.preventDefault();

  const producto = {
    codigo: document.getElementById('codigo').value,
    nombre: document.getElementById('nombre').value,
    descripcion: document.getElementById('descripcion').value,
    categoria_id: document.getElementById('categoria_id').value || null,
    proveedor_id: document.getElementById('proveedor_id').value || null,
    precio_compra: document.getElementById('precio_compra').value,
    precio_venta: document.getElementById('precio_venta').value,
    stock: document.getElementById('stock').value,
    stock_minimo: document.getElementById('stock_minimo').value,
    unidad_medida: document.getElementById('unidad_medida').value
  };

  let resultado;
  
  if (productoEditando) {
    resultado = await actualizarProducto(productoEditando, producto);
  } else {
    resultado = await crearProducto(producto);
  }

  if (resultado.success) {
    alert(resultado.message);
    await cargarProductos();
    limpiarFormulario();
    actualizarDashboard();
  } else {
    alert(resultado.message || 'Error al guardar');
  }
}

// Editar producto
window.editarProducto = function(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  productoEditando = id;
  
  document.getElementById('formTitulo').textContent = 'Editar Producto';
  document.getElementById('productoId').value = producto.id;
  document.getElementById('codigo').value = producto.codigo || '';
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('descripcion').value = producto.descripcion || '';
  document.getElementById('categoria_id').value = producto.categoria_id || '';
  document.getElementById('proveedor_id').value = producto.proveedor_id || '';
  document.getElementById('precio_compra').value = producto.precio_compra;
  document.getElementById('precio_venta').value = producto.precio_venta;
  document.getElementById('stock').value = producto.stock;
  document.getElementById('stock_minimo').value = producto.stock_minimo;
  document.getElementById('unidad_medida').value = producto.unidad_medida;

  // Scroll al formulario
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
};

// Eliminar producto
window.eliminarProductoConfirm = async function(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;

  const resultado = await eliminarProducto(id);
  
  if (resultado.success) {
    alert(resultado.message);
    await cargarProductos();
    actualizarDashboard();
  } else {
    alert(resultado.message || 'Error al eliminar');
  }
};

// Cancelar edición
window.cancelarEdicion = function() {
  limpiarFormulario();
};

// Limpiar formulario
function limpiarFormulario() {
  document.getElementById('productoForm').reset();
  document.getElementById('formTitulo').textContent = 'Nuevo Producto';
  productoEditando = null;
}

// Filtrar productos
function filtrarProductos(e) {
  const busqueda = e.target.value.toLowerCase();
  
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) ||
    (p.codigo && p.codigo.toLowerCase().includes(busqueda))
  );

  const tbody = document.getElementById('listaProductos');
  
  if (productosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron productos</td></tr>';
    return;
  }

  tbody.innerHTML = productosFiltrados.map(p => `
    <tr ${p.stock <= p.stock_minimo ? 'class="stock-bajo"' : ''}>
      <td>${p.codigo || '-'}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '-'}</td>
      <td>${formatearMoneda(p.precio_venta)}</td>
      <td>
        <span class="badge ${p.stock <= p.stock_minimo ? 'badge-danger' : 'badge-success'}">
          ${p.stock}
        </span>
      </td>
      <td>
        <button class="btn-edit" onclick="editarProducto(${p.id})">✏️</button>
        <button class="btn-delete" onclick="eliminarProductoConfirm(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Actualizar estadísticas del dashboard
function actualizarDashboard() {
  document.getElementById('totalProductos').textContent = productos.length;
  
  const productosActivos = productos.filter(p => p.activo).length;
  document.getElementById('productosActivos').textContent = productosActivos;
  
  const stockBajo = productos.filter(p => p.stock <= p.stock_minimo).length;
  document.getElementById('stockBajo').textContent = stockBajo;
}

// Cerrar sesión
window.cerrarSesion = function() {
  if (confirm('¿Deseas cerrar sesión?')) {
    cerrarSesionUtil();
  }
};
