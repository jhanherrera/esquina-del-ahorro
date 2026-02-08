// Configuracion global de API con fallback de puertos.
const construirBasesApi = () => {
  const bases = [];

  const agregar = (url) => {
    if (!url) return;
    const normalizada = String(url).replace(/\/+$/, '');
    if (normalizada && !bases.includes(normalizada)) {
      bases.push(normalizada);
    }
  };

  if (typeof window !== 'undefined') {
    const baseGuardada = localStorage.getItem('api_url');
    agregar(baseGuardada);

    const host = window.location.hostname || 'localhost';
    agregar(`http://${host}:3000/api`);
    agregar(`http://${host}:3001/api`);
    agregar('http://localhost:3000/api');
    agregar('http://localhost:3001/api');
  } else {
    agregar('http://localhost:3000/api');
    agregar('http://localhost:3001/api');
  }

  return bases;
};

const API_BASES = construirBasesApi();
let apiBaseActiva = API_BASES[0] || 'http://localhost:3000/api';

const requestJSON = async (endpoint, options = {}) => {
  let ultimoError = null;

  const candidatas = [apiBaseActiva, ...API_BASES.filter((b) => b !== apiBaseActiva)];

  for (const base of candidatas) {
    try {
      const response = await fetch(`${base}${endpoint}`, options);
      const data = await response.json().catch(() => ({}));

      apiBaseActiva = base;
      if (typeof window !== 'undefined') {
        localStorage.setItem('api_url', base);
      }

      if (!response.ok && typeof data === 'object' && data !== null && !('success' in data)) {
        data.success = false;
        data.status = response.status;
      }

      return data;
    } catch (error) {
      ultimoError = error;
    }
  }

  throw ultimoError || new Error('No se pudo conectar con la API');
};

// Utilidades para localStorage
export const storage = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};

// Utilidades para fetch
export const api = {
  get: async (endpoint) => {
    return requestJSON(endpoint, { method: 'GET' });
  },

  post: async (endpoint, data) => {
    return requestJSON(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  put: async (endpoint, data) => {
    return requestJSON(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  delete: async (endpoint) => {
    return requestJSON(endpoint, {
      method: 'DELETE'
    });
  }
};

// Formatear moneda
export const formatearMoneda = (valor) => {
  return `S/ ${parseFloat(valor).toFixed(2)}`;
};

// Formatear fecha
export const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE');
};

// Validar usuario autenticado
export const verificarAutenticacion = () => {
  const usuario = storage.get('usuario');
  if (!usuario) {
    window.location.href = 'login.html';
    return false;
  }
  return usuario;
};

// Cerrar sesion
export const cerrarSesion = () => {
  storage.clear();
  window.location.href = 'login.html';
};

// Mostrar alertas
export const mostrarAlerta = (mensaje, tipo = 'info') => {
  alert(mensaje);
};
