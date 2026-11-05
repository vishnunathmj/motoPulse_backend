
const mongoose = require('mongoose')

const fuelSchema = new mongoose.Schema({
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
    fuelDate: {
        type: Date,
        required: true
    },
    litres: {
        type: Number,
        required: true
    },
    pricePerLitre: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Petrol', 'Diesel']
    },
    notes: {
        type: String
    }
}, { timestamps: true })

const Fuel = mongoose.model('Fuel', fuelSchema)

module.exports = Fuel
