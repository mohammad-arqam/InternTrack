import React from "react";
import logo from "../assets/logo.svg";

export default function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <img src={logo} alt="InternTrack logo" className="h-10 w-10" />
      {!compact && (
        <div className="leading-tight">
          <div className="font-extrabold text-slate-900">InternTrack</div>
          <div className="text-xs text-slate-500">by Mohammad Arqam</div>
        </div>
      )}
    </div>
  );
}
