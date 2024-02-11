const express = require("express");
const app = express();
const multer = require("multer");
const cors = require("cors"); // Import the cors middleware
const path = require("path");
const fs = require("fs"); // Import the fs module

// setup multer for file upload
var storage = multer.diskStorage({
    destination: "./build",
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});


const upload = multer({ storage: storage });

app.use(express.json());
// Use cors middleware to enable CORS
app.use(cors());
// serving front end build files
app.use(express.static(__dirname + "/../build"));

// route for file upload
app.post("/api/uploadfile", upload.single("myFile"), (req, res, next) => {
    console.log(req.file.originalname + " file successfully uploaded !!");
    res.sendStatus(200);
});
// Route to get image URL accessible by the public
app.get("/api/images/:imageName", (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "/../build", imageName);

    // Check if the file exists
    if (fs.existsSync(imagePath)) {
        // Send the image file
        res.sendFile(imagePath);
    } else {
        // Image not found
        res.status(404).send("Image not found");
    }
});

app.listen(3010, () => console.log("Listening on port 3010"));
