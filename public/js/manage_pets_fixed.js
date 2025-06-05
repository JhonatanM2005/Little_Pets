document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentPetId = null;
    let isEditMode = false;
    let currentImageFile = null;
    let currentImageUrl = null;
    let currentImagePublicId = null;
    const modal = document.getElementById('pet-modal');
    const modalTitle = document.getElementById('modal-title');
    const addPetButton = document.querySelector('.add-btn');
    const saveButton = document.querySelector('.modal-footer .save-btn');
    const deleteButton = document.querySelector('.modal-footer .delete-btn');
    const cancelButton = document.querySelector('.modal-footer .cancel-btn');
    const closeModalButton = document.querySelector('.close-modal');
    const imageInput = document.getElementById('pet-image');
    const previewImg = document.getElementById('preview-img');
    const currentImageContainer = document.getElementById('current-image-container');
    const currentImage = document.getElementById('current-image');
    
    // Check if the user is authenticated and has appropriate permissions
    function getToken() {
        return localStorage.getItem('token');
    }
    
    const token = getToken();
    
    if (!token) {
        // If there's no token, redirect to login page
        alert('You must log in to access this page');
        window.location.href = '../index.html';
        return;
    }
    
    // Verificar el rol del usuario
    fetch('/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error getting user profile');
        }
        return response.json();
    })
    .then(user => {
        // Verificar si el usuario tiene rol de administrador o manager
        if (user.role !== 'admin' && user.role !== 'manager') {
            // Si no tiene los permisos necesarios, mostrar mensaje y redirigir
            alert('You do not have permission to access this page');
            window.location.href = '../index.html';
            return;
        }
        
        // Si tiene los permisos adecuados, continuar con la carga de la página
        console.log('Usuario autorizado:', user.name, '- Rol:', user.role);
        initializePetManagement();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error verifying permissions');
        window.location.href = '../index.html';
    });
    
    // Variable para almacenar todas las mascotas
    let allPets = [];

    // Initialize pet management
    function initializePetManagement() {
        // Load pet list
        loadPets();
        
        // Event listeners for the modal
        addPetButton.addEventListener('click', openAddPetModal);
        saveButton.addEventListener('click', savePet);
        deleteButton.addEventListener('click', deletePet);
        cancelButton.addEventListener('click', closeModal);
        closeModalButton.addEventListener('click', closeModal);
        
        // Event listener para la vista previa de la imagen
        imageInput.addEventListener('change', handleImagePreview);
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Load pet list from API
    function loadPets() {
        // Show loading indicator
        const tableBody = document.querySelector('.results-table tbody');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading pets...</td></tr>';
        
        fetch('/api/pets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading pets');
            }
            return response.json();
        })
        .then(pets => {
            // Mostrar todas las mascotas
            displayPets(pets);
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading pets</td></tr>';
        });
    }
    
    // No filter functions needed anymore
    
    // Display pets in the table
    function displayPets(pets) {
        const tableBody = document.querySelector('.results-table tbody');
        tableBody.innerHTML = '';
        
        if (!pets || pets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No pets available</td></tr>';
            return;
        }
        
        pets.forEach(pet => {
            const row = document.createElement('tr');
            
            // Formatear la disponibilidad para mostrarla
            let availabilityText = '';
            let availabilityClass = '';
            switch(pet.availability) {
                case 'available':
                    availabilityText = 'Available';
                    availabilityClass = 'status-available';
                    break;
                case 'adopted':
                    availabilityText = 'Adopted';
                    availabilityClass = 'status-adopted';
                    break;
                case 'fostered':
                    availabilityText = 'Fostered';
                    availabilityClass = 'status-fostered';
                    break;
                case 'pending':
                    availabilityText = 'Pending';
                    availabilityClass = 'status-pending';
                    break;
                default:
                    availabilityText = pet.availability || 'Unknown';
                    availabilityClass = 'status-unknown';
            }
            
            // Capitalizar primera letra del tipo y tamaño para mejor presentación
            const petType = pet.type ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1) : '';
            const petSize = pet.size ? pet.size.charAt(0).toUpperCase() + pet.size.slice(1) : '';
            
            // Determinar el sexo (puede estar como sex o gender en el backend)
            const petSex = pet.sex || pet.gender || '';
            const sexText = petSex === 'male' ? 'Male' : petSex === 'female' ? 'Female' : '';
            
            row.innerHTML = `
                <td>${pet.name || ''}</td>
                <td>${petType}</td>
                <td>${pet.breed || ''}</td>
                <td>${pet.age || ''}</td>
                <td>${petSize}</td>
                <td>${sexText}</td>
                <td><span class="status-badge ${availabilityClass}">${availabilityText}</span></td>
                <td>
                    <button class="edit-btn" data-id="${pet._id}">Edit</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const petId = this.getAttribute('data-id');
                openEditPetModal(petId);
            });
        });
    }
    
    // Open modal to add a pet
    function openAddPetModal() {
        isEditMode = false;
        currentPetId = null;
        modalTitle.textContent = 'Add New Pet';
        clearPetForm();
        deleteButton.style.display = 'none';
        modal.classList.add('show');
    }
    
    // Open modal to edit a pet
    function openEditPetModal(petId) {
        isEditMode = true;
        currentPetId = petId;
        modalTitle.textContent = 'Edit Pet';
        deleteButton.style.display = 'inline-block';
        
        // Load pet data
        fetch(`/api/pets/${petId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading pet data');
            }
            return response.json();
        })
        .then(pet => {
            fillPetForm(pet);
            modal.classList.add('show');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading pet data');
        });
    }
    
    // Fill form with pet data
    function fillPetForm(pet) {
        document.getElementById('pet-id').value = pet._id || '';
        document.getElementById('pet-name').value = pet.name || '';
        document.getElementById('pet-breed').value = pet.breed || '';
        document.getElementById('pet-age').value = pet.age || '';
        document.getElementById('pet-size').value = pet.size || '';
        
        // Manejar personality que puede ser array o string
        if (Array.isArray(pet.personality)) {
            document.getElementById('pet-personality').value = pet.personality.join(', ');
        } else {
            document.getElementById('pet-personality').value = pet.personality || '';
        }
        
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Set type radio button
        if (pet.type) {
            const typeValue = pet.type.toLowerCase();
            const typeRadio = document.querySelector(`input[name="pet-type"][value="${typeValue}"]`);
            if (typeRadio) typeRadio.checked = true;
        }
        
        // Set sex radio button (mapped from gender in the backend)
        if (pet.gender) {
            const sexValue = pet.gender.toLowerCase();
            const sexRadio = document.querySelector(`input[name="pet-sex"][value="${sexValue}"]`);
            if (sexRadio) sexRadio.checked = true;
        }
        
        // Set vaccinated radio button
        if (pet.vaccinated !== undefined) {
            const vaccinatedValue = pet.vaccinated ? 'yes' : 'no';
            const vaccinatedRadio = document.querySelector(`input[name="pet-vaccinated"][value="${vaccinatedValue}"]`);
            if (vaccinatedRadio) vaccinatedRadio.checked = true;
        }
        
        // Set sterilized radio button
        if (pet.sterilized !== undefined) {
            const sterilizedValue = pet.sterilized ? 'yes' : 'no';
            const sterilizedRadio = document.querySelector(`input[name="pet-sterilized"][value="${sterilizedValue}"]`);
            if (sterilizedRadio) sterilizedRadio.checked = true;
        }
        
        // Set availability radio button
        if (pet.availability) {
            const availabilityRadio = document.querySelector(`input[name="pet-availability"][value="${pet.availability}"]`);
            if (availabilityRadio) availabilityRadio.checked = true;
        }
        
        // Limpiar la vista previa de la imagen y el input de archivo
        imageInput.value = '';
        previewImg.style.display = 'none';
        previewImg.src = '';
        currentImageFile = null;
        
        // Display image if it exists
        if (pet.image) {
            currentImageUrl = pet.image;
            currentImagePublicId = pet.imagePublicId;
            currentImage.src = pet.image;
            currentImageContainer.style.display = 'block';
        } else {
            currentImageUrl = null;
            currentImagePublicId = null;
            currentImageContainer.style.display = 'none';
        }
    }
    
    // Clear form
    function clearPetForm() {
        document.getElementById('pet-id').value = '';
        document.getElementById('pet-name').value = '';
        document.getElementById('pet-breed').value = '';
        document.getElementById('pet-age').value = '';
        document.getElementById('pet-size').value = '';
        document.getElementById('pet-personality').value = '';
        
        // Uncheck all radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Limpiar la vista previa de la imagen y el input de archivo
        imageInput.value = '';
        previewImg.style.display = 'none';
        previewImg.src = '';
        currentImageFile = null;
        currentImageUrl = null;
        currentImagePublicId = null;
        currentImageContainer.style.display = 'none';
    }
    
    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        clearPetForm();
    }
    
    // Get form data
    function getPetFormData() {
        const petData = {
            name: document.getElementById('pet-name').value.trim(),
            breed: document.getElementById('pet-breed').value.trim(),
            age: document.getElementById('pet-age').value.trim(),
            size: document.getElementById('pet-size').value.trim(),
            personality: document.getElementById('pet-personality').value.trim()
        };
        
        // Get type (cat/dog)
        const typeRadio = document.querySelector('input[name="pet-type"]:checked');
        if (typeRadio) {
            petData.type = typeRadio.value.toLowerCase();
        }
        
        // Get sex (will be mapped to gender in the backend)
        const sexRadio = document.querySelector('input[name="pet-sex"]:checked');
        if (sexRadio) {
            petData.sex = sexRadio.value.toLowerCase();
        }
        
        // Get vaccinated status
        const vaccinatedRadio = document.querySelector('input[name="pet-vaccinated"]:checked');
        if (vaccinatedRadio) {
            petData.vaccinated = vaccinatedRadio.value === 'yes';
        }
        
        // Get sterilized status
        const sterilizedRadio = document.querySelector('input[name="pet-sterilized"]:checked');
        if (sterilizedRadio) {
            petData.sterilized = sterilizedRadio.value === 'yes';
        }
        
        // Get availability
        const availabilityRadio = document.querySelector('input[name="pet-availability"]:checked');
        if (availabilityRadio) {
            petData.availability = availabilityRadio.value.toLowerCase();
        } else {
            // Default value if none is selected
            petData.availability = 'available';
        }
        
        return petData;
    }
    
    // Validate form data
    function validatePetForm() {
        const name = document.getElementById('pet-name').value.trim();
        const breed = document.getElementById('pet-breed').value.trim();
        const age = document.getElementById('pet-age').value.trim();
        const size = document.getElementById('pet-size').value.trim();
        const typeChecked = document.querySelector('input[name="pet-type"]:checked');
        const sexChecked = document.querySelector('input[name="pet-sex"]:checked');
        
        if (!name) {
            alert('Pet name is required');
            return false;
        }
        
        if (!breed) {
            alert('Pet breed is required');
            return false;
        }
        
        if (!age) {
            alert('Pet age is required');
            return false;
        }
        
        if (!size) {
            alert('Pet size is required');
            return false;
        }
        
        if (!typeChecked) {
            alert('You must select if it is a cat or dog');
            return false;
        }
        
        if (!sexChecked) {
            alert('You must select the pet gender');
            return false;
        }
        
        return true;
    }
    
    // Función para manejar la vista previa de la imagen
    function handleImagePreview(event) {
        const file = event.target.files[0];
        if (!file) {
            previewImg.style.display = 'none';
            currentImageFile = null;
            return;
        }
        
        currentImageFile = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // Save pet
    function savePet() {
        if (!validatePetForm()) {
            return;
        }
        
        // Si hay una imagen nueva, primero la subimos a Cloudinary
        if (currentImageFile) {
            const formData = new FormData();
            formData.append('image', currentImageFile);
            
            // Añadir los datos del formulario al FormData
            const petData = getPetFormData();
            Object.keys(petData).forEach(key => {
                formData.append(key, petData[key]);
            });
            
            // Mostrar indicador de carga
            saveButton.disabled = true;
            saveButton.textContent = 'Uploading image...';
            
            // Primero subimos la imagen
            const url = isEditMode ? `/api/pets/${currentPetId}` : '/api/pets';
            const method = isEditMode ? 'PUT' : 'POST';
            
            fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error uploading image');
                }
                return response.json();
            })
            .then((data) => {
                alert(isEditMode ? 'Pet updated successfully' : 'Pet added successfully');
                closeModal();
                loadPets();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error uploading image');
            })
            .finally(() => {
                saveButton.disabled = false;
                saveButton.textContent = 'Save';
            });
        } else {
            // Si no hay imagen nueva, enviamos los datos normalmente
            const petData = getPetFormData();
            
            // Si estamos en modo edición y ya hay una imagen, incluimos la URL
            if (isEditMode && currentImageUrl) {
                petData.image = currentImageUrl;
                if (currentImagePublicId) {
                    petData.imagePublicId = currentImagePublicId;
                }
            }
            
            const url = isEditMode ? `/api/pets/${currentPetId}` : '/api/pets';
            const method = isEditMode ? 'PUT' : 'POST';
            
            fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error saving pet');
                }
                return response.json();
            })
            .then(() => {
                alert(isEditMode ? 'Pet updated successfully' : 'Pet added successfully');
                closeModal();
                loadPets();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error saving pet');
            });
        }
    }
    
    // Delete pet
    function deletePet() {
        if (!currentPetId) {
            alert('Error: No pet has been selected');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this pet?')) {
            return;
        }
        
        fetch(`/api/pets/${currentPetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting pet');
            }
            return response.json();
        })
        .then(() => {
            alert('Pet deleted successfully');
            closeModal();
            loadPets();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting pet');
        });
    }
});
