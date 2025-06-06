// src/controllers/adoptionController.js
const AdoptionRequest = require("../models/adoptionRequestModel");
const Pet = require("../models/petModel");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");

// Crear directorio para PDFs si no existe
const pdfDirectory = path.join(__dirname, "../../uploads/pdfs");
if (!fs.existsSync(pdfDirectory)) {
  fs.mkdirSync(pdfDirectory, { recursive: true });
  console.log(`Directorio creado: ${pdfDirectory}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload PDF to Cloudinary
const uploadPdfToCloudinary = (pdfBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Intentando subir PDF a Cloudinary...');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "adoption_requests",
          public_id: fileName,
          format: "pdf",
          access_mode: "public",
          type: "upload"
        },
        (error, result) => {
          if (error) {
            console.error('Error de Cloudinary:', error);
            reject(error);
          } else {
            console.log('PDF subido exitosamente a Cloudinary:', result.secure_url);
            resolve(result);
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(pdfBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    } catch (error) {
      console.error('Error al intentar subir a Cloudinary:', error);
      reject(error);
    }
  });
};

// Función para guardar PDF localmente y crear URL local
const saveLocalPdfAndGetUrl = async (pdfBuffer, fileName) => {
  try {
    const pdfFileName = `${fileName}.pdf`;
    const pdfPath = path.join(pdfDirectory, pdfFileName);
    
    // Guardar el PDF en el sistema de archivos local
    await fs.promises.writeFile(pdfPath, pdfBuffer);
    console.log(`PDF guardado localmente en: ${pdfPath}`);
    
    // Generar una URL local basada en la ruta de la API
    return {
      url: `/api/adoption/pdf/${pdfFileName}`,
      path: pdfPath
    };
  } catch (error) {
    console.error('Error al guardar PDF localmente:', error);
    throw error;
  }
};

// Función para servir PDFs locales
exports.servePdf = async (req, res) => {
  try {
    const pdfFileName = req.params.fileName;
    const pdfPath = path.join(pdfDirectory, pdfFileName);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "PDF not found" 
      });
    }
    
    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
    
    // Enviar el archivo
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al servir PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error serving PDF", 
      error: error.message 
    });
  }
};

// Create a new adoption request
exports.createAdoptionRequest = async (req, res) => {
  try {
    const { formData } = req.body;
    const pdfBuffer = Buffer.from(req.body.pdfBase64, "base64");
    
    // Generate a unique filename
    const fileName = `adoption_${formData.idNumber}_${Date.now()}`;
    
    let pdfUrl = null;
    let pdfPublicId = null;
    
    try {
      // Intentar subir PDF a Cloudinary
      console.log('Intentando subir PDF a Cloudinary...');
      const uploadResult = await uploadPdfToCloudinary(pdfBuffer, fileName);
      pdfUrl = uploadResult.secure_url;
      pdfPublicId = uploadResult.public_id;
      console.log('PDF subido exitosamente:', pdfUrl);
    } catch (cloudinaryError) {
      console.error('Error al subir a Cloudinary:', cloudinaryError);
      
      // Alternativa: guardar PDF localmente y obtener URL
      console.log('Guardando PDF localmente como alternativa...');
      const localResult = await saveLocalPdfAndGetUrl(pdfBuffer, fileName);
      pdfUrl = localResult.url;
      pdfPublicId = fileName;
      console.log('PDF guardado localmente. URL:', pdfUrl);
    }
    
    // Create adoption request in database
    const adoptionRequest = new AdoptionRequest({
      ...formData,
      pdfUrl: pdfUrl,
      pdfPublicId: pdfPublicId || fileName, // Usar fileName como fallback si no hay publicId
    });
    
    await adoptionRequest.save();
    
    res.status(201).json({
      success: true,
      message: "Adoption request submitted successfully",
      data: {
        requestId: adoptionRequest._id,
        pdfUrl: pdfUrl,
      },
    });
  } catch (error) {
    console.error("Error creating adoption request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit adoption request",
      error: error.message,
    });
  }
};

// Get all adoption requests (for admins and managers)
exports.getAllAdoptionRequests = async (req, res) => {
  try {
    const adoptionRequests = await AdoptionRequest.find()
      .sort({ createdAt: -1 })
      .populate("petId", "name type breed image")
      .populate("reviewedBy", "name");
    
    res.status(200).json({
      success: true,
      count: adoptionRequests.length,
      data: adoptionRequests,
    });
  } catch (error) {
    console.error("Error fetching adoption requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch adoption requests",
      error: error.message,
    });
  }
};

// Get a single adoption request by ID
exports.getAdoptionRequestById = async (req, res) => {
  try {
    const adoptionRequest = await AdoptionRequest.findById(req.params.id)
      .populate("petId", "name type breed image")
      .populate("reviewedBy", "name");
    
    if (!adoptionRequest) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: adoptionRequest,
    });
  } catch (error) {
    console.error("Error fetching adoption request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch adoption request",
      error: error.message,
    });
  }
};

// Update adoption request status (approve/reject)
exports.updateAdoptionRequestStatus = async (req, res) => {
  try {
    const { status, reviewComments } = req.body;
    
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
    
    const adoptionRequest = await AdoptionRequest.findById(req.params.id);
    
    if (!adoptionRequest) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found",
      });
    }
    
    // Update status and review information
    adoptionRequest.status = status;
    adoptionRequest.reviewComments = reviewComments || "";
    adoptionRequest.reviewedBy = req.user._id;
    adoptionRequest.reviewDate = Date.now();
    
    await adoptionRequest.save();
    
    // Si la solicitud es aprobada, actualizar el estado de la mascota a "adopted"
    if (status === "approved" && adoptionRequest.petId) {
      try {
        const pet = await Pet.findById(adoptionRequest.petId);
        if (pet) {
          pet.availability = "adopted";
          await pet.save();
          console.log(`Mascota ${pet._id} (${pet.name}) marcada como adoptada`);
        } else {
          console.warn(`No se encontró la mascota con ID: ${adoptionRequest.petId}`);
        }
      } catch (petError) {
        console.error("Error al actualizar el estado de la mascota:", petError);
        // No interrumpimos el flujo principal si hay un error al actualizar la mascota
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Adoption request ${status}`,
      data: adoptionRequest,
    });
  } catch (error) {
    console.error("Error updating adoption request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update adoption request",
      error: error.message,
    });
  }
};

// Get adoption requests by user email
exports.getAdoptionRequestsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const adoptionRequests = await AdoptionRequest.find({ email })
      .sort({ createdAt: -1 })
      .populate("petId", "name type breed image");
    
    res.status(200).json({
      success: true,
      count: adoptionRequests.length,
      data: adoptionRequests,
    });
  } catch (error) {
    console.error("Error fetching adoption requests by email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch adoption requests",
      error: error.message,
    });
  }
};
