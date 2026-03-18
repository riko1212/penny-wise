export default function Logo() {
  return (
    <span className="logo__wrap">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pw-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4776e6" />
            <stop offset="100%" stopColor="#38b2ac" />
          </linearGradient>
        </defs>
        {/* Badge */}
        <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#pw-grad)" />
        {/* Subtle inner border */}
        <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* PW text */}
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="-0.5"
        >
          PW
        </text>
      </svg>
      <span className="logo__text">
        Penny Wise
      </span>
    </span>
  );
}
