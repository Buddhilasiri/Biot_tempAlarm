const express = require("express");
const helmet = require("helmet");
const mqtt = require("mqtt");
const path = require("path");
const admin = require("firebase-admin");

// Import Telegram Alerting
const startTelegramAlerting = require("./telegramAlert");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebaseServiceAccountKey.json"); // Firebase credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
const PORT = 3007;

// Helmet for security and CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://d3js.org"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);

// Serve static files for the frontend
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

// Serve the index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
  console.log("Served index.html");
});

// Store incoming sensor data
let sensorData = {};

// MQTT Client Setup
const mqttClient = mqtt.connect("mqtt://test.mosquitto.org");

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker at mqtt://test.mosquitto.org");
  mqttClient.subscribe("junctionbox/#", (err) => {
    if (err) {
      console.error("MQTT Subscription error:", err);
    } else {
      console.log("Subscribed to topic: junctionbox/#");
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message}`);
  try {
    const data = JSON.parse(message.toString());
    const timestamp = new Date();

    // Update sensor data for API
    sensorData[data.sensor] = parseFloat(data.temperature);

    // Log to Firebase Firestore
    await db.collection("sensorLogs").add({
      sensor: data.sensor,
      temperature: parseFloat(data.temperature),
      timestamp: timestamp,
    });
    console.log(`Logged to Firebase: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error("Error processing MQTT message:", err);
  }
});

// API Endpoint to send sensor data
app.get("/api/sensors", (req, res) => {
  res.json(sensorData);
  console.log("Responded with sensor data:", sensorData);
});

// Start Telegram Alerting
startTelegramAlerting();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
