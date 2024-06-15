const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

let uploadCount = 0;

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Destination directory for uploaded files
    },
//     filename: function(req, file, cb) {
//         const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${uniquePrefix}-${file.originalname}`);
//     }
    filename: function(req, file, cb) {
        // Generate a unique filename
                // Get today's date and time
        uploadCount++
        const today = new Date();
        const datePart = today.toISOString().slice(0, 10); // YYYY-MM-DD format
        const timePart = today.getHours() + '-' + today.getMinutes()+ '-' + today.getSeconds(); // HH-MM format
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '_' + `${uploadCount}`+ '_' + datePart + '_' + timePart + ext);
    }

});



const upload = multer({ storage: storage });

// Serve static files from the 'public' directory (optional)
app.use(express.static('public'));

// Route to handle file upload
app.post('/upload', upload.array('image', 10000), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Process uploaded files if needed
    const fileNames = req.files.map(file => file.filename);
    console.log('Uploaded files:', fileNames);

    res.status(200).send('Files uploaded successfully.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
