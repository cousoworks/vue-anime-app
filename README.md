# 🌟 AnimeFind - Vue Anime App

<div align="center">
  <img src="src/assets/logo.png" alt="AnimeFind Logo" width="200"/>
  
  ### 🔥 Descubre y explora el mundo del anime 🔥
  
  [![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Axios](https://img.shields.io/badge/Axios-1.7.9-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![CSS3](https://img.shields.io/badge/CSS3-Advanced-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
  
  [🚀 Demo en Vivo](https://cousoworks.github.io/vue-anime-app/) | [📱 Ver Código](https://github.com/cousoworks/vue-anime-app)
</div>

---

## 📖 Descripción

**AnimeFind** es una aplicación web moderna desarrollada con Vue 3 que permite a los usuarios explorar, buscar y descubrir animes de forma intuitiva. La aplicación consume múltiples APIs para ofrecer información actualizada sobre animes populares, en emisión y mejor valorados.

### ✨ Características Principales

🔍 **Búsqueda Inteligente** - Sistema de búsqueda en tiempo real con resultados instantáneos
📊 **Filtros Avanzados** - Filtra por popularidad, estado de emisión, valoraciones y más
🎬 **Vista Previa** - Videos de preview al hacer hover sobre las tarjetas
📱 **Diseño Responsive** - Optimizado para dispositivos móviles y desktop
⚡ **Carga Rápida** - Optimización de rendimiento con lazy loading
🎨 **Interfaz Moderna** - Diseño atractivo con animaciones fluidas
🔄 **Actualizaciones en Tiempo Real** - Datos actualizados desde APIs externas

---

## 🛠️ Stack Tecnológico

### Frontend
- **Vue 3.2.13** - Framework principal con Composition API
- **Axios 1.7.9** - Cliente HTTP para consumo de APIs
- **CSS3 Avanzado** - Animaciones, transiciones y efectos visuales
- **JavaScript ES6+** - Funcionalidades modernas del lenguaje

### APIs Utilizadas
- **[Kitsu API](https://kitsu.io/api/edge)** - Base de datos principal de animes
- **[AniList GraphQL](https://anilist.co/graphiql)** - Información adicional y valoraciones

### Herramientas de Desarrollo
- **Vue CLI** - Herramientas de desarrollo y build
- **ESLint** - Linting y calidad de código
- **Babel** - Transpilación de JavaScript
- **GitHub Pages** - Despliegue automático

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/cousoworks/vue-anime-app.git
cd vue-anime-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run serve
```

4. **Abrir en el navegador**
```
http://localhost:8080
```

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run serve` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción optimizado |
| `npm run lint` | Análisis y corrección de código |
| `npm run deploy` | Despliegue automático a GitHub Pages |

---

## 🎯 Funcionalidades Detalladas

### 🔍 Sistema de Búsqueda
- Búsqueda en tiempo real mientras escribes
- Resultados instantáneos desde la API de Kitsu
- Manejo de estados de carga y errores

### 📊 Filtros Inteligentes
- **Todos** - Muestra el catálogo completo
- **Más Recientes** - Animes ordenados por fecha de lanzamiento
- **Más Populares** - Basado en ranking de popularidad
- **En Emisión** - Animes actualmente transmitiéndose
- **Mejor Valorados** - Con las mejores puntuaciones

### 🎬 Experiencia de Usuario
- Animaciones suaves entre transiciones
- Efectos hover con videos de preview
- Diseño responsive para todos los dispositivos
- Estados de carga informativos
- Enlaces directos a páginas oficiales

---

## 🌐 APIs y Endpoints

### Kitsu API
```javascript
// Búsqueda de animes
GET https://kitsu.io/api/edge/anime?filter[text]={query}

// Animes populares en emisión
GET https://kitsu.io/api/edge/anime?filter[status]=current&sort=popularityRank

// Catálogo paginado
GET https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]={offset}
```

### AniList GraphQL
```graphql
query {
  Page(page: 1, perPage: 14) {
    media(sort: POPULARITY_DESC, type: ANIME) {
      id
      title { romaji english }
      coverImage { large }
      averageScore
      popularity
    }
  }
}
```

---

## 📱 Responsive Design

La aplicación está optimizada para múltiples dispositivos:

- **Desktop** (1200px+) - Layout completo con grid de 6 columnas
- **Tablet** (768px-1199px) - Grid adaptativo de 4 columnas
- **Mobile** (320px-767px) - Layout vertical optimizado para touch

---

## 🎨 Personalización de Estilos

### Colores Principales
```css
:root {
  --primary-purple: #8B5CF6;
  --secondary-blue: #3B82F6;
  --background-dark: #1F2937;
  --text-light: #F9FAFB;
}
```

### Animaciones Personalizadas
- Transiciones suaves entre filtros
- Efectos de hover en tarjetas
- Animaciones de carga
- Parallax en imágenes de fondo

---

## 🚀 Despliegue

### GitHub Pages (Automático)
```bash
npm run deploy
```

### Build Manual
```bash
npm run build
# Los archivos se generan en la carpeta 'dist/'
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**CousoWorks** - *Desarrollo Frontend Especializado*

- 🌐 [Portfolio](https://github.com/cousoworks)
- 📧 Email: contacto@cousoworks.com
- 💼 LinkedIn: [CousoWorks](https://linkedin.com/in/cousoworks)

---

## 🙏 Agradecimientos

- [Kitsu.io](https://kitsu.io/) por proporcionar la API principal
- [AniList](https://anilist.co/) por los datos adicionales de animes
- [Vue.js](https://vuejs.org/) por el excelente framework
- La comunidad de desarrolladores por el feedback y sugerencias

---

<div align="center">
  
### ⭐ ¡Si te gusta el proyecto, no olvides darle una estrella! ⭐

**Hecho con ❤️ y mucho ☕ por CousoWorks**

</div>
