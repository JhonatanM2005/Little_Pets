document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado y tiene permisos de administrador
    function getToken() {
        return localStorage.getItem('token');
    }
    
    const token = getToken();
    
    if (!token) {
        // If no token, redirect to login
        Swal.fire({
            title: 'Error',
            text: 'You must log in to access this page',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
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
            throw new Error('Error getting profile');
        }
        return response.json();
    })
    .then(user => {
        // Verify if the user has admin role
        if (user.role !== 'admin') {
            // If not admin, show message and redirect
            Swal.fire({
                title: 'Error',
                text: 'You do not have permissions to access this page',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            window.location.href = '../index.html';
            return;
        }
        
        // If admin, continue with page loading
        initializeUserManagement(token);
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Error verifying permissions',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        window.location.href = '../index.html';
    });
});

// Function to initialize user management once permissions are verified
function initializeUserManagement(token) {
    // DOM element references
    const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const cedulaInput = document.getElementById('cedula');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const userTypeSelect = document.getElementById('user-type');
    const statusSelect = document.getElementById('status');
    const saveBtn = document.querySelector('.save-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const addBtn = document.querySelector('.add-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const modal = document.getElementById('user-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    
    // Variable to store the selected user ID
    let selectedUserId = null;
    
    // Function to load users from the API
    function loadUsers() {
        // Show loading indicator
        usersTable.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';
        
        // Get users from the API
        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error getting users');
            }
            return response.json();
        })
        .then(users => {
            // Clear the table
            usersTable.innerHTML = '';
            
            // Verify if there are users
            if (users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="6">No users registered</td></tr>';
                return;
            }
            
            // Add each user to the table
            users.forEach(user => {
                const row = document.createElement('tr');
                
                // Create cells for each user property
                const nameCell = document.createElement('td');
                nameCell.textContent = user.name;
                
                const emailCell = document.createElement('td');
                emailCell.textContent = user.email;
                
                const cedulaCell = document.createElement('td');
                cedulaCell.textContent = user.cedula;
                
                const typeCell = document.createElement('td');
                typeCell.textContent = user.role;
                
                const statusCell = document.createElement('td');
                statusCell.textContent = user.status || 'active';
                
                // Create cell for action buttons
                const actionsCell = document.createElement('td');
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.classList.add('edit-btn');
                editBtn.addEventListener('click', () => selectUser(user));
                
                actionsCell.appendChild(editBtn);
                
                // Add all cells to the row
                row.appendChild(nameCell);
                row.appendChild(emailCell);
                row.appendChild(cedulaCell);
                row.appendChild(typeCell);
                row.appendChild(statusCell);
                row.appendChild(actionsCell);
                
                // Add the row to the table
                usersTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
            usersTable.innerHTML = '<tr><td colspan="6">Error loading users</td></tr>';
        });
    }
    
    // Function to select a user for editing
    function selectUser(user) {
        selectedUserId = user._id;
        
        // Fill the form with user data
        nameInput.value = user.name;
        emailInput.value = user.email;
        cedulaInput.value = user.cedula;
        userTypeSelect.value = user.role;
        statusSelect.value = user.status || 'active';
        
        // Clear password fields
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Open the modal in edit mode
        openModal('edit');
    }
    
    // Function to clear the form
    function clearForm() {
        selectedUserId = null;
        nameInput.value = '';
        emailInput.value = '';
        cedulaInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        userTypeSelect.value = 'user';
        statusSelect.value = 'active';
    }
    
    // Function to save a user (create or update)
    function saveUser() {
        console.log('Starting saveUser...');
        
        // Validate the form
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }
        
        // Create user object
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            cedula: cedulaInput.value.trim(),
            role: userTypeSelect.value,
            status: statusSelect.value
        };
        
        console.log('User data to save:', userData);
        
        // If there is a password, add it to the object
        if (passwordInput.value) {
            userData.password = passwordInput.value;
            console.log('Password included in the request');
        } else if (!selectedUserId) {
            // If it's a new user, the password is required
            Swal.fire({
                title: 'Error',
                text: 'Password is required to create a new user',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            console.log('Error: Contraseña obligatoria para nuevo usuario');
            return;
        }
        
        let url, method;
        
        // If it's an existing user, update
        if (selectedUserId) {
            url = `/api/users/${selectedUserId}`;
            method = 'PUT';
            console.log(`Updating user with ID: ${selectedUserId}`);
        } else {
            // Create new user
            url = '/api/users';
            method = 'POST';
            console.log('Creating new user');
        }
        
        // Show loading indicator
        const saveButtonText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        console.log(`Sending ${method} request to ${url}`);
        console.log('Data sent:', JSON.stringify(userData));
        
        // Send request to the API
        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            console.log('Response received:', response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    console.error('Error in response:', data);
                    throw new Error(data.message || 'Error saving user');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('User saved successfully:', data);
            // Show success message
            if (selectedUserId) {
                Swal.fire({
                    title: 'Success',
                    text: 'User updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
            } else {
                Swal.fire({
                    title: 'Success',
                    text: 'User created successfully',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
            }
            
            // Reload the table, clear the form, and close the modal
            loadUsers();
            closeModal();
        })
        .catch(error => {
            console.error('Error saving user:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Error saving user',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        })
        .finally(() => {
            // Restore the button
            saveBtn.textContent = saveButtonText;
            saveBtn.disabled = false;
        });
    }
    
    // Function to validate the form
    function validateForm() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const cedula = cedulaInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validar nombre
        if (!name) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the user name',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            nameInput.focus();
            return false;
        }

        if (name.length < 2 || name.length > 50) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Name must be between 2 and 50 characters',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            nameInput.focus();
            return false;
        }

        // Validar cédula
        if (!cedula) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the ID number (cédula)',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            cedulaInput.focus();
            return false;
        }

        // Validar que la cédula solo contenga números
        const idNumberPattern = /^\d+$/;
        if (!idNumberPattern.test(cedula)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'The ID number must only contain numbers',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            cedulaInput.focus();
            return false;
        }
        
        if (cedula.length < 8 || cedula.length > 15) {
            Swal.fire({
                title: 'Validation Error',
                text: 'ID number must be between 8 and 15 digits',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            cedulaInput.focus();
            return false;
        }
        
        // Validar email
        if (!email) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter the email address',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            emailInput.focus();
            return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please enter a valid email address',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            emailInput.focus();
            return false;
        }
        
        // Si es un nuevo usuario o se está cambiando la contraseña
        if (!selectedUserId || password) {
            // Validar contraseña
            if (!password) {
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Password is required for new users',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                passwordInput.focus();
                return false;
            }

            if (password.length < 8) {
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Password must be at least 8 characters long',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                passwordInput.focus();
                return false;
            }

            // Validar complejidad de la contraseña
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                passwordInput.focus();
                return false;
            }

            // Validar confirmación de contraseña
            if (password !== confirmPassword) {
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Passwords do not match',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                confirmPasswordInput.focus();
                return false;
            }
        }
        
        return true;
    }
    
    // Function to delete a user
    function manageDeleteUser() {
        if (!selectedUserId) {
            Swal.fire({
                title: 'Error',
                text: 'Please select an user to delete',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return;
        }
        
        // Confirm before deleting with SweetAlert
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this user? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // If the user confirms, proceed with deletion
                deleteUser();
            }
        });
    }
    
    // Helper function to delete the user
    function deleteUser() {
        
        // Send request to the API
        fetch(`/api/users/${selectedUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error deleting user');
                });
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                title: 'Success',
                text: 'User successfully deleted',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
            loadUsers();
            closeModal();
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Error deleting user',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        });
    }
    
    // References to search elements
    const searchNameInput = document.getElementById('search-name');
    const searchEmailInput = document.getElementById('search-email');
    const searchCedulaInput = document.getElementById('search-cedula');
    const searchNameBtn = document.getElementById('search-name-btn');
    const searchEmailBtn = document.getElementById('search-email-btn');
    const searchCedulaBtn = document.getElementById('search-cedula-btn');
    const resetSearchBtn = document.getElementById('reset-search-btn');
    
    // Variables para almacenar todos los usuarios y los filtros actuales
    let allUsers = [];
    let currentFilters = {
        name: '',
        email: '',
        cedula: ''
    };
    
    // Agregar event listeners para los botones de búsqueda
    searchNameBtn.addEventListener('click', () => {
        currentFilters.name = searchNameInput.value.toLowerCase();
        filterUsers();
    });
    
    searchEmailBtn.addEventListener('click', () => {
        currentFilters.email = searchEmailInput.value.toLowerCase();
        filterUsers();
    });
    
    searchCedulaBtn.addEventListener('click', () => {
        currentFilters.cedula = searchCedulaInput.value.toLowerCase();
        filterUsers();
    });
    
    resetSearchBtn.addEventListener('click', () => {
        // Limpiar los campos de búsqueda
        searchNameInput.value = '';
        searchEmailInput.value = '';
        searchCedulaInput.value = '';
        
        // Resetear los filtros
        currentFilters = {
            name: '',
            email: '',
            cedula: ''
        };
        
        // Show all users
        displayUsers(allUsers);
    });
    
    // Function to filter users
    function filterUsers() {
        const filteredUsers = allUsers.filter(user => {
            const nameMatch = !currentFilters.name || user.name.toLowerCase().includes(currentFilters.name);
            const emailMatch = !currentFilters.email || user.email.toLowerCase().includes(currentFilters.email);
            const cedulaMatch = !currentFilters.cedula || (user.cedula && user.cedula.toLowerCase().includes(currentFilters.cedula));
            
            return nameMatch && emailMatch && cedulaMatch;
        });
        
        displayUsers(filteredUsers);
    }
    
    // Functions to handle the modal
    function openModal(mode) {
        if (mode === 'add') {
            modalTitle.textContent = 'Add New User';
            deleteBtn.style.display = 'none';
            clearForm();
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit User';
            deleteBtn.style.display = 'inline-block';
        }
        modal.style.display = 'block';
    }
    
    function closeModal() {
        modal.style.display = 'none';
        clearForm();
    }
    
    // Button events
    saveBtn.addEventListener('click', saveUser);
    deleteBtn.addEventListener('click', manageDeleteUser);
    addBtn.addEventListener('click', function() {
        openModal('add');
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close the modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Load users on initialization
    loadUsers();
    
    // Function to load users from the API
    function loadUsers() {
        // Show loading indicator
        usersTable.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';
        
        // Get users from the API
        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error getting users');
            }
            return response.json();
        })
        .then(users => {
            // Save all users for filtering
            allUsers = users;
            
            // Display users
            displayUsers(users);
        })
        .catch(error => {
            console.error('Error:', error);
            usersTable.innerHTML = '<tr><td colspan="6">Error loading users</td></tr>';
        });
    }
    
    // Function to display users in the table
    function displayUsers(users) {
        // Clear the table
        usersTable.innerHTML = '';
        
        // Verify if there are users
        if (users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
            return;
        }
        
        // Add each user to the table
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Create cells for each user property
            const nameCell = document.createElement('td');
            nameCell.textContent = user.name;
            
            const emailCell = document.createElement('td');
            emailCell.textContent = user.email;
            
            const cedulaCell = document.createElement('td');
            cedulaCell.textContent = user.cedula;
            
            const typeCell = document.createElement('td');
            typeCell.textContent = user.role;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = user.status || 'active';
            
            // Create cell for action buttons
            const actionsCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => selectUser(user));
            
            // Apply styles to the edit button
            editBtn.style.backgroundColor = '#FF8A2B';
            editBtn.style.color = 'white';
            editBtn.style.border = 'none';
            editBtn.style.borderRadius = '5px';
            editBtn.style.padding = '5px 10px';
            editBtn.style.cursor = 'pointer';
            
            actionsCell.appendChild(editBtn);
            
            // Add all cells to the row
            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(cedulaCell);
            row.appendChild(typeCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            
            // Add the row to the table
            usersTable.appendChild(row);
        });
    }

    function setupRealTimeValidation() {
        const inputs = [nameInput, emailInput, cedulaInput, passwordInput, confirmPasswordInput];
        
        inputs.forEach(input => {
            if (!input) return; // Skip if input doesn't exist
            
            // Agregar clases de validación visual
            input.addEventListener('blur', () => {
                validateInput(input);
            });
            
            // Limpiar estado de validación al empezar a escribir
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid', 'is-valid');
                const feedback = input.nextElementSibling;
                if (feedback && feedback.classList.contains('validation-feedback')) {
                    feedback.remove();
                }
            });
        });
    }

    function validateInput(input) {
        let isValid = true;
        let message = '';
        
        const value = input.value.trim();
        
        switch (input.id) {
            case 'name':
                if (!value) {
                    isValid = false;
                    message = 'Name is required';
                } else if (value.length < 2 || value.length > 50) {
                    isValid = false;
                    message = 'Name must be between 2 and 50 characters';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    message = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;
                
            case 'cedula':
                const idNumberPattern = /^\d+$/;
                if (!value) {
                    isValid = false;
                    message = 'ID number is required';
                } else if (!idNumberPattern.test(value)) {
                    isValid = false;
                    message = 'ID number must only contain numbers';
                } else if (value.length < 8 || value.length > 15) {
                    isValid = false;
                    message = 'ID number must be between 8 and 15 digits';
                }
                break;
                
            case 'password':
                if (!selectedUserId) { // Solo validar para nuevos usuarios
                    if (!value) {
                        isValid = false;
                        message = 'Password is required for new users';
                    } else if (value.length < 8) {
                        isValid = false;
                        message = 'Password must be at least 8 characters long';
                    } else {
                        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
                        if (!passwordRegex.test(value)) {
                            isValid = false;
                            message = 'Password must contain uppercase, lowercase and numbers';
                        }
                    }
                }
                break;
                
            case 'confirm-password':
                const password = passwordInput.value;
                if (!selectedUserId && password && value !== password) {
                    isValid = false;
                    message = 'Passwords do not match';
                }
                break;
        }
        
        // Actualizar clases y mensaje de validación
        updateValidationUI(input, isValid, message);
        
        return isValid;
    }

    function updateValidationUI(input, isValid, message) {
        // Remover clases y feedback existentes
        input.classList.remove('is-invalid', 'is-valid');
        const existingFeedback = input.nextElementSibling;
        if (existingFeedback && existingFeedback.classList.contains('validation-feedback')) {
            existingFeedback.remove();
        }
        
        // Agregar nueva clase y feedback
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        if (!isValid && message) {
            const feedback = document.createElement('div');
            feedback.className = 'validation-feedback invalid-feedback';
            feedback.textContent = message;
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
    }
}
