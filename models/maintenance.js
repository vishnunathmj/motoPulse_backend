
const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
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
    serviceType: {
        type: String,
        required: true
    },
    serviceDate: {
        type: Date,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    },
    serviceCenter: {
        type: String
    },
    description: {
        type: String
    },
    partsReplaced: {
        type: [String],
        default: []
    },
    labourCost: {
        type: Number,
        required: true
    },
    partsCost: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    nextServiceDate: {
        type: Date
    },
    nextServiceOdometer: {
        type: Number
    },
    notes: {
        type: String
    }
}, { timestamps: true })

const Maintenance = mongoose.model('Maintenance', maintenanceSchema)

module.exports = Maintenance
