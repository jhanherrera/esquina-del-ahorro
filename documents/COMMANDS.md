# 🛠️ Comandos Útiles - Esquina del Ahorro

Guía rápida de comandos para desarrollo, mantenimiento y producción.

---

## 📦 Instalación Inicial

```bash
# Clonar repositorio
git clone https://github.com/jhanherrera/esquina-del-ahorro.git
cd esquina-del-ahorro

# Instalar dependencias backend
cd backend
npm install
cd ..
```

---

## 🗄️ Base de Datos

### Crear Base de Datos

```bash
# Opción 1: Desde terminal MySQL
mysql -u root -p
CREATE DATABASE supermercado;
USE supermercado;
SOURCE database/schema.sql;
EXIT;

# Opción 2: Comando directo
mysql -u root -p < database/schema.sql
```

### Backup y Restore

```bash
# Hacer backup
mysqldump -u root -p supermercado > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p supermercado < backup_20260122.sql

# Backup completo con estructura
mysqldump -u root -p --databases supermercado > backup_completo.sql
```

### Verificar Datos

```bash
# Conectar a MySQL
mysql -u root -p supermercado

# Ver tablas
SHOW TABLES;

# Ver usuarios
SELECT * FROM usuarios;

# Ver productos
SELECT * FROM productos;

# Contar registros
SELECT COUNT(*) FROM productos;

# Ver productos con stock bajo
SELECT nombre, stock, stock_minimo FROM productos WHERE stock <= stock_minimo;
```

---

## 🚀 Servidor Backend

### Desarrollo

```bash
cd backend

# Iniciar con nodemon (auto-reload)
npm run dev

# Verificar que esté corriendo
curl http://localhost:3000/health
```

### Producción

```bash
cd backend

# Modo producción
npm start

# Con PM2 (recomendado para producción)
npm install -g pm2
pm2 start src/index.js --name "esquina-backend"
pm2 status
pm2 logs esquina-backend
pm2 stop esquina-backend
pm2 restart esquina-backend
```

### Verificar Estado

```bash
# Verificar puerto 3000
lsof -i :3000

# O con netstat
netstat -tuln | grep 3000

# Matar proceso en puerto 3000 si es necesario
kill -9 $(lsof -t -i:3000)
```

---

## 🌐 Frontend

### Servidor de Desarrollo

```bash
# Opción 1: Python (si tienes Python instalado)
cd frontend/public
python3 -m http.server 5500

# Opción 2: Node http-server
npx http-server frontend/public -p 5500

# Opción 3: PHP (si tienes PHP)
cd frontend/public
php -S localhost:5500
```

### Abrir en Navegador

```bash
# Linux
xdg-open http://localhost:5500/login.html

# macOS
open http://localhost:5500/login.html

# Windows
start http://localhost:5500/login.html
```

---

## 🧪 Testing de API

### Con curl

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"admin123"}'

# Obtener productos
curl http://localhost:3000/api/productos

# Crear producto
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "P999",
    "nombre": "Producto Test",
    "precio_venta": 10.50,
    "stock": 100
  }'

# Obtener productos con stock bajo
curl http://localhost:3000/api/productos/stock-bajo
```

### Con HTTPie (más legible)

```bash
# Instalar HTTPie
pip install httpie

# Login
http POST localhost:3000/api/usuarios/login \
  usuario=admin \
  password=admin123

# Obtener productos
http GET localhost:3000/api/productos

# Crear producto
http POST localhost:3000/api/productos \
  codigo=P999 \
  nombre="Producto Test" \
  precio_venta=10.50 \
  stock=100
```

---

## 🔧 Mantenimiento

### Limpiar y Reinstalar

```bash
cd backend

# Eliminar node_modules
rm -rf node_modules

# Limpiar cache de npm
npm cache clean --force

# Reinstalar
npm install
```

### Actualizar Dependencias

```bash
cd backend

# Ver paquetes desactualizados
npm outdated

# Actualizar un paquete específico
npm update express

# Actualizar todos (con cuidado)
npm update

# Actualizar a últimas versiones (más agresivo)
npx npm-check-updates -u
npm install
```

### Ver Logs

```bash
# Logs del backend en desarrollo
npm run dev

# Si usas PM2
pm2 logs esquina-backend

# Ver últimas 100 líneas
pm2 logs esquina-backend --lines 100
```

---

## 🔍 Debugging

### Encontrar Errores

```bash
# Ver puertos en uso
sudo lsof -i -P -n | grep LISTEN

# Ver procesos Node.js
ps aux | grep node

# Ver uso de memoria
free -h

# Espacio en disco
df -h
```

### Logs de MySQL

```bash
# Ver log de errores de MySQL
sudo tail -f /var/log/mysql/error.log

# Ver queries lentas
sudo tail -f /var/log/mysql/slow-queries.log
```

---

## 📊 Monitoreo

### Recursos del Sistema

```bash
# CPU y memoria en tiempo real
htop

# O con top
top

# Espacio usado por directorio
du -sh backend/
du -sh frontend/
du -sh database/
```

### Base de Datos

```bash
# Tamaño de la base de datos
mysql -u root -p -e "
SELECT 
  table_schema 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'supermercado'
GROUP BY table_schema;
"

# Ver conexiones activas
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🔐 Seguridad

### Cambiar Contraseñas

```bash
# Conectar a MySQL
mysql -u root -p supermercado

# Cambiar contraseña de admin
UPDATE usuarios 
SET password = 'nueva_contraseña_segura' 
WHERE usuario = 'admin';
```

### Generar Claves Secretas

```bash
# Generar clave aleatoria para JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# O con OpenSSL
openssl rand -hex 64
```

---

## 🚢 Despliegue

### Preparar para Producción

```bash
# 1. Configurar .env para producción
cd backend
cp .env.example .env
nano .env
# Cambiar NODE_ENV=production

# 2. Instalar solo dependencias de producción
npm install --production

# 3. Iniciar con PM2
pm2 start src/index.js --name esquina-backend -i max
pm2 startup
pm2 save
```

### Nginx (Proxy Reverse)

```bash
# Instalar Nginx
sudo apt install nginx

# Configurar
sudo nano /etc/nginx/sites-available/esquina

# Contenido:
server {
    listen 80;
    server_name tu-dominio.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /ruta/a/frontend/public;
        index login.html;
        try_files $uri $uri/ =404;
    }
}

# Activar
sudo ln -s /etc/nginx/sites-available/esquina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 Git

### Comandos Básicos

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: nueva funcionalidad"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline --graph
```

### Branching

```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Merge
git merge feature/nueva-funcionalidad

# Eliminar rama
git branch -d feature/nueva-funcionalidad
```

---

## 📋 Cheatsheet Rápido

```bash
# Backend
cd backend && npm run dev          # Iniciar desarrollo
cd backend && npm start             # Iniciar producción

# Base de datos
mysql -u root -p < database/schema.sql    # Crear BD
mysqldump -u root -p supermercado > backup.sql  # Backup

# Frontend
cd frontend/public && python3 -m http.server 5500

# Testing
curl http://localhost:3000/health         # Health check
curl http://localhost:3000/api/productos  # Ver productos

# PM2
pm2 start src/index.js --name esquina    # Iniciar
pm2 logs esquina                          # Ver logs
pm2 restart esquina                       # Reiniciar
pm2 stop esquina                          # Detener
```

---

## 🆘 Solución de Problemas

### Backend no inicia

```bash
# Verificar puerto en uso
lsof -i :3000

# Matar proceso
kill -9 $(lsof -t -i:3000)

# Verificar .env
cat backend/.env

# Reinstalar dependencias
cd backend
rm -rf node_modules
npm install
```

### MySQL no conecta

```bash
# Verificar MySQL corriendo
sudo systemctl status mysql

# Iniciar MySQL
sudo systemctl start mysql

# Ver errores
sudo tail -f /var/log/mysql/error.log

# Probar conexión
mysql -u root -p -e "SELECT 1;"
```

### Frontend no carga

```bash
# Verificar CORS en backend .env
cat backend/.env | grep CORS

# Verificar consola del navegador (F12)
# Verificar URL en frontend/src/utils/helpers.js
cat frontend/src/utils/helpers.js | grep API_URL
```

---

## 💡 Tips

### Atajos Útiles

```bash
# Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
alias backend="cd ~/esquina-del-ahorro/backend && npm run dev"
alias frontend="cd ~/esquina-del-ahorro/frontend/public && python3 -m http.server 5500"
alias mysql-esquina="mysql -u root -p supermercado"
```

### Scripts npm personalizados

```json
// Agregar a backend/package.json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prod": "NODE_ENV=production node src/index.js",
    "db:backup": "mysqldump -u root -p supermercado > backup.sql",
    "db:restore": "mysql -u root -p supermercado < backup.sql"
  }
}
```

---

**¿Más ayuda?** Consulta [README.md](README.md) o [QUICKSTART.md](QUICKSTART.md)
