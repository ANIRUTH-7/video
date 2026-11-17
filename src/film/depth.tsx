import React from 'react';

type DepthLayerProps = {
  d: number;
  cx: number;
  cy?: number;
  blur?: number;
  children: React.ReactNode;
};

/**
 * A 2.5D parallax plane for the illustrated sets. `d` keeps the original
 * camera-parallax behavior while adding real CSS depth inside the camera's
 * perspective. Foreground planes move toward camera; distant planes recede.
 */
export const DepthLayer: React.FC<DepthLayerProps> = ({ d, cx, cy = 0, blur = 0, children }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      transform: `translate3d(${-cx * d}px, ${-cy * d}px, ${(d - 1) * 120}px)`,
      transformStyle: 'preserve-3d',
      filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
    }}
  >
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ overflow: 'visible', display: 'block' }}>
      {children}
    </svg>
  </div>
);
