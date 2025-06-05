const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const os = require('os');

// Configuración de almacenamiento en disco temporal para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir()); // Usar directorio temporal del sistema
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: fileFilter
});

// Middleware para subir múltiples imágenes a Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    // Si no hay archivos, continuar
    if (!req.files && !req.file) {
      return next();
    }

    // Manejar tanto un solo archivo como múltiples archivos
    const files = req.files ? req.files : (req.file ? [req.file] : []);
    
    if (files.length === 0) {
      return next();
    }

    console.log(`Procesando ${files.length} archivo(s)`);
    
    // Array para almacenar resultados
    const uploadResults = [];
    
    // Subir cada archivo a Cloudinary
    for (const file of files) {
      console.log('Procesando archivo:', file.originalname, 'Tipo:', file.mimetype, 'Ruta:', file.path);
      
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'little-pets',
        resource_type: 'auto',
        timeout: 60000 // 60 segundos de timeout
      });
      
      console.log('Imagen subida exitosamente a Cloudinary:', result.public_id);
      
      // Eliminar el archivo temporal
      fs.unlinkSync(file.path);
      
      // Guardar resultado
      uploadResults.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    }
    
    // Si hay al menos un resultado, establecer la imagen principal
    if (uploadResults.length > 0) {
      req.body.image = uploadResults[0].url;
      req.body.imagePublicId = uploadResults[0].publicId;
      
      // Guardar todas las URLs e IDs públicos
      req.body.images = uploadResults.map(result => result.url);
      req.body.imagesPublicIds = uploadResults.map(result => result.publicId);
    }
    
    next();
  } catch (error) {
    console.error('Error al subir imágenes a Cloudinary:', error);
    
    // Registrar más detalles sobre los archivos que causaron el error
    if (req.files || req.file) {
      const files = req.files ? req.files : (req.file ? [req.file] : []);
      
      files.forEach(file => {
        console.error('Detalles del archivo:', {
          nombre: file.originalname,
          tipo: file.mimetype,
          tamaño: file.size,
          ruta: file.path
        });
        
        // Intentar eliminar el archivo temporal si existe
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      });
    }
    
    // Registrar detalles de la configuración de Cloudinary
    console.error('Configuración de Cloudinary:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'No configurado',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'No configurado',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'No configurado'
    });
    
    res.status(500).json({ 
      mensaje: 'Error al subir las imágenes', 
      error: error.message,
      detalles: error.toString()
    });
  }
};

// Exportar middleware
module.exports = {
  // Middleware para una sola imagen
  upload: upload.single('image'),
  // Middleware para múltiples imágenes (máximo 3)
  uploadMultiple: upload.array('images', 3),
  uploadToCloudinary
};
