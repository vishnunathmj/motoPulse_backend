const Reminder = require('../models/reminder')
const Vehicle = require('../models/vehicle')

// Add Reminder
exports.addReminder = async (req, res) => {
    try {
        const userId = req.payload.userId

        const { vehicleId, title, description, reminderType, dueDate, dueOdometer, priority } = req.body

        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId })

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        const reminder = new Reminder({userId,vehicleId,title,description,reminderType,dueDate,dueOdometer,priority})

        await reminder.save()

        res.status(201).json({message: 'Reminder added successfully',reminder})

    } catch (error) {
        res.status(500).json({message: 'Failed to add reminder',error: error.message})
    }
}


// Get All Reminders
exports.getReminders = async (req, res) => {
    try {
        const userId = req.payload.userId

        const reminders = await Reminder.find({ userId })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ dueDate: 1 })

        res.status(200).json(reminders)

    } catch (error) {
        res.status(500).json({message: 'Failed to fetch reminders',error: error.message})
    }
}


// Get Single Reminder
exports.getReminderById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const reminder = await Reminder.findOne({_id: id,userId}).populate('vehicleId', 'vehicleName brand model registrationNumber')

        if (!reminder) {
            return res.status(404).json({message: 'Reminder not found'})
        }

        res.status(200).json(reminder)

    } catch (error) {
        res.status(500).json({message: 'Failed to fetch reminder',error: error.message})
    }
}


// Update Reminder
exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {title,description,reminderType,dueDate,dueOdometer,status,priority} = req.body

        const reminder = await Reminder.findOne({_id: id,userId})

        if (!reminder) {
            return res.status(404).json({message: 'Reminder not found'})
        }

        if (title !== undefined) reminder.title = title
        if (description !== undefined) reminder.description = description
        if (reminderType !== undefined) reminder.reminderType = reminderType
        if (dueDate !== undefined) reminder.dueDate = dueDate
        if (dueOdometer !== undefined) reminder.dueOdometer = dueOdometer
        if (status !== undefined) reminder.status = status
        if (priority !== undefined) reminder.priority = priority

        await reminder.save()

        res.status(200).json({message: 'Reminder updated successfully',reminder})

    } catch (error) {
        res.status(500).json({message: 'Failed to update reminder',error: error.message})
    }
}


// Delete Reminder
exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const reminder = await Reminder.findOneAndDelete({_id: id,userId})

        if (!reminder) {
            return res.status(404).json({message: 'Reminder not found'})
        }

        res.status(200).json({message: 'Reminder deleted successfully'})

    } catch (error) {
        res.status(500).json({message: 'Failed to delete reminder',error: error.message})
    }
}