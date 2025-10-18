require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const groupRoutes = require('./routes/groupRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
