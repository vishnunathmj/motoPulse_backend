
const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    manufacturingYear: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    odometer: {
        type: Number,
        default: 0
    },
    averageMileage: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('Vehicle', vehicleSchema)
