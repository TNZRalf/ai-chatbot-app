const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authNoEmailVerification } = require('../middleware/auth');
const cvService = require('../services/cvService');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept pdf, doc, and docx files
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Helper function to handle file upload errors
const handleUpload = upload.single('file');

// Parse CV endpoint
router.post('/parse', authNoEmailVerification, (req, res) => {
    handleUpload(req, res, async (err) => {
        try {
            // Handle multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        message: 'File size cannot exceed 5MB'
                    });
                }
                return res.status(400).json({
                    error: 'Upload error',
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    error: 'Invalid file',
                    message: err.message
                });
            }

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    error: 'No file',
                    message: 'Please upload a file'
                });
            }

            // Log the upload
            console.log(`Processing CV upload for user:`, {
                userId: req.user.id,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            });

            // Parse the CV
            const result = await cvService.parseCV(req.file.path, req.user.id, req.file);

            // Return success response
            res.json({
                message: 'CV uploaded and parsed successfully',
                data: {
                    resumeId: result.resumeId,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    uploadTime: new Date(),
                    parsedData: result
                }
            });

        } catch (error) {
            console.error('CV parsing error:', error);
            
            // Clean up uploaded file if there's an error
            if (req.file) {
                fs.unlink(req.file.path, (unlinkError) => {
                    if (unlinkError) {
                        console.error('Error deleting failed upload:', unlinkError);
                    }
                });
            }

            res.status(500).json({
                error: 'Parse failed',
                message: 'Failed to parse CV. Please try again.'
            });
        }
    });
});

// Get parse status
router.get('/status/:id', authNoEmailVerification, async (req, res) => {
    try {
        const status = await cvService.getParseStatus(req.params.id);
        if (!status) {
            return res.status(404).json({
                message: 'CV not found'
            });
        }
        res.json(status);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'Status check failed',
            message: error.message
        });
    }
});

// Get all user's resumes
router.get('/resumes', authNoEmailVerification, async (req, res) => {
    try {
        const resumes = await cvService.getUserResumes(req.user.id);
        if (!resumes || resumes.length === 0) {
            return res.status(200).json([]); // Return empty array instead of 404
        }
        res.json(resumes);
    } catch (error) {
        console.error('Error fetching resumes:', error);
        res.status(500).json({
            error: 'Fetch failed',
            message: error.message
        });
    }
});

// Get user's CV profile
router.get('/profile', authNoEmailVerification, async (req, res) => {
    try {
        const profile = await cvService.getProfileByFirebaseUid(req.user.uid);
        if (!profile) {
            return res.status(404).json({
                message: 'No CV profile found'
            });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            error: 'Fetch failed',
            message: error.message
        });
    }
});

// Delete a resume
router.delete('/resume/:id', authNoEmailVerification, async (req, res) => {
    try {
        const result = await cvService.deleteResume(req.params.id, req.user.id);
        if (!result) {
            return res.status(404).json({
                message: 'Resume not found or already deleted'
            });
        }
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            error: 'Delete failed',
            message: error.message
        });
    }
});

module.exports = router;
