document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const totalSteps = 5;
    let currentStep = 1;
    
    // DOM elements
    const progressBar = document.getElementById('form-progress');
    const stepIndicators = document.querySelectorAll('.step');
    const formSections = document.querySelectorAll('.form-section');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const submitButton = document.getElementById('adoptButton');
    const modal = document.getElementById('pdfPreviewModal');
    const closeModal = document.querySelector('.close-modal');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const submitFormBtn = document.getElementById('submitFormBtn');
    
    // Initialize the form
    initForm();
    
    // Configure conditional events
    setupConditionalFields();
    
    // Configure navigation
    setupNavigation();
    
    // Configure modal and PDF
    setupModalAndPdf();
    
    // Function to get user profile data
    async function getUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error fetching user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Function to autofill form with user data
    async function autofillFormWithUserData() {
        const user = await getUserProfile();
        if (!user) return;

        // Autofill personal information
        const nameArray = user.name.split(' ');
        const firstName = nameArray[0];
        const lastName = nameArray.slice(1).join(' ');

        document.getElementById('first-name').value = firstName;
        document.getElementById('last-name').value = lastName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('id-number').value = user.cedula || '';
    }
    
    // Function to initialize the form
    function initForm() {
        // Set initial progress bar width
        updateProgressBar();
        
        // Verify if we came from a pet details page
        const urlParams = new URLSearchParams(window.location.search);
        const petId = urlParams.get("petId");
        if (petId) {
            // We could load pet information and pre-fill fields
            console.log("Adoption form for pet ID:", petId);
        }

        // Autofill form with user data
        autofillFormWithUserData();
    }
    
    // Function to update the progress bar
    function updateProgressBar() {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update step indicators
        stepIndicators.forEach((step, index) => {
            if (index + 1 < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Function to configure conditional fields
    function setupConditionalFields() {
        // Show/hide kids fields
        const haveKidsRadios = document.querySelectorAll('input[name="have-kids"]');
        const kidsDetailsDiv = document.getElementById('kids-details');
        const kidsAgesDiv = document.getElementById('kids-ages');
        
        haveKidsRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    kidsDetailsDiv.style.display = 'block';
                    kidsAgesDiv.style.display = 'block';
                } else {
                    kidsDetailsDiv.style.display = 'none';
                    kidsAgesDiv.style.display = 'none';
                }
            });
        });
        
        // Show/hide current pets fields
        const havePetsRadios = document.querySelectorAll('input[name="have-pets"]');
        const petsDetailsDiv = document.getElementById('pets-details');
        
        havePetsRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                petsDetailsDiv.style.display = this.value === 'yes' ? 'block' : 'none';
            });
        });
        
        // Show/hide landlord permission
        const homeOwnershipRadios = document.querySelectorAll('input[name="home-ownership"]');
        const landlordPermissionDiv = document.getElementById('landlord-permission');
        
        homeOwnershipRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                landlordPermissionDiv.style.display = this.value === 'rent' ? 'block' : 'none';
            });
        });
    }
    
    // Function to configure navigation between steps
    function setupNavigation() {
        // Next buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (validateCurrentStep()) {
                    if (currentStep < totalSteps) {
                        // Hide current step
                        document.getElementById(`section-${currentStep}`).style.display = 'none';
                        // Increment step
                        currentStep++;
                        // Show new step
                        document.getElementById(`section-${currentStep}`).style.display = 'block';
                        // Update progress bar
                        updateProgressBar();
                        // If it's the last step, generate summary
                        if (currentStep === totalSteps) {
                            generateReviewContent();
                        }
                        // Scroll to the top of the form
                        window.scrollTo({
                            top: document.querySelector('.adoption-form-container').offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // Previous buttons
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (currentStep > 1) {
                    // Hide current step
                    document.getElementById(`section-${currentStep}`).style.display = 'none';
                    // Decrement step
                    currentStep--;
                    // Show new step
                    document.getElementById(`section-${currentStep}`).style.display = 'block';
                    // Update progress bar
                    updateProgressBar();
                    // Scroll to the top of the form
                    window.scrollTo({
                        top: document.querySelector('.adoption-form-container').offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Submit button
        submitButton.addEventListener('click', function() {
            if (validateCurrentStep() && document.getElementById('terms-agreement').checked) {
                generatePdfPreview();
                modal.style.display = 'block';
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Please accept the terms and conditions before continuing.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    }
    
    // Function to validate the current step
    function validateCurrentStep() {
        const currentSection = document.getElementById(`section-${currentStep}`);
        const requiredFields = currentSection.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        });
        
        if (!isValid) {
            Swal.fire({
                title: 'Error',
                text: 'Please complete all required fields before continuing.',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
        
        return isValid;
    }
    
    // Function to generate review content
    function generateReviewContent() {
        const reviewContainer = document.getElementById('reviewContainer');
        reviewContainer.innerHTML = '';
        
        // Section 1: Personal Information
        const personalSection = document.createElement('div');
        personalSection.className = 'review-section';
        personalSection.innerHTML = `
            <h3><i class="fas fa-user"></i> Personal Information</h3>
            <div class="review-item">
                <div class="review-label">Full Name:</div>
                <div class="review-value">${document.getElementById('first-name').value} ${document.getElementById('last-name').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Email:</div>
                <div class="review-value">${document.getElementById('email').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Phone:</div>
                <div class="review-value">${document.getElementById('phone').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">ID Number:</div>
                <div class="review-value">${document.getElementById('id-number').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Occupation:</div>
                <div class="review-value">${document.getElementById('occupation').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Company:</div>
                <div class="review-value">${document.getElementById('company').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Work Schedule:</div>
                <div class="review-value">${document.getElementById('schedule').value || 'No specified'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Marital Status:</div>
                <div class="review-value">${document.querySelector('input[name="marital-status"]:checked')?.value || 'No especificado'}</div>
            </div>
        `;
        reviewContainer.appendChild(personalSection);
        
        // Section 2: Housing Information
        const housingSection = document.createElement('div');
        housingSection.className = 'review-section';
        housingSection.innerHTML = `
            <h3><i class="fas fa-home"></i> Housing Information</h3>
            <div class="review-item">
                <div class="review-label">City:</div>
                <div class="review-value">${document.getElementById('city').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Address:</div>
                <div class="review-value">${document.getElementById('address').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Housing Type:</div>
                <div class="review-value">${document.getElementById('housing').value}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Floor:</div>
                <div class="review-value">${document.getElementById('floor').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Description:</div>
                <div class="review-value">${document.getElementById('house-description').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Home Ownership:</div>
                <div class="review-value">${document.querySelector('input[name="home-ownership"]:checked')?.value || 'No especificado'}</div>
            </div>
            ${document.querySelector('input[name="home-ownership"]:checked')?.value === 'rent' ? `
                <div class="review-item">
                    <div class="review-label">Landlord Permission:</div>
                    <div class="review-value">${document.querySelector('input[name="landlord-permission"]:checked')?.value || 'No especificado'}</div>
                </div>
            ` : ''}
        `;
        reviewContainer.appendChild(housingSection);
        
        // Section 3: Family Information
        const familySection = document.createElement('div');
        familySection.className = 'review-section';
        familySection.innerHTML = `
            <h3><i class="fas fa-users"></i> Family Information</h3>
            <div class="review-item">
                <div class="review-label">Have Children:</div>
                <div class="review-value">${document.querySelector('input[name="have-kids"]:checked')?.value || 'No especificado'}</div>
            </div>
            ${document.querySelector('input[name="have-kids"]:checked')?.value === 'yes' ? `
                <div class="review-item">
                    <div class="review-label">Number of Children:</div>
                    <div class="review-value">${document.getElementById('many').value || 'No especificado'}</div>
                </div>
                <div class="review-item">
                    <div class="review-label">Ages of Children:</div>
                    <div class="review-value">${document.getElementById('ages').value || 'No especificado'}</div>
                </div>
            ` : ''}
            <div class="review-item">
                <div class="review-label">Have Pets:</div>
                <div class="review-value">${document.querySelector('input[name="have-pets"]:checked')?.value || 'No especificado'}</div>
            </div>
            ${document.querySelector('input[name="have-pets"]:checked')?.value === 'yes' ? `
                <div class="review-item">
                    <div class="review-label">Current Pets:</div>
                    <div class="review-value">${document.getElementById('current-pets').value || 'No especificado'}</div>
                </div>
            ` : ''}
            <div class="review-item">
                <div class="review-label">Household Agreement:</div>
                <div class="review-value">${document.querySelector('input[name="household-agreement"]:checked')?.value || 'No especificado'}</div>
            </div>
        `;
        reviewContainer.appendChild(familySection);
        
        // Section 4: Adoption Information
        const adoptionSection = document.createElement('div');
        adoptionSection.className = 'review-section';
        adoptionSection.innerHTML = `
            <h3><i class="fas fa-paw"></i> Adoption Information</h3>
            <div class="review-item">
                <div class="review-label">Why Adopt:</div>
                <div class="review-value">${document.getElementById('why-adopt').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Have Adopted Before:</div>
                <div class="review-value">${document.querySelector('input[name="adopt-before"]:checked')?.value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Committed to Pet:</div>
                <div class="review-value">${document.querySelector('input[name="committed"]:checked')?.value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Hours Alone:</div>
                <div class="review-value">${document.getElementById('hours-alone').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Veterinarian:</div>
                <div class="review-value">${document.getElementById('vet-name').value || 'No especificado'}</div>
            </div>
            <div class="review-item">
                <div class="review-label">Additional Information:</div>
                <div class="review-value">${document.getElementById('additional-info').value || 'No especificado'}</div>
            </div>
        `;
        reviewContainer.appendChild(adoptionSection);
    }
    
    // Function to configure the modal and PDF generation
    function setupModalAndPdf() {
        // Close modal
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Download PDF
        downloadPdfBtn.addEventListener('click', function() {
            generateAndDownloadPdf();
        });
        
        // Submit form
        submitFormBtn.addEventListener('click', function() {
            submitForm();
        });
        
        // Function to generate and download PDF
        async function generateAndDownloadPdf() {
            try {
                // Show loading indicator in the button
                downloadPdfBtn.disabled = true;
                downloadPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                
                // Use jsPDF to generate the PDF
                if (window.jspdf) {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    // Get form values
                    const formData = {
                        idNumber: document.getElementById("id-number").value,
                        firstName: document.getElementById("first-name").value,
                        lastName: document.getElementById("last-name").value,
                        email: document.getElementById("email").value,
                        phone: document.getElementById("phone").value,
                        occupation: document.getElementById("occupation").value,
                        company: document.getElementById("company").value,
                        schedule: document.getElementById("schedule").value,
                        maritalStatus: document.querySelector('input[name="marital-status"]:checked')?.value || 'Not selected',
                        city: document.getElementById("city").value,
                        address: document.getElementById("address").value,
                        housing: document.getElementById("housing").value,
                        floor: document.getElementById("floor").value,
                        houseDescription: document.getElementById("house-description").value,
                        haveKids: document.querySelector('input[name="have-kids"]:checked')?.value || 'Not selected',
                        many: document.getElementById("many").value,
                        ages: document.getElementById("ages").value,
                        havePets: document.querySelector('input[name="have-pets"]:checked')?.value || 'Not selected',
                        currentPets: document.getElementById("current-pets")?.value || '',
                        hoursAlone: document.getElementById("hours-alone")?.value || '',
                        vetName: document.getElementById("vet-name")?.value || '',
                        adoptBefore: document.querySelector('input[name="adopt-before"]:checked')?.value || 'Not selected',
                        committed: document.querySelector('input[name="committed"]:checked')?.value || 'Not selected',
                        whyAdopt: document.getElementById("why-adopt").value,
                        additionalInfo: document.getElementById("additional-info")?.value || ''
                    };
                    
                    // Generate enhanced PDF
                    generateEnhancedPDF(doc, formData);
                    
                    // Save the PDF with a descriptive name
                    const fileName = `adoption_form_${formData.firstName}_${formData.lastName}.pdf`;
                    doc.save(fileName);
                    
                    // Restaurar el botón
                    downloadPdfBtn.disabled = false;
                    downloadPdfBtn.innerHTML = 'Download PDF <i class="fas fa-download"></i>';
                } else {
                    throw new Error("Error: jsPDF no se ha cargado correctamente.");
                }
            } catch (error) {
                console.error("Error generating PDF for download:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error generating PDF. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                
                // Restaurar el botón
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.innerHTML = 'Download PDF <i class="fas fa-download"></i>';
            }
        }
    }

    // Function to generate an enhanced PDF
    function generateEnhancedPDF(doc, formData) {
        // Configuration of styles
        const titleFont = 'helvetica';
        const titleSize = 16;
        const headerFont = 'helvetica';
        const headerSize = 12;
        const textFont = 'helvetica';
        const textSize = 10;
        const margin = 20;
        let yPos = margin;
        
        // Helper function to add text
        function addText(text, x, y, options = {}) {
            const defaultOptions = {
                font: textFont,
                size: textSize,
                style: 'normal',
                color: [0, 0, 0]
            };
            
            const opts = {...defaultOptions, ...options};
            
            doc.setFont(opts.font, opts.style);
            doc.setFontSize(opts.size);
            doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
            doc.text(text, x, y);
        }
        
        // Header
        addText('ADOPTION APPLICATION FORM', margin, yPos, {
            size: titleSize,
            style: 'bold',
            color: [255, 138, 43] // Color naranja #FF8A2B
        });
        
        yPos += 10;
        addText('Date: ' + new Date().toLocaleDateString(), margin, yPos);
        yPos += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, 210 - margin, yPos);
        yPos += 10;
        
        // Section 1: Personal Information
        addText('1. PERSONAL INFORMATION', margin, yPos, {
            size: headerSize,
            style: 'bold'
        });
        yPos += 8;
        
        addText(`Name: ${formData.firstName} ${formData.lastName}`, margin, yPos);
        yPos += 6;
        addText(`ID Number: ${formData.idNumber}`, margin, yPos);
        yPos += 6;
        addText(`Email: ${formData.email}`, margin, yPos);
        yPos += 6;
        addText(`Phone: ${formData.phone}`, margin, yPos);
        yPos += 6;
        addText(`Occupation: ${formData.occupation}`, margin, yPos);
        yPos += 6;
        addText(`Company: ${formData.company}`, margin, yPos);
        yPos += 6;
        addText(`Work Schedule: ${formData.schedule}`, margin, yPos);
        yPos += 6;
        addText(`Marital Status: ${formData.maritalStatus}`, margin, yPos);
        yPos += 10;
        
        // Section 2: Housing Information
        addText('2. HOUSING INFORMATION', margin, yPos, {
            size: headerSize,
            style: 'bold'
        });
        yPos += 8;
        
        addText(`City: ${formData.city}`, margin, yPos);
        yPos += 6;
        addText(`Address: ${formData.address}`, margin, yPos);
        yPos += 6;
        addText(`Housing Type: ${formData.housing}`, margin, yPos);
        yPos += 6;
        addText(`Floor: ${formData.floor}`, margin, yPos);
        yPos += 6;
        addText(`Description: ${formData.houseDescription}`, margin, yPos);
        yPos += 10;
        
        // Section 3: Family Information
        addText('3. FAMILY INFORMATION', margin, yPos, {
            size: headerSize,
            style: 'bold'
        });
        yPos += 8;
        
        addText(`Have Kids: ${formData.haveKids}`, margin, yPos);
        yPos += 6;
        
        if (formData.haveKids === 'Yes') {
            addText(`How Many: ${formData.many}`, margin, yPos);
            yPos += 6;
            addText(`Ages: ${formData.ages}`, margin, yPos);
            yPos += 6;
        }
        
        addText(`Have Pets: ${formData.havePets}`, margin, yPos);
        yPos += 6;
        
        if (formData.havePets === 'Yes') {
            addText(`Current Pets: ${formData.currentPets}`, margin, yPos);
            yPos += 6;
        }
        
        // If we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = margin;
        }
        
        // Section 4: Adoption Information
        addText('4. ADOPTION INFORMATION', margin, yPos, {
            size: headerSize,
            style: 'bold'
        });
        yPos += 8;
        
        addText(`Hours Pet Will Be Alone: ${formData.hoursAlone}`, margin, yPos);
        yPos += 6;
        addText(`Veterinarian Name: ${formData.vetName}`, margin, yPos);
        yPos += 6;
        addText(`Adopted Before: ${formData.adoptBefore}`, margin, yPos);
        yPos += 6;
        addText(`Committed to Care: ${formData.committed}`, margin, yPos);
        yPos += 10;
        
        // Reason for adoption
        addText('Reason for Adoption:', margin, yPos);
        yPos += 6;
        
        // Split the long text into multiple lines
        const reasonLines = doc.splitTextToSize(formData.whyAdopt, 170);
        for (const line of reasonLines) {
            addText(line, margin, yPos);
            yPos += 5;
        }
        yPos += 5;
        
        // Additional Information
        if (formData.additionalInfo) {
            addText('Additional Information:', margin, yPos);
            yPos += 6;
            
            const additionalLines = doc.splitTextToSize(formData.additionalInfo, 170);
            for (const line of additionalLines) {
                addText(line, margin, yPos);
                yPos += 5;
            }
        }
        
        // Footer
        yPos = 280;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos - 10, 210 - margin, yPos - 10);
        
        addText('This document is an adoption request and does not guarantee automatic approval.', margin, yPos, {
            size: 8
        });
        yPos += 5;
        addText('Little Pets - All rights reserved', margin, yPos, {
            size: 8
        });
    }

    // Function to generate PDF as base64
    async function generatePdfAsBase64() {
        return new Promise((resolve, reject) => {
            try {
                // Verify that jsPDF is available
                if (!window.jspdf) {
                    console.error("jsPDF library not loaded");
                    reject(new Error("Error: jsPDF library not loaded. Please refresh the page and try again."));
                    return;
                }
                
                // Create a jsPDF instance
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Get form values
                const formData = {
                    idNumber: document.getElementById("id-number").value,
                    firstName: document.getElementById("first-name").value,
                    lastName: document.getElementById("last-name").value,
                    email: document.getElementById("email").value,
                    phone: document.getElementById("phone").value,
                    occupation: document.getElementById("occupation").value,
                    company: document.getElementById("company").value,
                    schedule: document.getElementById("schedule").value,
                    maritalStatus: document.querySelector('input[name="marital-status"]:checked')?.value || 'Not selected',
                    city: document.getElementById("city").value,
                    address: document.getElementById("address").value,
                    housing: document.getElementById("housing").value,
                    floor: document.getElementById("floor").value,
                    houseDescription: document.getElementById("house-description").value,
                    haveKids: document.querySelector('input[name="have-kids"]:checked')?.value || 'Not selected',
                    many: document.getElementById("many").value,
                    ages: document.getElementById("ages").value,
                    havePets: document.querySelector('input[name="have-pets"]:checked')?.value || 'Not selected',
                    currentPets: document.getElementById("current-pets")?.value || '',
                    hoursAlone: document.getElementById("hours-alone")?.value || '',
                    vetName: document.getElementById("vet-name")?.value || '',
                    adoptBefore: document.querySelector('input[name="adopt-before"]:checked')?.value || 'Not selected',
                    committed: document.querySelector('input[name="committed"]:checked')?.value || 'Not selected',
                    whyAdopt: document.getElementById("why-adopt").value,
                    additionalInfo: document.getElementById("additional-info")?.value || ''
                };
                
                // Generate PDF with enhanced design
                try {
                    generateEnhancedPDF(doc, formData);
                    
                    // Convert to base64
                    const pdfBase64 = doc.output('datauristring').split(',')[1];
                    resolve(pdfBase64);
                } catch (pdfError) {
                    console.error("Error in PDF generation:", pdfError);
                    reject(new Error("Error generating PDF content: " + pdfError.message));
                }
            } catch (error) {
                console.error("Error in generatePdfAsBase64:", error);
                reject(error);
            }
        });
    }

    // Function to generate PDF preview
    function generatePdfPreview() {
        const pdfPreview = document.getElementById('pdfPreview');
        
        // Get form values to avoid repetition
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const idNumber = document.getElementById('id-number').value;
        const occupation = document.getElementById('occupation').value || 'Not specified';
        const company = document.getElementById('company').value || 'Not specified';
        const schedule = document.getElementById('schedule').value || 'Not specified';
        const maritalStatus = document.querySelector('input[name="marital-status"]:checked')?.value || 'Not selected';
        
        const city = document.getElementById('city').value;
        const address = document.getElementById('address').value;
        const housing = document.getElementById('housing').value;
        const floor = document.getElementById('floor').value || 'Not specified';
        const houseDescription = document.getElementById('house-description').value || 'Not specified';
        
        const haveKids = document.querySelector('input[name="have-kids"]:checked')?.value || 'Not selected';
        const many = document.getElementById('many').value || 'N/A';
        const ages = document.getElementById('ages').value || 'N/A';
        const havePets = document.querySelector('input[name="have-pets"]:checked')?.value || 'Not selected';
        const currentPets = document.getElementById('current-pets')?.value || 'None';
        
        const hoursAlone = document.getElementById('hours-alone')?.value || 'Not specified';
        const vetName = document.getElementById('vet-name')?.value || 'Not specified';
        const adoptBefore = document.querySelector('input[name="adopt-before"]:checked')?.value || 'Not selected';
        const committed = document.querySelector('input[name="committed"]:checked')?.value || 'Not selected';
        const whyAdopt = document.getElementById('why-adopt').value;
        const additionalInfo = document.getElementById('additional-info')?.value || 'None provided';
        
        // Create HTML content for preview with all sections
        pdfPreview.innerHTML = `
            <div class="pdf-header">
                <h1><i class="fas fa-paw"></i> Adoption Application Form</h1>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="pdf-section">
                <h2><i class="fas fa-user"></i> Personal Information</h2>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>ID Number:</strong> ${idNumber}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Occupation:</strong> ${occupation}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Work Schedule:</strong> ${schedule}</p>
                <p><strong>Marital Status:</strong> ${maritalStatus}</p>
            </div>
            
            <div class="pdf-section">
                <h2><i class="fas fa-home"></i> Housing Information</h2>
                <p><strong>City:</strong> ${city}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Housing Type:</strong> ${housing}</p>
                <p><strong>Floor:</strong> ${floor}</p>
                <p><strong>Description:</strong> ${houseDescription}</p>
            </div>
            
            <div class="pdf-section">
                <h2><i class="fas fa-users"></i> Family Information</h2>
                <p><strong>Have Kids:</strong> ${haveKids}</p>
                ${haveKids === 'Yes' ? `
                    <p><strong>How Many:</strong> ${many}</p>
                    <p><strong>Ages:</strong> ${ages}</p>
                ` : ''}
                <p><strong>Have Pets:</strong> ${havePets}</p>
                ${havePets === 'Yes' ? `
                    <p><strong>Current Pets:</strong> ${currentPets}</p>
                ` : ''}
            </div>
            
            <div class="pdf-section">
                <h2><i class="fas fa-heart"></i> Adoption Information</h2>
                <p><strong>Hours Pet Will Be Alone:</strong> ${hoursAlone}</p>
                <p><strong>Veterinarian Name:</strong> ${vetName}</p>
                <p><strong>Adopted Before:</strong> ${adoptBefore}</p>
                <p><strong>Committed to Care:</strong> ${committed}</p>
                
                <div class="reason-section">
                    <p><strong>Reason for Adoption:</strong></p>
                    <p class="reason-text">${whyAdopt}</p>
                </div>
                
                ${additionalInfo !== 'None provided' ? `
                    <div class="additional-info">
                        <p><strong>Additional Information:</strong></p>
                        <p class="additional-text">${additionalInfo}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="pdf-footer">
                <p>This document is an adoption request and does not guarantee automatic approval.</p>
                <p><strong>Little Pets</strong> - All rights reserved</p>
            </div>
        `;
    }

    // Function to submit the form
    async function submitForm() {
        try {
            // Show loading indicator
            submitFormBtn.disabled = true;
            submitFormBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Generate PDF as base64
            const pdfBase64 = await generatePdfAsBase64();
            
            // Get form values
            const formData = {
                idNumber: document.getElementById("id-number").value,
                firstName: document.getElementById("first-name").value,
                lastName: document.getElementById("last-name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                occupation: document.getElementById("occupation").value,
                company: document.getElementById("company").value,
                schedule: document.getElementById("schedule").value,
                maritalStatus: document.querySelector('input[name="marital-status"]:checked')?.value || 'Not selected',
                city: document.getElementById("city").value,
                address: document.getElementById("address").value,
                housing: document.getElementById("housing").value,
                floor: document.getElementById("floor").value,
                houseDescription: document.getElementById("house-description").value,
                haveKids: document.querySelector('input[name="have-kids"]:checked')?.value || 'Not selected',
                many: document.getElementById("many").value,
                ages: document.getElementById("ages").value,
                havePets: document.querySelector('input[name="have-pets"]:checked')?.value || 'Not selected',
                currentPets: document.getElementById("current-pets")?.value || '',
                hoursAlone: document.getElementById("hours-alone")?.value || '',
                vetName: document.getElementById("vet-name")?.value || '',
                adoptBefore: document.querySelector('input[name="adopt-before"]:checked')?.value || 'Not selected',
                committed: document.querySelector('input[name="committed"]:checked')?.value || 'Not selected',
                whyAdopt: document.getElementById("why-adopt").value,
                additionalInfo: document.getElementById("additional-info")?.value || ''
            };
            
            // Verify if we are coming from a pet details page
            const urlParams = new URLSearchParams(window.location.search);
            const petId = urlParams.get("petId");
            if (petId) {
                formData.petId = petId;
            }
            
            // Send data to server
            const response = await fetch('/api/adoption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    formData,
                    pdfBase64
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit adoption request');
            }
            
            // Show success message
            Swal.fire({
                title: 'Success',
                text: 'Thank you! Your adoption request has been successfully submitted. We will contact you soon.',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
            modal.style.display = 'none';
            
            // Redirect to home page
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error submitting adoption request:', error);
            Swal.fire({
                title: 'Error',
                text: `Error: ${error.message || 'Failed to submit adoption request. Please try again later.'}`,
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            // Restore button
            submitFormBtn.disabled = false;
            submitFormBtn.innerHTML = 'Submit Application';
        }
    }

    // Close DOMContentLoaded event
});