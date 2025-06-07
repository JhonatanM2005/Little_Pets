// src/controllers/adoptionController.js
const AdoptionRequest = require("../models/adoptionRequestModel");
const Pet = require("../models/petModel");
const fileHandlers = require("../utils/fileHandlers");
const { sendAdoptionStatusEmail } = require("../services/emailService");
const fs = require('fs');
const path = require('path');

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
      // Try to upload PDF to Cloudinary
      console.log('Attempting to upload PDF to Cloudinary...');
      const uploadResult = await fileHandlers.uploadPdfToCloudinary(pdfBuffer, fileName);
      pdfUrl = uploadResult.secure_url;
      pdfPublicId = uploadResult.public_id;
      console.log('PDF uploaded successfully:', pdfUrl);
    } catch (cloudinaryError) {
      console.error('Error uploading to Cloudinary:', cloudinaryError);
      
      // Alternative: save PDF locally and get URL
      console.log('Saving PDF locally as alternative...');
      const localResult = await fileHandlers.saveLocalPdfAndGetUrl(pdfBuffer, fileName);
      pdfUrl = localResult.url;
      pdfPublicId = fileName;
      console.log('PDF saved locally. URL:', pdfUrl);
    }
    
    // Create adoption request in database
    const adoptionRequest = new AdoptionRequest({
      ...formData,
      pdfUrl: pdfUrl,
      pdfPublicId: pdfPublicId || fileName, // Use fileName as fallback if no publicId
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

// Get all adoption requests
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
      message: "Error fetching adoption requests",
      error: error.message,
    });
  }
};

// Get adoption request by ID
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
      message: "Error fetching adoption request",
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
    
    const adoptionRequest = await AdoptionRequest.findById(req.params.id)
      .populate("petId", "name type breed image availability");
    
    if (!adoptionRequest) {
      return res.status(404).json({
        success: false,
        message: "Adoption request not found",
      });
    }
    
    // Update status and comments
    adoptionRequest.status = status;
    if (reviewComments) {
      adoptionRequest.reviewComments = reviewComments;
    }
    adoptionRequest.reviewedBy = req.user._id;
    adoptionRequest.reviewDate = Date.now();
    
    await adoptionRequest.save();
    
    // If request is approved, update pet status to "adopted"
    if (status === "approved" && adoptionRequest.petId) {
      try {
        const pet = await Pet.findById(adoptionRequest.petId);
        if (pet) {
          pet.availability = "adopted";
          await pet.save();
          console.log(`Pet ${pet._id} (${pet.name}) marked as adopted`);
        } else {
          console.warn(`Pet not found with ID: ${adoptionRequest.petId}`);
        }
      } catch (petError) {
        console.error("Error updating pet status:", petError);
        // Don't interrupt main flow if there's an error updating the pet
      }
    }
    
    // Send email notification
    try {
      await sendAdoptionStatusEmail(adoptionRequest, status);
      console.log('Status notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending status notification email:', emailError);
      // Continue execution even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: "Adoption request status updated successfully",
      data: adoptionRequest,
    });
  } catch (error) {
    console.error("Error updating adoption request status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating adoption request status",
      error: error.message,
    });
  }
};

// Serve PDF files
exports.servePdf = async (req, res) => {
  try {
    const pdfFileName = req.params.fileName;
    const pdfPath = path.join(fileHandlers.pdfDirectory, pdfFileName);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "PDF not found" 
      });
    }
    
    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
    
    // Send the file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error serving PDF", 
      error: error.message 
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
