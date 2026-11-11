
const mongoose = require('mongoose')

const Vehicle = require('../models/vehicle')
const Fuel = require('../models/fuel')
const Maintenance = require('../models/maintenance')
const Reminder = require('../models/reminder')
const Document = require('../models/document')


// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.payload.userId)

        const totalVehicles = await Vehicle.countDocuments({ userId })

        const fuelExpenses = await Fuel.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ])

        const maintenanceExpenses = await Maintenance.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalCost' }
                }
            }
        ])

        const totalFuelExpense = fuelExpenses.length > 0
            ? fuelExpenses[0].total : 0

        const totalMaintenanceExpense = maintenanceExpenses.length > 0
            ? maintenanceExpenses[0].total : 0

        const totalExpenses = totalFuelExpense + totalMaintenanceExpense

        const upcomingReminders = await Reminder.find({
            userId,
            status: 'Pending',
            dueDate: { $gte: new Date() }
        })
            .populate('vehicleId', 'vehicleName brand model')
            .sort({ dueDate: 1 })
            .limit(5)

        const currentDate = new Date()
        const next30Days = new Date()
        next30Days.setDate(currentDate.getDate() + 30)

        const expiringDocuments = await Document.find({
            userId,
            expiryDate: {
                $gte: currentDate,
                $lte: next30Days
            }
        })
            .populate('vehicleId', 'vehicleName brand model')
            .sort({ expiryDate: 1 })

        res.status(200).json({
            message: 'Dashboard statistics fetched successfully',
            totalVehicles,
            totalFuelExpense,
            totalMaintenanceExpense,
            totalExpenses,
            upcomingReminders,
            expiringDocuments
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        })
    }
}


// Get Monthly Expense Report
exports.getMonthlyExpenses = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.payload.userId)

        const fuelReport = await Fuel.aggregate([
            {
                $match: { userId }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$fuelDate' },
                        year: { $year: '$fuelDate' }
                    },
                    totalFuelExpense: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ])

        const maintenanceReport = await Maintenance.aggregate([
            {
                $match: { userId }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$serviceDate' },
                        year: { $year: '$serviceDate' }
                    },
                    totalMaintenanceExpense: { $sum: '$totalCost' }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ])

        res.status(200).json({
            message: 'Monthly expense report fetched successfully',
            fuelReport,
            maintenanceReport
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch monthly expense report',
            error: error.message
        })
    }
}


// Get Vehicle-wise Expense Report
exports.getVehicleExpenses = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.payload.userId)

        const vehicles = await Vehicle.find({ userId })

        const vehicleExpenses = await Promise.all(
            vehicles.map(async (vehicle) => {

                const fuelExpense = await Fuel.aggregate([
                    {
                        $match: {
                            userId,
                            vehicleId: vehicle._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$totalAmount' }
                        }
                    }
                ])

                const maintenanceExpense = await Maintenance.aggregate([
                    {
                        $match: {
                            userId,
                            vehicleId: vehicle._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$totalCost' }
                        }
                    }
                ])

                const totalFuelExpense = fuelExpense.length > 0
                    ? fuelExpense[0].total : 0

                const totalMaintenanceExpense = maintenanceExpense.length > 0
                    ? maintenanceExpense[0].total : 0

                return {
                    vehicleId: vehicle._id,
                    vehicleName: vehicle.vehicleName,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    totalFuelExpense,
                    totalMaintenanceExpense,
                    totalExpenses: totalFuelExpense + totalMaintenanceExpense
                }
            })
        )

        res.status(200).json({
            message: 'Vehicle-wise expense report fetched successfully',
            vehicleExpenses
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch vehicle expenses',
            error: error.message
        })
    }
}


// Get Vehicle-wise Mileage Report
exports.getMileageReport = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.payload.userId)

        const vehicles = await Vehicle.find({ userId })

        const mileageReport = await Promise.all(
            vehicles.map(async (vehicle) => {

                const fuelEntries = await Fuel.find({
                    userId,
                    vehicleId: vehicle._id
                }).sort({ odometer: 1 })

                let totalDistance = 0
                let totalFuel = 0

                for (let i = 1; i < fuelEntries.length; i++) {
                    const distance =
                        fuelEntries[i].odometer - fuelEntries[i - 1].odometer

                    if (distance > 0) {
                        totalDistance += distance
                        totalFuel += fuelEntries[i].litres
                    }
                }

                const averageMileage = totalFuel > 0
                    ? Number((totalDistance / totalFuel).toFixed(2))
                    : 0

                return {
                    vehicleId: vehicle._id,
                    vehicleName: vehicle.vehicleName,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    totalDistance,
                    totalFuel,
                    averageMileage
                }
            })
        )

        res.status(200).json({
            message: 'Mileage report fetched successfully',
            mileageReport
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch mileage report',
            error: error.message
        })
    }
}


// Get Recent Activities
exports.getRecentActivities = async (req, res) => {
    try {
        const userId = req.payload.userId

        const recentFuelEntries = await Fuel.find({ userId })
            .populate('vehicleId', 'vehicleName brand model')
            .sort({ fuelDate: -1 })
            .limit(5)

        const recentMaintenanceRecords = await Maintenance.find({ userId })
            .populate('vehicleId', 'vehicleName brand model')
            .sort({ serviceDate: -1 })
            .limit(5)

        res.status(200).json({
            message: 'Recent activities fetched successfully',
            recentFuelEntries,
            recentMaintenanceRecords
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch recent activities',
            error: error.message
        })
    }
}
