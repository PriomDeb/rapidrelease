import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function RapidReleaseMark({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RapidRelease Icon"
    >
      {/* Outer Door / Hospital Portal Frame */}
      {/* Top rounded arch and left post */}
      <path
        d="M20 95V30C20 18.9543 28.9543 10 40 10H70C81.0457 10 90 18.9543 90 30V48"
        stroke="#0B2545"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Left lower anchor */}
      <path d="M20 85V96" stroke="#0B2545" strokeWidth="11" strokeLinecap="round" />

      {/* Medical Cross on Top Frame */}
      <path d="M55 22V36" stroke="#009688" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 29H62" stroke="#009688" strokeWidth="6" strokeLinecap="round" />

      {/* Hospital Bed Frame */}
      {/* Tilted backrest and mattress bar */}
      <path d="M28 58L38 72H82" stroke="#0B2545" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Front & Back Bed Legs */}
      <path d="M38 74V88" stroke="#0B2545" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M78 74V88" stroke="#0B2545" strokeWidth="5.5" strokeLinecap="round" />
      {/* Caster Wheels */}
      <circle cx="38" cy="92" r="4.5" fill="#0B2545" />
      <circle cx="78" cy="92" r="4.5" fill="#0B2545" />

      {/* Patient Head */}
      <circle cx="35" cy="50" r="7" fill="#0B2545" />

      {/* Patient Body in Bed (Teal) */}
      <path
        d="M44 58C44 58 48 53 58 55C66 56.5 70 63 76 65C80 66.5 82 71 82 71H42L44 58Z"
        fill="#009688"
      />

      {/* Rapid Exit Arrow (Teal) */}
      <path
        d="M62 65H92M92 65L82 55M92 65L82 75"
        stroke="#009688"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RapidReleaseLogo({ className = 'h-10', showSubtitle = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Exact Icon Mark */}
      <div className="shrink-0 w-11 h-11 flex items-center justify-center">
        <svg
          viewBox="0 0 110 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Door Frame in Navy */}
          <path
            d="M18 96V30C18 17.8497 27.8497 8 40 8H72C84.1503 8 94 17.8497 94 30V48"
            stroke="#0B2545"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path d="M18 84V96" stroke="#0B2545" strokeWidth="11" strokeLinecap="round" />

          {/* Teal Cross on the top door arch */}
          <path d="M56 20V34" stroke="#009688" strokeWidth="6" strokeLinecap="round" />
          <path d="M49 27H63" stroke="#009688" strokeWidth="6" strokeLinecap="round" />

          {/* Hospital Bed Frame */}
          <path
            d="M26 56L36 71H82"
            stroke="#0B2545"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bed legs */}
          <path d="M36 73V87" stroke="#0B2545" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M78 73V87" stroke="#0B2545" strokeWidth="5.5" strokeLinecap="round" />
          {/* Caster wheels */}
          <circle cx="36" cy="91" r="4.5" fill="#0B2545" />
          <circle cx="78" cy="91" r="4.5" fill="#0B2545" />

          {/* Patient Head */}
          <circle cx="34" cy="48" r="7" fill="#0B2545" />

          {/* Patient Body on Bed (Teal) */}
          <path
            d="M43 56C43 56 47 52 56 53.5C64 55 68 61 74 63C78 64.5 80 69 80 69H40L43 56Z"
            fill="#009688"
          />

          {/* Fast Release Arrow (Teal) exiting to the right */}
          <path
            d="M60 63H94M94 63L83 52M94 63L83 74"
            stroke="#009688"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography from Image: Rapid (Navy) + Release (Teal) & Subtitle */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline tracking-tight font-black text-2xl sm:text-[26px]">
          <span className="text-[#0B2545]">Rapid</span>
          <span className="text-[#009688]">Release</span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] sm:text-xs font-bold text-[#0B2545] tracking-tight mt-0.5">
            AI Discharge Coordinator
          </span>
        )}
      </div>
    </div>
  );
}
