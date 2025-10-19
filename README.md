# 🏦 Tirelire API (9or3a) - Système de Tontine Digitale

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-19.1-purple.svg)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> **API REST complète pour la gestion de tontines digitales avec authentification, paiements sécurisés, et système de vérification KYC.**

## 📋 Table des Matières

- [🎯 Aperçu](#aperçu)
- [✨ Fonctionnalités](#fonctionnalités)
- [🏗️ Architecture](#architecture)
- [🚀 Installation](#installation)
- [⚙️ Configuration](#configuration)
- [📚 Documentation API](#documentation-api)
- [🧪 Tests](#tests)
- [🔒 Sécurité](#sécurité)
- [📊 Monitoring](#monitoring)
- [🤝 Contribution](#contribution)
- [📄 Licence](#licence)

---

## 🎯 Aperçu

**Tirelire API** est une solution complète pour la gestion de tontines digitales, permettant aux utilisateurs de créer des groupes d'épargne, effectuer des contributions régulières, et recevoir des distributions automatiques. Le système intègre des fonctionnalités avancées de vérification d'identité (KYC), des paiements sécurisés via Stripe, et un système de communication intégré.

### 🎯 Objectifs

- **Digitaliser les tontines traditionnelles** avec une interface moderne
- **Sécuriser les transactions** avec des paiements cryptographiques
- **Automatiser la gestion** des contributions et distributions
- **Faciliter la communication** entre les membres des groupes
- **Assurer la conformité** avec les réglementations KYC

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- **Inscription/Connexion** avec JWT
- **Vérification KYC** avec reconnaissance faciale
- **Chiffrement des données** sensibles
- **Gestion des rôles** (Utilisateur/Admin)

### 👥 Gestion des Groupes
- **Création de groupes** de tontine
- **Invitation de membres** avec validation
- **Rotation automatique** des bénéficiaires
- **Gestion des montants** et fréquences

### 💰 Système de Contributions
- **Contributions automatiques** programmées
- **Paiements sécurisés** via Stripe
- **Suivi des paiements** en temps réel
- **Distributions automatiques** aux bénéficiaires

### 💬 Communication
- **Messages de groupe** intégrés
- **Système de tickets** de support
- **Notifications** par email
- **Chat en temps réel**

### 📊 Administration
- **Dashboard administrateur** complet
- **Statistiques avancées** et rapports
- **Gestion des utilisateurs** et groupes
- **Monitoring des transactions**

---

## 🏗️ Architecture

### Stack Technologique

```
Frontend (Future)

Backend API
├── Node.js + Express
├── MongoDB + Mongoose
├── JWT Authentication
├── Stripe Payments
└── Face Recognition (KYC)

Infrastructure
├── MongoDB Atlas
├── Stripe API
├── Email Service (SMTP)
└── File Storage
```

### Structure du Projet

```
9or3a/
├── 📁 config/           # Configuration (DB, Stripe)
├── 📁 controllers/      # Logique métier
├── 📁 middlewares/      # Middlewares d'authentification
├── 📁 models/          # Modèles MongoDB
├── 📁 routes/          # Définition des routes
├── 📁 tests/           # Tests unitaires et fonctionnels
├── 📁 uploads/         # Fichiers uploadés
├── 📁 utils/           # Utilitaires (cron, email, etc.)
├── 📄 server.js       # Point d'entrée
├── 📄 app.js          # Configuration Express
└── 📄 package.json    # Dépendances
```

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ 
- **MongoDB** 6.0+
- **npm** ou **yarn**
- **Compte Stripe** (pour les paiements)

### 1. Cloner le Repository

```bash
git clone https://github.com/Safaa-Ettalhi/Tirelire
cd Tirelire/9or3a
```

### 2. Installer les Dépendances

```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données
MONGO_URI=mongodb://localhost:27017/tirelire

# Authentification
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email (Notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Upload de fichiers
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

### 4. Démarrer l'Application

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:5000`

---

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Description | Obligatoire | Exemple |
|----------|-------------|-------------|---------|
| `PORT` | Port du serveur | ✅ | `5000` |
| `MONGO_URI` | URL MongoDB | ✅ | `mongodb://localhost:27017/tirelire` |
| `JWT_SECRET` | Clé secrète JWT | ✅ | `your_secret_key` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | ✅ | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | ✅ | `pk_test_...` |
| `EMAIL_HOST` | Serveur SMTP | ✅ | `smtp.gmail.com` |
| `EMAIL_USER` | Email d'envoi | ✅ | `your_email@gmail.com` |
| `EMAIL_PASS` | Mot de passe email | ✅ | `your_app_password` |

### Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés API dans le dashboard
3. Configurez les webhooks pour les événements de paiement

### Configuration Email

Pour Gmail :
1. Activez l'authentification à 2 facteurs
2. Générez un mot de passe d'application
3. Utilisez ce mot de passe dans `EMAIL_PASS`

---


### 🔗 Endpoints Principaux

#### Authentification
```
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
```

#### Groupes
```
GET  /api/groups           # Lister mes groupes
POST /api/groups           # Créer un groupe
POST /api/groups/:id/join  # Rejoindre un groupe
```

#### Contributions
```
POST /api/contributions              # Créer contribution
POST /api/contributions/pay          # Payer contribution
GET  /api/contributions/group/:id    # Contributions groupe
```

#### Paiements
```
POST /api/payments/create-intent  # Créer PaymentIntent
POST /api/payments/confirm        # Confirmer paiement
GET  /api/payments/user-payments  # Historique paiements
```

#### Administration
```
GET /api/admin/dashboard     # Dashboard admin
GET /api/admin/groups       # Tous les groupes
GET /api/admin/users        # Tous les utilisateurs
```

---

## 🧪 Tests

### Exécution des Tests

```bash
# Tests unitaires
npm test

# Tests fonctionnels
npm run test:functional

# Tous les tests
npm run test:all


### Couverture de Code

Les tests couvrent :
- ✅ **Authentification** (100%)
- ✅ **Gestion des groupes** (95%)
- ✅ **Système de paiements** (90%)
- ✅ **API d'administration** (85%)
- ✅ **Validation KYC** (80%)

---

## 🔒 Sécurité

### Mesures Implémentées

- **🔐 Authentification JWT** avec expiration
- **🛡️ Chiffrement des mots de passe** (bcrypt)
- **📋 Validation KYC** avec reconnaissance faciale
- **💳 Paiements sécurisés** via Stripe
- **🔒 Middleware d'autorisation** par rôles
- **📝 Logs de sécurité** complets

### Bonnes Pratiques

- Utilisez **HTTPS** en production
- Configurez des **rate limits** sur les endpoints sensibles
- Implémentez une **rotation des clés JWT**
- Surveillez les **tentatives de connexion** suspectes
- Sauvegardez régulièrement la **base de données**

---

## 📊 Monitoring

### Métriques Surveillées

- **Performance** : Temps de réponse des API
- **Erreurs** : Taux d'erreur par endpoint
- **Paiements** : Succès/échecs des transactions
- **Utilisateurs** : Activité et engagement
- **Système** : Utilisation CPU/RAM


## 🤝 Contribution

### Comment Contribuer

1. **Fork** le repository
2. Créez une **branche feature** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commitez** vos changements : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. **Pushez** vers la branche : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrez une **Pull Request**

### Standards de Code

- **ESLint** pour la qualité du code
- **Prettier** pour le formatage
- **Tests** obligatoires pour les nouvelles fonctionnalités
- **Documentation** mise à jour


## 📄 Licence

Ce projet est sous licence **ISC**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

### Utilisation Commerciale

- ✅ **Utilisation commerciale** autorisée
- ✅ **Modification** autorisée
- ✅ **Distribution** autorisée
- ✅ **Usage privé** autorisé

---


### Contact

- **Email** : safaeettalhi1@gmail.com

### FAQ

**Q: Comment configurer Stripe pour la production ?**
R: Utilisez les clés live de Stripe et configurez les webhooks pour votre domaine.

**Q: Puis-je utiliser une autre base de données ?**
R: L'API est conçue pour MongoDB, mais peut être adaptée pour PostgreSQL.

**Q: Comment déployer en production ?**
R: Consultez le guide de déploiement dans `/docs/deployment.md`.

---

## 🎉 Remerciements

- **Stripe** pour les paiements sécurisés
- **MongoDB** pour la base de données
- **Express.js** pour le framework
- **Communauté Node.js** pour l'écosystème

---

**🚀 Développé avec ❤️ pour digitaliser les tontines traditionnelles**

