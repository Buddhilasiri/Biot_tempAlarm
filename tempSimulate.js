const mqtt = require("mqtt");

// MQTT Broker Configuration
const brokerUrl = "mqtt://test.mosquitto.org"; // Public broker (replace with your broker if needed)
const client = mqtt.connect(brokerUrl);

// Simulate 9 Sensors
const sensorCount = 9;

// Publish sensor data every 1 second
client.on("connect", () => {
  console.log("Connected to MQTT broker");

  setInterval(() => {
    for (let i = 1; i <= sensorCount; i++) {
      const temperature = (Math.random() * 30 + 20).toFixed(2); // Random temp between 20°C and 50°C
      const topic = `junctionbox/sensor${i}`;
      const message = JSON.stringify({ sensor: `sensor${i}`, temperature });

      client.publish(topic, message);
      console.log(`Published: ${message} to ${topic}`);
    }
  }, 5000);
});
