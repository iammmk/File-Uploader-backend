const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const DB_LINK = process.env.DB_LINK;
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(DB_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// import routers
const fileRouter = require("./src/routers/fileRouter");

app.use("/files", fileRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
