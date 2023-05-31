import React from "react";
import "./popup.css";
export const Popup = ({ title, buttontext, closePopup }) => {
  return (
    <div className="popup-container">
     <div className="popup-body">
      <h1 className="title">{title}</h1>
      <button className="button" onClick={closePopup}>{buttontext}</button>
     </div>
    </div>
  );
};