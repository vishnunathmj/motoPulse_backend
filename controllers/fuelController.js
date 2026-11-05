
const Fuel = require('../models/fuel')
const Vehicle = require('../models/vehicle')


// add fuels details
exports.addFuel = async (req, res) => {
    try {
        const {vehicleId,fuelDate,litres,pricePerLitre,odometer,fuelType,notes} = req.body

        const userId = req.payload.userId

        const vehicle = await Vehicle.findOne({_id: vehicleId,userId})

        if (!vehicle) {
            return res.status(404).json({message: 'Vehicle not found'})
        }

        const totalAmount = litres * pricePerLitre

        const fuel = new Fuel({userId,vehicleId,fuelDate,litres,pricePerLitre,totalAmount,odometer,fuelType,notes})

        await fuel.save()

        res.status(201).json({message: 'Fuel entry added successfully',fuel})

    } catch (error) {
        res.status(500).json({message: 'Failed to add fuel entry',error: error.message})
    }
}


// get all fuel details
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
        res.status(500).json({
            message: 'Failed to fetch fuel entries',
            error: error.message
        })
    }
}

// get single fuel details by id

exports.getFuelById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const fuel = await Fuel.findOne({_id: id,userId}).populate('vehicleId','vehicleName brand model registrationNumber')

        if (!fuel) {
            return res.status(404).json({message: 'Fuel entry not found'})
        }
        res.status(200).json({message: 'Fuel entry fetched successfully',fuel})

    } catch (error) {
        res.status(500).json({message: 'Failed to fetch fuel entry',error: error.message})
    }
}


// edit fuel details

exports.updateFuel = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {fuelDate,litres,pricePerLitre,odometer,fuelType,notes} = req.body

        const totalAmount = litres * pricePerLitre

        const updatedFuel = await Fuel.findOneAndUpdate(
            { _id: id, userId },
            {$set: {fuelDate,litres,pricePerLitre,totalAmount,odometer,fuelType,notes}},{ new: true, runValidators: true })

        if (!updatedFuel) {
            return res.status(404).json({message: 'Fuel entry not found'})
        }

        res.status(200).json({message: 'Fuel entry updated successfully',updatedFuel})

    } catch (error) {
        res.status(500).json({message: 'Failed to update fuel entry',error: error.message})
    }
}

// delete fuel details

exports.deleteFuel = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const deletedFuel = await Fuel.findOneAndDelete({_id: id,userId})

        if (!deletedFuel) {
            return res.status(404).json({message: 'Fuel entry not found'})
        }

        res.status(200).json({message: 'Fuel entry deleted successfully'})

    } catch (error) {
        res.status(500).json({message: 'Failed to delete fuel entry',error: error.message})
    }
}
