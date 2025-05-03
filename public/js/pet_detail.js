document.addEventListener("DOMContentLoaded", () => {
  const petNameElement = document.querySelector(".pet-name");
  const breedElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(1) .attribute-item:nth-child(1) p"
  );
  const sexElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(1) .attribute-item:nth-child(2) p"
  );
  const personalityElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(1) .attribute-item:nth-child(3) p"
  );
  const ageElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(1) .attribute-item:nth-child(4) p"
  );
  const sizeElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(2) .attribute-item:nth-child(2) p"
  );
  const sterilizedElement = document.querySelector(
    ".pet-attributes .attributes-row:nth-child(2) .attribute-item:nth-child(3) p"
  );
  const petImageElement = document.querySelector(
    ".pet-image-container .image-wrapper .pet-image"
  );

  // Función para obtener el ID de la mascota de la URL
  function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  const petId = getPetIdFromUrl();

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
          petNameElement.textContent = pet.name || "Sin nombre";
          breedElement.textContent = pet.breed || "Desconocida";
          sexElement.textContent = pet.gender || "Desconocido";
          personalityElement.textContent = pet.personality || "Desconocida";
          ageElement.textContent =
            pet.age !== undefined ? `${pet.age} años` : "Desconocida";
          sizeElement.textContent = pet.size || "Desconocido";
          sterilizedElement.textContent = pet.sterilized ? "Sí" : "No";
          petImageElement.src = pet.image || "../media/images/pets/default.jpg";
          petImageElement.alt = pet.name || "Imagen de la mascota";
        } else {
          const petDetailsContent = document.querySelector(
            ".pet-details-content"
          );
          petDetailsContent.innerHTML =
            "<p>No se encontraron detalles para esta mascota.</p>";
        }
      })
      .catch((error) => {
        console.error("Error al obtener los detalles de la mascota:", error);
        const petDetailsContent = document.querySelector(
          ".pet-details-content"
        );
        petDetailsContent.innerHTML =
          "<p>Error al cargar los detalles de la mascota.</p>";
      });
  } else {
    console.error("No se proporcionó un ID de mascota en la URL.");
    const petDetailsContent = document.querySelector(".pet-details-content");
    petDetailsContent.innerHTML =
      "<p>Falta información para mostrar los detalles de la mascota.</p>";
  }
});
