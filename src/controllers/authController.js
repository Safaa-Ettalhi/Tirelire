const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
function validateCardImage(imageData) {
  const errors = [];
  if (!imageData.startsWith('data:image/')) {
    errors.push('Format d\'image invalide. Utilisez une image base64.');
  }

  const imageSize = (imageData.length * 3) / 4; 
  if (imageSize > 5 * 1024 * 1024) {
    errors.push('Image trop volumineuse. Maximum 5MB autorisé.');
  }

  const validFormats = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
  const isValidFormat = validFormats.some(format => imageData.startsWith(format));
  if (!isValidFormat) {
    errors.push('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
function validateFaceImage(imageData) {
  const errors = [];
  if (!imageData.startsWith('data:image/')) {
    errors.push('Format d\'image invalide. Utilisez une image base64.');
  }
  const imageSize = (imageData.length * 3) / 4;
  if (imageSize > 3 * 1024 * 1024) {
    errors.push('Image trop volumineuse. Maximum 3MB autorisé.');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

function encryptImage(imageData) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.IMAGE_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(imageData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      algorithm: algorithm
    };
  } catch (error) {
    console.warn('Erreur de chiffrement, image stockée non chiffrée:', error.message);
    return imageData;
  }
}

// Vérification faciale automatique avec Face-API.js
async function performFaceVerification(cardImage, faceImage) {
  try {
    const modelsPath = path.join(__dirname, '..', 'models');
    if (!fs.existsSync(modelsPath)) {
      console.warn('Modèles Face-API.js non trouvés, utilisation du mode simulation');
      return performFaceVerificationSimulation();
    }
    await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath);
    
    console.log('Modèles Face-API.js chargés avec succès');
    const cardBuffer = Buffer.from(cardImage.split(',')[1], 'base64');
    const faceBuffer = Buffer.from(faceImage.split(',')[1], 'base64');
    const cardImg = new Image();
    const faceImg = new Image();
    
    cardImg.src = cardBuffer;
    faceImg.src = faceBuffer;
    const cardFace = await faceapi.detectSingleFace(cardImg, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    const faceFace = await faceapi.detectSingleFace(faceImg, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!cardFace || !faceFace) {
      return {
        isMatch: false,
        confidence: 0,
        message: 'Visage non détecté dans une ou plusieurs images',
        timestamp: new Date(),
        method: 'face-api-real'
      };
    }
    const distance = faceapi.euclideanDistance(cardFace.descriptor, faceFace.descriptor);
    const threshold = 0.6; 
    const isMatch = distance < threshold;
    const confidence = Math.max(0, (1 - distance) * 100);
    
    console.log(` Distance entre visages: ${distance.toFixed(3)}`);
    console.log(`Seuil de correspondance: ${threshold}`);
    console.log(`Correspondance: ${isMatch ? 'OUI' : 'NON'}`);
    console.log(`Confiance: ${Math.round(confidence)}%`);
    
    return {
      isMatch: isMatch,
      confidence: Math.round(confidence),
      message: isMatch ? 'Vérification faciale réussie' : 'Vérification faciale échouée',
      timestamp: new Date(),
      method: 'face-api-real',
      distance: distance,
      threshold: threshold
    };
  } catch (error) {
    console.error('Erreur lors de la vérification faciale:', error.message);
    console.warn('Utilisation du mode simulation en cas d\'erreur');
    return performFaceVerificationSimulation();
  }
}

function performFaceVerificationSimulation() {
  const confidence = Math.random() * 100;
  const isMatch = confidence > 70;
  
  console.log(`Simulation - Confiance: ${Math.round(confidence)}%`);
  console.log(`Correspondance: ${isMatch ? 'OUI' : 'NON'}`);
  
  return {
    isMatch: isMatch,
    confidence: Math.round(confidence),
    message: isMatch ? 'Vérification faciale réussie (simulation)' : 'Vérification faciale échouée (simulation)',
    timestamp: new Date(),
    method: 'face-api-simulation'
  };
}

async function signup(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      email, 
      passwordHash: hashedPassword, 
      name,
      kycStatus: 'pending' 
    });
    
    return res.status(201).json({ 
      message: 'Compte créé avec succès',
      user: {
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name,
        kycStatus: newUser.kycStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCorrect) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ 
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function submitKYC(req, res) {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, nationalId, nationalIdImage, faceVerificationImage } = req.body;
    if (!firstName || !lastName || !nationalId) {
      return res.status(400).json({ message: 'Prénom, nom et numéro de carte nationale requis' });
    }
        if (!nationalIdImage || !faceVerificationImage) {
      return res.status(400).json({ message: 'Images de la carte nationale et de vérification faciale requises' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    const cardImageValidation = validateCardImage(nationalIdImage);
    if (!cardImageValidation.isValid) {
      return res.status(400).json({ 
        message: 'Image de carte nationale invalide',
        errors: cardImageValidation.errors 
      });
    }
    
    const faceImageValidation = validateFaceImage(faceVerificationImage);
    if (!faceImageValidation.isValid) {
      return res.status(400).json({ 
        message: 'Image de vérification faciale invalide',
        errors: faceImageValidation.errors 
      });
    }
    
    const encryptedCardImage = encryptImage(nationalIdImage);
    const encryptedFaceImage = encryptImage(faceVerificationImage);
    
    const faceVerificationResult = await performFaceVerification(encryptedCardImage, encryptedFaceImage);
    
    user.firstName = firstName;
    user.lastName = lastName;
    user.nationalId = nationalId;
    user.nationalIdImage = encryptedCardImage; 
    user.faceVerificationImage = encryptedFaceImage; 
    user.faceVerificationResult = faceVerificationResult; 
    user.kycStatus = faceVerificationResult.isMatch ? 'pending' : 'rejected'; 
    
    await user.save();
    
    return res.json({ 
      message: 'Documents KYC soumis avec succès',
      kycStatus: user.kycStatus,
      faceVerification: {
        isMatch: faceVerificationResult.isMatch,
        confidence: faceVerificationResult.confidence,
        message: faceVerificationResult.message
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function verifyKYC(req, res) {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ message: 'ID utilisateur et statut requis' });
    }
    
    if (status !== 'verified' && status !== 'rejected') {
      return res.status(400).json({ message: 'Statut invalide (verified ou rejected)' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    user.kycStatus = status;
    user.kycVerifiedAt = new Date();
    
    await user.save();
    
    return res.json({ 
      message: `Statut KYC mis à jour: ${status}`,
      user: {
        id: user._id,
        email: user.email,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    
    // Trouver l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        kycStatus: user.kycStatus,
        reliabilityScore: user.reliabilityScore
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function makeAdmin(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    user.role = 'admin';
    user.kycStatus = 'verified';
    user.reliabilityScore = 100;
    
    await user.save();
    
    return res.json({
      message: 'Utilisateur promu administrateur',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { 
  signup, 
  login, 
  submitKYC, 
  verifyKYC, 
  getProfile,
  makeAdmin
};