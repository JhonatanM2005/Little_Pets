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
      console.error("Error al obtener el catálogo:", error);
      petsGridContainer.innerHTML = "<p>Error al cargar el catálogo de mascotas.</p>";
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

  // Obtener razas únicas de las mascotas actuales
  const uniqueBreeds = [...new Set(allPets.map(pet => pet.breed))].filter(breed => breed);

  uniqueBreeds.forEach((breed) => {
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
    const count = allPets.filter(pet => pet.breed === breed).length;

    const span = document.createElement("span");
    span.textContent = breed;

    const countSpan = document.createElement("span");
    countSpan.className = "count";
    countSpan.textContent = `(${count})`;

    label.appendChild(checkbox);
    label.appendChild(span);
    label.appendChild(countSpan);
    li.appendChild(label);
    breedListContainer.appendChild(li);
  });
}

function filterByType(type) {
  // Actualizar la selección visual
  const catCategory = document.querySelector(".category.cat");
  const dogCategory = document.querySelector(".category.dog");
  const catImg = document.getElementById("catImg");
  const dogImg = document.getElementById("dogImg");

  if (type === "Cat") {
    catImg.src = "../media/images/blob_cat_select.png";
    dogImg.src = "../media/images/blob_dog_unselect.png";
    catCategory.classList.add("selected");
    dogCategory.classList.remove("selected");
    selectedType = "Cat";
  } else if (type === "Dog") {
    catImg.src = "../media/images/blob_cat_unselect.png";
    dogImg.src = "../media/images/blob_dog_select.png";
    catCategory.classList.remove("selected");
    dogCategory.classList.add("selected");
    selectedType = "Dog";
  }

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

  if (pets && pets.length > 0) {
    pets.forEach((pet) => {
      const cardLink = document.createElement("a");
      cardLink.href = `pet_details.html?id=${pet._id}`;

      const card = document.createElement("div");
      card.classList.add("pet-card");
      card.dataset.type = pet.type ? pet.type.toLowerCase() : "";
      card.dataset.breed = pet.breed ? pet.breed.toLowerCase().replace(/\s+/g, "-") : "";
      card.dataset.age = pet.age !== undefined ? pet.age : "";

      const petImageDiv = document.createElement("div");
      petImageDiv.classList.add("pet-image");

      const img = document.createElement("img");
      img.src = pet.image || "../media/images/pets/default.jpg";
      img.alt = pet.name || "Mascota sin nombre";

      petImageDiv.appendChild(img);

      const petInfoDiv = document.createElement("div");
      petInfoDiv.classList.add("pet-info");

      const nameEl = document.createElement("h3");
      nameEl.textContent = pet.name || "Sin nombre";

      const favBtn = document.createElement("button");
      favBtn.classList.add("favorite-btn");
      const favImg = document.createElement("img");
      favImg.src = "../media/icons/heart.png";
      favImg.alt = "Favorito";
      favBtn.appendChild(favImg);

      petInfoDiv.appendChild(nameEl);
      petInfoDiv.appendChild(favBtn);

      card.appendChild(petImageDiv);
      card.appendChild(petInfoDiv);
      cardLink.appendChild(card);
      petsGridContainer.appendChild(cardLink);
    });
  } else {
    petsGridContainer.innerHTML = "<p>No se encontraron mascotas con los filtros seleccionados.</p>";
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
  document.querySelectorAll("#breedList input[type='checkbox']").forEach(cb => {
    cb.checked = false;
  });

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