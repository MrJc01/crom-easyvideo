import React from 'react';

export const Icons = {
  Play: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  SkipBack: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  ),
  SkipForward: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  ),
  Mic: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-11a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"
      />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
      />
    </svg>
  ),
  Layers: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9zM9 1v3m6-3v3m-6 16v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3" />
    </svg>
  ),
  Code: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  BarChart: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Film: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5m10-10h5m-5 10h5" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
      />
    </svg>
  ),
  Video: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Scissors: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
};

export const TemplateIconMap: Record<string, React.FC> = {
  hero: Icons.Sparkles,
  code: Icons.Code,
  cpu: Icons.Cpu,
  layers: Icons.Layers,
  chart: Icons.BarChart,
  film: Icons.Film,
  video: Icons.Video,
  image: Icons.Image,
};
