
const Fuel = require('../models/fuel')
const Vehicle = require('../models/vehicle')

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// Validate fuel data
const validateFuelData = (data, isUpdate = false) => {

    const requiredFields = [
        'vehicleId',
        'fuelDate',
        'litres',
        'pricePerLitre',
        'odometer',
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
    }

    // Validate vehicle ID
    if (data.vehicleId !== undefined) {
        if (!isValidObjectId(data.vehicleId)) {
            return 'Invalid vehicle ID'
        }
    }

    // Validate fuel date
    if (data.fuelDate !== undefined) {
        if (
            !data.fuelDate ||
            isNaN(new Date(data.fuelDate).getTime())
        ) {
            return 'Invalid fuel date'
        }
    }

    // Validate litres
    if (data.litres !== undefined) {
        if (
            data.litres === null ||
            data.litres === '' ||
            !Number.isFinite(Number(data.litres)) ||
            Number(data.litres) <= 0
        ) {
            return 'Litres must be greater than zero'
        }
    }

    // Validate price per litre
    if (data.pricePerLitre !== undefined) {
        if (
            data.pricePerLitre === null ||
            data.pricePerLitre === '' ||
            !Number.isFinite(Number(data.pricePerLitre)) ||
            Number(data.pricePerLitre) <= 0
        ) {
            return 'Price per litre must be greater than zero'
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

    // Validate fuel type
    if (data.fuelType !== undefined) {
        if (!['Petrol', 'Diesel'].includes(data.fuelType)) {
            return 'Fuel type must be Petrol or Diesel'
        }
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


// Add fuel details
exports.addFuel = async (req, res) => {
    try {
        const {
            vehicleId,
            fuelDate,
            litres,
            pricePerLitre,
            odometer,
            fuelType,
            notes
        } = req.body

        const userId = req.payload.userId

        const validationError = validateFuelData(req.body)

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

        const totalAmount = Number(litres) * Number(pricePerLitre)

        const fuel = new Fuel({
            userId,
            vehicleId,
            fuelDate,
            litres,
            pricePerLitre,
            totalAmount,
            odometer,
            fuelType,
            notes
        })

        await fuel.save()

        res.status(201).json({
            message: 'Fuel entry added successfully',
            fuel
        })

    } catch (error) {
        handleError(res, error, 'Failed to add fuel entry')
    }
}


// Get all fuel details
exports.getFuelEntries = async (req, res) => {
    try {
        const userId = req.payload.userId

        const fuelEntries = await Fuel.find({ userId })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ fuelDate: -1 })

        res.status(200).json({
            message: 'Fuel entries fetched successfully',
            fuelEntries
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch fuel entries')
    }
}


// Get single fuel details by ID
exports.getFuelById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid fuel ID'
            })
        }

        const fuel = await Fuel.findOne({
            _id: id,
            userId
        }).populate(
            'vehicleId',
            'vehicleName brand model registrationNumber'
        )

        if (!fuel) {
            return res.status(404).json({
                message: 'Fuel entry not found'
            })
        }

        res.status(200).json({
            message: 'Fuel entry fetched successfully',
            fuel
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch fuel entry')
    }
}


// Update fuel details
exports.updateFuel = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {
            vehicleId,
            fuelDate,
            litres,
            pricePerLitre,
            odometer,
            fuelType,
            notes
        } = req.body

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid fuel ID'
            })
        }

        const updateData = {}

        if (vehicleId !== undefined) updateData.vehicleId = vehicleId
        if (fuelDate !== undefined) updateData.fuelDate = fuelDate
        if (litres !== undefined) updateData.litres = litres
        if (pricePerLitre !== undefined) updateData.pricePerLitre = pricePerLitre
        if (odometer !== undefined) updateData.odometer = odometer
        if (fuelType !== undefined) updateData.fuelType = fuelType
        if (notes !== undefined) updateData.notes = notes

        const validationError = validateFuelData(updateData, true)

        if (validationError) {
            return res.status(400).json({
                message: validationError
            })
        }

        const existingFuel = await Fuel.findOne({
            _id: id,
            userId
        })

        if (!existingFuel) {
            return res.status(404).json({
                message: 'Fuel entry not found'
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

        // Calculate total amount using updated and existing values
        const finalLitres = litres !== undefined
            ? Number(litres)
            : existingFuel.litres

        const finalPrice = pricePerLitre !== undefined
            ? Number(pricePerLitre)
            : existingFuel.pricePerLitre

        updateData.totalAmount = finalLitres * finalPrice

        const updatedFuel = await Fuel.findOneAndUpdate(
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

        res.status(200).json({
            message: 'Fuel entry updated successfully',
            updatedFuel
        })

    } catch (error) {
        handleError(res, error, 'Failed to update fuel entry')
    }
}


// Delete fuel details
exports.deleteFuel = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid fuel ID'
            })
        }

        const deletedFuel = await Fuel.findOneAndDelete({
            _id: id,
            userId
        })

        if (!deletedFuel) {
            return res.status(404).json({
                message: 'Fuel entry not found'
            })
        }

        res.status(200).json({
            message: 'Fuel entry deleted successfully'
        })

    } catch (error) {
        handleError(res, error, 'Failed to delete fuel entry')
    }
}
