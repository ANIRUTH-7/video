import React from 'react';
import { DepthLayer as Layer } from './depth';
import { STARS, SPRAY, OUT, hash, seededRandom } from './core';
import { Stickman as Character } from './stickman';
import { EXTRAS } from './character';

export const Clock: React.FC<{
  cx: number;
  cy: number;
  r: number;
  h: number;
  m: number;
  sec?: number;
  face?: string;
  glow?: string;
}> = ({ cx, cy, r, h, m, sec, face = '#f4e9c8', glow }) => {
  const ha = ((h % 12) + m / 60) * 30;
  const ma = m * 6;
  return (
    <g transform={`translate(${cx} ${cy})`} strokeLinecap="round">
      {glow && <circle r={r * 1.45} fill={glow} opacity={0.3} />}
      <circle r={r} fill={face} stroke="#0a0c14" strokeWidth={r * 0.09} />
      <circle r={r * 0.9} fill="none" stroke="#0a0c14" strokeWidth={r * 0.015} opacity={0.35} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-r * 0.84} x2={0} y2={-r * 0.7} stroke="#0a0c14" strokeWidth={r * 0.05} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke="#0a0c14" strokeWidth={r * 0.08} transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.76} stroke="#0a0c14" strokeWidth={r * 0.05} transform={`rotate(${ma})`} />
      {sec !== undefined && <line x1={0} y1={r * 0.12} x2={0} y2={-r * 0.82} stroke="#d93a2f" strokeWidth={r * 0.025} transform={`rotate(${sec * 6})`} />}
      <circle r={r * 0.06} fill="#0a0c14" />
    </g>
  );
};
