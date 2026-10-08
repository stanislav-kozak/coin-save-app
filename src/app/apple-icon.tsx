import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** iPhone home-screen icon: the white mark on the brand coral (an image asset, so plain colours). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F97350',
      }}
    >
      <svg width="120" height="120" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="163"
          strokeDashoffset="37"
          transform="rotate(38 40 40)"
        />
        <circle cx="40" cy="40" r="9" fill="#FCD34D" />
      </svg>
    </div>,
    size,
  );
}
