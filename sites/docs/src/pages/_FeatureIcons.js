import React from 'react';

export function MultiModalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
      <circle cx="28" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
      <circle cx="24" cy="27" r="12" stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
    </svg>
  );
}

export function SpatialIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      <circle cx="14" cy="16" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="26" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="34" cy="22" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="30" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="34" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="38" cy="38" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="10" cy="38" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="22" r="2" fill="currentColor" opacity="0.5" />
      <path d="M6 6L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M16 16L13 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 16V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ThreeDIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 4L24 24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M42 14L24 24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M6 14L24 24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M24 24V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ServerlessIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 32C7.58 32 4 28.42 4 24C4 20.28 6.52 17.16 10 16.26C10 16.18 10 16.08 10 16C10 11.58 13.58 8 18 8C21.2 8 23.98 9.94 25.26 12.72C26.12 12.26 27.1 12 28.14 12C31.92 12 34.98 15.06 34.98 18.84L34.98 19.02C38.96 19.42 42 22.78 42 26.86C42 31.22 38.42 34.74 34.06 34.74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 26V42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 30L24 26L28 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
