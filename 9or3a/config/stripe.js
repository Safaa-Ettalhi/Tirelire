const Stripe = require('stripe');

// Initialiser Stripe seulement si la clé est présente
const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

module.exports = stripe;
