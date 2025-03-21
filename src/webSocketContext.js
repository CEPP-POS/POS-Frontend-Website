import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = async (event) => {
      try {
        let messageData;
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          messageData = JSON.parse(text);
        } else {
          messageData = JSON.parse(event.data);
        }
        console.log("Message from server:", messageData);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
