require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mqtt = require("mqtt");

// Load environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Initialize Telegram Bot
const bot = new TelegramBot(botToken);

// MQTT Broker Configuration
const brokerUrl = "mqtt://test.mosquitto.org"; // Public MQTT broker
const client = mqtt.connect(brokerUrl);

function startTelegramAlerting() {
  client.on("connect", () => {
    console.log("Telegram Alerting: Connected to MQTT broker");
    client.subscribe("junctionbox/#", (err) => {
      if (err) {
        console.error("Telegram Alerting: MQTT Subscription error:", err);
      } else {
        console.log("Telegram Alerting: Subscribed to MQTT topics");
      }
    });
  });

  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      if (parseFloat(data.temperature) === 200) {
        const alertMessage = `🔥 *Alert!* Arc event detected at *${data.sensor}* with temperature *${data.temperature}°C*!`;
        console.log("Telegram Alerting: Sending Telegram Alert:", alertMessage);

        bot.sendMessage(chatId, alertMessage, { parse_mode: "Markdown" });
      }
    } catch (err) {
      console.error("Telegram Alerting: Error processing MQTT message:", err);
    }
  });
}

module.exports = startTelegramAlerting;
