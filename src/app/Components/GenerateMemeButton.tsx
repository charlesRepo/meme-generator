"use client"

import { MouseEvent } from "react";

interface GenerateMemeButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function GenerateMemeButton({ onClick }: GenerateMemeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
    >
      New Image 🖼️
    </button>
  );
}
