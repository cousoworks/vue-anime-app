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
            axios.get(`https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=${i * 20}`)
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
        const response = await axios.get(`https://kitsu.io/api/edge/anime?filter[status]=current&sort=popularityRank&page[limit]=14`);
        console.log("Animes en emisión:", response.data.data); // Verifica si la API devuelve datos
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
                  popularity
                  description
                  genres
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
        const response = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${this.searchQuery}`);
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
        rating: anime.attributes.averageRating || "N/A"
      }));
    },
    formatAnimesAniList(animes) {
      return animes.map((anime) => ({
        id: anime.id,
        title: this.truncateTitle(anime.title.romaji || anime.title.english),
        description: anime.description || "Sin descripción",
        status: anime.status || "Desconocido",
        image: anime.coverImage.large,
        previewVideo: "",  // AniList no devuelve un preview de video en la API
        url: `https://anilist.co/anime/${anime.id}`,
        shortDescription: this.truncateDescription(anime.description),
        startDate: `${anime.startDate.year || "1900"}-${anime.startDate.month || "01"}-${anime.startDate.day || "01"}`,
        popularityRank: anime.popularity || 0,
        rating: "N/A" // AniList no tiene un rating específico en esta consulta
      }));
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
    },
    onButtonClick(event) {
      document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.classList.remove('selected');
      });

      const button = event.target;
      button.classList.add('selected');
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
  justify-content: flex-start; /* Alinea los elementos a la izquierda */
  align-items: center; /* Centra verticalmente los elementos */
  width: 100%; /* Asegura que ocupe el ancho completo del contenedor */
  
}

.search-bar input {
  color: white; /* Color del texto ingresado */
  width: 15rem;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #00000000;
  background-color: rgba(178, 113, 194, 0.158); /* Fondo oscuro para resaltar el texto */
}

.search-bar input::placeholder {
  color: white; /* Cambia el color del texto del placeholder a blanco */
  opacity: 1; /* Asegura que el color se vea bien en algunos navegadores */
}


.filter-buttons {
  display: flex;
  justify-content: space-between; /* Distribuir los botones entre la izquierda y la derecha */
  margin: 20px;
  padding: 20px;
  background-color: rgba(178, 113, 194, 0.158); /* Fondo oscuro para resaltar el texto */
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(92, 92, 92, 0.2); /* Sombra sutil */
  color: white;
  max-width: 97.5rem; /* Limitar el tamaño para que no se vea tan grande */
  margin-left: auto;
  margin-right: auto;
}

.filter-buttons button {
  font-size: 14px; /* Aumenta el tamaño del texto */
  margin: 0 10px; /* Espacio entre botones */
  padding: 8px 15px; /* Ajusta el tamaño del botón */
  background-color: #9e6e9e1f; /* Color de fondo azul oscuro */
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  border-radius: 20px; /* Bordes redondeados */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background-color 0.3s ease, transform 0.2s ease; /* Transición suave */
}


.filter-buttons button:hover {
  background-color: #5f0f77; /* Color del botón al pasar el mouse */
  transform: scale(1.05); /* Aumenta ligeramente el tamaño del botón */
}

.filter-buttons button:active {
  background-color: #4c0e64; /* Color del botón cuando está presionado */
  transform: scale(1); /* Mantiene el tamaño original cuando se hace clic */
}

.filter-buttons button.selected {
  background-color: #500772; /* Azul más oscuro cuando está marcado */
  border: 2px solid #c4a2c7; /* Borde azul claro para mostrar que está seleccionado */
}

.filter-buttons button.selected:hover {
  background-color: #390c4b; /* Mantiene el color cuando se pasa el ratón sobre el botón seleccionado */
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


/* Ajuste para la carta del anime */
.anime-card {
  aspect-ratio: 2 / 4; /* Ajusté la proporción a algo más pequeño */
  width: calc(14.2857% - 20px); /* Ancho de las cartas (5 columnas), ajusté el margen */
  background: linear-gradient(to bottom, white, rgb(55, 12, 83), rgba(147, 38, 161, 0.301)); /* Gradiente blanco-morado-rosa */

  border-radius: 8px; /* Bordes más pequeños */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.7); /* Sombra más sutil */
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  position: relative; /* Importante para posicionar el icono relativo */
  margin-bottom: 15px; /* Espacio entre filas reducido */
}

.anime-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.anime-card-content {
  position: relative;
}

.anime-image {
  width: 100%;
  height: auto;
  border-radius: 10px 10px 0 0;
}

.anime-info {
  padding: 1px;
  
}

.anime-info h3 {
  font-size: 20px;
  color: #ffffff;
}

.anime-info p {
  color: #666;
  font-size: 14px;
}

.anime-info p strong {
  font-weight: bold;
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
}

.anime-preview {
  width: 80%;
  height: auto;
  border-radius: 10px;
}
footer {
  
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  position: relative;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

footer p {
  margin: 0;
}

/* Estilos responsivos */
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
    grid-template-columns: repeat(3, 1fr); /* Dos columnas en móvil */
    gap: 10px;
    justify-items: center; /* Asegura que las columnas estén centradas */
    padding: 0 0px; /* Da espacio a los lados */
  }

  .anime-card {
  width: 100%; /* Asegura que la tarjeta ocupe todo el ancho disponible */
  height: auto;
  background: linear-gradient(to bottom, white, rgb(55, 12, 83), rgba(147, 38, 161, 0.301)); /* Gradiente blanco-morado-rosa */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  position: relative;
  margin-bottom: 10px; /* Reduce la separación entre las filas */
}

.anime-image {
  width: 100%; /* Hace que la imagen ocupe todo el ancho del contenedor */
  height: 175px; /* Controla la altura de la imagen */
  object-fit: cover; /* Asegura que la imagen cubra el espacio sin distorsionarse */
  border-radius: 8px;
}

  .anime-info {
    font-size: 8px; /* Aumenta el tamaño del texto */
  }

  .anime-info p {
    font-size: 8px; /* Aumenta el tamaño del texto */
    max-height: 20px; /* Elimina la restricción de altura */
    overflow: visible; /* Asegura que se vea todo el texto */
    text-overflow: unset;
    white-space: normal; /* Permite saltos de línea */
    text-align: center;
  }

  .anime-info h3 {
    font-size: 13px;
    color: #ffffff;
    margin-bottom: 20px;
  }
  footer {
    position: relative; /* Asegura que esté en la parte inferior */
    bottom: 0;
    width: 100%;
}
}
</style>

