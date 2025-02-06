<template>
  <div id="app">
    <!-- Pantalla de carga con animación -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-bar"></div>
    </div>

    <!-- Título principal -->
    <h1>Los 10 animes más populares actualmente</h1>
    
    <!-- Sección de Animes Más Populares -->
    <div class="anime-category">
      <div class="anime-container">
        <div
          v-for="(anime, index) in popularAnimes"
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
            <!-- Icono con el número de ranking -->
            <div class="ranking-icon">{{ index + 1 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Animes en Emisión -->
    <div class="anime-category">
      <h1>Los 10 Animes más populares en emisión</h1>
      <div class="anime-container">
        <div
          v-for="(anime, index) in airingAnimes"
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
            <!-- Icono con el número de ranking -->
            <div class="ranking-icon">{{ index + 1 }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <footer>
      <p>&copy; {{ currentYear }} Blayneraptor</p>
    </footer>
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
      currentYear: new Date().getFullYear(), // Año dinámico
    };
  },
  mounted() {
    this.fetchAnimes();
    this.startLoading();
  },
  methods: {
    async fetchAnimes() {
      try {
        // Solicitudes a la nueva API de Kitsu para obtener los 2 grupos de animes
        const popularResponse = await axios.get(
          "https://kitsu.app/api/edge/trending/anime"
        );
        console.log("Respuesta popular:", popularResponse.data.data);

        const airingResponse = await axios.get(
          "https://kitsu.app/api/edge/anime?filter[status]=current"
        );
        console.log("Respuesta en emisión:", airingResponse.data.data);

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
        previewVideo: anime.attributes.youtubeVideoId
          ? `https://www.youtube.com/embed/${anime.attributes.youtubeVideoId}`
          : "",
        url: `https://kitsu.app/anime/${anime.id}`,
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
    startLoading() {
      setTimeout(() => {
        this.loading = false; // Cambiar el estado de carga después de 2 segundos
      }, 3000); // La pantalla de carga dura 3 segundos
    }
  }
};
</script>

<style scoped>


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

  opacity: 0; /* Inicialmente invisible */
  animation: fadeIn 3s ease-out forwards; /* Aplicamos la animación de desvanecimiento */
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
  max-width: 1400px; /* Limita el ancho máximo */
  width: 100%; /* Asegura que ocupe todo el espacio disponible */
}

/* Estilos para el icono de ranking */
.ranking-icon {
  position: absolute;
  top: 5px; /* Ajusta la distancia desde la parte superior */
  left: 5px; /* Ajusta la distancia desde la parte izquierda */
  background-color: rgba(0, 0, 0, 0.3); /* Fondo oscuro */
  color: white;
  border-radius: 40%; /* Forma circular */
  width: 30px; /* Tamaño del círculo */
  height: 30px; /* Tamaño del círculo */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px; /* Tamaño de fuente */
  font-weight: bold;
  z-index: 10; /* Asegura que esté por encima de otros elementos */
}

/* Ajuste para la carta del anime */
.anime-card {
  width: calc(20% - 10px); /* Ancho de las cartas (5 columnas) en pantallas grandes */
  background-color: rgba(255, 255, 255, 0.678); /* Fondo semi-transparente */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  position: relative; /* Importante para posicionar el icono relativo */
  margin-bottom: 20px; /* Espacio entre filas */
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
  font-size: 20px;
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
    font-size: 22px;
    padding: 12px;
  }

  #app {
    background-size: cover;
    background-attachment: fixed;
  }

  .anime-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Dos columnas en móvil */
    gap: 10px;
    justify-items: center; /* Asegura que las columnas estén centradas */
    padding: 0 0px; /* Da espacio a los lados */
  }

  .anime-card {
    width: 90%;
    max-width: 150px;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
    padding: 5px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-align: center;
    position: relative;
    margin-bottom: 20px; /* Reduce la separación entre las filas */
  }

  .anime-info {
    padding: 2px;
  }

  .anime-info p {
    font-size: 10px; /* Aumenta el tamaño del texto */
    max-height: 20px; /* Elimina la restricción de altura */
    overflow: visible; /* Asegura que se vea todo el texto */
    text-overflow: unset;
    white-space: normal; /* Permite saltos de línea */
    text-align: center;
  }

  .anime-info h3 {
    font-size: 16px;
    color: #333;
  }
  footer {
    position: relative; /* Asegura que esté en la parte inferior */
    bottom: 0;
    width: 100%;
}
}
</style>

