# 🌍 WeTrip - Tu asistente de viajes inteligente

Aplicación web **Full-Stack** que permite a los usuarios consultar información de ciudades, el clima actual, y los mejores lugares turísticos recomendados. Incluye un **Front-Office público** y un **Back-Office privado** con autenticación JWT para la gestión completa del contenido y usuarios.

![WeTrip](https://img.shields.io/badge/Estado-Completado-success)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)

---

## 🚀 Características

### Front-Office (público)

- 🔍 **Buscador de ciudades** con paginación (20 por página)
- 🌤️ **Consulta del clima actual** (Open-Meteo API)
- 🗺️ **Mapa interactivo** con Leaflet + OpenStreetMap
- 📍 **3 lugares turísticos recomendados** por ciudad (ordenados por rating)
- ⭐ **Sistema de favoritos** (solo para usuarios registrados)
- 📱 **Diseño responsive**

### Back-Office (privado)

- 🔐 **Autenticación con JWT** y contraseñas hasheadas con bcrypt
- ⚙️ **CRUD completo de ciudades** (crear, editar, eliminar)
- 📍 **CRUD completo de lugares turísticos**
- ✅ **Activar/desactivar lugares** sin eliminarlos
- 👥 **Gestión de usuarios** con jerarquía de roles
- 🗺️ **Importación masiva de ciudades** desde CountriesNow API
- 📌 **Importación de lugares** desde OpenStreetMap (Overpass API)
- 🌐 **Geocodificación automática** de direcciones con Nominatim

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Uso |
|------------|-----|
| **Node.js** + **Express** | Servidor y API REST |
| **MySQL** + **Sequelize** | Base de datos y ORM |
| **JWT** + **bcryptjs** | Autenticación y hashing |
| **Axios** | Llamadas a APIs externas |
| **dotenv** | Variables de entorno |
| **nodemon** | Recarga automática en desarrollo |

### Frontend
| Tecnología | Uso |
|------------|-----|
| **React 19** | Interfaz de usuario |
| **React Router** | Navegación entre páginas |
| **Axios** | Llamadas al backend |
| **Leaflet** + **react-leaflet** | Mapas interactivos |
| **OpenStreetMap** | Tiles del mapa |

### APIs externas consumidas
| API | Uso |
|-----|-----|
| **Open-Meteo** | Clima actual y geocodificación |
| **OpenStreetMap (Overpass)** | Lugares turísticos (POIs) |
| **Nominatim** | Geocodificación de direcciones |
| **CountriesNow** | Listado de ciudades por país |

---

## 📦 Instalación

### Requisitos previos
- **Node.js** 18 o superior
- **MySQL** 8 o superior
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/JairoRom/WeTrip.git
cd WeTrip
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend/` con:

```env
# Servidor
PORT=5000
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=wetrip
DB_PORT=3306

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRE=7d
```

Crea la base de datos en MySQL:

```sql
CREATE DATABASE wetrip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Arranca el servidor:

```bash
npm run dev
```

El backend estará en `http://localhost:5000`.

### 3. Configurar el Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

El frontend estará en `http://localhost:3000`.

---

## 👤 Crear el usuario administrador

Como solo puede existir un admin, se crea manualmente la primera vez:

### 1. Registrar un usuario

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@wetrip.com","password":"123456"}'
```

### 2. Convertirlo en admin desde MySQL

```sql
USE wetrip;
UPDATE Users SET role='admin' WHERE email='admin@wetrip.com';
```

### 3. Iniciar sesión

Ve a `http://localhost:3000/login` y usa:
- **Email:** `admin@wetrip.com`
- **Contraseña:** `123456`

---

## 🗺️ Scripts de importación

El proyecto incluye scripts para poblar la base de datos automáticamente.

### Importar ciudades de España

```bash
cd backend
node scripts/seed-cities.js
```

Descarga ~1116 ciudades de España desde **CountriesNow API**.

### Geocodificar ciudades sin coordenadas

```bash
node scripts/geocode-missing.js
```

Busca latitud y longitud con **Nominatim** para las ciudades que no las tengan.

**⚠️ Importante:** Nominatim limita a 1 petición/segundo. El script incluye las pausas necesarias.

---

## 🔗 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | ❌ |
| POST | `/api/auth/login` | Inicio de sesión | ❌ |

### Ciudades

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/cities?page=1&limit=20&search=madrid` | Listar con paginación y búsqueda | ❌ |
| GET | `/api/cities/:id` | Detalle de una ciudad | ❌ |
| POST | `/api/cities` | Crear ciudad | 🔒 Admin |
| PUT | `/api/cities/:id` | Editar ciudad | 🔒 Admin |
| DELETE | `/api/cities/:id` | Eliminar ciudad | 🔒 Admin |

### Lugares turísticos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/places/city/:cityId` | Lugares de una ciudad (top 3 activos) | ❌ |
| POST | `/api/places` | Crear lugar | 🔒 Admin |
| PUT | `/api/places/:id` | Editar lugar | 🔒 Admin |
| PATCH | `/api/places/:id/toggle` | Activar/desactivar | 🔒 Admin |
| DELETE | `/api/places/:id` | Eliminar lugar | 🔒 Admin |
| POST | `/api/places/import/:cityId` | Importar desde OSM | 🔒 Admin |

### Clima

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/weather/:city` | Clima actual de una ciudad | ❌ |
| GET | `/api/city-detail/:id` | Ciudad + clima + 3 lugares (combinado) | ❌ |

### Usuarios (Back-Office)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Listar usuarios | 🔒 Admin |
| POST | `/api/users` | Crear usuario (no admin) | 🔒 Admin |
| PUT | `/api/users/:id` | Editar usuario | 🔒 Admin |
| PATCH | `/api/users/:id/role` | Cambiar rol | 🔒 Admin |
| PATCH | `/api/users/:id/toggle` | Activar/desactivar | 🔒 Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | 🔒 Admin |

### Favoritos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/favorites` | Mis ciudades favoritas | 🔒 Usuario |
| POST | `/api/favorites` | Añadir a favoritos | 🔒 Usuario |
| DELETE | `/api/favorites/:cityId` | Quitar de favoritos | 🔒 Usuario |
| GET | `/api/favorites/check/:cityId` | Verificar si es favorito | 🔒 Usuario |

---

## 👥 Roles y jerarquía

El proyecto implementa una **jerarquía estricta de roles**:

| Rol | Gestiona contenido | Gestiona usuarios | Puede eliminarse |
|-----|:------------------:|:-----------------:|:----------------:|
| 👑 **Admin** | ✅ | ✅ | ❌ |
| ✏️ **Editor** | ✅ | ❌ | ✅ |
| 👁️ **Viewer** | ❌ | ❌ | ✅ |

**Reglas de protección:**
- Solo puede existir **un administrador principal** (el original)
- No se pueden crear usuarios con rol `admin` desde la interfaz ni la API
- El admin no puede ser eliminado, desactivado, ni cambiar su propio rol
- Ningún usuario puede eliminarse a sí mismo

---

## 📁 Estructura del proyecto

```
WeTrip/
├── backend/
│   ├── scripts/
│   │   ├── seed-cities.js           # Importar ciudades
│   │   └── geocode-missing.js       # Geocodificar en masa
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión MySQL
│   │   │   └── jwt.js               # Configuración JWT
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── cityController.js
│   │   │   ├── cityDetailController.js
│   │   │   ├── favoriteController.js
│   │   │   ├── placeController.js
│   │   │   ├── userController.js
│   │   │   └── weatherController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # Verificar JWT y roles
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── City.js
│   │   │   ├── Favorite.js
│   │   │   ├── TouristPlace.js
│   │   │   ├── User.js
│   │   │   └── index.js             # Asociaciones
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── cityRoutes.js
│   │   │   ├── cityDetailRoutes.js
│   │   │   ├── favoriteRoutes.js
│   │   │   ├── placeRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── weatherRoutes.js
│   │   ├── services/
│   │   │   ├── geocodingService.js  # Nominatim
│   │   │   ├── overpassService.js   # OpenStreetMap POIs
│   │   │   └── weatherService.js    # Open-Meteo
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.js           # Mapa Leaflet
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── CityForm.js
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── PlaceForm.js
│   │   │   │   └── UsersManagement.js
│   │   │   ├── CityDetail.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   └── MyFavorites.js
│   │   ├── services/
│   │   │   └── api.js               # Axios con interceptores
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
│
└── README.md
```

---

## 🎯 Funcionalidades destacadas

### ✅ Full-Stack completo
Backend + Frontend + Base de datos + API REST + Comunicación HTTP

### ✅ Front-Office y Back-Office
Parte pública accesible para cualquier visitante y panel privado con autenticación

### ✅ Múltiples APIs externas
4 fuentes de datos abiertos integradas: Open-Meteo, OpenStreetMap, Nominatim y CountriesNow

### ✅ Autenticación robusta
JWT, bcrypt, roles con jerarquía, protección del admin principal

### ✅ Contenido exclusivo para usuarios
Sistema de favoritos que requiere registro

### ✅ Importación masiva
1116 ciudades importadas con geocodificación automática

### ✅ Mapas interactivos
Leaflet + OpenStreetMap con marcadores de ciudades y lugares

---

## 👨‍💻 Autor

**Jairo Romero**
- GitHub: [@JairoRom](https://github.com/JairoRom)

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 🙏 Agradecimientos

- [Open-Meteo](https://open-meteo.com/) por la API de clima gratuita
- [OpenStreetMap](https://www.openstreetmap.org/) por los mapas y datos abiertos
- [Nominatim](https://nominatim.org/) por la geocodificación
- [CountriesNow](https://countriesnow.space/) por los datos de ciudades