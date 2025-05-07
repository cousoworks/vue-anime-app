<template>
  <div id="app">
    <header class="navbar"></header>

    <!-- Imagen de portada -->
    <div class="cover-image">
      <img 
        src="@/assets/cover-image.png" 
        alt="Imagen de Portada" 
        class="cover-image-img" 
        @click="reloadPage"
        style="cursor: pointer;" 
      />
    </div>
    <h1>Encuentra los <span class="morado">Animes</span> en tendencia</h1>

    <!-- Barra de filtrado -->
    <div class="filter-buttons">
      <button @click="filterAnimes('all')" data-filter-type="all">Todos</button>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" @input="searchAnimes" placeholder="Buscador de anime..." />
      </div>

      <div class="right-buttons">
        <button @click="filterAnimes('recent')" data-filter-type="recent">Más Recientes</button>
        <button @click="filterAnimes('popular')" data-filter-type="popular">Más Populares</button>
        <button @click="filterAnimes('airing')" data-filter-type="airing">En Emisión</button>
        <button @click="filterAnimes('anticipated')" data-filter-type="anticipated">Mejor Valorados</button>
      </div>
    </div>

    <!-- Pantalla de carga con animación -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-bar"></div>
    </div>

    <!-- Sección de Animes Filtrados -->
    <div class="anime-category">
      <div class="anime-container">
        <div
          v-for="anime in filteredAnimes"
          :key="anime.id"
          class="anime-card"
          @mouseover="hover = true"
          @mouseleave="hover = false"
          @click="redirectToKitsu(anime.url)"
        >
          <div class="anime-card-content">
            <div class="anime-status" :class="getStatusClass(anime.status)">
              {{ getStatusText(anime.status) }}
            </div>
            <div v-if="anime.rating !== 'N/A'" class="anime-rating">
              {{ anime.rating }}
            </div>
            <img :src="anime.image" alt="Imagen del Anime" class="anime-image" />
            <div v-if="hover" class="anime-hover">
              <video :src="anime.previewVideo" autoplay loop muted class="anime-preview"></video>
            </div>
            <div class="anime-info">
              <h3>{{ anime.title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <p>© {{ currentYear }} Blayneraptor</p>
    </footer>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      allAnimes: [], // Lista de todos los animes
      loading: true,
      hover: false,
      currentYear: new Date().getFullYear(),
      filteredAnimes: [], // Lista filtrada según el usuario
      popularAiringAnimes: [], // Lista de los 14 animes más populares en emisión
      anticipatedAnimes: [], // Lista de los animes más esperados
      searchQuery: ""
    };
  },
  async mounted() {
    await this.fetchAnimes();
    await this.fetchPopularAiringAnimes();
    await this.fetchAnticipatedAnimes(); // Obtener los animes más esperados
    this.filterAnimes('all');

    // Añadir event listener para los botones de filtro
    document.querySelectorAll('.filter-buttons button').forEach(button => {
      button.addEventListener('click', this.onButtonClick);
    });
  },
  methods: {
    async fetchAnimes() {
      try {
        const requests = [];
        const numRequests = 3;

        for (let i = 0; i < numRequests; i++) {
          requests.push(
            axios.get(`https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=${i * 20}&include=categories`)
          );
        }

        const responses = await Promise.all(requests);

        const totalAnimes = [];
        responses.forEach(response => {
          totalAnimes.push(...this.formatAnimes(response.data.data));
        });

        this.allAnimes = totalAnimes.slice(0, 42);
        this.loading = false;
      } catch (error) {
        console.error("Error al obtener los animes:", error);
        this.loading = false;
      }
    },
    async fetchPopularAiringAnimes() {
      try {
        const response = await axios.get(`https://kitsu.io/api/edge/anime?filter[status]=current&sort=popularityRank&page[limit]=14&include=categories`);
        console.log("Animes en emisión:", response.data.data);
        this.popularAiringAnimes = this.formatAnimes(response.data.data);
      } catch (error) {
        console.error("Error al obtener los animes populares en emisión:", error);
      }
    },
    async fetchAnticipatedAnimes() {
      try {
        const response = await axios.post('https://graphql.anilist.co', {
          query: `
            query {
              Page(page: 1, perPage: 14) {
                media(sort: POPULARITY_DESC, type: ANIME) {
                  id
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  status
                  season
                  seasonYear
                  format
                  episodes
                  duration
                  popularity
                  averageScore
                  description
                  genres
                  meanScore
                }
              }
            }`
        });

        this.anticipatedAnimes = this.formatAnimesAniList(response.data.data.Page.media);
      } catch (error) {
        console.error("Error al obtener los animes más esperados:", error);
      }
    },
    reloadPage() {
      window.scrollTo(0, 0);
      location.reload();
    },
    async searchAnimes() {
      if (!this.searchQuery.trim()) {
        this.filterAnimes('all');
        return;
      }
      try {
        const response = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${this.searchQuery}&include=categories`);
        this.filteredAnimes = this.formatAnimes(response.data.data);
      } catch (error) {
        console.error("Error al buscar el anime:", error);
      }
    },
    formatAnimes(animes) {
      return animes.map((anime) => ({
        id: anime.id,
        title: this.truncateTitle(anime.attributes.canonicalTitle),
        description: anime.attributes.description,
        status: anime.attributes.status,
        image: anime.attributes.posterImage.large,
        previewVideo: anime.attributes.youtubeVideoId
          ? `https://www.youtube.com/embed/${anime.attributes.youtubeVideoId}`
          : "",
        url: `https://kitsu.app/anime/${anime.id}`,
        shortDescription: this.truncateDescription(anime.attributes.description),
        startDate: anime.attributes.startDate || "1900-01-01",
        popularityRank: anime.attributes.popularityRank,
        rating: anime.attributes.averageRating || "N/A",
        genres: anime.attributes.categories ? anime.attributes.categories.map(cat => cat.title).slice(0, 3) : []
      }));
    },
    formatAnimesAniList(animes) {
      return animes.map((anime) => ({
        id: anime.id,
        title: this.truncateTitle(anime.title.romaji || anime.title.english),
        description: anime.description || "Sin descripción",
        status: this.mapAniListStatus(anime.status || "UNKNOWN"),
        image: anime.coverImage.large,
        previewVideo: "",  // AniList no devuelve un preview de video en la API
        url: `https://anilist.co/anime/${anime.id}`,
        shortDescription: this.truncateDescription(anime.description),
        startDate: `${anime.startDate.year || "1900"}-${anime.startDate.month || "01"}-${anime.startDate.day || "01"}`,
        popularityRank: anime.popularity || 0,
        rating: anime.averageScore ? anime.averageScore.toString() : "N/A",
        genres: anime.genres || []
      }));
    },
    mapAniListStatus(status) {
      // Convierte los estados de AniList al formato de Kitsu
      switch (status) {
        case "RELEASING":
          return "current";
        case "FINISHED":
          return "finished";
        case "NOT_YET_RELEASED":
          return "upcoming";
        default:
          return "unknown";
      }
    },
    truncateTitle(title) {
      return title.length > 30 ? title.slice(0, 40) + "..." : title;
    },
    truncateDescription(description) {
      return description ? description.slice(0, 30) + "..." : "Sin descripción";
    },
    redirectToKitsu(url) {
      window.open(url, "_blank");
    },
    filterAnimes(type) {
      // Guardar el contenedor y eliminar las tarjetas actuales
      const container = document.querySelector('.anime-container');
      if (container) {
        // Aplicar una pequeña animación de desvanecimiento al contenedor
        container.style.opacity = '0';
        container.style.transform = 'scale(0.97)';
        
        setTimeout(() => {
          // Actualizar los datos después de la animación de salida
          if (type === 'all') {
            this.filteredAnimes = this.allAnimes;
          } else if (type === 'recent') {
            this.filteredAnimes = [...this.allAnimes]
              .filter(anime => anime.startDate !== "1900-01-01")
              .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
              .slice(0, 14);
          } else if (type === 'popular') {
            this.filteredAnimes = [...this.allAnimes]
              .sort((a, b) => a.popularityRank - b.popularityRank)
              .slice(0, 14);
          } else if (type === 'anticipated') {
            this.filteredAnimes = this.anticipatedAnimes;
          } else if (type === 'airing') {
            this.filteredAnimes = this.popularAiringAnimes;
          }
          
          // Restaurar la visibilidad después de actualizar los datos
          this.$nextTick(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
            
            // Aplicar la animación de entrada a cada tarjeta con retraso escalonado
            const cards = document.querySelectorAll('.anime-card');
            cards.forEach((card, index) => {
              card.style.animationDelay = `${index * 0.05}s`;
            });
          });
        }, 300); // Tiempo suficiente para la animación de salida
      }
    },
    onButtonClick(event) {
      document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.classList.remove('selected');
      });

      const button = event.target;
      button.classList.add('selected');
    },
    getStatusClass(status) {
      switch (status) {
        case 'current':
          return 'status-current';
        case 'finished':
          return 'status-finished';
        case 'upcoming':
          return 'status-upcoming';
        default:
          return 'status-unknown';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'current':
          return 'En Emisión';
        case 'finished':
          return 'Finalizado';
        case 'upcoming':
          return 'Próximamente';
        default:
          return 'Desconocido';
      }
    }
  }
};
</script>




<style scoped>

h1 {
  font-size: 58px;
  font-weight: 700;
  text-align: center;
  color: rgb(255, 255, 255);
  max-width: 90%; /* Limitar el tamaño para que no se vea tan grande */
  margin-left: auto;
  margin-right: auto;
  opacity: 0; /* Inicialmente invisible */
  letter-spacing: 1px; /* Espaciado entre letras */
  font-family: 'Poppins', sans-serif; /* Fuente moderna */
  animation: fadeIn 1s ease-out forwards, slideIn 1s ease-out forwards; /* Animación de desvanecimiento y deslizamiento */
}

/* Color morado en la palabra 'Animes' */
.morado {
  color: #9b4dca; /* Morado vibrante */
  font-family: 'Roboto', sans-serif; /* Fuente diferente para resaltar la palabra */
  text-shadow: 2px 2px 8px rgba(155, 77, 202, 0.8); /* Sombra sutil para resaltar la palabra */
}

/* Animación de desvanecimiento */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px); /* Comienza ligeramente desplazado */
  }
  100% {
    opacity: 1;
    transform: translateY(0); /* Llega a su posición original */
  }
}

/* Animación de deslizamiento para el efecto moderno */
@keyframes slideIn {
  0% {
    transform: translateX(-30px); /* Desliza desde la izquierda */
  }
  100% {
    transform: translateX(0); /* Llega a su posición original */
  }
}


.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
}

.search-bar input {
  color: white;
  width: 20rem;
  padding: 12px 20px 12px 45px;
  font-size: 16px;
  border-radius: 30px;
  border: 1px solid rgba(138, 43, 226, 0.3);
  background: rgba(30, 10, 60, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-bar::before {
  
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  pointer-events: none;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  width: 22rem;
  border-color: rgba(138, 43, 226, 0.6);
  box-shadow: 0 4px 20px rgba(138, 43, 226, 0.3), inset 0 2px 5px rgba(0, 0, 0, 0.1);
  outline: none;
}

.search-bar input:focus + .search-bar::before {
  opacity: 1;
  transform: translateY(-50%) translateX(-5px);
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.search-bar input:focus::placeholder {
  opacity: 0.5;
}


.filter-buttons {
  display: flex;
  justify-content: space-between;
  margin: 20px auto;
  padding: 16px 24px;
  background: rgba(30, 10, 60, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(138, 43, 226, 0.2);
  color: white;
  max-width: 97.5rem;
  position: relative;
  z-index: 10;
  transition: all 0.4s ease;
}

.filter-buttons:hover {
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(138, 43, 226, 0.3);
}

.filter-buttons button {
  font-size: 15px;
  margin: 0 6px;
  padding: 10px 18px;
  background: rgba(80, 20, 120, 0.3);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  position: relative;
  overflow: hidden;
  outline: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-width: 80px; /* Asegura un ancho mínimo uniforme */
}

.filter-buttons button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: all 0.6s ease;
}

.filter-buttons button:hover {
  background: rgba(120, 40, 180, 0.5);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.filter-buttons button:hover::before {
  left: 100%;
}

.filter-buttons button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.filter-buttons button.selected {
  background: linear-gradient(135deg, #9b4dca, #6200ea);
  color: white;
  box-shadow: 0 6px 15px rgba(155, 77, 202, 0.4);
  font-weight: 600;
}

.filter-buttons button.selected:hover {
  background: linear-gradient(135deg, #9b4dca, #6200ea);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(155, 77, 202, 0.5);
}

.right-buttons {
  display: flex;
  justify-content: flex-end; /* Alinea los botones a la derecha */
}

/* Estilos para la imagen de portada */
.cover-image {
  display: flex;
  justify-content: center; /* Centra la imagen horizontalmente */
  margin-top: 100px;
}

.cover-image-img {
  width: 70%; /* Hace que la imagen se ajuste al contenedor */
  height: auto; /* Mantiene la relación de aspecto */
}




/* Estilos para la barra de navegación */
.navbar {
  display: flex;
  justify-content: flex-start; /* Centra todos los elementos en la barra */
  align-items: center;
  background-color: rgba(44, 27, 27, 0); /* Fondo oscuro */
}

.logo {
  position: relative;
}

.logo-image {
  height: 50px; /* Ajusta la altura del logo según sea necesario */
  transition: all 0.3s ease; /* Suaviza la transición para el hover */
}

.logo-image:hover {
  transform: translateY(-5px) scale(1.15); /* Efecto de levantamiento al pasar el ratón */
}



/* Fondo negro que cubre toda la pantalla */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 1;
  transition: opacity 5s ease-in-out;
}

/* Línea que se va a expandir como una televisión */
.loading-bar {
  width: 0%;
  height: 5px;
  background-color: white;
  animation: loadingAnimation 5s ease-out forwards; /* Animación de 3 segundos */
}

/* Animación de carga que expande la barra como una televisión */
@keyframes loadingAnimation {
  0% {
    width: 0%;
  }
  50% {
    width: 60%;
  }
  100% {
    width: 100%;
  }
}



/* Animación de desvanecimiento */
@keyframes fadeIn {
  0% {
    opacity: 0; /* Comienza invisible */
  }
  100% {
    opacity: 1; /* Se hace completamente visible */
  }
}
/* Eliminar el margen blanco de la página */

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden; /* Prevenir scroll lateral */
}

/* Fondo con la imagen proporcionada */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  background-image: url('@/assets/wallpaper.png');
  background-size: cover; /* Ajusta la imagen al tamaño de la pantalla */
  background-position: center;
  background-attachment: fixed; /* Mantiene la imagen de fondo fija al hacer scroll */
  height: 100%;
  overflow-x: hidden; /* Eliminar desplazamiento horizontal */
  color: white; /* Asegura que el texto sea visible */
  margin: -8.4px;  /* Eliminar el margen */
  padding: 0;  /* Eliminar el relleno */
}

.anime-category {
  margin-bottom: 100px;
}

.anime-container {
  display: flex;
  flex-wrap: wrap; /* Permite que los elementos se ajusten a varias filas */
  justify-content: space-between; /* Ajusta el espacio entre las cartas */
  gap: 10px; /* Espacio entre las cartas */
  margin: 0 auto; /* Centra el contenedor en la página */
  padding: 0 10px; /* Ajusta el relleno lateral */
  max-width: 1600px; /* Limita el ancho máximo */
  width: 100%; /* Asegura que ocupe todo el espacio disponible */
}

/* Estilo moderno y tecnológico para las tarjetas de anime */
.anime-card {
  aspect-ratio: 2 / 3.2; /* Proporción más cinematográfica */
  width: calc(14.2857% - 20px);
  background: rgba(20, 20, 30, 0.7); /* Fondo oscuro más tecnológico */
  border: 1px solid rgba(138, 43, 226, 0.5); /* Borde fino neón */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.25), 0 0 15px rgba(138, 43, 226, 0.1); /* Sombra neón */
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); /* Transición más suave */
  backdrop-filter: blur(5px); /* Efecto de cristal */
  text-align: center;
  margin-bottom: 15px;
  /* Añadir animación de entrada */
  animation: cardAppear 0.6s cubic-bezier(0.26, 1.04, 0.54, 1);
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  animation-fill-mode: forwards;
}

/* Animación para la aparición de tarjetas */
@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.anime-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0) 0%, rgba(138, 43, 226, 0.1) 100%);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.anime-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 15px 35px rgba(138, 43, 226, 0.4), 0 0 25px rgba(138, 43, 226, 0.15);
  border-color: rgba(138, 43, 226, 0.8);
}

.anime-card:hover::after {
  opacity: 1;
}

.anime-card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.anime-image {
  width: 100%;
  height: 75%;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
  transition: all 0.4s ease;
  filter: contrast(1.1) saturate(1.2); /* Aumenta el contraste y saturación */
}

.anime-card:hover .anime-image {
  filter: contrast(1.2) saturate(1.4) brightness(1.1); /* Mejora los colores al pasar el ratón */
}

.anime-info {
  padding: 12px;
  height: 25%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(0deg, rgba(30, 10, 60, 0.9) 0%, rgba(20, 20, 30, 0.7) 100%);
  transition: background 0.3s ease;
}

.anime-card:hover .anime-info {
  background: linear-gradient(0deg, rgba(50, 15, 100, 0.9) 0%, rgba(30, 30, 50, 0.7) 100%);
}

.anime-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
  transition: color 0.3s ease;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.anime-card:hover .anime-info h3 {
  color: #bb86fc; /* Color neón al pasar el ratón */
}

.anime-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 10, 20, 0.7); /* Fondo oscuro semitransparente */
  opacity: 0;
  transition: opacity 0.4s ease;
}

.anime-card:hover .anime-hover {
  opacity: 1;
}

.anime-preview {
  width: 90%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

/* Añadir detalles de anime adicionales con animación */
.anime-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px; /* Línea fina en la parte superior */
  background: linear-gradient(90deg, #9b4dca, #6200ea, #bb86fc);
  z-index: 3;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.anime-card:hover::before {
  transform: scaleX(1);
}

/* Añadir indicadores de rating o estado del anime */
.anime-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(138, 43, 226, 0.8);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  z-index: 3;
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.3s ease;
}

.anime-card:hover .anime-rating {
  opacity: 1;
  transform: translateY(0);
}

.anime-status {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  z-index: 3;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
  color: white;
  letter-spacing: 0.5px;
  backdrop-filter: blur(2px);
}

.anime-card:hover .anime-status {
  opacity: 1;
  transform: translateX(0);
}

.status-current {
  background: rgba(25, 200, 122, 0.8); /* Verde para En Emisión */
  border: 1px solid rgba(25, 200, 122, 0.3);
}

.status-finished {
  background: rgba(64, 114, 255, 0.8); /* Azul para Finalizado */
  border: 1px solid rgba(64, 114, 255, 0.3);
}

.status-upcoming {
  background: rgba(255, 165, 0, 0.8); /* Naranja para Próximamente */
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.status-unknown {
  background: rgba(128, 128, 128, 0.8); /* Gris para Desconocido */
  border: 1px solid rgba(128, 128, 128, 0.3);
}

.anime-genres {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 6px;
}

.genre-tag {
  font-size: 10px;
  background: rgba(174, 91, 245, 0.4);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(174, 91, 245, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.anime-card:hover .genre-tag {
  background: rgba(187, 134, 252, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(187, 134, 252, 0.3);
}

@media (max-width: 768px) {
  h1 {
    font-size: 24px;
    padding: 12px;
  }

  .cover-image {
  display: flex;
  justify-content: center; /* Centra la imagen horizontalmente */
  margin-top: 20px;
}

.cover-image-img {
  width: 130%; /* Hace que la imagen se ajuste al contenedor */
  height: auto; /* Mantiene la relación de aspecto */
}
/* Centrar la barra de búsqueda */
.search-bar {
  display: flex;
  justify-content: center; /* Centra el contenido horizontalmente */
  padding: 5px;  /* Reduce el padding */
  border-radius: 10px;
  
}

.search-bar input {
  width: 80%;  /* Reduce el tamaño en móviles */
  padding: 5px;  /* Reduce el padding */
  font-size: 14px; /* Reduce el tamaño de fuente */
  border-radius: 10px;
 
}


/* Centrar los botones de filtro */
.filter-buttons {
  display: flex;
  flex-wrap: wrap; /* Permite que los botones se distribuyan en varias filas */
  justify-content: center; /* Centra los botones horizontalmente */
  background-color: rgba(117, 21, 141, 0.158); /* Fondo oscuro para resaltar el texto */
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(92, 92, 92, 0.2); /* Sombra sutil */
  color: white;
  max-width: 97.5rem; /* Limitar el tamaño para que no se vea tan grande */
  margin: 5px;
  padding: 5px;
  
}
.filter-buttons button {
  
  font-size: 14px; /* Reduce el tamaño de fuente */
  margin: 1px; /* Espacio entre botones */
  padding: 8px 15px; /* Ajusta el tamaño del botón */
  background-color: #9e6e9e1f; /* Color de fondo azul oscuro */
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  border-radius: 20px; /* Bordes redondeados */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background-color 0.3s ease, 
  
}

.filter-buttons button:active {
  background-color: #4c0e64; /* Color del botón cuando está presionado */
}

.filter-buttons button.selected {
  background-color: #500772; /* Azul más oscuro cuando está marcado */
  border: 2px solid #c4a2c7; /* Borde azul claro para mostrar que está seleccionado */
  font-size: 14px; /* Reduce el tamaño de fuente */
}

.filter-buttons button.selected:hover {
  background-color: #390c4b; /* Mantiene el color cuando se pasa el ratón sobre el botón seleccionado */
}

.right-buttons {
  display: flex;
  justify-content: flex-end; /* Alinea los botones a la derecha */
}

  #app {
    background-size: cover;
    background-attachment: fixed;
  }

  .anime-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Tres columnas en móvil */
    gap: 10px;
    justify-items: center; /* Centrar las tarjetas */
    justify-content: center; /* Asegura que todo el grid esté centrado */
    padding: 10px;
  }

  .anime-card {
    width: 100%;
    aspect-ratio: 2 / 3.5;
    margin-bottom: 0;
  }

  .anime-image {
    height: 70%;
    object-fit: cover;
  }

  .anime-info {
    height: 30%;
  }

  .anime-info h3 {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }
  footer {
    position: relative; /* Asegura que esté en la parte inferior */
    bottom: 0;
    width: 100%;
}
}
</style>

