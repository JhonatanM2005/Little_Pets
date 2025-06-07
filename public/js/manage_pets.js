document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentPetId = null;
    let isEditMode = false;
    let currentImageFiles = [];
    let currentImageUrls = [];
    let currentImagePublicIds = [];
    const modal = document.getElementById('pet-modal');
    const modalTitle = document.getElementById('modal-title');
    const addPetButton = document.querySelector('.add-btn');
    const saveButton = document.querySelector('.modal-footer .save-btn');
    const deleteButton = document.querySelector('.modal-footer .delete-btn');
    const cancelButton = document.querySelector('.modal-footer .cancel-btn');
    const closeModalButton = document.querySelector('.close-modal');
    const imageInput = document.getElementById('pet-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const currentImagesContainer = document.getElementById('current-images-container');
    const currentImagesGrid = document.getElementById('current-images-grid');
    
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
    console.log('Verificando perfil de usuario con token:', token);
    fetch('/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Respuesta del servidor:', response.status, response.statusText);
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error en respuesta:', text);
                throw new Error(`Error getting user profile: ${response.status} ${text}`);
            });
        }
        return response.json();
    })
    .then(user => {
        console.log('Datos de usuario recibidos:', user);
        // Verificar si el usuario tiene rol de administrador o manager
        if (user.role !== 'admin' && user.role !== 'manager') {
            // Si no tiene los permisos necesarios, mostrar mensaje y redirigir
            console.error('Usuario sin permisos suficientes. Rol:', user.role);
            alert('You do not have permission to access this page');
            window.location.href = '../index.html';
            return;
        }
        
        // Si tiene los permisos adecuados, continuar con la carga de la página
        console.log('Usuario autorizado:', user.name, '- Rol:', user.role);
        initializePetManagement();
    })
    .catch(error => {
        console.error('Error al verificar permisos:', error);
        alert('Error verifying permissions: ' + error.message);
        // window.location.href = '../index.html'; // Comentado para poder ver el error en consola
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

        // Agregar validación en tiempo real
        setupRealTimeValidation();
    }
    
    // Load pet list from API
    function loadPets() {
        // Show loading indicator
        const tableBody = document.querySelector('.results-table tbody');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading pets...</td></tr>';
        
        // Cargar todas las mascotas sin filtro inicial
        fetch('/api/pets?availability=all', {
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
            // Guardar todas las mascotas en la variable global
            allPets = pets;
            
            // Filtrar para mostrar todas las mascotas excepto las adoptadas
            const filteredPets = pets.filter(pet => pet.availability !== 'adopted');
            
            // Mostrar las mascotas filtradas
            displayPets(filteredPets);
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
        
        // Añadir filtro para mostrar/ocultar mascotas adoptadas
        const filterContainer = document.querySelector('.pets-results-container');
        if (!document.getElementById('show-adopted-filter')) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'filter-options';
            filterDiv.innerHTML = `
                <label class="filter-checkbox">
                    <input type="checkbox" id="show-adopted-filter"> Show adopted pets
                </label>
            `;
            filterContainer.insertBefore(filterDiv, filterContainer.firstChild);
            
            // Añadir event listener al checkbox
            document.getElementById('show-adopted-filter').addEventListener('change', function() {
                if (this.checked) {
                    // Mostrar todas las mascotas incluyendo adoptadas
                    displayPets(allPets);
                } else {
                    // Mostrar solo mascotas no adoptadas
                    const filteredPets = allPets.filter(pet => pet.availability !== 'adopted');
                    displayPets(filteredPets);
                }
            });
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
    
    // Close modal and reset form
    function closeModal() {
        modal.classList.remove('show');
        clearPetForm();
    }
    
    // Clear pet form
    function clearPetForm() {
        document.getElementById('pet-name').value = '';
        document.getElementById('pet-breed').value = '';
        document.getElementById('pet-age').value = '';
        document.getElementById('pet-size').value = '';
        document.getElementById('pet-personality').value = '';
        
        // Clear radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Clear checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear image preview
        imageInput.value = '';
        imagePreviewContainer.innerHTML = '';
        currentImageFiles = [];
        currentImageUrls = [];
        currentImagePublicIds = [];
        currentImagesContainer.style.display = 'none';
        currentImagesGrid.innerHTML = '';
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
        // Manejar tanto gender como sex para compatibilidad
        const genderValue = pet.gender || pet.sex;
        if (genderValue) {
            console.log('Cargando género de la mascota:', genderValue);
            const sexValue = genderValue.toLowerCase();
            const sexRadio = document.querySelector(`input[name="pet-sex"][value="${sexValue}"]`);
            if (sexRadio) {
                sexRadio.checked = true;
                console.log('Radio button seleccionado:', sexValue);
            } else {
                console.log('No se encontró radio button para el valor:', sexValue);
                console.log('Radio buttons disponibles:', Array.from(document.querySelectorAll('input[name="pet-sex"]')).map(el => el.value));
            }
        } else {
            console.log('La mascota no tiene género definido');
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
        imagePreviewContainer.innerHTML = '';
        currentImageFiles = [];
        
        // Limpiar el contenedor de imágenes actuales
        currentImagesGrid.innerHTML = '';
        
        // Inicializar arrays para imágenes
        currentImageUrls = [];
        currentImagePublicIds = [];
        
        // Mostrar imágenes existentes si las hay
        if (pet.image) {
            // Siempre agregar la imagen principal
            currentImageUrls.push(pet.image);
            currentImagePublicIds.push(pet.imagePublicId || '');
            
            // Agregar la imagen principal al grid
            const mainImageDiv = document.createElement('div');
            mainImageDiv.className = 'current-image';
            
            const mainImageLabel = document.createElement('p');
            mainImageLabel.textContent = 'Main Image';
            mainImageLabel.style.fontWeight = 'bold';
            
            const mainImage = document.createElement('img');
            mainImage.src = pet.image;
            mainImage.alt = 'Main pet image';
            mainImage.style.maxWidth = '100%';
            mainImage.style.maxHeight = '150px';
            
            mainImageDiv.appendChild(mainImageLabel);
            mainImageDiv.appendChild(mainImage);
            currentImagesGrid.appendChild(mainImageDiv);
            
            // Comprobar si hay imágenes adicionales
            if (pet.images && Array.isArray(pet.images) && pet.images.length > 1) {
                // Agregar imágenes adicionales (omitir la primera que ya está como principal)
                for (let i = 1; i < Math.min(pet.images.length, 3); i++) {
                    if (pet.images[i]) {
                        currentImageUrls.push(pet.images[i]);
                        currentImagePublicIds.push(pet.imagesPublicIds && pet.imagesPublicIds[i] ? pet.imagesPublicIds[i] : '');
                        
                        const additionalImageDiv = document.createElement('div');
                        additionalImageDiv.className = 'current-image';
                        
                        const additionalImageLabel = document.createElement('p');
                        additionalImageLabel.textContent = `Additional Image ${i}`;
                        
                        const additionalImage = document.createElement('img');
                        additionalImage.src = pet.images[i];
                        additionalImage.alt = `Additional pet image ${i}`;
                        additionalImage.style.maxWidth = '100%';
                        additionalImage.style.maxHeight = '150px';
                        
                        additionalImageDiv.appendChild(additionalImageLabel);
                        additionalImageDiv.appendChild(additionalImage);
                        currentImagesGrid.appendChild(additionalImageDiv);
                    }
                }
            }
            
            // Mostrar el contenedor de imágenes actuales
            currentImagesContainer.style.display = 'block';
        } else {
            // No hay imágenes
            currentImagesContainer.style.display = 'none';
        }
        
        // Estos elementos se configuran al cargar los datos de la mascota
        // No necesitamos retornar nada aquí, ya que esta función solo rellena el formulario
    
    }
    
    // Validate form data
    function validatePetForm() {
        const name = document.getElementById('pet-name').value.trim();
        const breed = document.getElementById('pet-breed').value.trim();
        const age = document.getElementById('pet-age').value.trim();
        const size = document.getElementById('pet-size').value.trim();
        const typeChecked = document.querySelector('input[name="pet-type"]:checked');
        const sexChecked = document.querySelector('input[name="pet-sex"]:checked');
        const vaccinatedChecked = document.querySelector('input[name="pet-vaccinated"]:checked');
        const sterilizedChecked = document.querySelector('input[name="pet-sterilized"]:checked');
        const availabilityChecked = document.querySelector('input[name="pet-availability"]:checked');
        const personality = document.getElementById('pet-personality').value.trim();
        const imageInput = document.getElementById('pet-images');
        
        // Validar nombre
        if (!name) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the pet name',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-name').focus();
            return false;
        }

        if (name.length < 2 || name.length > 50) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Pet name must be between 2 and 50 characters',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-name').focus();
            return false;
        }
        
        // Validar raza
        if (!breed) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the pet breed',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-breed').focus();
            return false;
        }

        if (breed.length < 2 || breed.length > 50) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Breed must be between 2 and 50 characters',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-breed').focus();
            return false;
        }
        
        // Validar edad
        if (!age) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the pet age',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-age').focus();
            return false;
        }

        // Validar que la edad sea un número válido
        const ageNum = parseFloat(age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 30) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter a valid age between 0 and 30 years',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-age').focus();
            return false;
        }
        
        // Validar tamaño
        if (!size) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the pet size',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-size').focus();
            return false;
        }

        // Validar que el tamaño sea uno de los valores permitidos
        const validSizes = ['Small', 'Medium', 'Large'];
        if (!validSizes.includes(size)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Size must be Small, Medium, or Large',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-size').focus();
            return false;
        }
        
        // Validar tipo (cat/dog)
        if (!typeChecked) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please select if the pet is a cat or dog',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validar sexo
        if (!sexChecked) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please select the pet gender',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validar estado de vacunación
        if (!vaccinatedChecked) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please indicate if the pet is vaccinated',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validar estado de esterilización
        if (!sterilizedChecked) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please indicate if the pet is sterilized',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validar disponibilidad
        if (!availabilityChecked) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please select the pet availability status',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validar personalidad
        if (!personality) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please describe the pet personality',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-personality').focus();
            return false;
        }

        if (personality.length < 10 || personality.length > 500) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Personality description must be between 10 and 500 characters',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            document.getElementById('pet-personality').focus();
            return false;
        }
        
        // Validar imágenes
        if (!isEditMode && (!imageInput.files || imageInput.files.length === 0)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please select at least one image for the pet',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }

        if (imageInput.files && imageInput.files.length > 3) {
            Swal.fire({
                title: 'Validation Error',
                text: 'You can only upload a maximum of 3 images',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }

        // Validar el tamaño y tipo de las imágenes
        if (imageInput.files && imageInput.files.length > 0) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            
            for (let i = 0; i < imageInput.files.length; i++) {
                const file = imageInput.files[i];
                
                if (file.size > maxSize) {
                    Swal.fire({
                        title: 'Validation Error',
                        text: `Image ${file.name} is too large. Maximum size is 5MB`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                    return false;
                }
                
                if (!allowedTypes.includes(file.type)) {
                    Swal.fire({
                        title: 'Validation Error',
                        text: `Invalid file type for ${file.name}. Only JPG and PNG are allowed`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Get pet form data
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
            petData.sex = sexRadio.value.toLowerCase(); // Usar 'sex' en lugar de 'gender' para que el controlador lo mapee correctamente
            console.log('Género seleccionado:', sexRadio.value.toLowerCase());
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
            console.log('Disponibilidad seleccionada:', availabilityRadio.value.toLowerCase());
        } else {
            // Default value if none is selected
            petData.availability = 'available';
            console.log('Usando disponibilidad por defecto: available');
        }
        
        return petData;
    }
    
    // Función para manejar la vista previa de múltiples imágenes
    function handleImagePreview(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            imagePreviewContainer.innerHTML = '';
            currentImageFiles = [];
            return;
        }
        
        // Limitar a máximo 3 imágenes
        const maxFiles = Math.min(files.length, 3);
        currentImageFiles = Array.from(files).slice(0, maxFiles);
        
        // Limpiar el contenedor de vista previa
        imagePreviewContainer.innerHTML = '';
        
        // Crear vista previa para cada imagen
        for (let i = 0; i < maxFiles; i++) {
            const file = files[i];
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview';
            
            const previewImg = document.createElement('img');
            previewImg.className = 'preview-img';
            previewImg.style.maxWidth = '100%';
            previewImg.style.maxHeight = '150px';
            previewImg.style.margin = '5px';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            const imageLabel = document.createElement('p');
            imageLabel.textContent = i === 0 ? 'Main Image' : `Additional Image ${i}`;
            imageLabel.style.margin = '5px 0';
            imageLabel.style.fontWeight = i === 0 ? 'bold' : 'normal';
            
            previewDiv.appendChild(imageLabel);
            previewDiv.appendChild(previewImg);
            imagePreviewContainer.appendChild(previewDiv);
        }
        
        // Mostrar mensaje si se seleccionaron más de 3 imágenes
        if (files.length > 3) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'image-limit-message';
            messageDiv.textContent = `Note: Only the first 3 images will be used.`;
            messageDiv.style.color = '#ff6b6b';
            messageDiv.style.marginTop = '10px';
            imagePreviewContainer.appendChild(messageDiv);
        }
    }
    
    // Save pet
    function savePet() {
        if (!validatePetForm()) {
            return;
        }
        
        // Deshabilitar todos los botones del modal para evitar múltiples envíos
        saveButton.disabled = true;
        deleteButton.disabled = true;
        cancelButton.disabled = true;

        // Mostrar indicador de carga en el botón de guardar
        const originalSaveText = saveButton.textContent;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        // Crear FormData para enviar datos
        const formData = new FormData();
        
        // Añadir los datos del formulario al FormData
        const petData = getPetFormData();
        Object.keys(petData).forEach(key => {
            formData.append(key, petData[key]);
        });
        
        // Si hay imágenes nuevas, las agregamos al FormData
        if (currentImageFiles && currentImageFiles.length > 0) {
            // Agregar cada imagen al FormData (máximo 3)
            for (let i = 0; i < Math.min(currentImageFiles.length, 3); i++) {
                formData.append('images', currentImageFiles[i]);
            }
            
            console.log('Enviando nuevas imágenes:', currentImageFiles.length);
            saveButton.disabled = true;
            saveButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${currentImageFiles.length} image(s)...`;
        } else if (isEditMode) {
            // Si estamos en modo edición y no hay nuevas imágenes, mantenemos las existentes
            if (currentImageUrls && currentImageUrls.length > 0) {
                // Convertir el array a string para depuración
                console.log('Manteniendo imágenes existentes:', JSON.stringify(currentImageUrls));
                console.log('IDs públicos existentes:', JSON.stringify(currentImagePublicIds));
                
                // Usar el formato correcto para los arrays en FormData
                currentImageUrls.forEach((url, index) => {
                    formData.append('existingImageUrls', url);
                    if (currentImagePublicIds && currentImagePublicIds[index]) {
                        formData.append('existingImagePublicIds', currentImagePublicIds[index]);
                    }
                });
            } else {
                console.log('No hay imágenes existentes para mantener');
            }
            
            // Mostrar indicador de carga
            saveButton.disabled = true;
            saveButton.textContent = 'Saving pet...';
        } else {
            // Mostrar indicador de carga
            saveButton.disabled = true;
            saveButton.textContent = 'Saving pet...';
        }
        
        // Enviar datos al servidor
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
                throw new Error('Error saving pet');
            }
            return response.json();
        })
        .then((data) => {
            Swal.fire({
                title: 'Success!',
                text: isEditMode ? 'Pet updated successfully' : 'Pet added successfully',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 1500,
                timerProgressBar: true
            });
            closeModal();
            loadPets();
        })
        .catch(error => {
            console.error('Error:', error);
            // Intentar obtener más detalles del error
            if (error.text) {
                error.text().then(errorText => {
                    console.error('Error details:', errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        Swal.fire({
                            title: 'Error',
                            text: `Error saving pet: ${errorJson.error || errorJson.mensaje || errorText}`,
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    } catch (e) {
                        Swal.fire({
                            title: 'Error',
                            text: `Error saving pet: ${errorText || error.statusText || 'Unknown error'}`,
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    }
                }).catch(e => {
                    Swal.fire({
                        title: 'Error',
                        text: `Error saving pet: ${error.statusText || 'Unknown error'}`,
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: `Error saving pet: ${error.message || 'Unknown error'}`,
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        })
        .finally(() => {
        // Restaurar botones
        saveButton.disabled = false;
        deleteButton.disabled = false;
        cancelButton.disabled = false;
        saveButton.innerHTML = originalSaveText;
        });
    }
    
    // Delete pet
    function deletePet() {
        if (!currentPetId) {
            Swal.fire({
                title: 'Error',
                text: 'No pet has been selected',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return;
        }
        
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Deshabilitar botones
                saveButton.disabled = true;
                deleteButton.disabled = true;
                cancelButton.disabled = true;
                
                // Mostrar indicador de carga
                const originalDeleteText = deleteButton.textContent;
                deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                
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
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Pet has been deleted.',
                        icon: 'success',
                        confirmButtonColor: '#28a745',
                        timer: 1500,
                        timerProgressBar: true
                    });
                    closeModal();
                    loadPets();
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Error deleting pet',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    });
                })
                .finally(() => {
                    // Restaurar botones
                    saveButton.disabled = false;
                    deleteButton.disabled = false;
                    cancelButton.disabled = false;
                    deleteButton.innerHTML = originalDeleteText;
                });
            }
        });
    }

    // Función para configurar la validación en tiempo real
    function setupRealTimeValidation() {
        const textInputs = ['pet-name', 'pet-breed', 'pet-age', 'pet-size', 'pet-personality'];
        const radioGroups = ['pet-type', 'pet-sex', 'pet-vaccinated', 'pet-sterilized', 'pet-availability'];
        
        // Validar campos de texto
        textInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', function() {
                    validateField(this);
                });
                
                input.addEventListener('blur', function() {
                    validateField(this, true);
                });
            }
        });
        
        // Validar grupos de radio buttons
        radioGroups.forEach(groupName => {
            const radios = document.querySelectorAll(`input[name="${groupName}"]`);
            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    validateRadioGroup(groupName);
                });
            });
        });
        
        // Validar imágenes
        const imageInput = document.getElementById('pet-images');
        if (imageInput) {
            imageInput.addEventListener('change', function() {
                validateImages(this);
            });
        }
    }

    // Función para validar un campo individual
    function validateField(input, showError = false) {
        let isValid = true;
        let errorMessage = '';
        
        switch(input.id) {
            case 'pet-name':
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Pet name is required';
                } else if (input.value.length < 2 || input.value.length > 50) {
                    isValid = false;
                    errorMessage = 'Name must be between 2 and 50 characters';
                }
                break;
                
            case 'pet-breed':
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Breed is required';
                } else if (input.value.length < 2 || input.value.length > 50) {
                    isValid = false;
                    errorMessage = 'Breed must be between 2 and 50 characters';
                }
                break;
                
            case 'pet-age':
                const age = parseFloat(input.value);
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Age is required';
                } else if (isNaN(age) || age < 0 || age > 30) {
                    isValid = false;
                    errorMessage = 'Please enter a valid age between 0 and 30 years';
                }
                break;
                
            case 'pet-size':
                const validSizes = ['Small', 'Medium', 'Large'];
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Size is required';
                } else if (!validSizes.includes(input.value)) {
                    isValid = false;
                    errorMessage = 'Size must be Small, Medium, or Large';
                }
                break;
                
            case 'pet-personality':
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Personality description is required';
                } else if (input.value.length < 10 || input.value.length > 500) {
                    isValid = false;
                    errorMessage = 'Description must be between 10 and 500 characters';
                }
                break;
        }
        
        // Actualizar clases y mensajes de validación
        updateFieldValidationUI(input, isValid, errorMessage, showError);
        
        return isValid;
    }

    // Función para validar un grupo de radio buttons
    function validateRadioGroup(groupName) {
        const radios = document.querySelectorAll(`input[name="${groupName}"]`);
        const radioGroup = radios[0].closest('.radio-group');
        const isValid = Array.from(radios).some(radio => radio.checked);
        
        if (radioGroup) {
            if (isValid) {
                radioGroup.classList.remove('invalid');
            } else {
                radioGroup.classList.add('invalid');
            }
        }
        
        return isValid;
    }

    // Función para validar imágenes
    function validateImages(input) {
        const imageHelpText = document.querySelector('.image-help-text');
        let isValid = true;
        let errorMessage = '';
        
        if (!isEditMode && (!input.files || input.files.length === 0)) {
            isValid = false;
            errorMessage = 'Please select at least one image';
        } else if (input.files && input.files.length > 3) {
            isValid = false;
            errorMessage = 'You can only upload a maximum of 3 images';
        } else if (input.files && input.files.length > 0) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                
                if (file.size > maxSize) {
                    isValid = false;
                    errorMessage = `Image ${file.name} is too large. Maximum size is 5MB`;
                    break;
                }
                
                if (!allowedTypes.includes(file.type)) {
                    isValid = false;
                    errorMessage = `Invalid file type for ${file.name}. Only JPG and PNG are allowed`;
                    break;
                }
            }
        }
        
        // Actualizar UI para las imágenes
        if (imageHelpText) {
            if (!isValid) {
                imageHelpText.classList.add('invalid');
                imageHelpText.textContent = errorMessage;
            } else {
                imageHelpText.classList.remove('invalid');
                imageHelpText.textContent = 'Select up to 3 images. The first image will be the main image.';
            }
        }
        
        return isValid;
    }

    // Función para actualizar la UI de validación de un campo
    function updateFieldValidationUI(input, isValid, errorMessage, showError) {
        // Remover clases existentes
        input.classList.remove('valid', 'invalid');
        
        // Obtener o crear el elemento de mensaje de validación
        let validationMessage = input.nextElementSibling;
        if (!validationMessage || !validationMessage.classList.contains('validation-message')) {
            validationMessage = document.createElement('div');
            validationMessage.className = 'validation-message';
            input.parentNode.insertBefore(validationMessage, input.nextSibling);
        }
        
        if (isValid) {
            input.classList.add('valid');
            validationMessage.style.display = 'none';
        } else {
            input.classList.add('invalid');
            if (showError) {
                validationMessage.textContent = errorMessage;
                validationMessage.style.display = 'block';
            } else {
                validationMessage.style.display = 'none';
            }
        }
    }
});
