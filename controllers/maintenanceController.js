
const Maintenance = require('../models/maintenance')
const Vehicle = require('../models/vehicle')

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// Validate maintenance data
const validateMaintenanceData = (data, isUpdate = false) => {

    const requiredFields = [
        'vehicleId',
        'serviceType',
        'serviceDate',
        'odometer'
    ]

    if (!isUpdate) {
        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                String(data[field]).trim() === ''
            ) {
                return `${field} is required`
            }
        }
    } else {
        if (Object.keys(data).length === 0) {
            return 'At least one field is required for update'
        }

        for (const field of ['serviceType', 'serviceDate']) {
            if (
                data[field] !== undefined &&
                (
                    data[field] === null ||
                    String(data[field]).trim() === ''
                )
            ) {
                return `${field} cannot be empty`
            }
        }
    }

    // Validate vehicle ID
    if (data.vehicleId !== undefined) {
        if (!isValidObjectId(data.vehicleId)) {
            return 'Invalid vehicle ID'
        }
    }

    // Validate service type
    if (data.serviceType !== undefined) {
        if (typeof data.serviceType !== 'string' || !data.serviceType.trim()) {
            return 'Invalid service type'
        }
    }

    // Validate service date
    if (data.serviceDate !== undefined) {
        if (
            !data.serviceDate ||
            isNaN(new Date(data.serviceDate).getTime())
        ) {
            return 'Invalid service date'
        }
    }

    // Validate next service date
    if (data.nextServiceDate !== undefined && data.nextServiceDate !== null && data.nextServiceDate !== '') {
        if (isNaN(new Date(data.nextServiceDate).getTime())) {
            return 'Invalid next service date'
        }
    }

    // Validate numeric fields
    const numericFields = [
        'odometer',
        'labourCost',
        'partsCost',
        'nextServiceOdometer'
    ]

    for (const field of numericFields) {
        if (data[field] !== undefined) {
            if (
                data[field] === null ||
                data[field] === '' ||
                !Number.isFinite(Number(data[field])) ||
                Number(data[field]) < 0
            ) {
                return `${field} must be a valid non-negative number`
            }
        }
    }

    // Validate partsReplaced
    if (data.partsReplaced !== undefined && !Array.isArray(data.partsReplaced)) {
        return 'Parts replaced must be an array'
    }

    return null
}

// Handle errors
const handleError = (res, error, message) => {

    if (
        error.name === 'ValidationError' ||
        error.name === 'CastError'
    ) {
        return res.status(400).json({
            message,
            error: error.message
        })
    }

    return res.status(500).json({
        message,
        error: error.message
    })
}


// Add Maintenance detail
exports.addMaintenance = async (req, res) => {
    try {
        const {
            vehicleId,
            serviceType,
            serviceDate,
            odometer,
            serviceCenter,
            description,
            partsReplaced,
            labourCost,
            partsCost,
            nextServiceDate,
            nextServiceOdometer,
            notes
        } = req.body

        const userId = req.payload.userId

        const validationError = validateMaintenanceData(req.body)

        if (validationError) {
            return res.status(400).json({
                message: validationError
            })
        }

        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            userId
        })

        if (!vehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            })
        }

        const totalCost =
            Number(labourCost || 0) + Number(partsCost || 0)

        const maintenance = new Maintenance({
            userId,
            vehicleId,
            serviceType,
            serviceDate,
            odometer,
            serviceCenter,
            description,
            partsReplaced,
            labourCost,
            partsCost,
            totalCost,
            nextServiceDate,
            nextServiceOdometer,
            notes
        })

        await maintenance.save()

        res.status(201).json({
            message: 'Maintenance record added successfully',
            maintenance
        })

    } catch (error) {
        handleError(res, error, 'Failed to add maintenance record')
    }
}


// Get all maintenance records
exports.getMaintenanceRecords = async (req, res) => {
    try {
        const userId = req.payload.userId

        const maintenanceRecords = await Maintenance.find({ userId })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ serviceDate: -1 })

        res.status(200).json({
            message: 'Maintenance records fetched successfully',
            maintenanceRecords
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch maintenance records')
    }
}


// Get single maintenance record
exports.getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid maintenance ID'
            })
        }

        const maintenance = await Maintenance.findOne({
            _id: id,
            userId
        }).populate(
            'vehicleId',
            'vehicleName brand model registrationNumber'
        )

        if (!maintenance) {
            return res.status(404).json({
                message: 'Maintenance record not found'
            })
        }

        res.status(200).json({
            message: 'Maintenance record fetched successfully',
            maintenance
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch maintenance record')
    }
}


// Update maintenance details
exports.updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {
            vehicleId,
            serviceType,
            serviceDate,
            odometer,
            serviceCenter,
            description,
            partsReplaced,
            labourCost,
            partsCost,
            nextServiceDate,
            nextServiceOdometer,
            notes
        } = req.body

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid maintenance ID'
            })
        }

        const updateData = {}

        if (vehicleId !== undefined)
            updateData.vehicleId = vehicleId

        if (serviceType !== undefined)
            updateData.serviceType = serviceType

        if (serviceDate !== undefined)
            updateData.serviceDate = serviceDate

        if (odometer !== undefined)
            updateData.odometer = odometer

        if (serviceCenter !== undefined)
            updateData.serviceCenter = serviceCenter

        if (description !== undefined)
            updateData.description = description

        if (partsReplaced !== undefined)
            updateData.partsReplaced = partsReplaced

        if (labourCost !== undefined)
            updateData.labourCost = labourCost

        if (partsCost !== undefined)
            updateData.partsCost = partsCost

        if (nextServiceDate !== undefined)
            updateData.nextServiceDate = nextServiceDate

        if (nextServiceOdometer !== undefined)
            updateData.nextServiceOdometer = nextServiceOdometer

        if (notes !== undefined)
            updateData.notes = notes

        const validationError = validateMaintenanceData(updateData, true)

        if (validationError) {
            return res.status(400).json({
                message: validationError
            })
        }

        const maintenance = await Maintenance.findOne({
            _id: id,
            userId
        })

        if (!maintenance) {
            return res.status(404).json({
                message: 'Maintenance record not found'
            })
        }

        // Verify vehicle ownership if vehicleId is updated
        if (vehicleId !== undefined) {
            const vehicle = await Vehicle.findOne({
                _id: vehicleId,
                userId
            })

            if (!vehicle) {
                return res.status(404).json({
                    message: 'Vehicle not found'
                })
            }
        }

        if (serviceType !== undefined)
            maintenance.serviceType = serviceType

        if (vehicleId !== undefined)
            maintenance.vehicleId = vehicleId

        if (serviceDate !== undefined)
            maintenance.serviceDate = serviceDate

        if (odometer !== undefined)
            maintenance.odometer = odometer

        if (serviceCenter !== undefined)
            maintenance.serviceCenter = serviceCenter

        if (description !== undefined)
            maintenance.description = description

        if (partsReplaced !== undefined)
            maintenance.partsReplaced = partsReplaced

        if (labourCost !== undefined)
            maintenance.labourCost = labourCost

        if (partsCost !== undefined)
            maintenance.partsCost = partsCost

        if (nextServiceDate !== undefined)
            maintenance.nextServiceDate = nextServiceDate

        if (nextServiceOdometer !== undefined)
            maintenance.nextServiceOdometer = nextServiceOdometer

        if (notes !== undefined)
            maintenance.notes = notes

        maintenance.totalCost =
            Number(maintenance.labourCost || 0) +
            Number(maintenance.partsCost || 0)

        await maintenance.save()

        res.status(200).json({
            message: 'Maintenance record updated successfully',
            maintenance
        })

    } catch (error) {
        handleError(res, error, 'Failed to update maintenance record')
    }
}


// Delete maintenance
exports.deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid maintenance ID'
            })
        }

        const deletedMaintenance =
            await Maintenance.findOneAndDelete({
                _id: id,
                userId
            })

        if (!deletedMaintenance) {
            return res.status(404).json({
                message: 'Maintenance record not found'
            })
        }

        res.status(200).json({
            message: 'Maintenance record deleted successfully'
        })

    } catch (error) {
        handleError(res, error, 'Failed to delete maintenance record')
    }
}