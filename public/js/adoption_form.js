document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const totalSteps = 5;
    let currentStep = 1;
    
    // Elementos DOM
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
    
    // Inicializar el formulario
    initForm();
    
    // Configurar eventos condicionales
    setupConditionalFields();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar modal y PDF
    setupModalAndPdf();
    
    // Función para inicializar el formulario
    function initForm() {
        // Establecer ancho inicial de la barra de progreso
        updateProgressBar();
        
        // Verificar si venimos de una página de detalles de mascota
        const urlParams = new URLSearchParams(window.location.search);
        const petId = urlParams.get("petId");
        if (petId) {
            // Podríamos cargar información de la mascota y pre-llenar campos
            console.log("Formulario de adopción para mascota ID:", petId);
        }
    }
    
    // Función para actualizar la barra de progreso
    function updateProgressBar() {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Actualizar indicadores de paso
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
    
    // Función para configurar campos condicionales
    function setupConditionalFields() {
        // Mostrar/ocultar campos de niños
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
        
        // Mostrar/ocultar campos de mascotas actuales
        const havePetsRadios = document.querySelectorAll('input[name="have-pets"]');
        const petsDetailsDiv = document.getElementById('pets-details');
        
        havePetsRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                petsDetailsDiv.style.display = this.value === 'yes' ? 'block' : 'none';
            });
        });
        
        // Mostrar/ocultar permiso del propietario
        const homeOwnershipRadios = document.querySelectorAll('input[name="home-ownership"]');
        const landlordPermissionDiv = document.getElementById('landlord-permission');
        
        homeOwnershipRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                landlordPermissionDiv.style.display = this.value === 'rent' ? 'block' : 'none';
            });
        });
    }
    
    // Función para configurar la navegación entre pasos
    function setupNavigation() {
        // Botones Siguiente
        nextButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (validateCurrentStep()) {
                    if (currentStep < totalSteps) {
                        // Ocultar paso actual
                        document.getElementById(`section-${currentStep}`).style.display = 'none';
                        // Incrementar paso
                        currentStep++;
                        // Mostrar nuevo paso
                        document.getElementById(`section-${currentStep}`).style.display = 'block';
                        // Actualizar barra de progreso
                        updateProgressBar();
                        // Si es el último paso, generar resumen
                        if (currentStep === totalSteps) {
                            generateReviewContent();
                        }
                        // Scroll al inicio del formulario
                        window.scrollTo({
                            top: document.querySelector('.adoption-form-container').offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // Botones Anterior
        prevButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (currentStep > 1) {
                    // Ocultar paso actual
                    document.getElementById(`section-${currentStep}`).style.display = 'none';
                    // Decrementar paso
                    currentStep--;
                    // Mostrar nuevo paso
                    document.getElementById(`section-${currentStep}`).style.display = 'block';
                    // Actualizar barra de progreso
                    updateProgressBar();
                    // Scroll al inicio del formulario
                    window.scrollTo({
                        top: document.querySelector('.adoption-form-container').offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Botón Enviar
        submitButton.addEventListener('click', function() {
            if (validateCurrentStep() && document.getElementById('terms-agreement').checked) {
                generatePdfPreview();
                modal.style.display = 'block';
            } else {
                alert('Please accept the terms and conditions before continuing.');
            }
        });
    }
    
    // Función para validar el paso actual
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
            alert('Please complete all required fields before continuing.');
        }
        
        return isValid;
    }
    
    // Función para generar el contenido de revisión
    function generateReviewContent() {
        const reviewContainer = document.getElementById('reviewContainer');
        reviewContainer.innerHTML = '';
        
        // Sección 1: Información Personal
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
                <div class="review-value">${document.getElementById('schedule').value || 'No especificado'}</div>
            </div>
        `;
        reviewContainer.appendChild(personalSection);
        
        // Sección 2: Información de Vivienda
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
        `;
        reviewContainer.appendChild(housingSection);
        
        // Continuar con las demás secciones de manera similar...
    }
    
    // Función para configurar el modal y la generación de PDF
    function setupModalAndPdf() {
        // Cerrar modal
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Botón descargar PDF
        downloadPdfBtn.addEventListener('click', function() {
            generateAndDownloadPdf();
        });
        
        // Botón enviar formulario
        submitFormBtn.addEventListener('click', function() {
            submitForm();
        });
    }
    
    // Función para generar la vista previa del PDF
    function generatePdfPreview() {
        const pdfPreview = document.getElementById('pdfPreview');
        
        // Crear contenido HTML para la vista previa
        pdfPreview.innerHTML = `
            <div class="pdf-header">
                <h1>Adoption Form</h1>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="pdf-section">
                <h2>Personal Information</h2>
                <p><strong>Name:</strong> ${document.getElementById('first-name').value} ${document.getElementById('last-name').value}</p>
                <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
                <p><strong>Phone:</strong> ${document.getElementById('phone').value}</p>
                <p><strong>ID:</strong> ${document.getElementById('id-number').value}</p>
                <p><strong>Occupation:</strong> ${document.getElementById('occupation').value || 'Not specified'}</p>
            </div>
            
            <div class="pdf-section">
                <h2>Housing Information</h2>
                <p><strong>Address:</strong> ${document.getElementById('address').value}, ${document.getElementById('city').value}</p>
                <p><strong>Housing Type:</strong> ${document.getElementById('housing').value}</p>
                <p><strong>Description:</strong> ${document.getElementById('house-description').value || 'Not specified'}</p>
            </div>
            
            <!-- Continuar con las demás secciones -->
            
            <div class="pdf-footer">
                <p>This document is an adoption request and does not guarantee automatic approval.</p>
                <p>Little Pets - All rights reserved</p>
            </div>
        `;
    }
    
    // Función para generar y descargar el PDF
    function generateAndDownloadPdf() {
        if (window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Obtener valores del formulario
            const formData = {
                idNumber: document.getElementById("id-number").value,
                firstName: document.getElementById("first-name").value,
                lastName: document.getElementById("last-name").value,
                email: document.getElementById("email").value,
                occupation: document.getElementById("occupation").value,
                adoptBefore: document.querySelector('input[name="adopt-before"]:checked')?.value || 'Not selected',
                committed: document.querySelector('input[name="committed"]:checked')?.value || 'Not selected',
                maritalStatus: document.querySelector('input[name="marital-status"]:checked')?.value || 'Not selected',
                haveKids: document.querySelector('input[name="have-kids"]:checked')?.value || 'Not selected',
                company: document.getElementById("company").value,
                schedule: document.getElementById("schedule").value,
                city: document.getElementById("city").value,
                address: document.getElementById("address").value,
                floor: document.getElementById("floor").value,
                houseDescription: document.getElementById("house-description").value,
                phone: document.getElementById("phone").value,
                housing: document.getElementById("housing").value,
                whyAdopt: document.getElementById("why-adopt").value,
                ages: document.getElementById("ages").value,
                many: document.getElementById("many").value,
                // Nuevos campos
                havePets: document.querySelector('input[name="have-pets"]:checked')?.value || 'Not selected',
                currentPets: document.getElementById("current-pets")?.value || '',
                hoursAlone: document.getElementById("hours-alone")?.value || '',
                vetName: document.getElementById("vet-name")?.value || '',
                additionalInfo: document.getElementById("additional-info")?.value || ''
            };
            
            // Generar PDF con diseño mejorado
            generateEnhancedPDF(doc, formData);
            
            // Guardar PDF
            doc.save("adoption_form.pdf");
        } else {
            alert("Error: jsPDF no se ha cargado correctamente.");
        }
    }
    
    // Función para generar un PDF con mejor diseño
    function generateEnhancedPDF(doc, data) {
        // Configuración de colores y estilos
        const primaryColor = [255, 138, 43]; // #FF8A2B en RGB
        const secondaryColor = [51, 51, 51]; // #333333 en RGB
        
        // Título y encabezado
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("Adoption Form", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
        
        // Función auxiliar para añadir campos
        let y = 50;
        
        function addField(label, value, indent = 0) {
            if (value === undefined || value === null) {
                value = "No especificado";
            }
            
            doc.setFont("helvetica", "bold");
            doc.text(label, 20 + indent, y);
            doc.setFont("helvetica", "normal");
            doc.text(value || "Not specified", 80 + indent, y);
            y += 8;
            
            // If we reach the end of the page, add a new one
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        }
        
        function addSection(title) {
            // Añadir espacio antes de la sección
            y += 5;
            
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(title, 20, y);
            y += 5;
            
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(0.5);
            doc.line(20, y, 190, y);
            y += 10;
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
        }
        
        function addLongText(label, text) {
            if (!text) return;
            
            doc.setFont("helvetica", "bold");
            doc.text(label, 20, y);
            y += 8;
            
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(text, 160);
            doc.text(splitText, 20, y);
            y += splitText.length * 7 + 5;
        }
        
        // 1. Información Personal
        addSection("Personal Information");
        addField("Full Name:", `${data.firstName} ${data.lastName}`);
        addField("Email:", data.email);
        addField("Phone:", data.phone);
        addField("ID:", data.idNumber);
        addField("Occupation:", data.occupation);
        addField("Company:", data.company);
        addField("Work Schedule:", data.schedule);
        addField("Marital Status:", data.maritalStatus);
        
        // 2. Información de Vivienda
        addSection("Housing Information");
        addField("City:", data.city);
        addField("Address:", data.address);
        addField("Housing Type:", data.housing);
        addField("Floor:", data.floor);
        addLongText("Housing Description:", data.houseDescription);
        
        // 3. Información Familiar
        addSection("Family Information");
        addField("Do you have children?:", data.haveKids);
        if (data.haveKids === "yes") {
            addField("Number of children:", data.many);
            addField("Children's ages:", data.ages);
        }
        
        // 4. Información sobre Mascotas
        addSection("Pet Information");
        addField("Have you adopted before?:", data.adoptBefore);
        addField("Do you have other pets?:", data.havePets);
        if (data.havePets === "yes") {
            addLongText("Current pets:", data.currentPets);
        }
        addField("Hours the pet will be alone:", data.hoursAlone);
        addField("Veterinarian's name:", data.vetName);
        addField("Committed to care?:", data.committed);
        
        // 5. Motivo de Adopción
        addSection("Reason for Adoption");
        addLongText("Why do you want to adopt?:", data.whyAdopt);
        
        // 6. Información Adicional
        if (data.additionalInfo) {
            addSection("Additional Information");
            addLongText("Additional comments:", data.additionalInfo);
        }
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
            doc.text("Little Pets - Adoption Form", 105, 285, { align: "center" });
        }
    }
    
    // Función para enviar el formulario
    function submitForm() {
        // Aquí se implementaría la lógica para enviar el formulario al servidor
        alert('Thank you! Your adoption request has been successfully submitted. We will contact you soon.');
        modal.style.display = 'none';
        
        // Redireccionar a la página de inicio o de confirmación
        // window.location.href = '../index.html';
    }
});