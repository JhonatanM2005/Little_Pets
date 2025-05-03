let allPets = []; // Variable para almacenar todas las mascotas

document.addEventListener("DOMContentLoaded", () => {
  const petsGridContainer = document.querySelector(".pets-grid");
  const categorySelectors = document.querySelectorAll(".category");

  fetch("/api/pets")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((pets) => {
      allPets = pets; // Almacena todas las mascotas
      renderPets(pets); // Renderiza todas las mascotas al cargar la página

      // Resalta la categoría "All" inicialmente (si la añades)
      const allCategory = Array.from(categorySelectors).find(
        (cat) => cat.textContent.trim().toLowerCase() === "all"
      );
    })
    .catch((error) => {
      console.error("Error al obtener el catálogo:", error);
      petsGridContainer.innerHTML =
        "<p>Error al cargar el catálogo de mascotas.</p>";
    });

  function renderPets(petsToRender) {
    const petsGridContainer = document.querySelector(".pets-grid");
    petsGridContainer.innerHTML = ""; // Limpiar el contenedor

    if (petsToRender && petsToRender.length > 0) {
      petsToRender.forEach((pet) => {
        const cardLink = document.createElement("a"); // Crear un enlace
        cardLink.href = `pet_details.html?id=${pet._id}`;

        const card = document.createElement("div");
        card.classList.add("pet-card");
        card.dataset.category = pet.type ? pet.type.toLowerCase() : "";
        card.dataset.breed = pet.breed
          ? pet.breed.toLowerCase().replace(/\s+/g, "-")
          : "";
        card.dataset.age = pet.age !== undefined ? pet.age : "";

        const petImageDiv = document.createElement("div");
        petImageDiv.classList.add("pet-image");

        const imagen = document.createElement("img");
        imagen.src = pet.image || "../media/images/pets/default.jpg";
        imagen.alt = pet.name || "Mascota sin nombre";

        petImageDiv.appendChild(imagen);

        const petInfoDiv = document.createElement("div");
        petInfoDiv.classList.add("pet-info");

        const nombre = document.createElement("h3");
        nombre.textContent = pet.name || "Sin nombre";

        const favoriteBtn = document.createElement("button");
        favoriteBtn.classList.add("favorite-btn");

        const favoriteImg = document.createElement("img");
        favoriteImg.src = "../media/icons/heart.png";
        favoriteImg.alt = "Favorito";

        favoriteBtn.appendChild(favoriteImg);
        petInfoDiv.appendChild(nombre);
        petInfoDiv.appendChild(favoriteBtn);

        card.appendChild(petImageDiv);
        card.appendChild(petInfoDiv);

        cardLink.appendChild(card); // Añadir la tarjeta al enlace
        petsGridContainer.appendChild(cardLink); // Añadir el enlace al contenedor
      });
    } else {
      petsGridContainer.innerHTML =
        "<p>No hay mascotas disponibles en este momento.</p>";
    }
  }

  window.filterPets = function (category) {
    const categorySelectors = document.querySelectorAll(".category");

    if (category.toLowerCase() === "all") {
      renderPets(allPets);
    } else {
      const filteredPets = allPets.filter(
        (pet) => pet.type.toLowerCase() === category.toLowerCase()
      );
      renderPets(filteredPets);
    }

    // Actualizar la clase 'selected' en las categorías
    categorySelectors.forEach((cat) => {
      cat.classList.remove("selected");
      const catType = cat.textContent.trim().toLowerCase();
      if (catType === category.toLowerCase()) {
        setActiveCategory(cat);
      }
    });
  };

  window.resetFilters = function () {
    renderPets(allPets); // Muestra todas las mascotas

    // Deseleccionar todas las categorías
    const categorySelectors = document.querySelectorAll(".category");
    categorySelectors.forEach((cat) => cat.classList.remove("selected"));

    const allCategory = Array.from(categorySelectors).find(
      (cat) => cat.textContent.trim().toLowerCase() === "all"
    );
    if (allCategory) {
      setActiveCategory(allCategory);
    }
  };

  function setActiveCategory(categoryElement) {
    categoryElement.classList.add("selected");
  }
});
