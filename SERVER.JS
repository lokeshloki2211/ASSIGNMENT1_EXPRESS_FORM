const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Ensure 'uploads' directory exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/expressFormDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define Schema
const formSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  resume: String,
});

const Form = mongoose.model("Form", formSchema);

// Multer Storage
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/submit", upload.single("resume"), async (req, res) => {
  try {
    const { firstName, lastName, age, gender, phoneNumber, email } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !age || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const formData = new Form({
      firstName,
      lastName,
      age: Number(age),
      gender,
      phoneNumber,
      email,
      resume: req.file ? "/uploads/" + req.file.filename : "",
    });

    await formData.save();
    res.status(200).json({ message: "Form submitted successfully!", data: formData });

  } catch (error) {
    res.status(500).json({ error: "Error submitting form", details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
