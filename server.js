const express = require("express");
const helmet = require("helmet");
const mqtt = require("mqtt");
const path = require("path");

const app = express();
const PORT = 3007;

// CSP with helmet to allow external resources
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

// Serve static files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

// Serve index.html at root
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

mqttClient.on("message", (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message}`);
  try {
    const data = JSON.parse(message.toString());
    sensorData[data.sensor] = parseFloat(data.temperature);
  } catch (err) {
    console.error("Error processing MQTT message:", err);
  }
});

// API Endpoint to send sensor data
app.get("/api/sensors", (req, res) => {
  res.json(sensorData);
  console.log("Responded with sensor data:", sensorData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
