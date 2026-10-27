import { useId } from 'react';

interface OrnamentProps {
  className?: string;
}

export function FeatherOrnament({ className }: OrnamentProps) {
  const id = useId().replace(/:/g, '');
  const pluma = `pluma-${id}`;
  const oro = `oro-${id}`;
  const recorte = `recorte-${id}`;
  const silueta =
    'M94 12c24 26 37 60 35 94-1 31-16 58-34 79-8 9-15 21-18 37-9-20-17-40-20-61-9-27-9-56 1-84 8-25 21-48 36-65Z';

  return (
    <svg
      className={className}
      viewBox="0 0 180 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={pluma} x1="62" y1="24" x2="126" y2="216" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c5a9f0" />
          <stop offset="0.42" stopColor="#7c9fe3" />
          <stop offset="0.78" stopColor="#506fca" />
          <stop offset="1" stopColor="#334389" />
        </linearGradient>
        <linearGradient id={oro} x1="72" y1="12" x2="84" y2="228" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f9e3ad" />
          <stop offset="0.55" stopColor="#d9a05b" />
          <stop offset="1" stopColor="#a86c23" />
        </linearGradient>
        <mask id={recorte}>
          <path d={silueta} fill="#fff" />
          <g fill="#000">
            <circle cx="127" cy="58" r="8" />
            <circle cx="132" cy="82" r="9" />
            <circle cx="131" cy="108" r="8" />
            <circle cx="125" cy="133" r="9" />
            <circle cx="114" cy="157" r="8" />
            <circle cx="101" cy="180" r="7" />
            <circle cx="64" cy="70" r="8" />
            <circle cx="55" cy="95" r="9" />
            <circle cx="51" cy="120" r="8" />
            <circle cx="55" cy="146" r="9" />
            <circle cx="62" cy="170" r="8" />
            <circle cx="71" cy="193" r="7" />
          </g>
        </mask>
      </defs>

      <g transform="rotate(15 90 120)">
        <path d={silueta} fill={`url(#${pluma})`} mask={`url(#${recorte})`} />
        <path d={silueta} stroke="#cda15c" strokeWidth="1.3" opacity="0.9" />
        <path
          d="M93 14c-5 44-6 88-3 132 2 29 7 55 12 75"
          stroke={`url(#${oro})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g stroke="#f3dca4" strokeWidth="1.35" strokeLinecap="round" opacity="0.9">
          <path d="M91 48 65 38" />
          <path d="M93 64 62 57" />
          <path d="M95 81 59 78" />
          <path d="M96 99 60 99" />
          <path d="M96 117 62 121" />
          <path d="M97 135 67 143" />
          <path d="M98 152 74 163" />
          <path d="M92 48l29-13" />
          <path d="M93 64l32-9" />
          <path d="M95 81l33-6" />
          <path d="M96 99l33-2" />
          <path d="M96 117l31 3" />
          <path d="M97 135l27 7" />
          <path d="M98 152l20 11" />
        </g>
        <path
          d="M76 218c12 6 26 8 39 3"
          stroke="#f3dca4"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.72"
        />
      </g>

      <g fill="#ecd093">
        <path d="m138 30 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" opacity="0.95" />
        <path d="m45 110 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4Z" opacity="0.7" />
        <circle cx="144" cy="160" r="1.8" opacity="0.85" />
        <circle cx="40" cy="62" r="1.3" opacity="0.65" />
        <circle cx="112" cy="24" r="1.1" opacity="0.6" />
      </g>
    </svg>
  );
}

export function PocketWatchOrnament({ className }: OrnamentProps) {
  const id = useId().replace(/:/g, '');
  const oro = `reloj-oro-${id}`;
  const brillo = `reloj-brillo-${id}`;

  const marcas = Array.from({ length: 12 }, (_, indice) => (
    <line
      key={indice}
      x1="132"
      y1="69"
      x2="132"
      y2={indice % 3 === 0 ? "78" : "74"}
      transform={`rotate(${indice * 30} 132 112)`}
    />
  ));

  return (
    <svg
      className={className}
      viewBox="0 0 200 210"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={oro} cx="0" cy="0" r="1" gradientTransform="translate(112 90) rotate(52) scale(86)">
          <stop stopColor="#f8dfa4" />
          <stop offset="0.55" stopColor="#d9a05b" />
          <stop offset="1" stopColor="#9b621f" />
        </radialGradient>
        <radialGradient id={brillo} cx="0" cy="0" r="1" gradientTransform="translate(112 92) rotate(55) scale(50)">
          <stop stopColor="#fffdf6" />
          <stop offset="1" stopColor="#f2e4c7" />
        </radialGradient>
      </defs>

      <path
        d="M30 24c15 2 28 9 37 20M30 24c-7 15-5 31 5 43"
        stroke="#c99a4f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 6"
        opacity="0.8"
      />
      <path
        d="M18 168c28 9 58 9 85 0 24-8 50-7 74 3"
        stroke="#c99a4f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 5"
        opacity="0.8"
      />

      <path d="M132 51v-9" stroke="#b47a2b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="132" cy="34" r="7" stroke="#d9a05b" strokeWidth="2.6" />
      <path d="M123 43h18" stroke="#c98d3f" strokeWidth="4" strokeLinecap="round" />

      <circle cx="132" cy="112" r="61" fill={`url(#${oro})`} />
      <circle cx="132" cy="112" r="52" fill={`url(#${brillo})`} stroke="#8f5a1c" strokeWidth="2" />
      <circle cx="132" cy="112" r="46" stroke="#d9b06a" strokeWidth="1" />
      <circle cx="132" cy="112" r="39" stroke="#e8c994" strokeWidth="0.8" />

      <g stroke="#6b4318" strokeWidth="1.6" strokeLinecap="round">
        {marcas}
      </g>

      <path d="M132 112V83" stroke="#3a0036" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M132 112l21 13" stroke="#3a0036" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M132 112 115 127" stroke="#b47a2b" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="132" cy="112" r="4.6" fill="#b47a2b" stroke="#7c4c16" strokeWidth="1" />
      <circle cx="132" cy="112" r="1.6" fill="#f8dfa4" />

      <path
        d="M61 150c18 14 43 20 68 14"
        stroke="#f8dfa4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Flourish({ className }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 230 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 14c19 0 27-8 43-8 11 0 18 4 18 8s-7 8-18 8c-13 0-20-8-20-8"
        stroke="#d9a05b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M224 14c-19 0-27-8-43-8-11 0-18 4-18 8s7 8 18 8c13 0 20-8 20-8"
        stroke="#d9a05b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M72 14c7-7 15-7 21-1 4 4 4 8 0 11-5 4-12 2-14-3-2-6 4-10 10-8 8 3 13 10 22 10 9 0 14-7 22-10 6-2 12 2 10 8-2 5-9 7-14 3-4-3-4-7 0-11 6-6 14-6 21 1"
        stroke="#e7c07a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="m115 5 3 9-3 9-3-9 3-9Z" fill="#e7c07a" />
    </svg>
  );
}
