require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./apiRouter');
// const emailRouter = require("./emailRouter")
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`MJML server running at http://localhost:${port}`);
});
