import { login } from '../utils/api.js';

const loginForm = document.getElementById('loginForm');
const usuarioInput = document.getElementById('usuario');
const passwordInput = document.getElementById('password');
const mensajeDiv = document.getElementById('mensaje');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const usuario = usuarioInput.value.trim();
  const password = passwordInput.value.trim();

  if (!usuario || !password) {
    mostrarMensaje('Por favor completa todos los campos', 'error');
    return;
  }

  // Deshabilitar botón durante el proceso
  const boton = loginForm.querySelector('button');
  boton.disabled = true;
  boton.textContent = 'Iniciando...';

  const resultado = await login(usuario, password);

  if (resultado.success) {
    mostrarMensaje('¡Bienvenido! Redirigiendo...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } else {
    mostrarMensaje(resultado.message || 'Credenciales incorrectas', 'error');
    boton.disabled = false;
    boton.textContent = 'Iniciar Sesión';
  }
});

function mostrarMensaje(texto, tipo) {
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje ${tipo}`;
  mensajeDiv.style.display = 'block';

  setTimeout(() => {
    mensajeDiv.style.display = 'none';
  }, 5000);
}
