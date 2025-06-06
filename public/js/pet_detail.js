document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
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
  
  // Verify if the user is authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Function to get the pet ID from the URL
  function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // Function to load thumbnails
  function loadThumbnails(pet) {
    // Clear thumbnails container
    thumbnailsContainer.innerHTML = '';
    
    // Create array of unique images
    const uniqueImages = new Set();
    
    // Add main image if exists
    if (pet.image) {
      uniqueImages.add(pet.image);
    }
    
    // Add additional images if they exist
    if (pet.images && Array.isArray(pet.images)) {
      pet.images.forEach(img => uniqueImages.add(img));
    }
    
    // Convert Set back to Array
    const images = Array.from(uniqueImages);
    
    // If no images are available, use default
    if (images.length === 0) {
      images.push("../media/images/pets/default.jpg");
    }
    
    // Limit to maximum 3 images
    const displayImages = images.slice(0, 3);
    
    // Crear miniaturas
    displayImages.forEach((imgSrc, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = index === 0 ? 'thumbnail active' : 'thumbnail';
      thumbnail.dataset.index = index;
      
      const img = document.createElement('img');
      img.src = imgSrc || "../media/images/pets/default.jpg";
      img.alt = `${pet.name} - Image ${index + 1}`;
      
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

  // Function to load similar pets
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
              <h3>${pet.name || 'Unnamed'}</h3>
              <p>${pet.breed || 'Unknown'}</p>
            </div>
          `;
          
          similarPetsContainer.appendChild(petCard);
        });
      })
      .catch(error => {
        console.error('Error loading similar pets:', error);
        document.querySelector('.similar-pets-section').style.display = 'none';
      });
  }

  // Function to format age
  function formatAge(age) {
    if (age === undefined || age === null) return "Unknown";
    
    if (age < 1) {
      const months = Math.round(age * 12);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      return `${age} ${age === 1 ? 'year' : 'years'}`;
    }
  }

  const petId = getPetIdFromUrl();
  
  // Configure the adoption button to verify authentication
  if (adoptBtn) {
    adoptBtn.addEventListener("click", function(e) {
      e.preventDefault();
      
      // If the button is already disabled (pet not available), do nothing
      if (this.classList.contains("disabled")) {
        return;
      }
      
      // Verify if the user is authenticated
      if (isAuthenticated) {
        // Authenticated user, redirect to adoption form with pet ID
        window.location.href = `./adoption_form.html?petId=${petId}`;
      } else {
        // Unauthenticated user, redirect to login page with redirect URL
        const currentUrl = window.location.href;
        window.location.href = `./login.html?redirect=${encodeURIComponent(currentUrl)}`;
      }
    });
  }

  if (petId) {
    // Make the request to the backend to get the pet details
    fetch(`/api/pets/${petId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((pet) => {
        // Fill the page with pet details
        if (pet) {
          // Basic information
          petNameElement.textContent = pet.name || "Unnamed";
          petBreedElement.textContent = pet.breed || "Unknown";
          petSexElement.textContent = pet.gender || "Unknown";
          petPersonalityElement.textContent = pet.personality || "Unknown";
          petSterilizedElement.textContent = pet.sterilized ? "Yes" : "No";
          petTypeElement.textContent = pet.type || "Unknown";
          petAgeElement.textContent = formatAge(pet.age);
          petSizeElement.textContent = pet.size || "Unknown";
          
          // Description
          if (pet.description) {
            petDescriptionElement.textContent = pet.description;
          } else {
            petDescriptionElement.textContent = `Hello! I'm ${pet.name || 'a pet'} and I'm looking for a loving home. I'm ${pet.personality || 'friendly'} and I'd love to be part of your family. Come meet me!`;
          }
          
          // Main image - use the first available image (either from image field or images array)
          const mainImageSrc = pet.image || (pet.images && pet.images.length > 0 ? pet.images[0] : "../media/images/pets/default.jpg");
          mainPetImageElement.src = mainImageSrc;
          mainPetImageElement.alt = pet.name || "Pet image";
          
          // Adoption status
          if (pet.adoptionStatus) {
            adoptionStatusElement.textContent = pet.adoptionStatus;
            if (pet.adoptionStatus.toLowerCase() !== 'available') {
              adoptionStatusElement.style.backgroundColor = '#FF5722';
              adoptBtn.textContent = 'Not available';
              adoptBtn.classList.add('disabled');
              adoptBtn.href = 'javascript:void(0);';
            }
          }
          
          // Load thumbnails
          loadThumbnails(pet);
          
          // Load similar pets
          loadSimilarPets(pet);
          
          // Update page title
          document.title = `${pet.name || 'Pet'} - Little Pets`;
          
        } else {
          const petDetailsContent = document.querySelector(".pet-details-content");
          petDetailsContent.innerHTML = `
            <div class="pet-not-found">
              <h2>Pet not found</h2>
              <p>We're sorry, we couldn't find the pet you were looking for.</p>
              <a href="./pets_catalog.html" class="back-to-catalog">Back to catalog</a>
            </div>
          `;
        }
      })
      .catch((error) => {
        console.error("Error al obtener los detalles de la mascota:", error);
        const petDetailsContent = document.querySelector(".pet-details-content");
        petDetailsContent.innerHTML = `
          <div class="pet-not-found">
            <h2>Error loading pet</h2>
            <p>We're sorry, an error occurred while loading the pet details.</p>
            <a href="./pets_catalog.html" class="back-to-catalog">Back to catalog</a>
          </div>
        `;
      });
  } else {
    console.error("No se proporcionó un ID de mascota en la URL.");
    const petDetailsContent = document.querySelector(".pet-details-content");
    petDetailsContent.innerHTML = `
      <div class="pet-not-found">
        <h2>Missing information</h2>
        <p>Missing information to display the pet details.</p>
        <a href="./pets_catalog.html" class="back-to-catalog">Back to catalog</a>
      </div>
    `;
  }
  
  // Add additional CSS styles for similar pets
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
