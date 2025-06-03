import React from "react";

// PUBLIC_INTERFACE
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="status">
      {message}
    </div>
  );
}

export default ErrorBanner;
