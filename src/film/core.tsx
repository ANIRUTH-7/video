import React from 'react';
import { interpolate, Easing, AbsoluteFill } from 'remotion';

export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);
export const FONT = "'Arial Black', Impact, 'Helvetica Neue', Arial, sans-serif";

/* Storyboard timed to a ~43s voice-over. */
export const SCENES = {
  s1: { start: fr(0), end: fr(6) },
  s2: { start: fr(6), end: fr(8.5) },
  s3: { start: fr(8.5), end: fr(10) },
  s4: { start: fr(10), end: fr(13.2) },
  s5: { start: fr(13.2), end: fr(16) },
  s6: { start: fr(16), end: fr(20) },
  s7: { start: fr(20), end: fr(24) },
  s8: { start: fr(24), end: fr(27.5) },
  s9: { start: fr(27.5), end: fr(32.5) },
  s10: { start: fr(32.5), end: fr(36) },
  s11: { start: fr(36), end: fr(38.3) },
  s12: { start: fr(38.3), end: fr(43) },
} as const;

/* ------------------------ Pre-generated data ------------------------ */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
export const hash = (n: number) => ((n * 9301 + 49297) % 233280) / 233280;
const rand = seededRandom(42);

export const STARS = Array.from({ length: 80 }, () => ({
  x: rand() * 1080,
  y: rand() * 800,
  r: 1 + rand() * 2.6,
  tw: Math.floor(rand() * 60),
}));
export const RAIN = Array.from({ length: 90 }, () => ({
  x: rand() * 1200 - 60,
  delay: Math.floor(rand() * 40),
  len: 30 + rand() * 40,
  speed: 0.8 + rand() * 0.6,
}));
export const SPRAY = Array.from({ length: 7 }, (_, i) => ({
  cx: 140 + rand() * 800,
  cy: 200 + rand() * 420,
  delay: i * 17 + Math.floor(rand() * 10),
  hue: Math.floor(rand() * 360),
  sparks: Array.from({ length: 20 }, (_, k) => ({ a: (k / 20) * Math.PI * 2 + rand() * 0.2, v: 0.7 + rand() * 0.5 })),
}));
export const DUST = Array.from({ length: 50 }, () => ({
  x: rand() * 1200 - 60,
  y: rand() * 1920,
  r: 2 + rand() * 5,
  delay: Math.floor(rand() * 120),
  speed: 0.4 + rand() * 0.9,
}));
export const BOKEH = Array.from({ length: 24 }, () => ({
  x: rand() * 2400 - 200,
  y: 250 + rand() * 1100,
  r: 30 + rand() * 90,
  hue: Math.floor(30 + rand() * 40),
  ph: Math.floor(rand() * 60),
}));

/* --------------------------- Motion helpers --------------------------- */
export type Ease = (t: number) => number;
export const OUT: Ease = Easing.out(Easing.cubic);
export const IN: Ease = Easing.in(Easing.cubic);
export const BACK: Ease = Easing.out(Easing.back(1.8));
export const INOUT: Ease = Easing.inOut(Easing.cubic);
export const SOFT: Ease = Easing.inOut(Easing.sin);
export const ip = (f: number, i: number[], o: number[], e: Ease = OUT) =>
  interpolate(f, i, o, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

// natural handheld drift (sum of slow + fast sines)
export const shake = (f: number, amp: number, seed = 0) => ({
  x: (Math.sin(f * 0.9 + seed) + Math.sin(f * 2.3 + seed * 2)) * amp * 0.5,
  y: (Math.cos(f * 1.1 + seed) + Math.sin(f * 2.9 + seed)) * amp * 0.5,
  r: Math.sin(f * 0.7 + seed) * amp * 0.04,
});
// impact jolt that decays
export const kick = (f: number, at: number, amp: number) =>
  f < at ? 0 : amp * Math.exp(-(f - at) / 5) * Math.sin((f - at) * 2.2);

/* -------------------------- Virtual camera rig -------------------------- */
export type CamState = { zoom: number; x: number; y: number; rot: number; rx: number; ry: number; blur: number };
export type CamKey = Partial<CamState> & { t: number; e?: Ease };
const CAM0: CamState = { zoom: 1, x: 0, y: 0, rot: 0, rx: 0, ry: 0, blur: 0 };

/**
 * Keyframed camera. Unspecified properties carry over from the previous key.
 * zoom = dolly, x/y = track/crane, rot = dutch roll, rx = tilt (neg = low angle, pos = high angle), ry = orbit yaw.
 */
export const camAt = (f: number, keys: CamKey[], ease: Ease = INOUT): CamState => {
  let prev: CamState = { ...CAM0 };
  const ks = keys.map((k) => {
    const { t, e, ...rest } = k;
    prev = { ...prev, ...rest };
    return { t, e, ...prev };
  });
  if (f <= ks[0].t) return ks[0];
  const last = ks[ks.length - 1];
  if (f >= last.t) return last;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (f < b.t) {
      const p = (f - a.t) / (b.t - a.t);
      const e = (b.e ?? ease)(p);
      const m = (u: number, v: number) => u + (v - u) * e;
      return { zoom: m(a.zoom, b.zoom), x: m(a.x, b.x), y: m(a.y, b.y), rot: m(a.rot, b.rot), rx: m(a.rx, b.rx), ry: m(a.ry, b.ry), blur: m(a.blur, b.blur) };
    }
  }
  return last;
};

export const Cam: React.FC<{
  cam: CamState;
  sh?: { x: number; y: number; r: number };
  ox?: number;
  oy?: number;
  persp?: number;
  children: React.ReactNode;
}> = ({ cam, sh = { x: 0, y: 0, r: 0 }, ox = 50, oy = 55, persp = 1700, children }) => (
  <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: `${ox}% ${oy}%` }}>
    <AbsoluteFill
      style={{
        transform: `translate(${cam.x + sh.x}px, ${cam.y + sh.y}px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotate(${cam.rot + sh.r}deg) scale(${cam.zoom * 1.08})`,
        transformOrigin: `${ox}% ${oy}%`,
        filter: cam.blur > 0.1 ? `blur(${cam.blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

export const Layer: React.FC<{ d: number; cx: number; cy?: number; blur?: number; children: React.ReactNode }> = ({
  d,
  cx,
  cy = 0,
  blur = 0,
  children,
}) => (
  <AbsoluteFill style={{ transform: `translate(${-cx * d}px, ${-cy * d}px)`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ overflow: 'visible' }}>
      {children}
    </svg>
  </AbsoluteFill>
);

/* ------------------------------ Overlays ------------------------------ */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 50%, rgba(6,8,16,0) 40%, rgba(6,8,16,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);
export const Tint: React.FC<{ c: string; o: number }> = ({ c, o }) => (
  <AbsoluteFill style={{ background: c, opacity: o, pointerEvents: 'none' }} />
);

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -0.5'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill
    style={{
      backgroundImage: GRAIN,
      backgroundSize: '220px 220px',
      backgroundPosition: `${(f * 53) % 220}px ${(f * 97) % 220}px`,
      opacity: 0.16,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  />
);

export const LightLeak: React.FC<{ f: number; color?: string; o?: number; speed?: number }> = ({ f, color = '#ffb36b', o = 0.35, speed = 0.4 }) => {
  const x = 50 + Math.sin(f * 0.02 * speed) * 55;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 28% at ${x}% ${18 + Math.sin(f * 0.03) * 8}%, ${color}, rgba(0,0,0,0) 70%)`,
        mixBlendMode: 'screen',
        opacity: o,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Speed lines for fast moves */
export const SpeedLines: React.FC<{ f: number; o?: number }> = ({ f, o = 0.25 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920">
      {Array.from({ length: 16 }).map((_, i) => {
        const y = 200 + hash(i * 7) * 1500;
        const t = ((f * (1.4 + hash(i)) * 0.9 + i * 13) % 30) / 30;
        const x = 1200 - t * 1500;
        return <line key={i} x1={x} y1={y} x2={x + 240 + hash(i * 3) * 200} y2={y} stroke="#fff" strokeWidth={3} opacity={Math.sin(t * Math.PI)} />;
      })}
    </svg>
  </AbsoluteFill>
);

export const CaptionText: React.FC<{ text: string; frame: number; start: number; end: number }> = ({ text, frame, start, end }) => {
  const o = interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: OUT,
  });
  const ty = ip(frame, [start, start + 12], [24, 0], OUT);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '30%',
          background: 'linear-gradient(to top, rgba(8,10,20,0.88), rgba(8,10,20,0))',
        }}
      />
      <div style={{ position: 'absolute', left: '7%', right: '7%', bottom: '16%', transform: `translateY(${ty}px)` }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 50,
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#fbf3df',
            textShadow: '0 4px 0 #0a0c14, 0 0 22px rgba(0,0,0,0.9), 0 0 6px #0a0c14',
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const PopText: React.FC<{
  text: string;
  frame: number;
  start: number;
  end?: number;
  top: string;
  size?: number;
  color?: string;
  glow?: string;
}> = ({ text, frame, start, end, top, size = 110, color = '#ffd166', glow = '#ff9e2c' }) => {
  const sc = ip(frame, [start, start + 14], [0.3, 1], BACK);
  const o = ip(frame, [start, start + 8], [0, 1], OUT) * (end ? ip(frame, [end - 8, end], [1, 0], IN) : 1);
  const wob = Math.sin((frame - start) * 0.25) * 1.5;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, opacity: o, transform: `scale(${sc}) rotate(${wob}deg)`, pointerEvents: 'none' }}>
      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color,
          textShadow: `0 0 24px ${glow}, 0 0 60px ${glow}, 0 6px 0 #0a0c14`,
        }}
      >
        {text}
      </p>
    </div>
  );
};

/* ------------------------------ Particles ------------------------------ */
export const DustField: React.FC<{ f: number; color: string; op?: number; n?: number; blur?: number }> = ({ f, color, op = 0.5, n = 50, blur = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', filter: blur ? `blur(${blur}px)` : undefined }}>
    <svg width="100%" height="100%" viewBox="0 0 1080 1920">
      {DUST.slice(0, n).map((p, i) => {
        const t = ((f * p.speed * 0.6 + p.delay * 7) % 600) / 600;
        const y = 1920 - t * 2000;
        const x = p.x + Math.sin((f + p.delay) * 0.05) * 30;
        return <circle key={i} cx={x} cy={y} r={p.r} fill={color} opacity={Math.sin(t * Math.PI) * op} />;
      })}
    </svg>
  </AbsoluteFill>
);
export const RainField: React.FC<{ f: number; color: string; vbH?: number }> = ({ f, color, vbH = 1920 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width="100%" height="100%" viewBox={`0 0 1080 ${vbH}`}>
      {RAIN.map((p, i) => {
        const t = ((f * p.speed * 1.4 + p.delay) % 20) / 20;
        const y = -80 + t * (vbH + 160);
        const x = p.x - t * 60;
        return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + p.len} stroke={color} strokeWidth={3} opacity={0.5} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** Round bokeh discs used for rack-focus backgrounds */
export const Bokeh: React.FC<{ f: number; cx: number; n?: number; o?: number; hue?: number; blur?: number; d?: number; scaleX?: number }> = ({
  f,
  cx,
  n = 24,
  o = 0.18,
  hue,
  blur = 10,
  d = 0.35,
  scaleX = 1,
}) => (
  <Layer d={d} cx={cx} blur={blur}>
    {BOKEH.slice(0, n).map((b, i) => (
      <circle key={i} cx={b.x * scaleX} cy={b.y} r={b.r} fill={`hsl(${hue ?? b.hue},90%,65%)`} opacity={o + o * 0.55 * Math.sin((f + b.ph) * 0.1)} />
    ))}
  </Layer>
);
