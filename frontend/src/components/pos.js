// 🛒 MÓDULO DE PUNTO DE VENTA (POS)
// Última actualización: 2026-01-23 20:32
import { obtenerProductos, obtenerClientes, crearVenta } from '../utils/api.js';
import { formatearMoneda, storage } from '../utils/helpers.js';

let productosDisponibles = [];
let carrito = [];
let eventosConfigurados = false;

// Inicializar POS
export const inicializarPOS = async () => {
  await cargarProductos();
  await cargarClientes();
  if (!eventosConfigurados) {
    configurarEventos();
    eventosConfigurados = true;
  }
  actualizarCarrito();
};

// Cargar productos
const cargarProductos = async () => {
  productosDisponibles = await obtenerProductos();
  mostrarProductos(productosDisponibles);
};

// Cargar clientes
const cargarClientes = async () => {
  const clientes = await obtenerClientes();
  const datalist = document.getElementById('clientesList');
  
  if (datalist) {
    datalist.innerHTML = '<option value="">Cliente General</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.nombre;
      option.dataset.id = cliente.id;
      option.textContent = `${cliente.nombre} - ${cliente.documento || 'Sin doc'}`;
      datalist.appendChild(option);
    });
  }
};

// Mostrar productos
const mostrarProductos = (productos) => {
  const grid = document.getElementById('productosGrid');
  
  if (!grid) return;

  if (productos.length === 0) {
    grid.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
    return;
  }

  grid.innerHTML = productos.map(producto => `
    <div class="producto-card" onclick="window.agregarAlCarrito(${producto.id}, event)">
      <div class="producto-info">
        <h4>${producto.nombre}</h4>
        <p class="producto-codigo">${producto.codigo || 'S/C'}</p>
        <p class="producto-stock">Stock: ${producto.stock} ${producto.unidad_medida}</p>
      </div>
      <div class="producto-precio">
        <span class="precio">${formatearMoneda(producto.precio_venta)}</span>
      </div>
    </div>
  `).join('');
};

// Buscar productos
const buscarProductos = (termino) => {
  const productosFiltrados = productosDisponibles.filter(p => 
    p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(termino.toLowerCase()))
  );
  mostrarProductos(productosFiltrados);
};

// Agregar al carrito
window.agregarAlCarrito = (productoId, clickEvent) => {
  const producto = productosDisponibles.find(p => p.id === productoId);
  
  if (!producto) {
    alert('Producto no encontrado');
    return;
  }

  if (producto.stock <= 0) {
    alert('Producto sin stock');
    return;
  }

  const itemExistente = carrito.find(item => item.producto_id === productoId);

  if (itemExistente) {
    if (itemExistente.cantidad >= producto.stock) {
      alert('No hay suficiente stock');
      return;
    }
    itemExistente.cantidad++;
  } else {
    carrito.push({
      producto_id: productoId,
      nombre: producto.nombre,
      precio_unitario: producto.precio_venta,
      cantidad: 1,
      stock_disponible: producto.stock
    });
  }

  actualizarCarrito();
  
  // Feedback visual
  const card = clickEvent?.target?.closest('.producto-card');
  if (card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 200);
  }
};

// Actualizar carrito
const actualizarCarrito = () => {
  const tbody = document.getElementById('carritoBody');
  const subtotalEl = document.getElementById('subtotal');
  const impuestoEl = document.getElementById('impuesto');
  const totalEl = document.getElementById('total');
  const btnProcesar = document.getElementById('btnProcesarVenta');

  if (!tbody) return;

  if (carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cart">🛒 Carrito vacío</td></tr>';
    subtotalEl.textContent = formatearMoneda(0);
    impuestoEl.textContent = formatearMoneda(0);
    totalEl.textContent = formatearMoneda(0);
    btnProcesar.disabled = true;
    return;
  }

  tbody.innerHTML = carrito.map((item, index) => `
    <tr>
      <td>${item.nombre}</td>
      <td>${formatearMoneda(item.precio_unitario)}</td>
      <td>
        <div class="cantidad-control">
          <button onclick="window.cambiarCantidad(${index}, -1)" class="btn-cantidad">−</button>
          <span class="cantidad">${item.cantidad}</span>
          <button onclick="window.cambiarCantidad(${index}, 1)" class="btn-cantidad">+</button>
        </div>
      </td>
      <td>${formatearMoneda(item.precio_unitario * item.cantidad)}</td>
      <td>
        <button onclick="window.eliminarDelCarrito(${index})" class="btn-eliminar">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Calcular totales
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const impuesto = subtotal * 0.18; // IGV 18%
  const total = subtotal + impuesto;

  subtotalEl.textContent = formatearMoneda(subtotal);
  impuestoEl.textContent = formatearMoneda(impuesto);
  totalEl.textContent = formatearMoneda(total);
  btnProcesar.disabled = false;
};

// Cambiar cantidad
window.cambiarCantidad = (index, delta) => {
  const item = carrito[index];
  const nuevaCantidad = item.cantidad + delta;

  if (nuevaCantidad <= 0) {
    window.eliminarDelCarrito(index);
    return;
  }

  if (nuevaCantidad > item.stock_disponible) {
    alert(`Solo hay ${item.stock_disponible} unidades disponibles`);
    return;
  }

  item.cantidad = nuevaCantidad;
  actualizarCarrito();
};

// Eliminar del carrito
window.eliminarDelCarrito = (index) => {
  carrito.splice(index, 1);
  actualizarCarrito();
};

// Procesar venta
window.procesarVenta = async () => {
  if (carrito.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const usuario = storage.get('usuario');
  if (!usuario) {
    alert('No hay usuario autenticado');
    return;
  }

  // Obtener cliente del datalist
  const clienteInput = document.getElementById('clienteInput');
  const clienteNombre = clienteInput.value.trim();
  let clienteId = null;
  
  // Buscar ID del cliente si se seleccionó uno
  if (clienteNombre && clienteNombre !== 'Cliente General') {
    const datalist = document.getElementById('clientesList');
    const options = Array.from(datalist.options);
    const clienteOption = options.find(opt => opt.value === clienteNombre);
    clienteId = clienteOption ? clienteOption.dataset.id : null;
  }

  const metodoPago = document.getElementById('metodoPago').value;
  const notas = document.getElementById('notasVenta').value;

  const btnProcesar = document.getElementById('btnProcesarVenta');
  btnProcesar.disabled = true;
  btnProcesar.textContent = 'Procesando...';

  const venta = {
    cliente_id: clienteId,
    usuario_id: usuario.id,
    productos: carrito.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario
    })),
    metodo_pago: metodoPago,
    descuento: 0,
    notas: notas
  };

  const resultado = await crearVenta(venta);

  if (resultado.success) {
    alert(`✅ Venta procesada exitosamente\nNúmero: ${resultado.numero_venta}\nTotal: ${formatearMoneda(resultado.total)}`);
    window.dispatchEvent(new CustomEvent('venta:registrada', { detail: resultado }));
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    
    // Limpiar formulario
    clienteInput.value = '';
    document.getElementById('metodoPago').value = 'efectivo';
    document.getElementById('notasVenta').value = '';
    
    // Recargar productos (stock actualizado)
    await cargarProductos();
    
    // Imprimir ticket (opcional)
    if (confirm('¿Desea imprimir el ticket?')) {
      imprimirTicket(resultado);
    }
  } else {
    alert('❌ Error al procesar venta: ' + (resultado.message || 'Error desconocido'));
  }

  btnProcesar.disabled = false;
  btnProcesar.textContent = 'Procesar Venta';
};

// Imprimir ticket (simplificado)
const imprimirTicket = (venta) => {
  const ventana = window.open('', 'Ticket', 'width=300,height=500');
  ventana.document.write(`
    <html>
    <head>
      <title>Ticket - ${venta.numero_venta}</title>
      <style>
        body { font-family: monospace; padding: 10px; }
        h2 { text-align: center; }
        .linea { border-top: 1px dashed #000; margin: 10px 0; }
        .total { font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>🏪 Esquina del Ahorro</h2>
      <p>Ticket: ${venta.numero_venta}</p>
      <p>Fecha: ${new Date().toLocaleString()}</p>
      <div class="linea"></div>
      <div class="linea"></div>
      <p class="total">TOTAL: ${formatearMoneda(venta.total)}</p>
      <p style="text-align: center;">¡Gracias por su compra!</p>
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `);
};

// Cancelar venta
window.cancelarVenta = () => {
  if (carrito.length === 0) return;
  
  if (confirm('¿Está seguro de cancelar la venta?')) {
    carrito = [];
    actualizarCarrito();
  }
};

// Configurar eventos
const configurarEventos = () => {
  const buscarInput = document.getElementById('buscarProductoPos') || document.getElementById('buscarProducto');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      buscarProductos(e.target.value);
    });
  }

  // Atajo de teclado F2 para enfocar búsqueda
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      buscarInput?.focus();
    }
  });
};

// Modal para agregar cliente rápido
window.mostrarModalCliente = () => {
  const nombre = prompt('Nombre del cliente:');
  if (!nombre) return;
  
  const documento = prompt('Documento (DNI/RUC):');
  
  crearClienteRapido(nombre, documento);
};

const crearClienteRapido = async (nombre, documento) => {
  try {
    // Llamar directamente a la API
    const response = await fetch('http://localhost:3000/api/catalogos/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        documento,
        tipo_documento: 'DNI',
        telefono: '',
        email: '',
        direccion: ''
      })
    });
    
    const resultado = await response.json();

    if (resultado.success) {
      alert('✅ Cliente creado exitosamente');
      await cargarClientes();
      
      // Seleccionar el nuevo cliente en el input
      const clienteInput = document.getElementById('clienteInput');
      clienteInput.value = nombre;
    } else {
      alert('❌ Error al crear cliente');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al crear cliente');
  }
};
