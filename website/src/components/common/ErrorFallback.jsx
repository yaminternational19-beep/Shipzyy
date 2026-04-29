import React from "react";

const ErrorFallback = ({ type, retryAction, isRetrying }) => {
  const isOffline = type === "offline";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      {/* Animated Icon */}
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-5xl shadow-2xl animate-pulse">
        {isOffline ? "📡" : "⚠️"}
      </div>
      
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        {isOffline ? "No Connection" : "Server Error"}
      </h2>
      
      <p className="text-slate-400 font-bold max-w-sm leading-relaxed mb-8">
        {isOffline 
          ? "Oops! It looks like you're offline. Check your internet and try again." 
          : "Something went wrong on our end. We're working on fixing it!"}
      </p>

      <button 
        onClick={retryAction}
        disabled={isRetrying} 
        className={`${isOffline ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-red-500 shadow-red-500/20'} 
          min-w-[200px] text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3`}
      >
        {isRetrying ? (
          <>
            <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
            <span>Checking...</span>
          </>
        ) : (
          <span>{isOffline ? "Try Refreshing" : "Try Again"}</span>
        )}
      </button>

      <p className="mt-8 text-[10px] text-white/20 font-black tracking-[0.5em] uppercase">
        Shipzzy Security Shield
      </p>
    </div>
  );
};

export default ErrorFallback;