require('dotenv').config();
const express = require('express');
const path = require('path'); // 👈 required to resolve paths
const db = require("./config/dbConnection");
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const admin = require("./App/Router/admin");
const user = require("./App/Router/user");

// 🔥 This line serves static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsers
app.use(cors("*"))
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/admin", admin);
app.use("/api", user);

// Server start
const port = 3600;
app.listen(port, () => {
  db();
  console.log(`✅ App listening on port ${port}`);
});
