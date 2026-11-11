
const express = require('express')
const routes = new express.Router()

const authMiddleware = require('../middleware/authMiddleware')

const { register, login } = require('../controllers/userController')
const { addVehicle,getVehicles, getVehicleById, updateVehicle, deletevehicle } = require('../controllers/vehicleController')
const fuelController = require('../controllers/fuelController')
const maintenanceController = require('../controllers/maintenanceController')
const reminderController = require('../controllers/reminderController')
const documentController = require('../controllers/documentController')
const dashboardController = require('../controllers/dashboardController')

// Register route
routes.post('/register', register)

// Login route
routes.post('/login', login)

// Test route
routes.get('/', (req, res) => {
    res.send('MotoPulse API is working')
})

// Auth testing
routes.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({message: 'Token verified',user: req.payload})
})

// Add vehicle - Protected route
routes.post('/vehicles', authMiddleware, addVehicle)

// get all vehicles of loginned user
routes.get('/vehicles',authMiddleware,getVehicles)

// get single vehicle by id
routes.get('/vehicles/:id',authMiddleware,getVehicleById)

// update vehicle details
routes.put('/vehicles/:id',authMiddleware,updateVehicle)

// delete vehicle details
routes.delete('/vehicles/:id',authMiddleware,deletevehicle)

// add fuel details
routes.post('/fuel', authMiddleware, fuelController.addFuel)

// get all fuel details
routes.get('/fuel', authMiddleware, fuelController.getFuelEntries)

// get single fuel details by id
routes.get('/fuel/:id', authMiddleware, fuelController.getFuelById)

// update fuel detail
routes.put('/fuel/:id', authMiddleware, fuelController.updateFuel)

// delete fuel details
routes.delete('/fuel/:id', authMiddleware, fuelController.deleteFuel)

// add maintenance detail
routes.post('/maintenance', authMiddleware, maintenanceController.addMaintenance)

// get all maintenance
routes.get('/maintenance', authMiddleware, maintenanceController.getMaintenanceRecords)

// get single maintenance
routes.get('/maintenance/:id', authMiddleware, maintenanceController.getMaintenanceById)

// update maintenance
routes.put('/maintenance/:id', authMiddleware, maintenanceController.updateMaintenance)

// delete maintenance
routes.delete('/maintenance/:id', authMiddleware, maintenanceController.deleteMaintenance)

// Reminder Routes
// add reminder
routes.post('/reminder', authMiddleware, reminderController.addReminder)

// get all reminder
routes.get('/reminder', authMiddleware, reminderController.getReminders)

// Overdue Reminders
routes.get('/reminder/overdue', authMiddleware, reminderController.getOverdueReminders)

// upcoming overdue
routes.get('/reminder/upcoming', authMiddleware, reminderController.getUpcomingReminders)


// get single reminder
routes.get('/reminder/:id', authMiddleware, reminderController.getReminderById)

// update reminder
routes.put('/reminder/:id', authMiddleware, reminderController.updateReminder)

// delete reminder
routes.delete('/reminder/:id', authMiddleware, reminderController.deleteReminder)




// Document Routes
// add doc
routes.post('/document', authMiddleware, documentController.addDocument)

// get all doc
routes.get('/document', authMiddleware, documentController.getDocuments)

// expiring document
routes.get('/document/expired', authMiddleware, documentController.getExpiredDocuments)

// expiring soon doc
routes.get('/document/expiring-soon', authMiddleware, documentController.getExpiringSoonDocuments)

// get one doc
routes.get('/document/:id', authMiddleware, documentController.getDocumentById)

// edit doc
routes.put('/document/:id', authMiddleware, documentController.updateDocument)

// delete doc
routes.delete('/document/:id', authMiddleware, documentController.deleteDocument)

// Dashboard Route
routes.get('/dashboard', authMiddleware, dashboardController.getDashboardStats)

// Monthly Expense Report
routes.get('/reports/monthly-expenses', authMiddleware, dashboardController.getMonthlyExpenses)

// Vehicle-wise Expense Report
routes.get('/reports/vehicle-expenses', authMiddleware, dashboardController.getVehicleExpenses)

// Mileage Report
routes.get('/reports/mileage', authMiddleware, dashboardController.getMileageReport)


// Recent Activities
routes.get('/dashboard/recent-activities', authMiddleware, dashboardController.getRecentActivities)
module.exports = routes
