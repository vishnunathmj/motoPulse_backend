
const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    reminderType: {
        type: String,
        required: true,
        enum: ['Service', 'Insurance', 'PUC', 'Oil Change', 'Other']
    },
    dueDate: {
        type: Date
    },
    dueOdometer: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
}, { timestamps: true })

const Reminder = mongoose.model('Reminder', reminderSchema)

module.exports = Reminder
