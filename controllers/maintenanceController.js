
const Maintenance = require('../models/maintenance')
const Vehicle = require('../models/vehicle')


// add Maintenance detail
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

        const vehicle = await Vehicle.findOne({_id: vehicleId,userId})

        if (!vehicle) {
            return res.status(404).json({message: 'Vehicle not found'})
        }

        const totalCost = labourCost + partsCost

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

        res.status(201).json({message: 'Maintenance record added successfully',maintenance})

    } catch (error) {
        res.status(500).json({message: 'Failed to add maintenance record',error: error.message})
    }
}


// get all maintenece

exports.getMaintenanceRecords = async (req, res) => {
    try {
        const userId = req.payload.userId

        const maintenanceRecords = await Maintenance.find({ userId }).populate('vehicleId','vehicleName brand model registrationNumber').sort({ serviceDate: -1 })

        res.status(200).json({message: 'Maintenance records fetched successfully',maintenanceRecords})

    } catch (error) {
        res.status(500).json({message: 'Failed to fetch maintenance records',error: error.message})
    }
}

// get single maintenace
exports.getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const maintenance = await Maintenance.findOne({
            _id: id,
            userId
        }).populate(
            'vehicleId',
            'vehicleName brand model registrationNumber'
        )

        if (!maintenance) {
            return res.status(404).json({message: 'Maintenance record not found'})
        }

        res.status(200).json({message: 'Maintenance record fetched successfully',maintenance})

    } catch (error) {
        res.status(500).json({message: 'Failed to fetch maintenance record',error: error.message})
    }
}

// update maintenance details
exports.updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {
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

        const maintenance = await Maintenance.findOne({
            _id: id,
            userId
        })

        if (!maintenance) {
            return res.status(404).json({
                message: 'Maintenance record not found'
            })
        }

        if (serviceType !== undefined)
            maintenance.serviceType = serviceType

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

        maintenance.totalCost = maintenance.labourCost + maintenance.partsCost

        await maintenance.save()

        res.status(200).json({message: 'Maintenance record updated successfully',maintenance})

    } catch (error) {
        res.status(500).json({message: 'Failed to update maintenance record',error: error.message})
    }
}


// delete maintenance
exports.deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const deletedMaintenance =
            await Maintenance.findOneAndDelete({_id: id,userId})

        if (!deletedMaintenance) {
            return res.status(404).json({message: 'Maintenance record not found'})
        }

        res.status(200).json({message: 'Maintenance record deleted successfully'})

    } catch (error) {
        res.status(500).json({message: 'Failed to delete maintenance record',error: error.message})
    }
}