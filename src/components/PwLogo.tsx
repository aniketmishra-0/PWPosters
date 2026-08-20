import React, { useState, useEffect } from 'react';
import { PW_LOGO_BASE64 } from '../data/pwLogoBase64';

interface PwLogoProps {
  size?: number;
  className?: string;
  src?: string;
}

export const PW_OFFICIAL_LOGO_URL = PW_LOGO_BASE64;

export const PwLogo: React.FC<PwLogoProps> = ({
  size = 64,
  className = '',
  src = PW_LOGO_BASE64
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  // If external official image is provided and hasn't errored, render it inside a crisp white circular badge
  if (src && !imageFailed) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          transform: 'translateZ(0)' // Fix for html-to-image border-radius clipping
        }}
        className={`shrink-0 select-none flex items-center justify-center relative ${className}`}
      >
        <img
          src={src}
          alt="PW Logo"
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"></div>
      </div>
    );
  }

  // Crisp, high-contrast standalone vector emblem fallback
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#000000',
        borderColor: '#ffffff',
        borderRadius: '50%'
      }}
      className={`relative shrink-0 select-none flex items-center justify-center shadow-md border-2 ${className}`}
    >
      {/* Outer Fine Dark Ring */}
      <div 
        className="absolute inset-0 rounded-full border-[3px] border-[#111827]" 
        style={{ margin: '2px' }} 
      />
      
      {/* Bold Monogram PW using HTML text */}
      <span
        className="font-black leading-none text-white"
        style={{
          color: '#ffffff',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          fontSize: `${size * 0.45}px`,
          letterSpacing: '-0.05em',
          marginTop: '2px'
        }}
      >
        PW
      </span>
    </div>
  );
};




