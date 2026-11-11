const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    documentType: {
        type: String,
        required: true,
        enum: ['RC', 'Insurance', 'PUC', 'Other']
    },
    documentNumber: {
        type: String
    },
    issueDate: {
        type: Date
    },
    expiryDate: {
        type: Date
    },
    fileUrl: {
        type: String
    },
    notes: {
        type: String
    }
}, { timestamps: true })

const Document = mongoose.model('Document', documentSchema)

module.exports = Document