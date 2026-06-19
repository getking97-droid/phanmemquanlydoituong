import React from 'react';

export default function PoliceLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Viền ngoài màu vàng */}
      <circle cx="50" cy="50" r="48" fill="#1b5e20" stroke="#fbc02d" strokeWidth="2" />
      
      {/* Cành tùng hai bên (mô phỏng) */}
      <path d="M 10 50 A 40 40 0 0 0 90 50" fill="none" stroke="#fbc02d" strokeWidth="8" strokeDasharray="4 2" />
      <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#fbc02d" strokeWidth="4" />
      
      {/* Vòng đỏ bên trong */}
      <circle cx="50" cy="45" r="30" fill="#d32f2f" />
      
      {/* Tia sáng đỏ đậm (mô phỏng) */}
      <circle cx="50" cy="45" r="30" fill="url(#sunburst)" opacity="0.3" />

      {/* Ngôi sao vàng năm cánh ở giữa */}
      <polygon 
        points="50,20 57,35 73,35 60,45 65,60 50,51 35,60 40,45 27,35 43,35" 
        fill="#ffeb3b" 
        stroke="#f57f17"
        strokeWidth="0.5"
      />
      
      {/* Bánh răng và chữ CA ở dưới */}
      <g transform="translate(50, 80)">
        <circle cx="0" cy="0" r="14" fill="#fbc02d" />
        <path d="M -16 -4 L -16 4 L -12 6 L -8 14 L 0 16 L 8 14 L 12 6 L 16 4 L 16 -4 Z" fill="#fbc02d" />
        <circle cx="0" cy="0" r="10" fill="#1b5e20" />
        <text x="0" y="4" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="900" fill="#fbc02d" textAnchor="middle" letterSpacing="-1">CA</text>
      </g>
      
      <defs>
        <radialGradient id="sunburst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#d32f2f" />
        </radialGradient>
      </defs>
    </svg>
  );
}
