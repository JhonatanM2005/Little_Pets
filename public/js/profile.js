document.addEventListener("DOMContentLoaded", () => {
  const profileDetailsDiv = document.querySelector(".profile-info"); // Selecciona el contenedor de la información
  const roleBasedButtonsDiv = document.querySelector(".role-based-buttons"); // Contenedor para botones según rol

  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();

  if (!token) {
    profileDetailsDiv.innerHTML =
      "<p>You are not authenticated. Please log in.</p>";
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
        console.error("Error fetching profile:", response.status);
        profileDetailsDiv.innerHTML =
          "<p>Error loading profile information.</p>";
        return null; // Important so the next .then doesn't try to read a null body
      }
      return response.json();
    })
    .then((user) => {
      if (user) {
        // Updates the profile fields with the user information
        const emailInput = profileDetailsDiv.querySelector(
          'input[value="Email"]'
        );
        const firstNameInput = profileDetailsDiv.querySelector(
          'input[value="Name"]'
        ); // Selects the input for "First Name"

        if (emailInput) {
          emailInput.value = user.email || ""; // You can use the email as the visual "username"
        }
        if (firstNameInput) {
          firstNameInput.value = user.name || ""; // Displays the full name for now
        }

        console.log("Información del perfil cargada:", user);
        
        // Mostrar botones según el rol del usuario
        if (roleBasedButtonsDiv) {
          // Limpiar cualquier contenido previo
          roleBasedButtonsDiv.innerHTML = "";
          
          // Agregar botones según el rol
          if (user.role === "admin") {
            // Administradores tienen acceso a gestión de mascotas y usuarios
            const managePetsBtn = document.createElement("a");
            managePetsBtn.href = "./manage_pets.html";
            managePetsBtn.className = "action-btn";
            managePetsBtn.textContent = "Manage Pets";
            roleBasedButtonsDiv.appendChild(managePetsBtn);
            
            const manageUsersBtn = document.createElement("a");
            manageUsersBtn.href = "./manage_users.html";
            manageUsersBtn.className = "action-btn";
            manageUsersBtn.textContent = "Manage Users";
            roleBasedButtonsDiv.appendChild(manageUsersBtn);
          } else if (user.role === "manager" || user.role === "operator") {
            // Managers y operators tienen acceso a gestión de mascotas
            const managePetsBtn = document.createElement("a");
            managePetsBtn.href = "./manage_pets.html";
            managePetsBtn.className = "action-btn";
            managePetsBtn.textContent = "Manage Pets";
            roleBasedButtonsDiv.appendChild(managePetsBtn);
          }
          // Los usuarios normales no tienen botones adicionales
        }
      }
    })
    .catch((error) => {
      console.error("Error in profile request:", error);
      profileDetailsDiv.innerHTML =
        "<p>Error loading profile information.</p>";
    });

  const logoutButton = document.getElementById("logout-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Removes the token and authentication flag from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");

      // Redirect the user to the home page (or login page)
      window.location.href = "../index.html"; // Adjust the path if necessary
    });
  }
});
