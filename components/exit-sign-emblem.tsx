import React from "react";

/**
 * International Standard Emergency Exit Pictogram (ISO 7010 E001)
 * Vector recreation of the green square emergency exit sign with white open doorway,
 * running figure silhouette, and threshold light wedge.
 */
export function ExitIsoIcon({
  className = "h-5 w-5",
  title
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Outer White Safety Sign Border */}
      <rect x="2" y="2" width="116" height="116" rx="8" fill="#FFFFFF" stroke="#146C43" strokeWidth="2" />
      {/* ISO 7010 Safety Emerald Green Field */}
      <rect x="8" y="8" width="104" height="104" rx="4" fill="#17794B" />

      {/* White Open Doorway + Floor Light Wedge */}
      <path
        d="M32 22H92V98L99 106H40L32 98V22Z"
        fill="#FFFFFF"
      />

      {/* Floor Shadow of Front Foot on Threshold Wedge */}
      <polygon points="43,99 56,99 63,106 49,106" fill="#17794B" />

      {/* Running Figure Head */}
      <circle cx="53.5" cy="34" r="7.5" fill="#17794B" />

      {/* Running Figure Body, Arms, and Legs */}
      {/* Upper Torso + Left Arm reaching into doorway + Right Arm bent back */}
      <path
        d="M52 44H74C76.5 44 78.5 45.2 79.8 47.4L86.5 59.2C87.8 61.5 87 64.4 84.7 65.7C82.4 67 79.5 66.2 78.2 63.9L72.8 54.2H66.5L71.5 67.5L72.8 84H94.5C98.5 84 101.5 87.2 101.5 91.2V92.5H70C66.8 92.5 64.5 90.3 64.2 87.1L63 72.5L48.5 96.5H39L55.5 65.5L50.5 53.5L43.5 61.5C42.2 63 40.3 63.8 38.3 63.8H26V55.2H36.8L46.5 45.8C48 44.5 49.9 44 52 44Z"
        fill="#17794B"
      />

      {/* White Knockout Stroke for Right Foot Extending Past Doorway Frame */}
      <path
        d="M92 82.2H95C100 82.2 103.5 86 103.5 91.2V94.2H92"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        fill="#17794B"
      />
    </svg>
  );
}

/**
 * Movie <EXIT (엑시트)> Inspired Hero Emblem:
 * - Bold blocky "EXIT" wordmark slanted upward to the right (matching the user's sketch)
 * - Directly beneath the elevated "T" (and "I"/"T"), the International Standard Emergency Exit
 *   Pictogram (ISO 7010 E001) + glowing (E) emergency beacon lamp above the doorway.
 */
export function ExitHeroEmblem({
  className = "w-full max-w-[320px] h-auto"
}: {
  className?: string;
}) {
  return (
    <div className={`relative select-none ${className}`} aria-hidden="true">
      {/* Ambient Emerald Exit Glow */}
      <div className="pointer-events-none absolute inset-0 -m-3 rounded-3xl bg-emerald-500/15 blur-2xl dark:bg-emerald-400/20" />

      <svg
        viewBox="0 0 350 245"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-auto drop-shadow-md"
      >
        <defs>
          <linearGradient id="exitWordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
          <linearGradient id="exitSignGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E8A56" />
            <stop offset="100%" stopColor="#12663D" />
          </linearGradient>
          <filter id="exitSoftShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#062E1E" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* ============================================================
            1. UPWARD-RIGHT SLANTED "EXIT" BLOCK WORDMARK
            Tilted upward to the right (-16 deg) so E is lower-left
            and T rises high on the top-right, opening space under I & T
           ============================================================ */}
        <g
          transform="translate(18, 108) rotate(-16.5) skewX(-8)"
          filter="url(#exitSoftShadow)"
        >
          {/* 3D Extrusion / Block Depth Layer */}
          <g transform="translate(4, 5)" fill="#0D5233" stroke="#062E1E" strokeWidth="2.5" strokeLinejoin="round">
            {/* E */}
            <path d="M8 6H70V24H29V38H63V55H29V71H72V90H8V6Z" />
            {/* X */}
            <path d="M84 6H108L124 34L140 6H164L137 47L166 90H141L123 60L105 90H81L110 47L84 6Z" />
            {/* I (with top & bottom serif bars like sketch) */}
            <path d="M176 6H236V24H217V72H236V90H176V72H195V24H176V6Z" />
            {/* T */}
            <path d="M248 6H318V25H294V90H272V25H248V6Z" />
          </g>

          {/* Main Crisp Block Letters Layer (Sketch-authentic hand-crafted bold geometry) */}
          <g
            fill="url(#exitWordGrad)"
            stroke="#0B3B24"
            strokeWidth="3.5"
            strokeLinejoin="round"
          >
            {/* Letter E */}
            <path d="M8 6H70V24H29V38H63V55H29V71H72V90H8V6Z" />
            {/* Letter X */}
            <path d="M84 6H108L124 34L140 6H164L137 47L166 90H141L123 60L105 90H81L110 47L84 6Z" />
            {/* Letter I (Slab-bar style matching user's drawing) */}
            <path d="M176 6H236V24H217V72H236V90H176V72H195V24H176V6Z" />
            {/* Letter T */}
            <path d="M248 6H318V25H294V90H272V25H248V6Z" />
          </g>

          {/* Subtle Inner Highlight Accents */}
          <g stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" opacity="0.65">
            <line x1="14" y1="12" x2="64" y2="12" />
            <line x1="182" y1="12" x2="230" y2="12" />
            <line x1="254" y1="12" x2="312" y2="12" />
          </g>
        </g>

        {/* ============================================================
            2. EMERGENCY BEACON "(E)" LAMP + INTERNATIONAL ISO 7010
               EMERGENCY EXIT LOGO DIRECTLY UNDER THE ELEVATED "I / T"
           ============================================================ */}
        <g transform="translate(198, 92)" filter="url(#exitSoftShadow)">
          {/* Sketch-inspired Circular "(E)" Emergency Exit Lamp Badge on Top of the Doorway */}
          <g transform="translate(46, 0)">
            {/* Outer Lamp Glow */}
            <circle cx="18" cy="14" r="16" fill="#10B981" opacity="0.28" />
            {/* Lamp Circle Body */}
            <circle
              cx="18"
              cy="14"
              r="12.5"
              fill="#ECFDF5"
              stroke="#0B3B24"
              strokeWidth="3"
            />
            {/* "E" inside the circular beacon (matching Screenshot 1) */}
            <path
              d="M13 8.5H23M13 14H21.5M13 19.5H23M13 8.5V19.5"
              stroke="#146C43"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* International Standard ISO 7010 Emergency Exit Pictogram Box (matching Screenshot 2) */}
          <g transform="translate(10, 26)">
            {/* White Outer Sign Frame */}
            <rect
              x="0"
              y="0"
              width="112"
              height="112"
              rx="10"
              fill="#FFFFFF"
              stroke="#0B3B24"
              strokeWidth="3"
            />
            {/* ISO Safety Green Square Field */}
            <rect
              x="6.5"
              y="6.5"
              width="99"
              height="99"
              rx="5"
              fill="url(#exitSignGreen)"
            />

            {/* Open White Emergency Doorway + Angled Light Threshold */}
            <path
              d="M29 19H87V91L94 99.5H37L29 91V19Z"
              fill="#FFFFFF"
            />

            {/* Front Foot Shadow Cast Across Threshold */}
            <polygon points="40,92 53,92 60,99.5 46,99.5" fill="#16784A" />

            {/* Running Person Head */}
            <circle cx="50.5" cy="31.5" r="7.2" fill="#16784A" />

            {/* Running Person Dynamic Silhouette (stepping through doorway) */}
            <path
              d="M49 41H70C72.5 41 74.5 42.2 75.7 44.3L82 55.5C83.2 57.6 82.5 60.3 80.3 61.5C78.1 62.7 75.4 62 74.2 59.8L69 50.6H63L67.8 63.2L69 79H89.5C93.3 79 96.2 82 96.2 85.8V87H66.5C63.5 87 61.2 84.9 60.9 81.9L59.8 68L45.8 90.8H36.8L52.5 61.2L47.8 49.8L41.2 57.4C39.9 58.8 38.1 59.6 36.2 59.6H23.5V51.4H34.5L43.8 42.6C45.2 41.4 47 41 49 41Z"
              fill="#16784A"
            />

            {/* White Separator Outline for Rear Foot Crossing Right Doorway Edge */}
            <path
              d="M87 77.3H90C94.6 77.3 98 80.8 98 85.8V88.6H87"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              fill="#16784A"
            />
          </g>
        </g>

        {/* ============================================================
            3. SOS MORSE SIGNAL SPARKS (··· −−− ···) ON LOWER LEFT
               Connecting the slanted "E-X" baseline with the EXIT sign
           ============================================================ */}
        <g transform="translate(22, 198)" opacity="0.92">
          <rect
            x="0"
            y="0"
            width="162"
            height="28"
            rx="14"
            fill="#0B3B24"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Three Short Dots (· · ·) */}
          <circle cx="22" cy="14" r="3" fill="#34D399" />
          <circle cx="32" cy="14" r="3" fill="#34D399" />
          <circle cx="42" cy="14" r="3" fill="#34D399" />
          {/* Three Long Dashes (− − −) */}
          <rect x="56" y="11.5" width="12" height="5" rx="2.5" fill="#FBBF24" />
          <rect x="73" y="11.5" width="12" height="5" rx="2.5" fill="#FBBF24" />
          <rect x="90" y="11.5" width="12" height="5" rx="2.5" fill="#FBBF24" />
          {/* Three Short Dots (· · ·) */}
          <circle cx="116" cy="14" r="3" fill="#34D399" />
          <circle cx="126" cy="14" r="3" fill="#34D399" />
          <circle cx="136" cy="14" r="3" fill="#34D399" />
        </g>
      </svg>
    </div>
  );
}
