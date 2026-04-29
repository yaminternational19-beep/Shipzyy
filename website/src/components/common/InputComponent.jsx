import React from "react";

const InputComponent = ({ 
  icon: Icon, 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error,
  maxLength
}) => {
  return (
    <div className="flex flex-col gap-1 mb-3 relative z-10">
      <label className="text-xs font-bold text-[var(--text-light)] pl-1">
        {label}
      </label>
      
      <div className="relative flex items-center group">
        
        {Icon && (
          <div className={`absolute left-3.5 z-10 transition-colors duration-300 ${
            error 
              ? "text-[var(--danger)]" 
              : "text-[var(--text-muted)] group-focus-within:text-[var(--primary)]" 
          }`}>
            <Icon fontSize="small" />
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=""
          maxLength={maxLength}
          className={`w-full h-12 rounded-[var(--radius-md)] bg-[var(--bg-soft)] border-2 outline-none transition-all duration-300 text-sm text-[var(--text-main)]
            ${Icon ? "pl-11" : "pl-3"} pr-3
            ${error 
              ? "border-[var(--danger)] focus:bg-[var(--bg)] shadow-sm" 
              : "border-transparent hover:border-[var(--border)] focus:border-[var(--primary)] focus:bg-[var(--bg)] focus:shadow-[var(--shadow-sm)]" 
            }`}
        />
      </div>

      {error && <span className="text-[11px] text-[var(--danger)] font-bold px-1 animate-pulse">{error}</span>}
    </div>
  );
};

export default InputComponent;