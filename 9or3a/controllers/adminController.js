const Group = require('../models/Group');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Distribution = require('../models/Distribution');
const KYC = require('../models/KYC');
const Ticket = require('../models/Ticket');

// Dashboard principal admin
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalGroups,
            totalContributions,
            totalDistributions,
            pendingKYC,
            openTickets
        ] = await Promise.all([
            User.countDocuments(),
            Group.countDocuments(),
            Contribution.countDocuments(),
            Distribution.countDocuments(),
            KYC.countDocuments({ status: 'pending' }),
            Ticket.countDocuments({ status: 'open' })
        ]);

        // Statistiques financières
        const totalContributionsAmount = await Contribution.aggregate([
            { $match: { paid: true } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalDistributionsAmount = await Distribution.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            overview: {
                totalUsers,
                totalGroups,
                totalContributions,
                totalDistributions,
                pendingKYC,
                openTickets
            },
            financial: {
                totalContributionsAmount: totalContributionsAmount[0]?.total || 0,
                totalDistributionsAmount: totalDistributionsAmount[0]?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tous les groupes
exports.getAllGroups = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const groups = await Group.find()
            .populate('owner', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Group.countDocuments();

        res.json({
            groups,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Détails d'un groupe
exports.getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('owner', 'name email score')
            .populate('members', 'name email score');

        if (!group) return res.status(404).json({ message: 'Groupe introuvable' });

        // Statistiques du groupe
        const contributions = await Contribution.find({ group: req.params.id })
            .populate('user', 'name email');
        
        const distributions = await Distribution.find({ group: req.params.id })
            .populate('beneficiary', 'name email');

        res.json({
            group,
            statistics: {
                totalContributions: contributions.length,
                paidContributions: contributions.filter(c => c.paid).length,
                totalDistributions: distributions.length,
                completedDistributions: distributions.filter(d => d.status === 'completed').length
            },
            contributions,
            distributions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments();

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// KYC en attente
exports.getPendingKYC = async (req, res) => {
    try {
        const kycList = await KYC.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({ kycList });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tickets ouverts
exports.getOpenTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ status: 'open' })
            .populate('user', 'name email')
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        res.json({ tickets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Statistiques avancées
exports.getAdvancedStats = async (req, res) => {
    try {
        // Top utilisateurs par score
        const topUsers = await User.find()
            .select('name email score')
            .sort({ score: -1 })
            .limit(10);

        // Groupes les plus actifs
        const activeGroups = await Group.aggregate([
            {
                $lookup: {
                    from: 'contributions',
                    localField: '_id',
                    foreignField: 'group',
                    as: 'contributions'
                }
            },
            {
                $project: {
                    name: 1,
                    memberCount: { $size: '$members' },
                    contributionCount: { $size: '$contributions' },
                    totalAmount: { $multiply: ['$amount', { $size: '$members' }] }
                }
            },
            { $sort: { contributionCount: -1 } },
            { $limit: 10 }
        ]);

        // Évolution mensuelle
        const monthlyStats = await Contribution.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            topUsers,
            activeGroups,
            monthlyStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
