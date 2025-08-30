const express = require("express");
const bodyParser = require("body-parser");
const mjml = require("mjml");
const { MongoClient } = require("mongodb");
const router = express.Router();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const client = new MongoClient(uri);

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

router.get("/emails", async (req, res) => {
  try {
    await client.connect();
    db = await client.db("CleverGraceDB");
    const emails = await db.collection("CleverGraceDB").find().toArray();

    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const dotenv = require("dotenv");
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');

dotenv.config();

// Multer setup
const dStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: dStorage });

const user_mail = process.env.EMAIL_USER;
const email_pass = process.env.EMAIL_PASS;
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const portSMTP = process.env.SMTP_PORT || '465';
const secure = process.env.SECURE === 'true';
const service = process.env.SERVICE || 'gmail';

router.post('/send-email', upload.single('file'), async (req, res) => {
  const { name, recipient, subject, html } = req.body;
  
  try {
    const emailSubject = subject || `Message from ${name}`;

    const transporter = nodemailer.createTransport({
      host,
      port: portSMTP,
      secure,
      service,
      auth: {
        user: "antoinefaith1@gmail.com",
        pass: "eefv ierk zcuy ldla",
        clientId: "100669861850-tr9amt92s25npjcb92j0hbtp2nfrclkq.apps.googleusercontent.com"
      }
    });

    const mailOptions = {
      from: name,
      to: [recipient].join(","),
      subject: emailSubject,
      html: html
    };

    await transporter.sendMail(mailOptions);
    // if (file && typeof file === 'string') {
    //   fs.unlinkSync(file);
    //   fs.unlink(filePath, (err) => {
    //     if (err) {
    //       console.error('❌ Failed to delete file:', err);
    //     } else {
    //       console.log('✅ File deleted:', filePath);
    //     }
    //   });

    // } else {
    //   console.warn('Invalid file path:', file);
    // }


    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error(err);
    if (file) fs.unlinkSync(file.path);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;
