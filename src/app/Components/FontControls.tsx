"use client"

import { useState } from "react"

interface FontControlsProps {
  fontSize: number
  textAlign: string
  onFontSizeChange: (size: number) => void
  onTextAlignChange: (align: string) => void
}

export default function FontControls({ 
  fontSize, 
  textAlign, 
  onFontSizeChange, 
  onTextAlignChange 
}: FontControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const alignmentOptions = [
    { value: 'left', label: 'Left', icon: '⬅️' },
    { value: 'center', label: 'Center', icon: '↔️' },
    { value: 'right', label: 'Right', icon: '➡️' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-gray-700 font-medium py-2 px-3 rounded border hover:bg-gray-50"
      >
        <span>Font Settings</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Font Size Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size: {fontSize}px
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.max(12, fontSize - 4))}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-gray-700"
              >
                -
              </button>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => onFontSizeChange(Math.min(72, fontSize + 4))}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-gray-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Text Alignment Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Alignment
            </label>
            <div className="flex gap-2">
              {alignmentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTextAlignChange(option.value)}
                  className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
                    textAlign === option.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 