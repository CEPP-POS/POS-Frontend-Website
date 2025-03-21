const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      // แปลง message เป็น string ถ้าเป็น Buffer หรือ Blob
      const messageString =
        message instanceof Buffer ? message.toString() : message;

      // Parse message
      const parsedMessage = JSON.parse(messageString);

      // ส่ง message ไปยังทุก client
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
