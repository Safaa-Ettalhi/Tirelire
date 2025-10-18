const crypto = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Clé de chiffrement depuis les variables d'environnement
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.error('❌ ENCRYPTION_KEY non définie dans le fichier .env');
    process.exit(1);
}

if (ENCRYPTION_KEY.length < 32) {
    console.error('❌ ENCRYPTION_KEY doit faire au moins 32 caractères');
    process.exit(1);
}

/**
 * Chiffrer un fichier
 */
function encryptFile(filePath) {
    try {
        // Lire le fichier
        const fileBuffer = fs.readFileSync(filePath);
        const fileContent = fileBuffer.toString('base64');
        
        // Chiffrer le contenu
        const encrypted = crypto.AES.encrypt(fileContent, ENCRYPTION_KEY).toString();
        
        // Créer le chemin chiffré
        const encryptedPath = filePath + '.encrypted';
        
        // Écrire le fichier chiffré
        fs.writeFileSync(encryptedPath, encrypted);
        
        // Supprimer le fichier original
        fs.unlinkSync(filePath);
        
        console.log(`🔒 Fichier chiffré: ${filePath}`);
        return encryptedPath;
    } catch (error) {
        console.error('❌ Erreur lors du chiffrement:', error.message);
        throw error;
    }
}

/**
 * Déchiffrer un fichier
 */
function decryptFile(encryptedPath) {
    try {
        // Lire le fichier chiffré
        const encryptedContent = fs.readFileSync(encryptedPath, 'utf8');
        
        // Déchiffrer le contenu
        const decrypted = crypto.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
        const fileContent = decrypted.toString(crypto.enc.Utf8);
        
        // Convertir de base64 vers buffer
        const fileBuffer = Buffer.from(fileContent, 'base64');
        
        // Créer le chemin déchiffré
        const decryptedPath = encryptedPath.replace('.encrypted', '');
        
        // Écrire le fichier déchiffré
        fs.writeFileSync(decryptedPath, fileBuffer);
        
        console.log(`🔓 Fichier déchiffré: ${encryptedPath}`);
        return decryptedPath;
    } catch (error) {
        console.error('❌ Erreur lors du déchiffrement:', error.message);
        throw error;
    }
}

/**
 * Chiffrer automatiquement les images KYC
 */
function encryptKYCImages(cardImagePath, selfieImagePath) {
    try {
        const encryptedCard = encryptFile(cardImagePath);
        const encryptedSelfie = encryptFile(selfieImagePath);
        
        return {
            cardImage: encryptedCard,
            selfieImage: encryptedSelfie
        };
    } catch (error) {
        console.error('❌ Erreur lors du chiffrement KYC:', error.message);
        throw error;
    }
}

/**
 * Déchiffrer temporairement pour la vérification faciale
 */
function decryptKYCImagesForVerification(cardImagePath, selfieImagePath) {
    try {
        const decryptedCard = decryptFile(cardImagePath);
        const decryptedSelfie = decryptFile(selfieImagePath);
        
        return {
            cardImage: decryptedCard,
            selfieImage: decryptedSelfie
        };
    } catch (error) {
        console.error('❌ Erreur lors du déchiffrement KYC:', error.message);
        throw error;
    }
}

/**
 * Nettoyer les fichiers temporaires après vérification
 */
function cleanupTempFiles(cardImagePath, selfieImagePath) {
    try {
        if (fs.existsSync(cardImagePath)) {
            fs.unlinkSync(cardImagePath);
        }
        if (fs.existsSync(selfieImagePath)) {
            fs.unlinkSync(selfieImagePath);
        }
        console.log('🧹 Fichiers temporaires nettoyés');
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error.message);
    }
}

module.exports = {
    encryptFile,
    decryptFile,
    encryptKYCImages,
    decryptKYCImagesForVerification,
    cleanupTempFiles
};
