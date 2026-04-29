import React from "react";

const ButtonComponent = ({ text, onClick, loading, disabled, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full h-11 mt-1 rounded-[var(--radius-md)] bg-[var(--primary)] text-[var(--secondary)] text-sm font-bold tracking-wide transition-all hover:-translate-y-[1px] hover:shadow-[var(--shadow-float)] hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
    >
      {loading ? "Processing..." : text}
    </button>
  );
};

export default ButtonComponent;