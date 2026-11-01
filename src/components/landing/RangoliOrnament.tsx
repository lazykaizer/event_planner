import React from 'react';

interface RangoliOrnamentProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export function RangoliOrnament({
  className = '',
  size = 400,
  opacity = 0.06,
}: RangoliOrnamentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="180" stroke="#FF9F1C" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="200" cy="200" r="150" stroke="#C9962B" strokeWidth="1" />
      <circle cx="200" cy="200" r="120" stroke="#FF9F1C" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="90" stroke="#C9962B" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="200" cy="200" r="60" stroke="#FF9F1C" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="30" stroke="#C9962B" strokeWidth="1" />
      <circle cx="200" cy="200" r="6" fill="#FF9F1C" />

      {/* 8 Petal Rotations */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 200 200)`}>
          {/* Main Petal */}
          <path
            d="M200 80 C215 120 230 160 200 200 C170 160 185 120 200 80 Z"
            stroke="#FF9F1C"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Inner Petal Flurry */}
          <path
            d="M200 110 C208 135 215 160 200 180 C185 160 192 135 200 110 Z"
            stroke="#C9962B"
            strokeWidth="0.8"
            fill="none"
          />
          {/* Accent Diamond */}
          <polygon
            points="200,60 205,68 200,76 195,68"
            stroke="#FFC857"
            strokeWidth="1"
            fill="none"
          />
          {/* Outer Diya ray */}
          <line x1="200" y1="20" x2="200" y2="45" stroke="#C9962B" strokeWidth="1.2" />
          <circle cx="200" cy="18" r="3" fill="#FF9F1C" />
        </g>
      ))}

      {/* 16 Secondary Lotus Points */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 200 200)`}>
          <path
            d="M200 130 C208 155 208 175 200 190 C192 175 192 155 200 130 Z"
            stroke="#FFC857"
            strokeWidth="0.75"
            fill="none"
          />
          <circle cx="200" cy="120" r="2.5" fill="#C9962B" />
        </g>
      ))}
    </svg>
  );
}
