
import React from 'react';

interface CircularCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const CircularCheckbox: React.FC<CircularCheckboxProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={`
        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
        ${checked 
          ? 'bg-black border-black scale-110' 
          : 'border-gray-300 hover:border-black bg-transparent'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {checked && (
        <svg 
          className="w-3.5 h-3.5 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </button>
  );
};
