
const Reminder = require('../models/reminder')
const Vehicle = require('../models/vehicle')

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// Helper: Handle errors
const handleError = (res, error, message) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({
            message: error.message
        })
    }

    return res.status(500).json({
        message,
        error: error.message
    })
}

// Helper: Validate Reminder Data
const validateReminderData = (data, isUpdate = false) => {

    const { title, reminderType, dueDate, dueOdometer, status, priority } = data

    if (!isUpdate) {
        if (!title || !title.trim()) {
            return 'Title is required'
        }

        if (!reminderType) {
            return 'Reminder type is required'
        }
    }

    if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
            return 'Title must be a non-empty string'
        }
    }

    const validReminderTypes = ['Service', 'Insurance', 'PUC', 'Oil Change', 'Other']

    if (reminderType !== undefined && !validReminderTypes.includes(reminderType)) {
        return 'Invalid reminder type'
    }

    const validStatuses = ['Pending', 'Completed']

    if (status !== undefined && !validStatuses.includes(status)) {
        return 'Invalid reminder status'
    }

    const validPriorities = ['Low', 'Medium', 'High']

    if (priority !== undefined && !validPriorities.includes(priority)) {
        return 'Invalid reminder priority'
    }

    if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
        if (isNaN(Date.parse(dueDate))) {
            return 'Invalid due date'
        }
    }

    if (dueOdometer !== undefined && dueOdometer !== null && dueOdometer !== '') {
        if (!Number.isFinite(Number(dueOdometer)) || Number(dueOdometer) < 0) {
            return 'Due odometer must be a valid non-negative number'
        }
    }

    return null
}


// Add Reminder
exports.addReminder = async (req, res) => {
    try {
        const userId = req.payload.userId

        const {
            vehicleId,
            title,
            description,
            reminderType,
            dueDate,
            dueOdometer,
            priority
        } = req.body

        if (!vehicleId || !isValidObjectId(vehicleId)) {
            return res.status(400).json({ message: 'Invalid vehicle ID' })
        }

        const validationError = validateReminderData(req.body)

        if (validationError) {
            return res.status(400).json({ message: validationError })
        }

        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId })

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        const reminder = new Reminder({
            userId,
            vehicleId,
            title: title.trim(),
            description,
            reminderType,
            dueDate: dueDate || null,
            dueOdometer: dueOdometer === '' ? null : dueOdometer,
            priority
        })

        await reminder.save()

        res.status(201).json({
            message: 'Reminder added successfully',
            reminder
        })

    } catch (error) {
        handleError(res, error, 'Failed to add reminder')
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
        handleError(res, error, 'Failed to fetch reminders')
    }
}


// Get Single Reminder
exports.getReminderById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid reminder ID' })
        }

        const reminder = await Reminder.findOne({ _id: id, userId })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' })
        }

        res.status(200).json(reminder)

    } catch (error) {
        handleError(res, error, 'Failed to fetch reminder')
    }
}


// Update Reminder
exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {
            title,
            description,
            reminderType,
            dueDate,
            dueOdometer,
            status,
            priority
        } = req.body

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid reminder ID' })
        }

        const validationError = validateReminderData(req.body, true)

        if (validationError) {
            return res.status(400).json({ message: validationError })
        }

        const reminder = await Reminder.findOne({ _id: id, userId })

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' })
        }

        if (title !== undefined) reminder.title = title.trim()
        if (description !== undefined) reminder.description = description
        if (reminderType !== undefined) reminder.reminderType = reminderType
        if (dueDate !== undefined) reminder.dueDate = dueDate || null
        if (dueOdometer !== undefined) {
            reminder.dueOdometer = dueOdometer === '' ? null : dueOdometer
        }
        if (status !== undefined) reminder.status = status
        if (priority !== undefined) reminder.priority = priority

        await reminder.save()

        res.status(200).json({
            message: 'Reminder updated successfully',
            reminder
        })

    } catch (error) {
        handleError(res, error, 'Failed to update reminder')
    }
}


// Delete Reminder
exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid reminder ID' })
        }

        const reminder = await Reminder.findOneAndDelete({ _id: id, userId })

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' })
        }

        res.status(200).json({
            message: 'Reminder deleted successfully'
        })

    } catch (error) {
        handleError(res, error, 'Failed to delete reminder')
    }
}


// Get Overdue Reminders
exports.getOverdueReminders = async (req, res) => {
    try {
        const userId = req.payload.userId

        const overdueReminders = await Reminder.find({
            userId,
            status: 'Pending',
            dueDate: { $lt: new Date() }
        })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ dueDate: 1 })

        res.status(200).json({
            message: 'Overdue reminders fetched successfully',
            overdueReminders
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch overdue reminders')
    }
}


// Get Upcoming Reminders
exports.getUpcomingReminders = async (req, res) => {
    try {
        const userId = req.payload.userId

        const upcomingReminders = await Reminder.find({
            userId,
            status: 'Pending',
            dueDate: { $gte: new Date() }
        })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ dueDate: 1 })

        res.status(200).json({
            message: 'Upcoming reminders fetched successfully',
            upcomingReminders
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch upcoming reminders')
    }
}
