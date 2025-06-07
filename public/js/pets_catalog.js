let allPets = [];
let selectedBreeds = new Set();
let selectedType = null;

document.addEventListener("DOMContentLoaded", () => {
  const petsGridContainer = document.getElementById("petsGrid");
  const breedListContainer = document.getElementById("breedList");

  // Obtener mascotas
  fetch("/api/pets")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((pets) => {
      allPets = pets;
      renderPets(pets);
      
      // Obtener razas basadas en las mascotas cargadas
      updateBreedFilters();
    })
    .catch((error) => {
      console.error("Error fetching catalog:", error);
      petsGridContainer.innerHTML = "<p>Error loading the pet catalog.</p>";
    });

  // Configurar el slider de edad
  const ageSlider = document.getElementById("ageSlider");
  const ageValue = document.getElementById("ageValue");
  
  ageSlider.addEventListener("input", () => {
    const minAge = 0;
    const maxAge = ageSlider.value;
    ageValue.textContent = `${minAge} - ${maxAge}`;
    applyFilters();
  });
});

function updateBreedFilters() {
  const breedListContainer = document.getElementById("breedList");
  breedListContainer.innerHTML = "";

  // Filtrar razas por tipo si hay uno seleccionado
  let petsToFilter = allPets;
  if (selectedType) {
    petsToFilter = allPets.filter(pet => pet.type === selectedType);
  }

  // Obtener razas únicas de las mascotas filtradas
  const uniqueBreeds = [...new Set(petsToFilter.map(pet => pet.breed))].filter(breed => breed);
  
  // Mostrar solo las primeras 6 razas
  const breedsToShow = uniqueBreeds.slice(0, 6);
  const remainingBreeds = uniqueBreeds.slice(6);

  breedsToShow.forEach((breed) => {
    addBreedToFilter(breed, breedListContainer);
  });

  // Agregar botón "Ver más" si hay más de 6 razas
  if (remainingBreeds.length > 0) {
    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-breeds";
    showMoreBtn.textContent = `Show more (${remainingBreeds.length})`;
    showMoreBtn.addEventListener("click", () => {
      remainingBreeds.forEach(breed => {
        addBreedToFilter(breed, breedListContainer);
      });
      showMoreBtn.remove();
    });
    breedListContainer.appendChild(showMoreBtn);
  }
}

// Función auxiliar para agregar una raza al filtro
function addBreedToFilter(breed, container) {
  const li = document.createElement("li");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "breed";
  checkbox.value = breed;

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedBreeds.add(breed);
    } else {
      selectedBreeds.delete(breed);
    }
    applyFilters();
  });

  // Contar cuántas mascotas hay de esta raza
  const count = allPets.filter(pet => pet.breed === breed && (!selectedType || pet.type === selectedType)).length;

  const span = document.createElement("span");
  span.textContent = breed;

  const countSpan = document.createElement("span");
  countSpan.className = "count";
  countSpan.textContent = `(${count})`;

  label.appendChild(checkbox);
  label.appendChild(span);
  label.appendChild(countSpan);
  li.appendChild(label);
  container.appendChild(li);
}

function filterByType(type) {
  // Actualizar la selección visual
  const catCategory = document.querySelector(".category.cat");
  const dogCategory = document.querySelector(".category.dog");
  const catImg = document.getElementById("catImg");
  const dogImg = document.getElementById("dogImg");

  // Si ya está seleccionado el mismo tipo, deseleccionarlo
  if (selectedType === type) {
    catImg.src = "../media/images/blob_cat_unselect.png";
    dogImg.src = "../media/images/blob_dog_unselect.png";
    catCategory.classList.remove("selected");
    dogCategory.classList.remove("selected");
    selectedType = null;
    console.log("Deseleccionando tipo:", type);
  } else {
    if (type === "cat") {
      catImg.src = "../media/images/blob_cat_select.png";
      dogImg.src = "../media/images/blob_dog_unselect.png";
      catCategory.classList.add("selected");
      dogCategory.classList.remove("selected");
      selectedType = "cat";
      console.log("Seleccionando tipo: cat");
    } else if (type === "dog") {
      catImg.src = "../media/images/blob_cat_unselect.png";
      dogImg.src = "../media/images/blob_dog_select.png";
      catCategory.classList.remove("selected");
      dogCategory.classList.add("selected");
      selectedType = "dog";
      console.log("Seleccionando tipo: dog");
    }
  }

  // Limpiar selección de razas y actualizar lista
  selectedBreeds.clear();
  updateBreedFilters();
  applyFilters();
}

function applyFilters() {
  let filteredPets = [...allPets];
  const ageSlider = document.getElementById("ageSlider");
  const maxAge = parseInt(ageSlider.value);

  // Aplicar filtro por tipo
  if (selectedType) {
    filteredPets = filteredPets.filter(pet => pet.type === selectedType);
  }

  // Aplicar filtro por raza
  if (selectedBreeds.size > 0) {
    filteredPets = filteredPets.filter(pet => selectedBreeds.has(pet.breed));
  }

  // Aplicar filtro por edad
  filteredPets = filteredPets.filter(pet => {
    const petAge = parseInt(pet.age) || 0;
    return petAge >= 0 && petAge <= maxAge;
  });

  renderPets(filteredPets);
}

function renderPets(pets) {
  const petsGridContainer = document.getElementById("petsGrid");
  petsGridContainer.innerHTML = "";

  // Filtrar para mostrar solo mascotas disponibles o con solicitudes pendientes
  const availablePets = pets.filter(pet => pet.availability !== "adopted");

  if (availablePets && availablePets.length > 0) {
    availablePets.forEach((pet) => {
      const cardLink = document.createElement("a");
      cardLink.href = `pet_details.html?id=${pet._id}`;
      cardLink.classList.add("pet-link");

      const card = document.createElement("div");
      card.classList.add("pet-card");
      card.dataset.type = pet.type ? pet.type.toLowerCase() : "";
      card.dataset.breed = pet.breed ? pet.breed.toLowerCase().replace(/\s+/g, "-") : "";
      card.dataset.age = pet.age !== undefined ? pet.age : "";

      const petImageDiv = document.createElement("div");
      petImageDiv.classList.add("pet-image");

      const img = document.createElement("img");
      img.src = pet.image || "../media/images/pets/default.jpg";
      img.alt = pet.name || "Unnamed pet";
      img.loading = "lazy"; // Lazy loading for better performance

      // Add status badge
      const statusBadge = document.createElement("div");
      statusBadge.classList.add("status-badge");
      
      if (pet.adoptionStatus === "pending") {
        statusBadge.classList.add("pending");
        statusBadge.innerHTML = '<i class="fas fa-clock"></i> Pending';
      } else {
        statusBadge.classList.add("available");
        statusBadge.innerHTML = '<i class="fas fa-heart"></i> Available';
      }
      
      petImageDiv.appendChild(img);
      petImageDiv.appendChild(statusBadge);

      const petInfo = document.createElement("div");
      petInfo.classList.add("pet-info");

      const name = document.createElement("h3");
      name.textContent = pet.name || "Unnamed pet";

      const breed = document.createElement("p");
      breed.classList.add("breed");
      breed.textContent = pet.breed || "Unknown breed";

      const age = document.createElement("p");
      age.classList.add("age");
      age.textContent = pet.age ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'} old` : "Age unknown";

      petInfo.appendChild(name);
      petInfo.appendChild(breed);
      petInfo.appendChild(age);

      card.appendChild(petImageDiv);
      card.appendChild(petInfo);
      cardLink.appendChild(card);
      petsGridContainer.appendChild(cardLink);
    });
  } else {
    const noResults = document.createElement("div");
    noResults.classList.add("no-results");
    noResults.innerHTML = `
      <img src="../media/images/no_results.png" alt="No results found">
      <p>No pets found matching your criteria.</p>
      <button onclick="resetFilters()" class="reset-filters-btn">
        <i class="fas fa-undo"></i> Reset Filters
      </button>
    `;
    petsGridContainer.appendChild(noResults);
  }
}

function resetFilters() {
  // Resetear tipo
  selectedType = null;
  const catCategory = document.querySelector(".category.cat");
  const dogCategory = document.querySelector(".category.dog");
  const catImg = document.getElementById("catImg");
  const dogImg = document.getElementById("dogImg");
  
  catImg.src = "../media/images/blob_cat_unselect.png";
  dogImg.src = "../media/images/blob_dog_unselect.png";
  catCategory.classList.remove("selected");
  dogCategory.classList.remove("selected");

  // Resetear razas
  selectedBreeds.clear();
  updateBreedFilters();

  // Resetear edad
  const ageSlider = document.getElementById("ageSlider");
  ageSlider.value = 15;
  document.getElementById("ageValue").textContent = "0 - 15";

  // Mostrar todas las mascotas
  renderPets(allPets);
}

// Hacer las funciones accesibles globalmente
window.filterByType = filterByType;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;