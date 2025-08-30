const express = require("express");
const mjml = require("mjml");
const mongoose = require("mongoose");
const multer = require("multer");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
const router = express.Router();

// 🔌 MongoDB Lazy Connection
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    const uri = `mongodb+srv://CleverGrace:%23.J87tasTptRJaw@emailtemplatecluster.7wg7scv.mongodb.net/?retryWrites=true&w=majority&appName=emailTemplateCluster`;
    if (!uri) throw new Error("MongoDB URI not found");

    await mongoose.connect(uri);

    isConnected = true;
    console.log("✅ MongoDB connected");
  }
}

// 📤 MJML Conversion Endpoint
router.post("/convert-mjml", async (req, res) => {
  const { mjml: mjmlString } = req.body;

  if (!mjmlString) {
    return res.status(400).json({ error: "MJML content is required" });
  }

  try {
    const { html } = mjml(mjmlString, { validationLevel: "soft" });
    res.status(200).json({ html });
  } catch (err) {
    console.error("MJML Conversion Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📬 Email Fetch Endpoint
router.get("/emails", async (req, res) => {
  try {
    await connectDB();
    const emails = await mongoose.connection.db.collection("CleverGraceDB").find().toArray();
    res.status(200).json(emails);
  } catch (error) {
    console.error("Email fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📎 Multer Setup
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// 📧 Email Sending Endpoint
router.post("/send-email", upload.single("file"), async (req, res) => {
  const { name, recipient, subject, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SECURE === "true",
      service: process.env.SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: name,
      to: recipient,
      subject: subject || `Message from ${name}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email send error:", err.message);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Failed to send email." });
  }
});

module.exports = router;