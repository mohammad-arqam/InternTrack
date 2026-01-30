import React from "react";

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }
) {
  const { className = "", variant = "primary", ...rest } = props;
  const base = "rounded-2xl px-4 py-2 text-sm font-semibold transition shadow-soft disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-500"
      : "bg-white/70 border border-slate-200 text-slate-800 hover:bg-white";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}
