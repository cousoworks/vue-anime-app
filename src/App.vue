<template>
  <div id="app">
    <h1>Los 10 animes más populares actualmente xd</h1>
    <div v-if="loading" class="loading">Cargando...</div>

    <!-- Sección de Animes Más Populares -->
    <div class="anime-category">
      <div class="anime-container">
        <div
          v-for="anime in popularAnimes"
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
              <p><strong>Descripción:</strong> {{ anime.shortDescription }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Animes en Emisión -->
    <div class="anime-category">
      <h1>Los 10 Animes más populares en emisión</h1>
      <div class="anime-container">
        <div
          v-for="anime in airingAnimes"
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
              <p><strong>Descripción:</strong> {{ anime.shortDescription }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      popularAnimes: [],
      airingAnimes: [],
      loading: true,
      hover: false,
    };
  },
  mounted() {
    this.fetchAnimes();
  },
  methods: {
    async fetchAnimes() {
      try {
        // Solicitudes a la API de Kitsu para obtener los 2 grupos de animes
        const popularResponse = await axios.get(
          "https://kitsu.io/api/edge/trending/anime"
        );
        console.log("Respuesta popular:", popularResponse.data.data); // Log de la respuesta popular

        const airingResponse = await axios.get(
          "https://kitsu.io/api/edge/anime?filter[status]=current"
        );
        console.log("Respuesta en emisión:", airingResponse.data.data); // Log de la respuesta en emisión

        // Formatear las respuestas
        this.popularAnimes = this.formatAnimes(popularResponse.data.data.slice(0, 10));
        this.airingAnimes = this.formatAnimes(airingResponse.data.data.slice(0, 10));

        // Cambiar el estado de carga
        this.loading = false;
      } catch (error) {
        console.error("Error al obtener los animes:", error);
        this.loading = false;
      }
    },
    formatAnimes(animes) {
      return animes.map((anime) => ({
        id: anime.id,
        title: anime.attributes.canonicalTitle,
        description: anime.attributes.description,
        status: anime.attributes.status,
        image: anime.attributes.posterImage.large,
        previewVideo: anime.attributes.youtubeVideoId // Suponiendo que el video de avance está en YouTube
          ? `https://www.youtube.com/embed/${anime.attributes.youtubeVideoId}`
          : "",
        url: `https://kitsu.io/anime/${anime.id}`,
        shortDescription: this.truncateDescription(anime.attributes.description),
      }));
    },
    truncateDescription(description) {
      const truncated = description.slice(0, 70) + "...";
      return truncated;
    },
    redirectToKitsu(url) {
      window.open(url, "_blank"); // Redirige a la página del anime en Kitsu
    },
  },
};
</script>

<style scoped>
/* Eliminar el margen blanco de la página */

html, body {
  height: 100%;
  width: 100%;
}

/* Fondo con la imagen proporcionada */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  background-image: url('@/assets/wallpaper.png');
  background-size: cover; /* Ajusta la imagen al tamaño de la pantalla */
  background-position: center;
  height: 100%;
  overflow-x: hidden; /* Eliminar desplazamiento horizontal */
  color: white; /* Asegura que el texto sea visible */
  margin: -10px;  /* Eliminar el margen */
  padding: 0;  /* Eliminar el relleno */
}

h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 30px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo oscuro para resaltar el texto */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra sutil */
  color: white;
  max-width: 90%; /* Limitar el tamaño para que no se vea tan grande */
  margin-left: auto;
  margin-right: auto;
}

.loading {
  font-size: 24px;
  color: #ffffff;
}

.anime-category {
  margin-bottom: 100px;
}

.anime-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.anime-card {
  width: 290px;
  background-color: rgba(255, 255, 255, 0.678); /* Fondo semi-transparente */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  position: relative;
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
  padding: 10px;
}

.anime-info h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
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

/* Estilos responsivos */
@media (max-width: 768px) {
  h1 {
    font-size: 22px;
    padding: 12px;
  }

  #app {
    background-size: cover;
    background-attachment: fixed;
  }

  .anime-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    justify-content: center;
    padding: 5px;
  }

  .anime-card {
    width: 90%;
    max-width: 150px;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    padding: 5px;
    
  }
  .anime-info {
  padding: 2px;
}

  .anime-info p {
    font-size: 10px; /* Aumentar el tamaño del texto */
    max-height: 20px; /* Eliminar la restricción de altura */
    overflow: visible; /* Asegura que se vea todo el texto */
    text-overflow: unset;
    white-space: normal; /* Permite saltos de línea */
    text-align: center;
  }
  .anime-info h3 {
  font-size: 16px;
  color: #333;
  
}
}
</style>
