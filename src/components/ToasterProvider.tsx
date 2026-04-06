"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#161b22",
          color: "#e6edf3",
          border: "1px solid #30363d",
          fontSize: "13px",
        },
      }}
    />
  );
}
