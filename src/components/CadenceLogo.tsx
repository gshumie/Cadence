import React from 'react';

interface CadenceLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export const CadenceLogo: React.FC<CadenceLogoProps> = ({
  size = 28,
  showWordmark = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector SVG Mark: Two interlocking isometric geometric brackets */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Cadence Mark"
      >
        {/* Deep Carbon Container Background */}
        <rect width="32" height="32" rx="6" fill="#0D0F12" />
        <rect width="32" height="32" rx="6" stroke="#22262F" strokeWidth="1" />

        {/* Upper Sharp Isometric Bracket Loop */}
        <path
          d="M 7 15 L 7 10 L 16 5 L 25 10 L 25 14"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lower Sharp Isometric Bracket Loop */}
        <path
          d="M 25 17 L 25 22 L 16 27 L 7 22 L 7 18"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interlocking Cycle Diagonals */}
        <path
          d="M 11 13.5 L 16 16.5 L 21 13.5"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 21 18.5 L 16 15.5 L 11 18.5"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Precision Emerald Billing Checkpoint Indicator at Top-Right Vertex */}
        <circle cx="25" cy="10" r="2.2" fill="#10B981" />
        <circle
          cx="25"
          cy="10"
          r="4.2"
          stroke="#10B981"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      </svg>

      {/* Wordmark with CADENCE // LEDGER monospace badge */}
      {showWordmark && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base sm:text-lg text-[#F8FAFC] tracking-[-0.03em] font-sans">
            Cadence
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono tracking-widest text-[#8E95A2] bg-[#14171C] border border-[#22262F] rounded uppercase">
            LEDGER
          </span>
        </div>
      )}
    </div>
  );
};
