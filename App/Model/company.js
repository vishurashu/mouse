const mongoose = require('mongoose')
const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyLogo: {
        type: String,
        required: true,
    },
    companyAddress1: {
        type: String,
        required: true,
    },
    companyAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    vendorId: {
        type: String,
        required: true,
    },
    gstin: {
        type: String,
        required: true,
    },
    tagline: {
        type: String,
    },
    companyEmail: {
        type: String,
        required: true,
    },
    companyPhone1: {
        type: String,
        required: true,
    },
    companyPhone2: {
        type: String,
    },
    description: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
