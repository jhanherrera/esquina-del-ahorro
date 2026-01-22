
//inico de sesion
function login() {
  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: usuario.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data) window.location = "dashboard.html";
    else alert("Datos incorrectos");
  });
}

//agregar prodcuctos

function agregar() {
  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const stock = document.getElementById("stock").value;

  if (!nombre || !precio || !stock) {
    alert("Completa todos los campos");
    return;
  }

  fetch("http://localhost:3000/productos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, precio, stock })
  })
  .then(res => res.json())
  .then(() => {
    listar();
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
  });
}


//listar todos los productos
function listar() {
  fetch("http://localhost:3000/productos")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      data.forEach(p => {
        lista.innerHTML += `
          <tr>
            <td>${p.nombre}</td>
            <td>$${p.precio}</td>
            <td>${p.stock}</td>
            <td>
              <button onclick="eliminar(${p.id})">Eliminar</button>
              <button onclick="editar(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock})">Editar</button>
            </td>
          </tr>
        `;
      });
    });
}
//eliminar productos
function eliminar(id) {
  fetch(`http://localhost:3000/productos/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(() => listar());
}

let idEditar = null;

function editar(id, nombre, precio, stock) {
  idEditar = id;
  document.getElementById("nombre").value = nombre;
  document.getElementById("precio").value = precio;
  document.getElementById("stock").value = stock;
}
//actualizar productos
function actualizar() {
  fetch(`http://localhost:3000/productos/${idEditar}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: nombre.value,
      precio: precio.value,
      stock: stock.value
    })
  })
  .then(res => res.json())
  .then(() => {
    listar();
    idEditar = null;
  });
}

function cerrarSesion() {
  // Borrar sesión
  localStorage.removeItem("usuario");

  // Redirigir al login
  window.location.href = "login.html";
}


listar();
