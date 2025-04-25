document.addEventListener("DOMContentLoaded", () => {
  const profileDetailsDiv = document.querySelector(".profile-info"); // Selecciona el contenedor de la información

  // Función para obtener el token del localStorage (ajústalo si lo guardas en otro lugar)
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();

  if (!token) {
    profileDetailsDiv.innerHTML =
      "<p>No estás autenticado. Por favor, inicia sesión.</p>";
    return;
  }

  fetch("/api/users/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Error al obtener el perfil:", response.status);
        profileDetailsDiv.innerHTML =
          "<p>Error al cargar la información del perfil.</p>";
        return null; // Importante para que el siguiente .then no intente leer un body nulo
      }
      return response.json();
    })
    .then((user) => {
      if (user) {
        // Actualiza los campos del perfil con la información del usuario
        const emailInput = profileDetailsDiv.querySelector(
          'input[value="Email"]'
        );
        const firstNameInput = profileDetailsDiv.querySelector(
          'input[value="Name"]'
        ); // Selecciona el input del "First Name"

        if (emailInput) {
          emailInput.value = user.email || ""; // Puedes usar el email como "username" visual
        }
        if (firstNameInput) {
          firstNameInput.value = user.name || ""; // Muestra el nombre completo por ahora
        }

        console.log("Información del perfil cargada:", user);
      }
    })
    .catch((error) => {
      console.error("Error en la petición del perfil:", error);
      profileDetailsDiv.innerHTML =
        "<p>Error al cargar la información del perfil.</p>";
    });

  const logoutButton = document.getElementById("logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Eliminar el token y la bandera de autenticación del localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");

      // Redirigir al usuario a la página de inicio (o de inicio de sesión)
      window.location.href = "../index.html"; // Ajusta la ruta si es necesario
    });
  }
});
