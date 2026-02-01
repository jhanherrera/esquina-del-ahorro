import { api, storage } from '../utils/helpers.js';

// Login
export const login = async (usuario, password) => {
  try {
    const response = await api.post('/usuarios/login', { usuario, password });
    
    if (response.success) {
      storage.set('usuario', response.user);
      return { success: true, user: response.user };
    }
    
    return { success: false, message: response.message };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error de conexión' };
  }
};

// Obtener productos
export const obtenerProductos = async () => {
  try {
    return await api.get('/productos');
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

// Crear producto
export const crearProducto = async (producto) => {
  try {
    return await api.post('/productos', producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return { success: false, message: 'Error al crear producto' };
  }
};

// Actualizar producto
export const actualizarProducto = async (id, producto) => {
  try {
    return await api.put(`/productos/${id}`, producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return { success: false, message: 'Error al actualizar' };
  }
};

// Eliminar producto
export const eliminarProducto = async (id) => {
  try {
    return await api.delete(`/productos/${id}`);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return { success: false, message: 'Error al eliminar' };
  }
};

// Obtener categorías
export const obtenerCategorias = async () => {
  try {
    return await api.get('/catalogos/categorias');
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

// Obtener proveedores
export const obtenerProveedores = async () => {
  try {
    return await api.get('/catalogos/proveedores');
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return [];
  }
};

// Crear venta
export const crearVenta = async (venta) => {
  try {
    return await api.post('/ventas', venta);
  } catch (error) {
    console.error('Error al crear venta:', error);
    return { success: false, message: 'Error al procesar venta' };
  }
};

// Obtener ventas
export const obtenerVentas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams(filtros).toString();
    return await api.get(`/ventas${params ? '?' + params : ''}`);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return [];
  }
};

// Obtener clientes
export const obtenerClientes = async () => {
  try {
    return await api.get('/catalogos/clientes');
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

// Crear cliente
export const crearCliente = async (cliente) => {
  try {
    return await api.post('/catalogos/clientes', cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return { success: false, message: 'Error al crear cliente' };
  }
};

// Inventario
export const obtenerDashboardInventario = async () => {
    try {
        const [inventario, resumen] = await Promise.all([
            api.get('/inventario'),
            api.get('/inventario/valor-total')
        ]);
        return { 
            productos: inventario.success ? inventario.data : [], 
            resumen: resumen.success ? resumen.data : {} 
        };
    } catch (error) {
        console.error('Error al obtener datos del inventario:', error);
        return { productos: [], resumen: {} };
    }
};

export const registrarMovimientoStock = async (datos) => {
    try {
        return await api.post('/inventario/movimiento', datos);
    } catch (error) {
        console.error('Error al registrar movimiento:', error);
        return { success: false, message: 'Error de conexión' };
    }
};
