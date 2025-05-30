document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const petNameElement = document.querySelector(".pet-name");
  const petBreedElement = document.getElementById("pet-breed");
  const petSexElement = document.getElementById("pet-sex");
  const petPersonalityElement = document.getElementById("pet-personality");
  const petSterilizedElement = document.getElementById("pet-sterilized");
  const petDescriptionElement = document.getElementById("pet-description");
  const petTypeElement = document.getElementById("pet-type");
  const petAgeElement = document.getElementById("pet-age");
  const petSizeElement = document.getElementById("pet-size");
  const mainPetImageElement = document.getElementById("main-pet-image");
  const adoptionStatusElement = document.getElementById("adoption-status");
  const thumbnailsContainer = document.querySelector(".image-thumbnails");
  const similarPetsContainer = document.getElementById("similar-pets");
  const adoptBtn = document.getElementById("adopt-btn");
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Función para obtener el ID de la mascota de la URL
  function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // Función para cargar las imágenes en miniatura
  function loadThumbnails(pet) {
    // Limpiar contenedor de miniaturas
    thumbnailsContainer.innerHTML = '';
    
    // Crear array de imágenes (principal + adicionales si existen)
    const images = [pet.image];
    if (pet.additionalImages && Array.isArray(pet.additionalImages)) {
      images.push(...pet.additionalImages);
    }
    
    // Si no hay imágenes adicionales, usar la principal repetida para demo
    if (images.length === 1) {
      images.push(pet.image, pet.image);
    }
    
    // Limitar a máximo 3 imágenes
    const displayImages = images.slice(0, 3);
    
    // Crear miniaturas
    displayImages.forEach((imgSrc, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = index === 0 ? 'thumbnail active' : 'thumbnail';
      thumbnail.dataset.index = index;
      
      const img = document.createElement('img');
      img.src = imgSrc || "../media/images/pets/default.jpg";
      img.alt = `${pet.name} - Imagen ${index + 1}`;
      
      thumbnail.appendChild(img);
      thumbnailsContainer.appendChild(thumbnail);
      
      // Añadir evento click
      thumbnail.addEventListener('click', function() {
        // Actualizar imagen principal
        mainPetImageElement.src = imgSrc || "../media/images/pets/default.jpg";
        
        // Actualizar clases active
        document.querySelectorAll('.thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
  }

  // Función para cargar mascotas similares
  function loadSimilarPets(currentPet) {
    fetch(`/api/pets?type=${currentPet.type}&limit=4`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(pets => {
        // Filtrar la mascota actual
        const similarPets = pets.filter(pet => pet._id !== currentPet._id).slice(0, 4);
        
        // Si no hay suficientes mascotas similares, ocultar la sección
        if (similarPets.length === 0) {
          document.querySelector('.similar-pets-section').style.display = 'none';
          return;
        }
        
        // Mostrar mascotas similares
        similarPetsContainer.innerHTML = '';
        similarPets.forEach(pet => {
          const petCard = document.createElement('a');
          petCard.href = `pet_details.html?id=${pet._id}`;
          petCard.className = 'similar-pet-card';
          
          petCard.innerHTML = `
            <div class="similar-pet-image">
              <img src="${pet.image || '../media/images/pets/default.jpg'}" alt="${pet.name}">
            </div>
            <div class="similar-pet-info">
              <h3>${pet.name || 'Sin nombre'}</h3>
              <p>${pet.breed || 'Desconocida'}</p>
            </div>
          `;
          
          similarPetsContainer.appendChild(petCard);
        });
      })
      .catch(error => {
        console.error('Error al cargar mascotas similares:', error);
        document.querySelector('.similar-pets-section').style.display = 'none';
      });
  }

  // Función para formatear la edad
  function formatAge(age) {
    if (age === undefined || age === null) return "Desconocida";
    
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      return `${age} ${age === 1 ? 'año' : 'años'}`;
    }
  }

  const petId = getPetIdFromUrl();
  
  // Configurar el botón de adopción para verificar autenticación
  if (adoptBtn) {
    adoptBtn.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Si el botón ya está deshabilitado (mascota no disponible), no hacer nada
      if (this.classList.contains("disabled")) {
        return;
      }
      
      // Verificar si el usuario está autenticado
      if (isAuthenticated) {
        // Usuario autenticado, redirigir al formulario de adopción con el ID de la mascota
        window.location.href = `./adoption_form.html?petId=${petId}`;
      } else {
        // Usuario no autenticado, redirigir a la página de login con URL de redirección
        const currentUrl = window.location.href;
        window.location.href = `./login.html?redirect=${encodeURIComponent(currentUrl)}`;
      }
    });
  }

  if (petId) {
    // Realizar la petición al backend para obtener los detalles de la mascota
    fetch(`/api/pets/${petId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((pet) => {
        // Rellenar la página con los datos de la mascota
        if (pet) {
          // Información básica
          petNameElement.textContent = pet.name || "Sin nombre";
          petBreedElement.textContent = pet.breed || "Desconocida";
          petSexElement.textContent = pet.gender || "Desconocido";
          petPersonalityElement.textContent = pet.personality || "Desconocida";
          petSterilizedElement.textContent = pet.sterilized ? "Sí" : "No";
          petTypeElement.textContent = pet.type || "Desconocido";
          petAgeElement.textContent = formatAge(pet.age);
          petSizeElement.textContent = pet.size || "Desconocido";
          
          // Descripción
          if (pet.description) {
            petDescriptionElement.textContent = pet.description;
          } else {
            petDescriptionElement.textContent = `¡Hola! Soy ${pet.name || 'una mascota'} y estoy buscando un hogar amoroso. Soy ${pet.personality || 'amigable'} y me encantaría ser parte de tu familia. ¡Ven a conocerme!`;
          }
          
          // Imagen principal
          mainPetImageElement.src = pet.image || "../media/images/pets/default.jpg";
          mainPetImageElement.alt = pet.name || "Imagen de la mascota";
          
          // Estado de adopción
          if (pet.adoptionStatus) {
            adoptionStatusElement.textContent = pet.adoptionStatus;
            if (pet.adoptionStatus.toLowerCase() !== 'available') {
              adoptionStatusElement.style.backgroundColor = '#FF5722';
              adoptBtn.textContent = 'No disponible';
              adoptBtn.classList.add('disabled');
              adoptBtn.href = 'javascript:void(0);';
            }
          }
          
          // Cargar miniaturas
          loadThumbnails(pet);
          
          // Cargar mascotas similares
          loadSimilarPets(pet);
          
          // Actualizar título de la página
          document.title = `${pet.name || 'Mascota'} - Little Pets`;
          
        } else {
          const petDetailsContent = document.querySelector(".pet-details-content");
          petDetailsContent.innerHTML = `
            <div class="pet-not-found">
              <h2>Mascota no encontrada</h2>
              <p>Lo sentimos, no pudimos encontrar la mascota que estás buscando.</p>
              <a href="./pets_catalog.html" class="back-to-catalog">Volver al catálogo</a>
            </div>
          `;
        }
      })
      .catch((error) => {
        console.error("Error al obtener los detalles de la mascota:", error);
        const petDetailsContent = document.querySelector(".pet-details-content");
        petDetailsContent.innerHTML = `
          <div class="pet-not-found">
            <h2>Error al cargar la mascota</h2>
            <p>Lo sentimos, ocurrió un error al cargar los detalles de la mascota.</p>
            <a href="./pets_catalog.html" class="back-to-catalog">Volver al catálogo</a>
          </div>
        `;
      });
  } else {
    console.error("No se proporcionó un ID de mascota en la URL.");
    const petDetailsContent = document.querySelector(".pet-details-content");
    petDetailsContent.innerHTML = `
      <div class="pet-not-found">
        <h2>Información incompleta</h2>
        <p>Falta información para mostrar los detalles de la mascota.</p>
        <a href="./pets_catalog.html" class="back-to-catalog">Volver al catálogo</a>
      </div>
    `;
  }
  
  // Añadir estilos CSS adicionales para las mascotas similares
  const style = document.createElement('style');
  style.textContent = `
    .similar-pet-card {
      display: block;
      text-decoration: none;
      background-color: #f8f8f8;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .similar-pet-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .similar-pet-image {
      height: 150px;
      overflow: hidden;
    }
    
    .similar-pet-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .similar-pet-card:hover .similar-pet-image img {
      transform: scale(1.1);
    }
    
    .similar-pet-info {
      padding: 15px;
    }
    
    .similar-pet-info h3 {
      margin: 0 0 5px;
      font-size: 16px;
      color: #333;
    }
    
    .similar-pet-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    
    .pet-not-found {
      text-align: center;
      padding: 50px 20px;
      background-color: #fff;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
    
    .pet-not-found h2 {
      color: #ff8a2b;
      margin-bottom: 20px;
    }
    
    .back-to-catalog {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #ff8a2b;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
    
    .back-to-catalog:hover {
      background-color: #e67a1e;
    }
    
    .adopt-btn.disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .adopt-btn.disabled:hover {
      background-color: #ccc;
      transform: none;
      box-shadow: none;
    }
  `;
  document.head.appendChild(style);
});
