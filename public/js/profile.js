document.addEventListener("DOMContentLoaded", () => {
  const profileDetailsDiv = document.querySelector(".profile-info"); // Selecciona el contenedor de la información

  // Función para obtener el token del localStorage (ajústalo si lo guardas en otro lugar)
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

        console.log("Profile information loaded:", user);
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
