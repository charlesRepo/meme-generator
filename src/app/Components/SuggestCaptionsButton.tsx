"use client";

import { MouseEvent } from "react";

interface SuggestCaptionsButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function SuggestCaptionsButton({ loading, disabled, onClick }: SuggestCaptionsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? "Generating suggestions…" : "Suggest Captions 🧠"}
    </button>
  );
}
