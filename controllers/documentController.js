
const Document = require('../models/document')
const Vehicle = require('../models/vehicle')

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id)
}

// Helper: Handle Errors
const handleError = (res, error, message) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({
        message,
        error: error.message
    })
}

// Helper: Validate Document Data
const validateDocumentData = (data, isUpdate = false, existingDocument = null) => {

    const {
        documentType,
        documentNumber,
        issueDate,
        expiryDate,
        fileUrl
    } = data

    if (!isUpdate) {
        if (!documentType) return 'Document type is required'
        if (!documentNumber || !documentNumber.trim()) return 'Document number is required'
        if (!issueDate) return 'Issue date is required'
        if (!expiryDate) return 'Expiry date is required'
    }

    const validDocumentTypes = ['RC', 'Insurance', 'PUC', 'Other']

    if (documentType !== undefined && !validDocumentTypes.includes(documentType)) {
        return 'Invalid document type'
    }

    if (documentNumber !== undefined) {
        if (typeof documentNumber !== 'string' || !documentNumber.trim()) {
            return 'Document number must be a non-empty string'
        }
    }

    if (fileUrl !== undefined && typeof fileUrl !== 'string') {
        return 'File URL must be a string'
    }

    if (issueDate !== undefined && isNaN(Date.parse(issueDate))) {
        return 'Invalid issue date'
    }

    if (expiryDate !== undefined && isNaN(Date.parse(expiryDate))) {
        return 'Invalid expiry date'
    }

    const finalIssueDate = issueDate !== undefined
        ? issueDate
        : existingDocument?.issueDate

    const finalExpiryDate = expiryDate !== undefined
        ? expiryDate
        : existingDocument?.expiryDate

    if (finalIssueDate && finalExpiryDate) {
        if (new Date(finalExpiryDate) < new Date(finalIssueDate)) {
            return 'Expiry date cannot be earlier than issue date'
        }
    }

    return null
}


// Add Document
exports.addDocument = async (req, res) => {
    try {
        const userId = req.payload.userId

        const {
            vehicleId,
            documentType,
            documentNumber,
            issueDate,
            expiryDate,
            fileUrl,
            notes
        } = req.body

        if (!vehicleId || !isValidObjectId(vehicleId)) {
            return res.status(400).json({ message: 'Invalid vehicle ID' })
        }

        const validationError = validateDocumentData(req.body)

        if (validationError) {
            return res.status(400).json({ message: validationError })
        }

        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId })

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' })
        }

        const document = new Document({
            userId,
            vehicleId,
            documentType,
            documentNumber: documentNumber.trim(),
            issueDate,
            expiryDate,
            fileUrl,
            notes
        })

        await document.save()

        res.status(201).json({
            message: 'Document added successfully',
            document
        })

    } catch (error) {
        handleError(res, error, 'Failed to add document')
    }
}


// Get All Documents
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.payload.userId

        const documents = await Document.find({ userId })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ createdAt: -1 })

        res.status(200).json(documents)

    } catch (error) {
        handleError(res, error, 'Failed to fetch documents')
    }
}


// Get Single Document
exports.getDocumentById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document ID' })
        }

        const document = await Document.findOne({
            _id: id,
            userId
        }).populate('vehicleId', 'vehicleName brand model registrationNumber')

        if (!document) {
            return res.status(404).json({ message: 'Document not found' })
        }

        res.status(200).json(document)

    } catch (error) {
        handleError(res, error, 'Failed to fetch document')
    }
}


// Update Document
exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        const {
            documentType,
            documentNumber,
            issueDate,
            expiryDate,
            fileUrl,
            notes
        } = req.body

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document ID' })
        }

        const document = await Document.findOne({ _id: id, userId })

        if (!document) {
            return res.status(404).json({ message: 'Document not found' })
        }

        const validationError = validateDocumentData(
            req.body,
            true,
            document
        )

        if (validationError) {
            return res.status(400).json({ message: validationError })
        }

        if (documentType !== undefined) document.documentType = documentType
        if (documentNumber !== undefined) document.documentNumber = documentNumber.trim()
        if (issueDate !== undefined) document.issueDate = issueDate
        if (expiryDate !== undefined) document.expiryDate = expiryDate
        if (fileUrl !== undefined) document.fileUrl = fileUrl
        if (notes !== undefined) document.notes = notes

        await document.save()

        res.status(200).json({
            message: 'Document updated successfully',
            document
        })

    } catch (error) {
        handleError(res, error, 'Failed to update document')
    }
}


// Delete Document
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.payload.userId

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid document ID' })
        }

        const document = await Document.findOneAndDelete({ _id: id, userId })

        if (!document) {
            return res.status(404).json({ message: 'Document not found' })
        }

        res.status(200).json({
            message: 'Document deleted successfully'
        })

    } catch (error) {
        handleError(res, error, 'Failed to delete document')
    }
}


// Get Expired Documents
exports.getExpiredDocuments = async (req, res) => {
    try {
        const userId = req.payload.userId

        const expiredDocuments = await Document.find({
            userId,
            expiryDate: { $lt: new Date() }
        })
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ expiryDate: -1 })

        res.status(200).json({
            message: 'Expired documents fetched successfully',
            expiredDocuments
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch expired documents')
    }
}


// Get Documents Expiring Soon
exports.getExpiringSoonDocuments = async (req, res) => {
    try {
        const userId = req.payload.userId

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
            .populate('vehicleId', 'vehicleName brand model registrationNumber')
            .sort({ expiryDate: 1 })

        res.status(200).json({
            message: 'Documents expiring soon fetched successfully',
            expiringDocuments
        })

    } catch (error) {
        handleError(res, error, 'Failed to fetch documents expiring soon')
    }
}
