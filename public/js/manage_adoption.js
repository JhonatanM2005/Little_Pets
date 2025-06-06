document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allAdoptionRequests = [];
    let filteredRequests = [];
    let currentRequestId = null;
    
    // DOM elements
    const adoptionRequestsList = document.getElementById('adoptionRequestsList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    
    // Check authentication and role
    function checkAuthAndRole() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // If there's no token, redirect to login page
            window.location.href = './login.html?redirect=manage_adoptions.html';
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        adoptionRequestsList.style.display = 'none';
        
        // Verify user role
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
            // Check if user has admin or manager role
            if (user.role !== 'admin' && user.role !== 'manager') {
                console.error('Usuario sin permisos suficientes. Rol:', user.role);
                Swal.fire({
                    title: 'Error',
                    text: 'You do not have permission to access this page',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                window.location.href = '../index.html';
                return;
            }
            
            // If user has appropriate permissions, continue loading the page
            console.log('Usuario autorizado:', user.name, '- Rol:', user.role);
            loadAdoptionRequests();
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error verifying permissions:', error);
            loadingIndicator.style.display = 'none';
            errorMessage.style.display = 'block';
        });
    }
    
    // Load adoption requests from API
    function loadAdoptionRequests() {
        const token = localStorage.getItem('token');
        
        fetch('/api/adoption', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading adoption requests');
            }
            return response.json();
        })
        .then(data => {
            console.log('Adoption requests loaded:', data);
            allAdoptionRequests = data.data;
            filteredRequests = [...allAdoptionRequests];
            
            // Apply initial filters
            applyFilters();
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            adoptionRequestsList.style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.style.display = 'none';
            errorMessage.style.display = 'block';
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Filter event listeners
        statusFilter.addEventListener('change', applyFilters);
        dateFilter.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);
        
        // Reset filters button
        document.querySelector('.retry-btn').addEventListener('click', checkAuthAndRole);
        document.querySelector('button[onclick="resetFilters()"]').addEventListener('click', resetFilters);
        
        // Modal event listeners
        document.getElementById('approveRequestBtn').addEventListener('click', () => openReviewModal('approved'));
        document.getElementById('rejectRequestBtn').addEventListener('click', () => openReviewModal('rejected'));
        document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    }
    
    // Apply filters to adoption requests
    function applyFilters() {
        const status = statusFilter.value;
        const dateSort = dateFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        // Filter by status and search term
        filteredRequests = allAdoptionRequests.filter(request => {
            // Status filter
            if (status !== 'all' && request.status !== status) {
                return false;
            }
            
            // Search filter
            if (searchTerm) {
                const fullName = `${request.firstName} ${request.lastName}`.toLowerCase();
                const email = request.email ? request.email.toLowerCase() : '';
                const idNumber = request.idNumber ? request.idNumber.toLowerCase() : '';
                const petName = request.petId && request.petId.name ? request.petId.name.toLowerCase() : '';
                
                return fullName.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       idNumber.includes(searchTerm) ||
                       petName.includes(searchTerm);
            }
            
            return true;
        });
        
        // Sort by date
        filteredRequests.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            
            return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        // Display filtered requests
        displayAdoptionRequests();
    }
    
    // Reset filters
    function resetFilters() {
        statusFilter.value = 'all';
        dateFilter.value = 'newest';
        searchInput.value = '';
        applyFilters();
    }
    
    // Display adoption requests as cards
    function displayAdoptionRequests() {
        // Clear previous content
        adoptionRequestsList.innerHTML = '';
        
        // Show no results message if no requests match filters
        if (filteredRequests.length === 0) {
            noResultsMessage.style.display = 'block';
            adoptionRequestsList.style.display = 'none';
            return;
        }
        
        // Hide no results message
        noResultsMessage.style.display = 'none';
        adoptionRequestsList.style.display = 'block';
        
        // Create and append request cards
        filteredRequests.forEach(request => {
            const card = createAdoptionRequestCard(request);
            adoptionRequestsList.appendChild(card);
        });
    }
    
    // Create adoption request card
    function createAdoptionRequestCard(request) {
        // Create card element
        const card = document.createElement('div');
        card.className = 'adoption-request-card';
        
        // Format date
        const requestDate = new Date(request.createdAt);
        const formattedDate = requestDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge class and text
        let statusClass = '';
        let statusText = '';
        switch(request.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Pending';
                break;
            case 'approved':
                statusClass = 'status-approved';
                statusText = 'Approved';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            default:
                statusClass = 'status-unknown';
                statusText = 'Unknown';
        }
        
        // Pet information
        const petInfo = request.petId ? 
            `<div class="pet-info">
                <img src="${request.petId.image || '../media/images/default-pet.jpg'}" alt="${request.petId.name}" class="pet-image">
                <div>
                    <p class="pet-name">${request.petId.name}</p>
                    <p class="pet-breed">${request.petId.breed} (${request.petId.type})</p>
                </div>
            </div>` : 
            '<p class="no-pet-info">No pet information available</p>';
        
        // Build card HTML
        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span class="request-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
            </div>
            <div class="card-body">
                <div class="applicant-info-container">
                    <h4 class="applicant-name">${request.firstName} ${request.lastName}</h4>
                    <div class="applicant-info">
                        <p><i class="fas fa-envelope"></i> ${request.email}</p>
                        <p><i class="fas fa-phone"></i> ${request.phone}</p>
                        <p><i class="fas fa-id-card"></i> ${request.idNumber}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${request.city}, ${request.address}</p>
                    </div>
                </div>
                <div class="pet-section">
                    <h5>Pet Being Adopted</h5>
                    ${petInfo}
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary view-details-btn" data-id="${request._id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        
        // Add event listener to view details button
        card.querySelector('.view-details-btn').addEventListener('click', () => {
            viewAdoptionDetails(request._id);
        });
        
        return card;
    }
    
    // View adoption request details
    function viewAdoptionDetails(requestId) {
        currentRequestId = requestId;
        const token = localStorage.getItem('token');
        
        // Show loading in modal
        const modalBody = document.getElementById('adoptionDetailContent');
        modalBody.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading adoption request details...</p>
            </div>
        `;
        
        // Show modal
        const adoptionDetailModal = new bootstrap.Modal(document.getElementById('adoptionDetailModal'));
        adoptionDetailModal.show();
        
        // Fetch adoption request details
        fetch(`/api/adoption/${requestId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading adoption request details');
            }
            return response.json();
        })
        .then(data => {
            const request = data.data;
            
            // Update modal content with request details
            modalBody.innerHTML = generateDetailedRequestHTML(request);
            
            // Update PDF button link
            document.getElementById('viewPdfBtn').href = request.pdfUrl;
            
            // Set up approve/reject buttons
            const approveBtn = document.getElementById('approveRequestBtn');
            const rejectBtn = document.getElementById('rejectRequestBtn');
            
            // Hide/show buttons based on current status
            if (request.status === 'approved' || request.status === 'rejected') {
                approveBtn.style.display = 'none';
                rejectBtn.style.display = 'none';
            } else {
                approveBtn.style.display = 'block';
                rejectBtn.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            modalBody.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading adoption request details. Please try again.
                </div>
            `;
        });
    }
    
    // Generate detailed HTML for request
    function generateDetailedRequestHTML(request) {
        const requestDate = new Date(request.createdAt);
        const formattedDate = requestDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let reviewInfo = '';
        if (request.reviewedBy) {
            const reviewDate = new Date(request.reviewDate);
            const formattedReviewDate = reviewDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            reviewInfo = `
                <div class="review-info">
                    <h5><i class="fas fa-clipboard-check"></i> Review Information</h5>
                    <p><strong>Reviewed by:</strong> ${request.reviewedBy.name}</p>
                    <p><strong>Review date:</strong> ${formattedReviewDate}</p>
                    <p><strong>Comments:</strong> ${request.reviewComments || 'No comments provided'}</p>
                </div>
            `;
        }
        
        return `
            <div class="adoption-detail">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Request Information</h4>
                    <p><strong>Request ID:</strong> ${request._id}</p>
                    <p><strong>Submission Date:</strong> ${formattedDate}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span></p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Applicant Information</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Name:</strong> ${request.firstName} ${request.lastName}</p>
                            <p><strong>ID Number:</strong> ${request.idNumber}</p>
                            <p><strong>Email:</strong> ${request.email}</p>
                            <p><strong>Phone:</strong> ${request.phone}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Occupation:</strong> ${request.occupation || 'N/A'}</p>
                            <p><strong>Company:</strong> ${request.company || 'N/A'}</p>
                            <p><strong>Schedule:</strong> ${request.schedule || 'N/A'}</p>
                            <p><strong>Marital Status:</strong> ${request.maritalStatus || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-home"></i> Housing Information</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>City:</strong> ${request.city}</p>
                            <p><strong>Address:</strong> ${request.address}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Housing Type:</strong> ${request.housing || 'N/A'}</p>
                            <p><strong>Floor:</strong> ${request.floor || 'N/A'}</p>
                        </div>
                    </div>
                    <p><strong>House Description:</strong> ${request.houseDescription || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-users"></i> Family Information</h4>
                    <p><strong>Have Kids:</strong> ${request.haveKids || 'N/A'}</p>
                    ${request.haveKids === 'yes' ? `
                        <p><strong>How Many:</strong> ${request.many || 'N/A'}</p>
                        <p><strong>Ages:</strong> ${request.ages || 'N/A'}</p>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-paw"></i> Pet Information</h4>
                    <p><strong>Have Other Pets:</strong> ${request.havePets || 'N/A'}</p>
                    ${request.havePets === 'yes' ? `
                        <p><strong>Current Pets:</strong> ${request.currentPets || 'N/A'}</p>
                    ` : ''}
                    <p><strong>Hours Pet Will Be Alone:</strong> ${request.hoursAlone || 'N/A'}</p>
                    <p><strong>Veterinarian Name:</strong> ${request.vetName || 'N/A'}</p>
                    <p><strong>Adopted Before:</strong> ${request.adoptBefore || 'N/A'}</p>
                    <p><strong>Committed to Pet:</strong> ${request.committed || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-comment"></i> Additional Information</h4>
                    <p><strong>Why Adopt:</strong> ${request.whyAdopt || 'N/A'}</p>
                    <p><strong>Additional Info:</strong> ${request.additionalInfo || 'N/A'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-dog"></i> Pet Being Adopted</h4>
                    ${request.petId ? `
                        <div class="pet-info-detail">
                            ${request.petId.image ? `<img src="${request.petId.image}" alt="${request.petId.name}" class="pet-image-detail">` : ''}
                            <div>
                                <p><strong>Name:</strong> ${request.petId.name}</p>
                                <p><strong>Type:</strong> ${request.petId.type}</p>
                                <p><strong>Breed:</strong> ${request.petId.breed}</p>
                            </div>
                        </div>
                    ` : '<p>No pet information available</p>'}
                </div>
                
                ${reviewInfo}
            </div>
        `;
    }
    
    // Open review modal
    function openReviewModal(status) {
        // Set request ID and status in hidden fields
        document.getElementById('requestId').value = currentRequestId;
        document.getElementById('requestStatus').value = status;
        
        // Update status info
        const statusInfo = document.getElementById('reviewStatusInfo');
        if (status === 'approved') {
            statusInfo.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>Approving Adoption Request</strong>
                    <p>You are about to approve this adoption request. The applicant will be notified.</p>
                </div>
            `;
        } else {
            statusInfo.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle"></i>
                    <strong>Rejecting Adoption Request</strong>
                    <p>You are about to reject this adoption request. The applicant will be notified.</p>
                </div>
            `;
        }
        
        // Show review modal
        const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
        reviewModal.show();
    }
    
    // Submit review
    function submitReview() {
        const token = localStorage.getItem('token');
        const requestId = document.getElementById('requestId').value;
        const status = document.getElementById('requestStatus').value;
        const comments = document.getElementById('reviewComments').value;
        
        if (!requestId || !status) {
            Swal.fire({
                title: 'Error',
                text: 'Missing request information',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            return;
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('submitReviewBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Update adoption request status
        fetch(`/api/adoption/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                reviewComments: comments
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating adoption request status');
            }
            return response.json();
        })
        .then(data => {
            // Close review modal
            const reviewModal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
            reviewModal.hide();
            
            // Close detail modal
            const detailModal = bootstrap.Modal.getInstance(document.getElementById('adoptionDetailModal'));
            detailModal.hide();
            
            // Show success message
            Swal.fire({
                title: 'Success!',
                text: `The adoption request has been ${status}.`,
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 1500,
                timerProgressBar: true
            }).then(() => {
                // Recargar solicitudes
                loadAdoptionRequests();
            });
            
            // Reload adoption requests
            loadAdoptionRequests();
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Show error message
            Swal.fire({
                title: 'Error',
                text: 'Error updating adoption request status',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
        });
    }
    
    // Initialize
    checkAuthAndRole();
});