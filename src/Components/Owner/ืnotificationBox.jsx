import React from "react";

const NotificationBox = ({ title, description, Icon, bgColor }) => {
  return (
    <div className="flex justify-between px-5 pt-2">
      <div className="flex py-2 px-4 w-full mr-2 bg-[#F5F5F5] border rounded-lg">
        <div
          className={`flex items-center py-2 px-4 justify-center w-12 h-12 rounded-full ${bgColor}`}
        >
          {Icon && <Icon color="white" size={16} />}
        </div>
        <div className="ml-3">
          <p className="font-bold">{title}</p>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;
