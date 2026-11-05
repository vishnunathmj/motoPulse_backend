
const vehicle = require('../models/vehicle')
const Vehicle = require('../models/vehicle')

// Add vehicle
exports.addVehicle = async (req, res) => {
    const {vehicleName,brand,model,registrationNumber,manufacturingYear,fuelType,odometer,averageMileage} = req.body

    const userId = req.payload.userId

    try {
        const newVehicle = new Vehicle({userId,vehicleName,brand,model,registrationNumber,manufacturingYear,fuelType,odometer,averageMileage})

        await newVehicle.save()

        res.status(201).json({message: 'Vehicle added successfully',vehicle: newVehicle})
    } catch (error) {
        res.status(400).json({message: 'Failed to add vehicle',error: error.message})
    }
}

// get all vehicles of loginned user
exports.getVehicles = async (req, res) => {
    const userId = req.payload.userId
    try {
        const vehicles = await Vehicle.find({ userId })
        res.status(200).json({message: 'Vehicles fetched successfully',vehicles})
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch vehicles',error: error.message})
    }
}


 // Get single vehicle by ID
exports.getVehicleById = async (req, res) => {
    const userId = req.payload.userId
    const { id } = req.params
    try {
        const vehicle = await Vehicle.findOne({ _id: id,userId})

        if (!vehicle) {
            return res.status(404).json({message: 'Vehicle not found'})
        }
        res.status(200).json({message: 'Vehicle fetched successfully',vehicle})
    } catch (error) {
        res.status(400).json({message: 'Failed to fetch vehicle',error: error.message})
    }
}



 // Update vehicle
exports.updateVehicle = async (req, res) => {
    const userId = req.payload.userId
    const { id } = req.params

    const {vehicleName,brand,model,registrationNumber,manufacturingYear,fuelType,odometer,averageMileage} = req.body

    try {
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { _id: id, userId },
            {
                $set: {vehicleName,brand,model,registrationNumber,manufacturingYear,fuelType,odometer,averageMileage}
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedVehicle) {
            return res.status(404).json({message: 'Vehicle not found'})
        }

        res.status(200).json({message: 'Vehicle updated successfully',vehicle: updatedVehicle})
    } catch (error) {
        res.status(400).json({message: 'Failed to update vehicle',error: error.message})
    }
}

// delete vehicle
exports.deletevehicle = async (req,res)=>{
    const userId = req.payload.userId
    const { id } = req.params

    try {
        const deletedvehicle = await vehicle.findOneAndDelete({
            _id:id,userId
        })
        if(!deletedvehicle){
            return res.status(404).json({message:"Vehicle not found"})
        }
        res.status(200).json({message:'vehicle deleted successfully',vehicle:deletedvehicle})
    } catch (error) {
        res.status(400).json({message: 'Failed to delete vehicle',error: error.message})
    }
}