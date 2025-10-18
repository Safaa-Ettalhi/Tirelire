const canvas = require('canvas');
const faceapi = require('face-api.js');
const path = require('path');
const fs = require('fs');

// Configuration de face-api.js pour Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Variable pour stocker l'état de chargement des modèles
let modelsLoaded = false;

async function loadModels() {
    if (modelsLoaded) return;
    
    try {
        console.log('🔄 Chargement des modèles d\'IA...');
        const modelPath = path.join(__dirname, '../models/face-api');
        
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
            faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
            faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
        ]);
        
        modelsLoaded = true;
        console.log('✅ Modèles d\'IA chargés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des modèles:', error.message);
        throw error;
    }
}

async function compareFaces(image1Path, image2Path) {
    try {
        // Vérifier que les fichiers d'images existent
        if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
            console.log('❌ Fichiers d\'images non trouvés');
            return false;
        }

        console.log('🔍 Vérification faciale avec IA...');
        console.log('📸 Image 1:', image1Path);
        console.log('📸 Image 2:', image2Path);
        
        // Charger les modèles d'IA
        await loadModels();
        
        // Charger les images
        const img1 = await canvas.loadImage(image1Path);
        const img2 = await canvas.loadImage(image2Path);

        // Détecter les visages et extraire les descripteurs
        const detection1 = await faceapi
            .detectSingleFace(img1)
            .withFaceLandmarks()
            .withFaceDescriptor();
            
        const detection2 = await faceapi
            .detectSingleFace(img2)
            .withFaceLandmarks()
            .withFaceDescriptor();

        // Vérifier si des visages ont été détectés
        if (!detection1) {
            console.log('❌ Aucun visage détecté dans la première image');
            return false;
        }
        
        if (!detection2) {
            console.log('❌ Aucun visage détecté dans la deuxième image');
            return false;
        }

        // Calculer la distance euclidienne entre les descripteurs
        const distance = faceapi.euclideanDistance(
            detection1.descriptor, 
            detection2.descriptor
        );
        
        // Seuil de similarité (ajustable)
        const threshold = 0.6; // Distance < 0.6 = même personne
        const isSamePerson = distance < threshold;
        const similarity = Math.max(0, (1 - distance) * 100);
        
        console.log(`📊 Distance euclidienne: ${distance.toFixed(3)}`);
        console.log(`📊 Similarité: ${similarity.toFixed(1)}%`);
        console.log(`✅ Résultat: ${isSamePerson ? 'Même personne' : 'Personnes différentes'}`);
        
        return isSamePerson;
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification faciale:', error.message);
        return false;
    }
}

module.exports = { compareFaces };
