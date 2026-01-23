import db from "../config/database.js";

// Login de usuarios
export const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Usuario y contraseña son requeridos" 
    });
  }

  db.query(
    "SELECT u.*, r.nombre as rol FROM usuarios u INNER JOIN roles r ON u.rol_id = r.id WHERE u.usuario=? AND u.password=? AND u.activo=1",
    [usuario, password],
    (err, result) => {
      if (err) {
        console.error("❌ Error en login:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error en el servidor" 
        });
      }

      if (result.length > 0) {
        const user = result[0];
        return res.json({ 
          success: true, 
          user: {
            id: user.id,
            usuario: user.usuario,
            nombre_completo: user.nombre_completo,
            rol: user.rol
          }
        });
      }

      res.status(401).json({ 
        success: false, 
        message: "Credenciales incorrectas" 
      });
    }
  );
};

// Obtener todos los usuarios
export const obtenerUsuarios = (req, res) => {
  db.query(
    "SELECT u.id, u.usuario, u.nombre_completo, u.email, u.telefono, r.nombre as rol, u.activo FROM usuarios u INNER JOIN roles r ON u.rol_id = r.id",
    (err, result) => {
      if (err) {
        console.error("❌ Error al obtener usuarios:", err);
        return res.status(500).json([]);
      }
      res.json(result);
    }
  );
};

// Crear nuevo usuario
export const crearUsuario = (req, res) => {
  const { usuario, password, nombre_completo, email, telefono, rol_id } = req.body;

  if (!usuario || !password || !nombre_completo) {
    return res.status(400).json({ 
      success: false, 
      message: "Faltan datos obligatorios" 
    });
  }

  db.query(
    "INSERT INTO usuarios (usuario, password, nombre_completo, email, telefono, rol_id) VALUES (?, ?, ?, ?, ?, ?)",
    [usuario, password, nombre_completo, email, telefono, rol_id || 2],
    (err, result) => {
      if (err) {
        console.error("❌ Error al crear usuario:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al crear usuario" 
        });
      }
      res.json({ 
        success: true, 
        message: "Usuario creado exitosamente",
        id: result.insertId 
      });
    }
  );
};

// Actualizar usuario
export const actualizarUsuario = (req, res) => {
  const { id } = req.params;
  const { usuario, nombre_completo, email, telefono, rol_id, activo } = req.body;

  db.query(
    "UPDATE usuarios SET usuario=?, nombre_completo=?, email=?, telefono=?, rol_id=?, activo=? WHERE id=?",
    [usuario, nombre_completo, email, telefono, rol_id, activo, id],
    (err) => {
      if (err) {
        console.error("❌ Error al actualizar usuario:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error al actualizar" 
        });
      }
      res.json({ 
        success: true, 
        message: "Usuario actualizado" 
      });
    }
  );
};

// Eliminar usuario
export const eliminarUsuario = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM usuarios WHERE id=?", [id], (err) => {
    if (err) {
      console.error("❌ Error al eliminar usuario:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error al eliminar" 
      });
    }
    res.json({ 
      success: true, 
      message: "Usuario eliminado" 
    });
  });
};
