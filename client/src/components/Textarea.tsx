import React from "react";

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 ${className}`}
      {...rest}
    />
  );
}
