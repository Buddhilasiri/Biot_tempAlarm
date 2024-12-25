const mqtt = require("mqtt");

// MQTT Broker Configuration
const brokerUrl = "mqtt://test.mosquitto.org"; // Public broker
const client = mqtt.connect(brokerUrl);

// Simulate 9 Sensors
const sensorCount = 9;
let temperatures = Array(sensorCount).fill(25); // Initialize all sensors to room temp (25°C)

// Helper Function: Update temperatures for an arc event
function simulateArcEvent(arcSensor) {
  const arcTemperature = 200; // Temperature of the arc
  const roomTemperature = 25; // Normal temp for all other sensors

  // Update the temperatures array
  for (let i = 0; i < sensorCount; i++) {
    temperatures[i] = i === arcSensor ? arcTemperature : roomTemperature;
  }
}

// Publish sensor data every 1 second
client.on("connect", () => {
  console.log("Connected to MQTT broker");

  setInterval(() => {
    for (let i = 0; i < sensorCount; i++) {
      const topic = `junctionbox/sensor${i + 1}`;
      const message = JSON.stringify({
        sensor: `sensor${i + 1}`,
        temperature: temperatures[i],
      });

      client.publish(topic, message);
      console.log(`Published: ${message} to ${topic}`);
    }
  }, 5000); // Publish every 5 seconds

  // Trigger an arc event every 15 seconds
  setInterval(() => {
    const arcSensor = Math.floor(Math.random() * sensorCount); // Random sensor for the arc
    console.log(`Arc event at sensor${arcSensor + 1}`);
    simulateArcEvent(arcSensor);
  }, 15000);
});
