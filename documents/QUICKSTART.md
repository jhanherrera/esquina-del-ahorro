# 🚀 Guía Rápida de Inicio

## Pasos para ejecutar el proyecto

### 1️⃣ Preparar Base de Datos

```bash
# Acceder a MySQL
mysql -u root -p

# Ejecutar el esquema
source database/schema.sql

# O manualmente:
mysql -u root -p < database/schema.sql
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env (abrir con tu editor favorito)
nano .env
```

**Archivo .env mínimo:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=supermercado
```

### 3️⃣ Iniciar Backend

```bash
# Dentro de /backend
npm run dev
```

Deberías ver:
```
╔════════════════════════════════════════╗
║  🏪 Esquina del Ahorro - Backend      ║
║  🚀 Servidor corriendo en puerto 3000  ║
║  📡 http://localhost:3000             ║
╚════════════════════════════════════════╝
✅ MySQL conectado exitosamente
```

### 4️⃣ Abrir Frontend

**Opción A - Live Server (VS Code):**
1. Instalar extensión "Live Server"
2. Abrir `frontend/public/login.html`
3. Click derecho → "Open with Live Server"

**Opción B - HTTP Server simple:**
```bash
cd frontend/public
python -m http.server 5500
```

Luego abrir: `http://localhost:5500/login.html`

### 5️⃣ Acceder al Sistema

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## ✅ Checklist de Verificación

- [ ] MySQL instalado y corriendo
- [ ] Base de datos `supermercado` creada
- [ ] Tablas creadas con el script `schema.sql`
- [ ] Node.js instalado (v18+)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend accesible en el navegador
- [ ] Login exitoso

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
cd backend
rm -rf node_modules
npm install
```

### Error: "Access denied for user"
Verificar credenciales en `.env`:
```env
DB_USER=root
DB_PASSWORD=tu_password_real
```

### Error: "Table doesn't exist"
Ejecutar nuevamente el schema:
```bash
mysql -u root -p supermercado < database/schema.sql
```

### Backend no conecta a MySQL
1. Verificar que MySQL esté corriendo:
```bash
sudo systemctl status mysql
# o
service mysql status
```

2. Verificar puerto MySQL (por defecto 3306)
3. Verificar usuario y contraseña

### Frontend no carga datos
1. Verificar que backend esté corriendo
2. Abrir consola del navegador (F12)
3. Verificar errores de CORS
4. Verificar que la URL del API sea correcta en `helpers.js`

---

## 🎯 Primeros Pasos en la Aplicación

### 1. Explorar el Dashboard
- Ver estadísticas generales
- Productos totales
- Stock bajo

### 2. Agregar Productos
1. Ir a "Productos"
2. Completar formulario:
   - Código: P010
   - Nombre: Producto de prueba
   - Precio venta: 10.00
   - Stock: 50
3. Click "Guardar"

### 3. Ver Productos
- Tabla muestra todos los productos
- Buscar productos en el campo de búsqueda
- Editar o eliminar productos

### 4. Explorar otras secciones
- Ventas (en desarrollo)
- Inventario (en desarrollo)
- Reportes (en desarrollo)

---

## 📞 ¿Necesitas Ayuda?

- 📖 Lee el [README.md](README.md) completo
- 🐛 Reporta bugs en [GitHub Issues](https://github.com/jhanherrera/esquina-del-ahorro/issues)
- 💬 Contacta al desarrollador

---

**¡Listo! Tu sistema debería estar funcionando 🎉**
