require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./apiRouter');
// const emailRouter = require("./emailRouter")
const port = process.env.PORT || 3000;
const app = express();

app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use('/public', express.static('public'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://gracek505.github.io'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`MJML server running at http://localhost:${port}`);
});
