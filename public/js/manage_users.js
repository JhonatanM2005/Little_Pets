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
        // Validate that required fields are completed
        if (!nameInput.value || !emailInput.value || !cedulaInput.value) {
            Swal.fire({
                title: 'Error',
                text: 'Please complete all required fields (name, email and cédula)',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a valid email',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return false;
        }
        
        // If it's a new user or the password is being changed
        if (!selectedUserId || passwordInput.value) {
            // Validate that the password has at least 8 characters
            if (passwordInput.value.length < 8) {
                Swal.fire({
                    title: 'Error',
                    text: 'Password must be at least 8 characters long',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                return false;
            }
            
            // Validate that the passwords match
            if (passwordInput.value !== confirmPasswordInput.value) {
                Swal.fire({
                    title: 'Error',
                    text: 'Passwords do not match',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
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
}
