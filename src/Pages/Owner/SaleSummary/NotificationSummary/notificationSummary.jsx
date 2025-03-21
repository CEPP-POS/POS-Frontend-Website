import React, { useEffect } from "react";
// import SideBar from "../../../../Components/Owner/sideBar";
// import NotificationBox from "../../../../Components/Owner/notificationBox";
// import { IoMdCart } from "react-icons/io";
// import { IoStatsChart } from "react-icons/io5";
// import { FaBox } from "react-icons/fa";
// import { IoNotifications } from "react-icons/io5";
// import { FaThLarge } from "react-icons/fa";

const NotificationSummary = () => {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'NEW_SLIP') {
        // แสดง popup หรือทำการอัปเดต UI ตามที่ต้องการ
        console.log('New slip received:', message.data);
        // แสดง popup ที่นี่
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      {/* Your existing UI code */}
    </div>
  );
};

export default NotificationSummary;
