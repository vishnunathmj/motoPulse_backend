
const Vehicle = require('../models/vehicle')

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// Validate vehicle data
const validateVehicleData = (data, isUpdate = false) => {

    const requiredFields = [
        'vehicleName',
        'brand',
        'model',
        'registrationNumber',
        'manufacturingYear',
        'fuelType'
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

        for (const field of requiredFields) {
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

    // Validate manufacturing year
    if (data.manufacturingYear !== undefined) {
        const year = Number(data.manufacturingYear)

        if (
            !Number.isInteger(year) ||
            year < 1886 ||
            year > new Date().getFullYear() + 1
        ) {
            return 'Invalid manufacturing year'
        }
    }

    // Validate odometer
    if (data.odometer !== undefined) {
        if (
            data.odometer === null ||
            data.odometer === '' ||
            !Number.isFinite(Number(data.odometer)) ||
            Number(data.odometer) < 0
        ) {
            return 'Odometer must be a valid non-negative number'
        }
    }

    // Validate average mileage
    if (data.averageMileage !== undefined) {
        if (
            data.averageMileage === null ||
            data.averageMileage === '' ||
            !Number.isFinite(Number(data.averageMileage)) ||
            Number(data.averageMileage) < 0
        ) {
            return 'Average mileage must be a valid non-negative number'
        }
    }

    return null
}

// Handle duplicate key and validation errors
const handleError = (res, error, message) => {

    if (error.code === 11000) {
        return res.status(409).json({
            message: 'Vehicle with this registration number already exists'
        })
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({
            message: message,
            error: error.message
        })
    }

    return res.status(500).json({
        message: message,
        error: error.message
    })
}


// Add vehicle
exports.addVehicle = async (req, res) => {

    const {
        vehicleName,
        brand,
        model,
        registrationNumber,
        manufacturingYear,
        fuelType,
        odometer,
        averageMileage
    } = req.body

    const userId = req.payload.userId

    try {

        const validationError = validateVehicleData(req.body)

        if (validationError) {
            return res.status(400).json({
                message: validationError
            })
        }

        const newVehicle = new Vehicle({
            userId,
            vehicleName: vehicleName.trim(),
            brand: brand.trim(),
            model: model.trim(),
            registrationNumber: registrationNumber.trim().toUpperCase(),
            manufacturingYear,
            fuelType,
            odometer,
            averageMileage
        })

        await newVehicle.save()

        res.status(201).json({
            message: 'Vehicle added successfully',
            vehicle: newVehicle
        })

    } catch (error) {
        handleError(res, error, 'Failed to add vehicle')
    }
}


// Get all vehicles of logged-in user
exports.getVehicles = async (req, res) => {

    const userId = req.payload.userId

    try {

        const vehicles = await Vehicle.find({ userId })

        res.status(200).json({
            message: 'Vehicles fetched successfully',
            vehicles
        })

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch vehicles',
            error: error.message
        })
    }
}


// Get single vehicle by ID
exports.getVehicleById = async (req, res) => {

    const userId = req.payload.userId
    const { id } = req.params

    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid vehicle ID'
            })
        }

        const vehicle = await Vehicle.findOne({
            _id: id,
            userId
        })

        if (!vehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            })
        }

        res.status(200).json({
            message: 'Vehicle fetched successfully',
            vehicle
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch vehicle')
    }
}


// Update vehicle
exports.updateVehicle = async (req, res) => {

    const userId = req.payload.userId
    const { id } = req.params

    const {
        vehicleName,
        brand,
        model,
        registrationNumber,
        manufacturingYear,
        fuelType,
        odometer,
        averageMileage
    } = req.body

    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid vehicle ID'
            })
        }

        const updateData = {}

        if (vehicleName !== undefined) updateData.vehicleName = vehicleName.trim()
        if (brand !== undefined) updateData.brand = brand.trim()
        if (model !== undefined) updateData.model = model.trim()
        if (registrationNumber !== undefined) {
            updateData.registrationNumber = registrationNumber.trim().toUpperCase()
        }
        if (manufacturingYear !== undefined) updateData.manufacturingYear = manufacturingYear
        if (fuelType !== undefined) updateData.fuelType = fuelType
        if (odometer !== undefined) updateData.odometer = odometer
        if (averageMileage !== undefined) updateData.averageMileage = averageMileage

        const validationError = validateVehicleData(updateData, true)

        if (validationError) {
            return res.status(400).json({
                message: validationError
            })
        }

        const updatedVehicle = await Vehicle.findOneAndUpdate(
            {
                _id: id,
                userId
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedVehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            })
        }

        res.status(200).json({
            message: 'Vehicle updated successfully',
            vehicle: updatedVehicle
        })

    } catch (error) {
        handleError(res, error, 'Failed to update vehicle')
    }
}


// Delete vehicle
exports.deletevehicle = async (req, res) => {

    const userId = req.payload.userId
    const { id } = req.params

    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid vehicle ID'
            })
        }

        const deletedvehicle = await Vehicle.findOneAndDelete({
            _id: id,
            userId
        })

        if (!deletedvehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            })
        }

        res.status(200).json({
            message: 'Vehicle deleted successfully',
            vehicle: deletedvehicle
        })

    } catch (error) {
        handleError(res, error, 'Failed to delete vehicle')
    }
}
