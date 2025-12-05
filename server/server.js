// server/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app
    methods: ["GET", "POST"],
  },
});

// Supported stocks
const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Initial prices
let prices = {};
SUPPORTED_STOCKS.forEach((ticker) => {
  prices[ticker] = 500 + Math.random() * 500; // random 500–1000
});

// Update prices slightly every second
function updatePrices() {
  SUPPORTED_STOCKS.forEach((ticker) => {
    const change = (Math.random() - 0.5) * 10; // -5 to +5
    prices[ticker] = Math.max(10, prices[ticker] + change);
  });
}

// Send updated prices to all connected clients every second
setInterval(() => {
  updatePrices();
  io.emit("stockPrices", prices); // broadcast to everyone
}, 1000);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current prices immediately when a client connects
  socket.emit("stockPrices", prices);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Simple route to test server
app.get("/", (req, res) => {
  res.send("Stock price server is running");
});

const PORT =process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
