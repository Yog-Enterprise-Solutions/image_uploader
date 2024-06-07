import React from "react";

const LoaderComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p style={{ color: "black" }}>Updating...</p>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden" style={{ color: "black" }}>
          Updating...
        </span>
      </div>
    </div>
  );
};

export default LoaderComponent;
