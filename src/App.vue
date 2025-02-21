<template>
  <div id="app">
    <!-- Barra de navegación -->
    <header class="navbar">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
      </div>
      <nav class="nav-buttons">
        <button @click="onButtonClick('button1')">Botón 1</button>
        <button @click="onButtonClick('button2')">Botón 2</button>
        <button @click="onButtonClick('button3')">Botón 3</button>
      </nav>
    </header>

    <!-- Pantalla de carga con animación -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-bar"></div>
    </div>

    <!-- Imagen de portada -->
    <div class="cover-image">
      <img src="@/assets/cover-image.png" alt="Imagen de Portada" class="cover-image-img" />
    </div>

    <!-- Título de la lista de animes -->
    <h1>Lista de Animes</h1>

    <!-- Barra de filtrado -->
    <div class="filter-buttons">
      <button @click="filterAnimes('all')">Todos</button>
      <button @click="filterAnimes('recent')">Más Recientes</button>
      <button @click="filterAnimes('popular')">Más Populares</button>
      <button @click="filterAnimes('airing')">En Emisión</button>
    </div>

    <!-- Sección de Animes Filtrados -->
    <div class="anime-category">
      <div class="anime-container">
        <div
          v-for="(anime, index) in filteredAnimes"
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
            <div class="ranking-icon">{{ index + 1 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de los 14 Animes más Populares en Emisión -->
    
      <div class="anime-container">
        <div
          v-for="(anime, index) in popularAiringAnimes"
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
            <div class="ranking-icon">{{ index + 1 }}</div>
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
      allAnimes: [], // Lista de todos los animes recuperados
      loading: true,
      hover: false,
      currentYear: new Date().getFullYear(), // Año dinámico
      filteredAnimes: [], // Lista de animes que se mostrarán según el filtro
      popularAiringAnimes: [], // Lista de los 14 animes más populares en emisión
    };
  },
  mounted() {
    this.fetchAnimes();
    this.fetchPopularAiringAnimes(); // Obtener los animes más populares en emisión al montar
  },
  methods: {
    async fetchAnimes() {
      try {
        const requests = []; // Arreglo para guardar las promesas de las solicitudes

        // Haremos tres solicitudes para obtener suficientes animes (42 animes)
        const numRequests = 3;

        for (let i = 0; i < numRequests; i++) {
          requests.push(
            axios.get(`https://kitsu.app/api/edge/anime?page[limit]=20&page[offset]=${i * 20}`)
          );
        }

        // Esperar a que todas las solicitudes se completen
        const responses = await Promise.all(requests);

        // Combinar los resultados
        const totalAnimes = [];
        responses.forEach(response => {
          totalAnimes.push(...this.formatAnimes(response.data.data));
        });

        // Guardar todos los animes
        this.allAnimes = totalAnimes.slice(0, 42); // Asegurarse de tener solo 42 animes

        // Mostrar por defecto todos los animes
        this.filterAnimes('all');

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
        createdAt: anime.attributes.createdAt, // Añadido para filtrar por fecha
        popularityRank: anime.attributes.popularityRank // Añadido para ordenar
      }));
    },
    truncateDescription(description) {
      const truncated = description.slice(0, 70) + "...";
      return truncated;
    },
    redirectToKitsu(url) {
      window.open(url, "_blank"); // Redirige a la página del anime en Kitsu
    },
    filterAnimes(type) {
      if (type === 'all') {
        // Mostrar todos los animes
        this.filteredAnimes = this.allAnimes; // Muestra todos los 42 animes
      } else if (type === 'recent') {
        this.filteredAnimes = [...this.allAnimes]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 14);
      } else if (type === 'popular') {
        this.filteredAnimes = [...this.allAnimes]
          .sort((a, b) => a.popularityRank - b.popularityRank)
          .slice(0, 14);
      } else if (type === 'airing') {
        // Mostrar los animes más populares en emisión
        this.filteredAnimes = this.popularAiringAnimes; // Usar la lista de animes populares en emisión
      }
    },
    async fetchPopularAiringAnimes() {
      try {
        const response = await axios.get(`https://kitsu.app/api/edge/anime?page[limit]=14&filter[status]=current&sort=popularityRank`);
        this.popularAiringAnimes = this.formatAnimes(response.data.data); // Formatear y guardar los 14 animes más populares en emisión
      } catch (error) {
        console.error("Error al obtener los animes populares en emisión:", error);
      }
    },
    onButtonClick(buttonName) {
      console.log(`Se hizo clic en ${buttonName}`);
      // Aquí puedes manejar el evento de clic según sea necesario
    }
  }
};
</script>



<style scoped>

.filter-buttons {
  display: flex;
  justify-content: center;
  margin: 20px 0; /* Espacio alrededor de la barra de filtros */
}

.filter-buttons button {
  margin: 0 10px; /* Espacio entre botones */
  padding: 10px 15px; /* Tamaño del botón */
  background-color: #007BFF; /* Color de fondo del botón */
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  border-radius: 5px; /* Bordes redondeados */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
}

.filter-buttons button:hover {
  background-color: #0056b3; /* Color del botón al pasar el mouse */
}

/* Estilos para la imagen de portada */
.cover-image {
  display: flex;
  justify-content: center; /* Centra la imagen horizontalmente */
  margin: 20px 0; /* Espaciado vertical */
}

.cover-image-img {
  width: 90rem; /* Hace que la imagen se ajuste al contenedor */
  height: 40rem; /* Mantiene la relación de aspecto */
}

/* Estilos para la barra de navegación */
.navbar {
  display: flex;
  justify-content: space-between; /* Espacio entre el logo y los botones */
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.7); /* Fondo oscuro */
}

.logo {
  justify-content: flex-start;
}

.logo-image {
  height: 80px; /* Ajusta la altura del logo según sea necesario */
  
}

.nav-buttons {
  display: flex;
  gap: 15px; /* Espacio entre botones */
}

.nav-buttons button {
  padding: 10px 15px;
  background-color: #7f26c9; /* Color de fondo de los botones */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-buttons button:hover {
  background-color: #b1a5a9; /* Color de fondo en hover */
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
  max-width: 1600px; /* Limita el ancho máximo */
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
  width: calc(14.2857% - 10px); /* Ancho de las cartas (5 columnas) en pantallas grandes */
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

