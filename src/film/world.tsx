import React from 'react';
import { Layer, STARS, SPRAY, OUT, hash, seededRandom } from './core';
import { Character, EXTRAS } from './character';

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

type Bd = { x: number; w: number; h: number };
const makeRow = (seed: number, from: number, to: number, minW: number, maxW: number, minH: number, maxH: number) => {
  const r = seededRandom(seed);
  const out: Bd[] = [];
  let x = from;
  while (x < to) {
    const w = minW + r() * (maxW - minW);
    out.push({ x, w, h: minH + r() * (maxH - minH) });
    x += w + r() * 10;
  }
  return out;
};
const FAR = makeRow(11, -900, 2000, 110, 200, 300, 720);
const NEAR = makeRow(23, -900, 2000, 200, 320, 420, 900);

const BuildingRow: React.FC<{ rows: Bd[]; base: number; fill: string; win: string; lit: number; f: number }> = ({ rows, base, fill, win, lit, f }) => (
  <g>
    {rows.map((b, i) => {
      const cols = Math.max(1, Math.floor((b.w - 20) / 44));
      const rws = Math.floor((b.h - 40) / 60);
      return (
        <g key={i}>
          <rect x={b.x} y={base - b.h} width={b.w} height={b.h} fill={fill} stroke="#0a0c14" strokeWidth={6} />
          <rect x={b.x} y={base - b.h} width={b.w * 0.22} height={b.h} fill="#fff" opacity={0.04} />
          {Array.from({ length: rws }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const on = hash(i * 53 + r * 7 + c * 3) < lit;
              const flick = hash(Math.floor(f / 45) * 17 + i * 5 + r * 3 + c) > 0.985;
              return on !== flick ? (
                <rect key={`${r}-${c}`} x={b.x + 14 + c * 44} y={base - b.h + 24 + r * 60} width={22} height={30} fill={win} opacity={0.85} />
              ) : null;
            })
          )}
        </g>
      );
    })}
  </g>
);

export type Mood = { far: string; near: string; win: string; lit: number; ground: string; walk: string; lamp: string };
export const MOOD: Record<string, Mood> = {
  night: { far: '#1b2147', near: '#12162f', win: '#ffd98a', lit: 0.35, ground: '#1a1d3a', walk: '#2a2f58', lamp: '#ffe2a0' },
  dusk: { far: '#6a4a7a', near: '#3c2f5a', win: '#ffc86b', lit: 0.3, ground: '#3a3050', walk: '#5a4a6e', lamp: '#ffd28a' },
  sunrise: { far: '#d9805a', near: '#a85a4a', win: '#fff0b0', lit: 0.15, ground: '#7a4a48', walk: '#b86f5a', lamp: '#ffe9b0' },
  cold: { far: '#2a3342', near: '#1d2430', win: '#a9c4e0', lit: 0.18, ground: '#222a36', walk: '#323c4c', lamp: '#cfe6ff' },
};

const WALKERS = [
  { x0: 200, v: 1.6, s: 0.78, look: 0, y: 1352 },
  { x0: 1500, v: -1.9, s: 0.72, look: 1, y: 1348 },
  { x0: 2400, v: 1.3, s: 0.82, look: 2, y: 1356 },
  { x0: 900, v: -1.4, s: 0.7, look: 3, y: 1346 },
  { x0: 3000, v: 2.2, s: 0.76, look: 0, y: 1352 },
];
const CARS = [
  { x0: 0, v: 9, c: '#c4566a', dir: 1 },
  { x0: 1900, v: 6.5, c: '#4a8aa8', dir: -1 },
  { x0: 3000, v: 11, c: '#e0b050', dir: 1 },
];
const LOOP = 4200;

const Car: React.FC<{ x: number; y: number; c: string; dir: number; f: number; head: string }> = ({ x, y, c, dir, f, head }) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`}>
    <ellipse cx={0} cy={4} rx={190} ry={14} fill="#05060c" opacity={0.4} />
    <polygon points="150,-40 520,-70 520,10 150,10" fill={head} opacity={0.12} />
    <path d="M-170 0 L-170 -48 Q-170 -70 -140 -74 L-80 -80 Q-50 -128 0 -132 L80 -132 Q130 -128 150 -80 L176 -70 Q196 -62 196 -40 L196 0 Z" fill={c} stroke="#0a0c14" strokeWidth={7} strokeLinejoin="round" />
    <path d="M-62 -82 L-34 -116 L-4 -118 L-4 -82 Z M14 -82 L14 -118 L70 -116 L110 -82 Z" fill="#1a2236" stroke="#0a0c14" strokeWidth={5} />
    <rect x={176} y={-52} width={22} height={14} rx={5} fill={head} />
    <rect x={-172} y={-52} width={12} height={14} rx={4} fill="#ff4d4d" />
    {[-100, 110].map((wx) => (
      <g key={wx} transform={`translate(${wx} 0)`}>
        <circle r={36} fill="#14161f" stroke="#0a0c14" strokeWidth={6} />
        <circle r={16} fill="#5a6078" />
        <line x1={0} y1={-14} x2={0} y2={14} stroke="#14161f" strokeWidth={4} transform={`rotate(${f * 40})`} />
        <line x1={-14} y1={0} x2={14} y2={0} stroke="#14161f" strokeWidth={4} transform={`rotate(${f * 40})`} />
      </g>
    ))}
  </g>
);

const Bird: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const flap = Math.sin(f * 0.5 + x) * 14;
  return (
    <path d={`M${x - 22 * s} ${y - flap * s} Q${x - 8 * s} ${y - 6 * s} ${x} ${y} Q${x + 8 * s} ${y - 6 * s} ${x + 22 * s} ${y - flap * s}`} fill="none" stroke="#2a1c30" strokeWidth={5 * s} strokeLinecap="round" />
  );
};

export const TownLayers: React.FC<{
  cx: number;
  cy?: number;
  f: number;
  mood: Mood;
  tower?: { h: number; m: number; sec?: number };
  stars?: boolean;
  fireworks?: boolean;
  postClocks?: { x: number; h: number; m: number }[];
  walkers?: boolean;
  cars?: boolean;
  birds?: boolean;
  clouds?: string;
}> = ({ cx, cy = 0, f, mood, tower, stars, fireworks, postClocks = [], walkers, cars, birds, clouds }) => (
  <>
    {stars && (
      <Layer d={0.05} cx={cx} cy={cy}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6d8" opacity={0.35 + 0.55 * (0.5 + 0.5 * Math.sin((f + s.tw) * 0.15))} />
        ))}
      </Layer>
    )}
    {clouds && (
      <Layer d={0.08} cx={cx} cy={cy}>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = ((i * 520 + f * (0.4 + i * 0.1)) % 2800) - 500;
          const y = 160 + i * 110 + (i % 2) * 60;
          return (
            <g key={i} opacity={0.55} fill={clouds}>
              <ellipse cx={x} cy={y} rx={190} ry={34} />
              <ellipse cx={x + 90} cy={y - 22} rx={110} ry={32} />
              <ellipse cx={x - 80} cy={y - 14} rx={90} ry={26} />
            </g>
          );
        })}
      </Layer>
    )}
    {fireworks && (
      <Layer d={0.15} cx={cx} cy={cy}>
        {SPRAY.map((b, bi) => {
          const t = ((f + b.delay) % 90) / 90;
          if (t > 0.88) return null;
          const e = OUT(Math.min(1, t * 1.4));
          return (
            <g key={bi}>
              {t < 0.2 && <circle cx={b.cx} cy={b.cy} r={70 * (1 - t * 5)} fill={`hsl(${b.hue},95%,75%)`} opacity={0.5} />}
              {b.sparks.map((sp, k) => (
                <circle
                  key={k}
                  cx={b.cx + Math.cos(sp.a) * sp.v * e * 230}
                  cy={b.cy + Math.sin(sp.a) * sp.v * e * 230 + t * t * 120}
                  r={Math.max(0, 6 * (1 - t))}
                  fill={`hsl(${b.hue},95%,68%)`}
                  opacity={1 - t * 0.9}
                />
              ))}
            </g>
          );
        })}
      </Layer>
    )}
    {birds && (
      <Layer d={0.25} cx={cx} cy={cy}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bird key={i} x={((i * 260 + f * (3 + (i % 3))) % 2600) - 500} y={300 + (i % 3) * 70 + Math.sin(f * 0.04 + i) * 20} s={0.8 + (i % 2) * 0.4} f={f + i * 4} />
        ))}
      </Layer>
    )}
    <Layer d={0.3} cx={cx} cy={cy}>
      <BuildingRow rows={FAR} base={1200} fill={mood.far} win={mood.win} lit={mood.lit * 0.7} f={f} />
    </Layer>
    {tower && (
      <Layer d={0.5} cx={cx} cy={cy}>
        <circle cx={540} cy={560} r={190} fill={mood.lamp} opacity={0.12 + 0.05 * Math.sin(f * 0.2)} />
        <rect x={440} y={380} width={200} height={830} fill={mood.near} stroke="#0a0c14" strokeWidth={8} />
        <polygon points="420,380 540,200 660,380" fill={mood.far} stroke="#0a0c14" strokeWidth={8} />
        <rect x={532} y={150} width={16} height={60} fill="#0a0c14" />
        <Clock cx={540} cy={560} r={92} h={tower.h} m={tower.m} sec={tower.sec} />
      </Layer>
    )}
    <Layer d={0.75} cx={cx} cy={cy}>
      <BuildingRow rows={NEAR} base={1300} fill={mood.near} win={mood.win} lit={mood.lit} f={f} />
    </Layer>
    {walkers && (
      <Layer d={0.92} cx={cx} cy={cy}>
        {WALKERS.map((w, i) => {
          const wx = ((((w.x0 + f * w.v) % LOOP) + LOOP) % LOOP) - 1200;
          return (
            <Character
              key={i}
              x={wx}
              y={w.y}
              s={w.s}
              look={EXTRAS[w.look]}
              shadow={false}
              pose={{ yaw: w.v > 0 ? 88 : -88, walk: f * (0.3 + Math.abs(w.v) * 0.12) + i, seed: i, smile: 0.1 }}
            />
          );
        })}
      </Layer>
    )}
    <Layer d={1} cx={cx} cy={cy}>
      <rect x={-2500} y={1290} width={6200} height={1800} fill={mood.ground} />
      <rect x={-2500} y={1290} width={6200} height={60} fill={mood.walk} stroke="#0a0c14" strokeWidth={6} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-1200 + i * 260} y={1600} width={150} height={16} rx={6} fill={mood.walk} opacity={0.8} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => {
        const lx = -1000 + i * 540;
        const fl = 0.75 + 0.15 * Math.sin(f * 0.35 + i * 2) + (hash(Math.floor(f / 3) + i * 11) > 0.93 ? -0.4 : 0);
        return (
          <g key={i}>
            <rect x={lx - 7} y={880} width={14} height={420} fill="#0a0c14" />
            <rect x={lx - 34} y={866} width={68} height={22} rx={8} fill="#0a0c14" />
            <circle cx={lx} cy={900} r={90} fill={mood.lamp} opacity={fl * 0.22} />
            <circle cx={lx} cy={896} r={16} fill={mood.lamp} opacity={fl} />
          </g>
        );
      })}
      {postClocks.map((c, i) => (
        <g key={i}>
          <rect x={c.x - 8} y={1010} width={16} height={290} fill="#0a0c14" />
          <Clock cx={c.x} cy={960} r={70} h={c.h} m={c.m} glow={mood.lamp} />
        </g>
      ))}
    </Layer>
    {cars && (
      <Layer d={1.12} cx={cx} cy={cy}>
        {CARS.map((c, i) => {
          const px = ((((c.x0 + f * c.v) % LOOP) + LOOP) % LOOP) - 1400;
          return <Car key={i} x={c.dir === 1 ? px : 2800 - px} y={1800} c={c.c} dir={c.dir} f={f} head={mood.lamp} />;
        })}
      </Layer>
    )}
  </>
);
