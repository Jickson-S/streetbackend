require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const UAParser = require('ua-parser-js');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

console.log("MONGO_URI loaded:", process.env.MONGO_URI);

// Modern Mongoose connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // no options needed in v6+
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // stop server if DB fails to connect
  }
}
connectDB();

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from MERN backend!" });
});

// Device-specific frontend serving
app.use((req, res, next) => {
  const parser = new UAParser(req.headers['user-agent']);
  const deviceType = parser.getDevice().type || 'desktop';

  let buildPath;
  if (deviceType === 'mobile') {
    buildPath = path.join(__dirname, '../mobile');
  } else {
    buildPath = path.join(__dirname, '../desktop');
  }

  const indexFile = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send("Build not found");
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));