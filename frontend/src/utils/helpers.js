// Configuración global
const API_URL = "http://localhost:3000/api";

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
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE"
    });
    return response.json();
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

// Cerrar sesión
export const cerrarSesion = () => {
  storage.clear();
  window.location.href = 'login.html';
};

// Mostrar alertas
export const mostrarAlerta = (mensaje, tipo = 'info') => {
  alert(mensaje); // Puedes mejorar esto con SweetAlert2 o similar
};
