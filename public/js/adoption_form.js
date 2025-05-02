document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("adoptButton").addEventListener("click", async function(){
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
                adoptBefore: document.querySelector('input[name="adopt-before"]:checked')?.value || 'No seleccionado',
                committed: document.querySelector('input[name="committed"]:checked')?.value || 'No seleccionado',
                maritalStatus: document.querySelector('input[name="marital-status"]:checked')?.value || 'No seleccionado',
                haveKids: document.querySelector('input[name="have-kids"]:checked')?.value || 'No seleccionado',
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
                many: document.getElementById("many").value
            };

            // Generar PDF
            generatePDF(doc, formData);

        } else {
            alert("Error: jsPDF no se ha cargado correctamente.");
        }
    });
});

function generatePDF(doc, data) {
    // Título
    doc.setFontSize(20);
    doc.text("Adoption Form", 80, 20);
    
    // Información personal
    doc.setFontSize(16);
    doc.text("Personal Information", 10, 40);
    
    doc.setFontSize(12);
    doc.text("ID Number: " + data.idNumber, 10, 55);
    doc.text("Full Name: " + data.firstName + " " + data.lastName, 10, 65);
    doc.text("Email: " + data.email, 10, 75);
    doc.text("Phone: " + data.phone, 10, 85);
    doc.text("Occupation: " + data.occupation, 10, 95);
    doc.text("Company: " + data.company, 10, 105);
    doc.text("Schedule: " + data.schedule, 10, 115);

    // Información de dirección
    doc.setFontSize(16);
    doc.text("Address Information", 10, 135);
    
    doc.setFontSize(12);
    doc.text("City: " + data.city, 10, 150);
    doc.text("Address: " + data.address, 10, 160);
    doc.text("Floor: " + data.floor, 10, 170);
    doc.text("Housing Type: " + data.housing, 10, 180);

    // Información adicional
    doc.setFontSize(16);
    doc.text("Additional Information", 10, 200);
    
    doc.setFontSize(12);
    doc.text("Marital Status: " + data.maritalStatus, 10, 215);
    doc.text("Ages: " + data.ages, 10, 225);
    doc.text("Have Kids: " + data.haveKids, 10, 235);
    doc.text("Number of kids: " + data.many, 10, 245);

    // Nueva página para el resto de la información
    doc.addPage();

    doc.setFontSize(16);
    doc.text("Adoption Details", 10, 20);

    doc.setFontSize(12);
    doc.text("Previous Adoptions: " + data.adoptBefore, 10, 35);
    doc.text("Committed to Care: " + data.committed, 10, 45);

    // Descripción de la casa
    doc.setFontSize(16);
    doc.text("House Description", 10, 65);
    
    doc.setFontSize(12);
    let splitHouseDesc = doc.splitTextToSize(data.houseDescription, 180);
    doc.text(splitHouseDesc, 10, 80);

    // Por qué quiere adoptar
    doc.setFontSize(16);
    doc.text("Why do you want to adopt?", 10, 120);
    
    doc.setFontSize(12);
    let splitWhyAdopt = doc.splitTextToSize(data.whyAdopt, 180);
    doc.text(splitWhyAdopt, 10, 135);

    // Fecha de generación
    const date = new Date();
    doc.setFontSize(10);
    doc.text("Generated on: " + date.toLocaleDateString(), 10, 280);

    // Guardar PDF
    doc.save("adoption_form.pdf");
}