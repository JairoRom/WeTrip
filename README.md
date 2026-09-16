# 🌍 WeTrip - Tu asistente de viajes

Aplicación web **Full-Stack** que permite a los usuarios consultar información de ciudades, el clima actual, y los mejores lugares turísticos recomendados. Incluye un **Front-Office público** y un **Back-Office privado** con autenticación JWT para la gestión completa del contenido y usuarios.

---

## Características

### Front-Office (público)

- 🔍 **Buscador de ciudades** con paginación (20 por página)
- 🌤️ **Consulta del clima actual** (Open-Meteo API)
- 🗺️ **Mapa interactivo** con Leaflet + OpenStreetMap
- 📍 **3 lugares turísticos recomendados** por ciudad (ordenados por rating)
- ⭐ **Sistema de favoritos** (solo para usuarios registrados)

### Back-Office (privado)

- 🔐 **Autenticación con JWT**
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

## 👤 Crear el usuario administrador

Como solo puede existir un admin, se crea manualmente la primera vez:

### 1. Iniciar sesión

Las credenciales son:
- **Email:** `admin@wetrip.com`
- **Contraseña:** `123456`

---

## Roles y jerarquía

El proyecto implementa una **jerarquía estricta de roles**:

| Rol | Gestiona contenido | Gestiona usuarios | Puede eliminarse |

| 👑 **Admin** | ✅ | ✅ | ❌ |
| ✏️ **Editor** | ✅ | ❌ | ✅ |
| 👁️ **Viewer** | ❌ | ❌ | ✅ |

**Reglas de protección:**
- Solo puede existir **un administrador principal** (el original)
- No se pueden crear usuarios con rol `admin` desde la interfaz ni la API
- El admin no puede ser eliminado, desactivado, ni cambiar su propio rol
- Ningún usuario puede eliminarse a sí mismo

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

---

## 👨‍💻 Autor

**Jairo Romero**
- GitHub: [@JairoRom](https://github.com/JairoRom)
---