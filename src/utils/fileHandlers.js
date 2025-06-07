const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create directory for PDFs if it doesn't exist
const pdfDirectory = path.join(__dirname, "../../uploads/pdfs");
if (!fs.existsSync(pdfDirectory)) {
  fs.mkdirSync(pdfDirectory, { recursive: true });
  console.log(`Directory created: ${pdfDirectory}`);
}

// Helper function to upload PDF to Cloudinary
const uploadPdfToCloudinary = (pdfBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Attempting to upload PDF to Cloudinary...');
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
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('PDF uploaded successfully to Cloudinary:', result.secure_url);
            resolve(result);
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(pdfBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    } catch (error) {
      console.error('Error attempting to upload to Cloudinary:', error);
      reject(error);
    }
  });
};

// Function to save PDF locally and create local URL
const saveLocalPdfAndGetUrl = async (pdfBuffer, fileName) => {
  try {
    const pdfFileName = `${fileName}.pdf`;
    const pdfPath = path.join(pdfDirectory, pdfFileName);
    
    // Save PDF to local filesystem
    await fs.promises.writeFile(pdfPath, pdfBuffer);
    console.log(`PDF saved locally at: ${pdfPath}`);
    
    // Generate a local URL based on API path
    return {
      url: `/api/adoption/pdf/${pdfFileName}`,
      path: pdfPath
    };
  } catch (error) {
    console.error('Error saving PDF locally:', error);
    throw error;
  }
};

// Export all functions and variables in a single object
module.exports = {
  uploadPdfToCloudinary,
  saveLocalPdfAndGetUrl,
  pdfDirectory
}; 