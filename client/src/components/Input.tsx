import React from "react";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 ${className}`}
      {...rest}
    />
  );
}
