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
  obtenerProveedores,
  obtenerVentas
} from '../utils/api.js';
import { inicializarPOS } from '../components/pos.js';
import { inicializarModuloVentasDashboard } from '../module/ventasDashboardModule.js';

const usuario = verificarAutenticacion();
if (usuario) {
  const nombreUsuario = document.getElementById('nombreUsuario');
  if (nombreUsuario) {
    nombreUsuario.textContent = usuario.nombre_completo;
  }
}

let productos = [];
let categorias = [];
let proveedores = [];
let productoEditando = null;

let inventarioCargado = false;
let inventarioInicializando = false;

let menuLinks = [];
let sections = [];

const activarSeccionFallback = (sectionId) => {
  const link = document.querySelector(`.menu a[data-section="${sectionId}"]`);
  if (link) link.click();
};

// Funciones de respaldo para evitar botones inactivos si el modulo de ventas tarda en cargar.
if (!window.ventasIrPos) {
  window.ventasIrPos = () => activarSeccionFallback('pos');
}

if (!window.ventasActualizar) {
  window.ventasActualizar = () => activarSeccionFallback('ventas');
}

if (!window.ventasAbrirHistorial) {
  window.ventasAbrirHistorial = () => {
    const modal = document.getElementById('ventasModalHistorial');
    modal?.classList.add('active');
    modal?.setAttribute('aria-hidden', 'false');
  };
}

if (!window.ventasCerrarHistorial) {
  window.ventasCerrarHistorial = () => {
    const modal = document.getElementById('ventasModalHistorial');
    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
  };
}

const obtenerFechaLocalISO = (fecha = new Date()) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    inicializarMenu();
    configurarEventos();

    const inicializacionVentas = inicializarModuloVentasDashboard({
      onVentaRegistrada: actualizarDashboardGeneral
    }).catch((error) => {
      console.error('Error al inicializar modulo de ventas:', error);
    });

    await cargarDatosIniciales();
    await inicializacionVentas;

    const seccionInicial = obtenerSeccionInicial();
    await activarSeccion(seccionInicial);
  } catch (error) {
    console.error('Error inicializando dashboard:', error);
  }
});

function obtenerSeccionInicial() {
  const hash = (window.location.hash || '').replace('#', '').trim();
  if (!hash) return 'dashboard';

  const existe = document.getElementById(hash);
  return existe ? hash : 'dashboard';
}

function inicializarMenu() {
  menuLinks = Array.from(document.querySelectorAll('.menu a[data-section]'));
  sections = Array.from(document.querySelectorAll('main.content > .section'));

  menuLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      const seccion = link.dataset.section;
      await activarSeccion(seccion);
    });
  });
}

async function activarSeccion(targetSection) {
  if (!targetSection) return;

  const section = document.getElementById(targetSection);
  if (!section) return;

  menuLinks.forEach((link) => {
    const activa = link.dataset.section === targetSection;
    link.classList.toggle('active', activa);
  });

  sections.forEach((node) => {
    node.classList.toggle('active', node.id === targetSection);
  });

  window.location.hash = targetSection;

  if (targetSection === 'pos') {
    await inicializarPOS();
  }

  if (targetSection === 'ventas') {
    try {
      await inicializarModuloVentasDashboard({
        onVentaRegistrada: actualizarDashboardGeneral
      });
    } catch (error) {
      console.error('Error al cargar modulo de ventas:', error);
    }
  }

  if (targetSection === 'inventario') {
    await cargarInventario();
  }

  if (targetSection === 'dashboard') {
    await actualizarDashboardGeneral();
  }
}

function configurarEventos() {
  const form = document.getElementById('productoForm');
  form?.addEventListener('submit', guardarProducto);

  const inputBusqueda = document.getElementById('buscarProductoGestion');
  inputBusqueda?.addEventListener('input', filtrarProductos);
}

async function cargarDatosIniciales() {
  await Promise.all([
    cargarProductos(),
    cargarCategorias(),
    cargarProveedores()
  ]);

  await actualizarDashboardGeneral();
}

async function cargarProductos() {
  const data = await obtenerProductos();
  productos = Array.isArray(data) ? data : [];
  renderizarProductos(productos);
}

async function cargarCategorias() {
  categorias = await obtenerCategorias();

  const select = document.getElementById('categoria_id');
  if (!select) return;

  select.innerHTML = '<option value="">Seleccionar</option>';
  categorias.forEach((categoria) => {
    select.innerHTML += `<option value="${categoria.id}">${categoria.nombre}</option>`;
  });
}

async function cargarProveedores() {
  proveedores = await obtenerProveedores();

  const select = document.getElementById('proveedor_id');
  if (!select) return;

  select.innerHTML = '<option value="">Seleccionar</option>';
  proveedores.forEach((proveedor) => {
    select.innerHTML += `<option value="${proveedor.id}">${proveedor.nombre}</option>`;
  });
}

function renderizarProductos(lista) {
  const tbody = document.getElementById('listaProductos');
  if (!tbody) return;

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos</td></tr>';
    return;
  }

  tbody.innerHTML = lista
    .map((producto) => {
      const stockBajo = Number(producto.stock || 0) <= Number(producto.stock_minimo || 0);

      return `
        <tr ${stockBajo ? 'class="stock-bajo"' : ''}>
          <td>${producto.codigo || '-'}</td>
          <td>${producto.nombre}</td>
          <td>${producto.categoria || '-'}</td>
          <td>${formatearMoneda(producto.precio_venta || 0)}</td>
          <td>
            <span class="badge ${stockBajo ? 'badge-danger' : 'badge-success'}">
              ${producto.stock}
            </span>
          </td>
          <td>
            <button class="btn-edit" onclick="editarProducto(${producto.id})" title="Editar">Editar</button>
            <button class="btn-delete" onclick="eliminarProductoConfirm(${producto.id})" title="Eliminar">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function filtrarProductos(event) {
  const termino = String(event.target.value || '').trim().toLowerCase();

  const filtrados = productos.filter((producto) => {
    const nombre = String(producto.nombre || '').toLowerCase();
    const codigo = String(producto.codigo || '').toLowerCase();
    return nombre.includes(termino) || codigo.includes(termino);
  });

  renderizarProductos(filtrados);
}

async function guardarProducto(event) {
  event.preventDefault();

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

  if (!resultado?.success) {
    alert(resultado?.message || 'No se pudo guardar el producto');
    return;
  }

  alert(resultado.message || 'Producto guardado correctamente');
  limpiarFormulario();
  await cargarProductos();
  await actualizarDashboardGeneral();
}

window.editarProducto = (id) => {
  const producto = productos.find((fila) => fila.id === id);
  if (!producto) return;

  productoEditando = id;

  document.getElementById('formTitulo').textContent = 'Editar Producto';
  document.getElementById('productoId').value = producto.id;
  document.getElementById('codigo').value = producto.codigo || '';
  document.getElementById('nombre').value = producto.nombre || '';
  document.getElementById('descripcion').value = producto.descripcion || '';
  document.getElementById('categoria_id').value = producto.categoria_id || '';
  document.getElementById('proveedor_id').value = producto.proveedor_id || '';
  document.getElementById('precio_compra').value = producto.precio_compra || 0;
  document.getElementById('precio_venta').value = producto.precio_venta || 0;
  document.getElementById('stock').value = producto.stock || 0;
  document.getElementById('stock_minimo').value = producto.stock_minimo || 0;
  document.getElementById('unidad_medida').value = producto.unidad_medida || 'unidad';

  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
};

window.eliminarProductoConfirm = async (id) => {
  const confirmar = confirm('Seguro que deseas eliminar este producto?');
  if (!confirmar) return;

  const resultado = await eliminarProducto(id);

  if (!resultado?.success) {
    alert(resultado?.message || 'No se pudo eliminar el producto');
    return;
  }

  alert(resultado.message || 'Producto eliminado');
  await cargarProductos();
  await actualizarDashboardGeneral();
};

window.cancelarEdicion = () => {
  limpiarFormulario();
};

function limpiarFormulario() {
  const form = document.getElementById('productoForm');
  form?.reset();

  const titulo = document.getElementById('formTitulo');
  if (titulo) titulo.textContent = 'Nuevo Producto';

  productoEditando = null;
}

async function actualizarDashboardGeneral() {
  const totalProductos = productos.length;
  const productosActivos = productos.filter((producto) => Number(producto.activo) !== 0).length;
  const stockBajo = productos.filter(
    (producto) => Number(producto.stock || 0) <= Number(producto.stock_minimo || 0)
  ).length;

  const totalProductosNode = document.getElementById('totalProductos');
  const productosActivosNode = document.getElementById('productosActivos');
  const stockBajoNode = document.getElementById('stockBajo');

  if (totalProductosNode) totalProductosNode.textContent = String(totalProductos);
  if (productosActivosNode) productosActivosNode.textContent = String(productosActivos);
  if (stockBajoNode) stockBajoNode.textContent = String(stockBajo);

  const hoy = obtenerFechaLocalISO(new Date());
  const ventasHoyData = await obtenerVentas({ fecha_inicio: hoy, fecha_fin: hoy });
  const ventasHoy = Array.isArray(ventasHoyData) ? ventasHoyData : [];

  const totalVentasHoy = ventasHoy
    .filter((venta) => String(venta.estado || '').toLowerCase() !== 'anulada')
    .reduce((acum, venta) => acum + Number(venta.total || 0), 0);

  const ventasHoyNode = document.getElementById('ventasHoy');
  if (ventasHoyNode) {
    ventasHoyNode.textContent = formatearMoneda(totalVentasHoy);
  }
}

async function cargarInventario() {
  if (inventarioInicializando) return;
  if (inventarioCargado) return;

  const contenedor = document.getElementById('inventario');
  if (!contenedor) return;

  inventarioInicializando = true;

  try {
    const response = await fetch('inventario.partial.html');
    if (!response.ok) {
      throw new Error('No se pudo cargar el modulo de inventario');
    }

    contenedor.innerHTML = await response.text();

    const { inicializarInventario } = await import('./inventario.js');
    await inicializarInventario();

    inventarioCargado = true;
  } catch (error) {
    console.error('Error al cargar inventario:', error);
    contenedor.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2 style="color: #e74c3c;">Error al cargar inventario</h2>
        <p style="margin-top: 10px; color: #6b7280;">${error.message}</p>
        <button onclick="cargarInventario()" style="margin-top: 20px; padding: 10px 16px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer;">Reintentar</button>
      </div>
    `;
  } finally {
    inventarioInicializando = false;
  }
}

window.cargarInventario = cargarInventario;

window.cerrarSesion = () => {
  const confirmar = confirm('Deseas cerrar sesion?');
  if (!confirmar) return;
  cerrarSesionUtil();
};
