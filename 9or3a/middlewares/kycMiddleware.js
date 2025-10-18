module.exports = (req, res, next) => {
    if (!req.user.isKYCValidated) return res.status(403).json({ message: 'KYC non validé' });
    next();
};
