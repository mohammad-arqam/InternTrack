import React from "react";

export function Icon({ name, className="" }: { name: "menu"|"x"|"sparkles"|"chart"|"list"|"logout"; className?: string }) {
  const common = "inline-block";
  if (name === "menu") return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === "x") return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === "sparkles") return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l1.2 4.2L17 7.4l-3.8 1.2L12 13l-1.2-4.4L7 7.4l3.8-1.2L12 2Z" fill="currentColor" opacity="0.9"/>
      <path d="M5 12l.8 2.6L8 15.4l-2.2.8L5 19l-.8-2.8L2 15.4l2.2-.8L5 12Z" fill="currentColor" opacity="0.65"/>
      <path d="M19 13l.8 2.6 2.2.8-2.2.8L19 20l-.8-2.8-2.2-.8 2.2-.8.8-2.6Z" fill="currentColor" opacity="0.65"/>
    </svg>
  );
  if (name === "chart") return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 16v-5M11 16V8M15 16v-3M19 16V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === "list") return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg className={`${common} ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M10 7h10M10 12h10M10 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 7l2 2 3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12l2 2 3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
