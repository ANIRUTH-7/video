import React from 'react';
import { useCurrentFrame } from 'remotion';

const OL = '#0a0c14';
const rad = (d: number) => (d * Math.PI) / 180;
type V = [number, number];

export type Look = {
  skin: string;
  skinDark: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun' | 'curly' | 'bald';
  top: string;
  topDark: string;
  pants: string;
  shoes: string;
  glasses?: boolean;
  earrings?: boolean;
  beanie?: string;
  detail?: boolean;
};

export const SAM: Look = {
  skin: '#f2c8a2',
  skinDark: '#d89f78',
  hair: '#3b2418',
  hairStyle: 'short',
  top: '#e8553d',
  topDark: '#b73a2a',
  pants: '#2f4a8a',
  shoes: '#f1ece0',
  glasses: true,
};
export const MAYA: Look = {
  skin: '#b97b5c',
  skinDark: '#945d43',
  hair: '#2a1530',
  hairStyle: 'long',
  top: '#2fa59a',
  topDark: '#1f7a72',
  pants: '#2a2a3e',
  shoes: '#f4c542',
  earrings: true,
};
export const EXTRAS: Look[] = [
  { skin: '#e8b48c', skinDark: '#c88f68', hair: '#c9a24a', hairStyle: 'bun', top: '#7a5ad8', topDark: '#5a3fb0', pants: '#2a2f40', shoes: '#14161f' },
  { skin: '#8a5a40', skinDark: '#6a4230', hair: '#1a1210', hairStyle: 'curly', top: '#f0b43a', topDark: '#c28a1f', pants: '#4a3a30', shoes: '#f1ece0' },
  { skin: '#f4d2b0', skinDark: '#d4a884', hair: '#8a8a92', hairStyle: 'short', top: '#4a8a5a', topDark: '#356a43', pants: '#3a3a4a', shoes: '#14161f', glasses: true },
  { skin: '#d9a07a', skinDark: '#b57c58', hair: '#1a1a22', hairStyle: 'bald', top: '#c4566a', topDark: '#963e50', pants: '#232838', shoes: '#f1ece0', beanie: '#4a4a6a' },
];

export type Pose = {
  /** 0 = facing camera, 90 = facing screen-right, 180 = back to camera, -90 = facing left */
  yaw?: number;
  walk?: number | null;
  /** [upper arm, forearm] sideways angles in degrees (0 = hanging down) */
  armL?: [number, number];
  armR?: [number, number];
  mouth?: number;
  smile?: number; // -1 frown .. 1 grin
  brow?: number; // -1 angry .. 1 worried
  browH?: number; // raise (+) / lower (-)
  eyes?: number; // 0 closed .. 1 normal .. 1.3 shocked
  gaze?: [number, number];
  tilt?: number;
  headYaw?: number;
  sweat?: number;
  shrug?: number;
  tear?: number;
  lean?: number;
  seed?: number;
  hold?: React.ReactNode;
  holdL?: React.ReactNode;
};

const Limb: React.FC<{ d: string; c: string; w: number }> = ({ d, c, w }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={OL} strokeWidth={w + 10} />
    <path d={d} stroke={c} strokeWidth={w} />
  </g>
);

export const Phone: React.FC<{ glow?: number }> = ({ glow = 0.6 }) => (
  <g transform="rotate(-8)">
    <circle cx={0} cy={-6} r={50} fill="#6ec1ff" opacity={glow * 0.22} />
    <rect x={-11} y={-34} width={24} height={58} rx={6} fill="#101520" stroke={OL} strokeWidth={3} />
    <rect x={-7} y={-29} width={16} height={44} rx={3} fill="#6ec1ff" opacity={0.92} />
  </g>
);

/** Preset arm gestures */
export const GESTURE = {
  phoneR: [110, -140] as [number, number],
  scratchR: [118, -152] as [number, number],
  idleL: [-8, -6] as [number, number],
  idleR: [8, 6] as [number, number],
  hipsL: [-55, 40] as [number, number],
  hipsR: [55, -40] as [number, number],
  pointR: [78, 82] as [number, number],
  cheerL: [-150, -170] as [number, number],
  cheerR: [150, 170] as [number, number],
  crossL: [20, 125] as [number, number],
  wheelL: [-18, -30] as [number, number],
  wheelR: [18, 30] as [number, number],
};

export const Character: React.FC<{ x: number; y: number; s?: number; pose?: Pose; look?: Look; shadow?: boolean }> = ({
  x,
  y,
  s = 1,
  pose = {},
  look = SAM,
  shadow = true,
}) => {
  const gf = useCurrentFrame();
  const {
    yaw = 0,
    walk = null,
    armL = GESTURE.idleL,
    armR = GESTURE.idleR,
    mouth = 0,
    smile = 0.15,
    brow = 0,
    browH = 0,
    eyes = 1,
    gaze = [0, 0],
    tilt = 0,
    headYaw = 0,
    sweat = 0,
    shrug = 0,
    tear = 0,
    lean = 0,
    seed = 0,
    hold,
    holdL,
  } = pose;

  const cyw = Math.cos(rad(yaw));
  const syw = Math.sin(rad(yaw));
  const proj = (lat: number, fwd: number) => lat * cyw + fwd * syw;
  const breathe = Math.sin((gf + seed * 17) * 0.1);
  const sw = walk === null ? 0 : Math.sin(walk);
  const idle = walk === null ? 1 : 0;
  const bob = walk === null ? 0 : -Math.abs(Math.cos(walk)) * 9;
  const hipY = -122;
  const shY = -214 - shrug * 14 + breathe * 0.8;

  const seg = (p: V, lat: number, fwd: number, L: number): V => [
    p[0] + (Math.sin(rad(lat)) * cyw + Math.sin(rad(fwd)) * syw) * L,
    p[1] + Math.cos(rad(lat)) * Math.cos(rad(fwd)) * L,
  ];

  /* legs */
  const leg = (side: -1 | 1) => {
    const a1 = (side === -1 ? 1 : -1) * sw * 30;
    const a2 = walk === null ? 0 : a1 - Math.max(0, -a1 / 30) * 36;
    const hip: V = [proj(side * 17, 0), hipY];
    const lat = side * (idle ? 5 : 2);
    const k = seg(hip, lat, a1, 60);
    const f = seg(k, lat, a2, 62);
    return { hip, k, f, d: `M${hip[0]} ${hip[1]} L${k[0]} ${k[1]} L${f[0]} ${f[1]}` };
  };
  const lL = leg(-1);
  const lR = leg(1);

  /* arms */
  const arm = (side: -1 | 1) => {
    const base = side === -1 ? armL : armR;
    const a1 = base[0] + (side * 50 - base[0]) * shrug + Math.sin((gf + seed * 9) * 0.08 + side) * 2 * idle;
    const a2 = base[1] + (side * 130 - base[1]) * shrug;
    const fwd = walk === null ? 0 : side * sw * 32;
    const fwd2 = walk === null ? 0 : fwd + 12 + Math.max(0, fwd) * 0.7;
    const sh: V = [proj(side * 40, 0), shY];
    const e = seg(sh, a1, fwd, 54);
    const h = seg(e, a2, fwd2, 52);
    return { sh, e, h, d: `M${sh[0]} ${sh[1]} L${e[0]} ${e[1]} L${h[0]} ${h[1]}` };
  };
  const aL = arm(-1);
  const aR = arm(1);

  /* torso */
  const hw = Math.abs(40 * cyw) + 20 * Math.abs(syw) + 8;
  const torso = `M${-hw} -198 Q${-hw} -228 ${-hw + 26} -228 L${hw - 26} -228 Q${hw} -228 ${hw} -198 L${hw * 0.84} -110 Q0 -98 ${-hw * 0.84} -110 Z`;
  const front = cyw > -0.15;
  const zipX = syw * hw * 0.85;

  /* head */
  const H = yaw + headYaw;
  const cH = Math.cos(rad(H));
  const sH = Math.sin(rad(H));
  const faceFront = cH > -0.1;
  const nod = breathe * 1.2;
  const bp = (gf + seed * 31) % 96;
  const blink = bp < 5 ? Math.sin((bp / 5) * Math.PI) : 0;
  const eo = Math.max(0, eyes) * (1 - blink);
  const squash = Math.max(0.52, Math.abs(cH));
  const gid = `hg-${look.skin.replace('#', '')}`;

  const hairC = look.hair;
  const near = syw > 0 ? lR : lL; // used only for ordering hints
  void near;
  const farFirst = Math.abs(syw) > 0.35;
  const farSide: -1 | 1 = syw > 0 ? 1 : -1;
  const armOf = (side: -1 | 1) => (side === -1 ? aL : aR);
  const legOf = (side: -1 | 1) => (side === -1 ? lL : lR);

  const sleeve = (a: ReturnType<typeof arm>, side: -1 | 1) => (
    <g key={`arm${side}`}>
      <Limb d={a.d} c={look.top} w={22} />
      <circle cx={a.h[0]} cy={a.h[1]} r={12} fill={look.skin} stroke={OL} strokeWidth={4.5} />
      <circle cx={a.h[0] + (side === 1 ? 5 : -5)} cy={a.h[1] - 5} r={4.5} fill={look.skinDark} opacity={0.5} />
      {(side === 1 ? hold : holdL) && <g transform={`translate(${a.h[0]} ${a.h[1]})`}>{side === 1 ? hold : holdL}</g>}
    </g>
  );
  const pantsLeg = (l: ReturnType<typeof leg>, side: -1 | 1) => (
    <g key={`leg${side}`}>
      <Limb d={l.d} c={look.pants} w={26} />
      <ellipse cx={l.f[0] + syw * 12} cy={l.f[1] + 3} rx={14 + 11 * Math.abs(syw)} ry={10} fill={look.shoes} stroke={OL} strokeWidth={5} />
      <path d={`M${l.f[0] + syw * 12 - 10} ${l.f[1] + 9} L${l.f[0] + syw * 12 + 10 + 10 * Math.abs(syw)} ${l.f[1] + 9}`} stroke={OL} strokeWidth={3} opacity={0.5} />
    </g>
  );

  /* hair paths (head space, radius ~44) */
  const capShort =
    'M-47 -2 C-54 -42 -28 -62 2 -60 C34 -62 56 -42 47 -2 C42 -20 30 -30 14 -28 C4 -38 -14 -34 -22 -26 C-34 -24 -41 -14 -47 -2 Z';
  const tuft = 'M-8 -58 Q4 -84 26 -70 Q12 -66 8 -56 Z';
  const longBack = 'M-54 -4 C-66 -64 66 -64 54 -4 L62 70 Q0 94 -62 70 Z';

  const hairFront = (
    <g transform={`translate(${sH * 7} 0)`}>
      {look.hairStyle === 'bun' && <circle cx={0} cy={-62} r={17} fill={hairC} stroke={OL} strokeWidth={6} />}
      {look.hairStyle === 'curly' &&
        [-34, -18, 0, 18, 34].map((cx, i) => <circle key={i} cx={cx} cy={-40 - (i % 2 === 0 ? 4 : 10) + Math.abs(cx) * 0.25} r={17} fill={hairC} stroke={OL} strokeWidth={5} />)}
      {look.hairStyle !== 'bald' && look.hairStyle !== 'curly' && <path d={capShort} fill={hairC} stroke={OL} strokeWidth={6} strokeLinejoin="round" />}
      {look.hairStyle === 'curly' && <path d={capShort} fill={hairC} stroke={OL} strokeWidth={0} transform="translate(0 4)" />}
      {look.hairStyle === 'short' && <path d={tuft} fill={hairC} stroke={OL} strokeWidth={5} strokeLinejoin="round" />}
      {look.hairStyle === 'long' && <path d="M-47 -2 C-50 20 -48 40 -52 52 L-40 44 C-42 20 -44 10 -44 -2 Z" fill={hairC} stroke={OL} strokeWidth={4} />}
      {look.hairStyle !== 'bald' && <path d="M-26 -50 Q-8 -58 12 -52" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.18} />}
      {look.beanie && (
        <g>
          <path d="M-49 -8 C-52 -58 -20 -72 0 -72 C20 -72 52 -58 49 -8 Z" fill={look.beanie} stroke={OL} strokeWidth={6} />
          <rect x={-51} y={-16} width={102} height={18} rx={9} fill={look.beanie} stroke={OL} strokeWidth={6} />
          <rect x={-51} y={-16} width={102} height={18} rx={9} fill="#000" opacity={0.18} />
          <circle cx={0} cy={-76} r={9} fill={look.beanie} stroke={OL} strokeWidth={5} />
        </g>
      )}
    </g>
  );

  /* mouth */
  const mw = 10 + mouth * 3 + Math.max(0, smile) * 6 - Math.max(0, -smile) * 2;
  const cornerY = 25 - smile * 7;
  const uc = 25 + smile * 10 - (mouth > 0.08 ? 3 : 0);
  const lc = uc + 4 + mouth * 42;
  const mouthEl =
    mouth > 0.08 ? (
      <g>
        <path d={`M${-mw} ${cornerY} Q0 ${uc} ${mw} ${cornerY} Q0 ${lc} ${-mw} ${cornerY} Z`} fill="#4a1414" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        {mouth > 0.25 && <ellipse cx={0} cy={(cornerY + lc) / 2 + 6} rx={mw * 0.45} ry={3 + mouth * 3} fill="#d9605a" />}
        {mouth > 0.2 && <path d={`M${-mw * 0.6} ${cornerY + 1.5} Q0 ${uc + 1} ${mw * 0.6} ${cornerY + 1.5} L${mw * 0.55} ${cornerY + 6} Q0 ${uc + 5} ${-mw * 0.55} ${cornerY + 6} Z`} fill="#f7f3ea" />}
      </g>
    ) : (
      <path d={`M${-mw} ${cornerY} Q0 ${uc} ${mw} ${cornerY}`} fill="none" stroke={OL} strokeWidth={5} strokeLinecap="round" />
    );

  /* brows */
  const by = -27 - browH * 9;
  const oy = by + brow * 4;
  const iy = by - brow * 7;
  const browL = `M-33 ${oy} Q-19 ${(oy + iy) / 2 - 3} -6 ${iy}`;
  const browR = `M33 ${oy} Q19 ${(oy + iy) / 2 - 3} 6 ${iy}`;
  const browCol = look.hairStyle === 'bald' ? '#3a2a22' : hairC;

  const eyeX = 16;
  const pr = 5.8 - Math.max(0, eyes - 1) * 4;
  const eye = (sx: -1 | 1) => (
    <g key={sx}>
      <ellipse cx={sx * eyeX} cy={-4} rx={10.5} ry={Math.max(1.4, 12 * eo)} fill="#fbf8f0" stroke={OL} strokeWidth={3.5} />
      {eo > 0.15 && (
        <g>
          <ellipse cx={sx * eyeX + gaze[0] * 4.5} cy={-4 + gaze[1] * 4.5} rx={pr} ry={pr * Math.min(1, eo * 1.5)} fill="#1a1620" />
          <circle cx={sx * eyeX + gaze[0] * 4.5 + 2} cy={-6 + gaze[1] * 4.5} r={1.9} fill="#fff" />
        </g>
      )}
      {tear > 0 && <ellipse cx={sx * eyeX} cy={7} rx={10} ry={3} fill="#8fd3ff" opacity={tear * 0.75} />}
      {look.glasses && <circle cx={sx * eyeX} cy={-4} r={15.5} fill="#bfe6ff" fillOpacity={0.14} stroke="#14161f" strokeWidth={4} />}
    </g>
  );

  const tp = ((gf * 0.9 + seed * 5) % 30) / 30;
  const sp = ((gf * 0.6 + seed * 3) % 28) / 28;

  const headTransform = `translate(0 ${-282 + nod}) rotate(${tilt})`;

  return (
    <g transform={`translate(${x} ${y + bob * s}) scale(${s})`}>
      {shadow && <ellipse cx={0} cy={4 - bob} rx={66} ry={11} fill="#05060c" opacity={0.38} />}

      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {/* back hair (long) sits behind the body when facing camera */}
        {look.hairStyle === 'long' && faceFront && (
          <g transform={headTransform}>
            <path d={longBack} fill={hairC} stroke={OL} strokeWidth={6} strokeLinejoin="round" transform={`translate(${-sH * 6} 0)`} />
          </g>
        )}

        {farFirst && sleeve(armOf(farSide), farSide)}
        {pantsLeg(legOf(farSide), farSide)}
        {pantsLeg(legOf(farSide === 1 ? -1 : 1), farSide === 1 ? -1 : 1)}

        {/* neck */}
        <rect x={-10} y={-250} width={20} height={34} rx={8} fill={look.skinDark} stroke={OL} strokeWidth={5} />

        {/* torso */}
        <g transform={`translate(0 ${-170}) scale(1 ${1 + breathe * 0.008}) translate(0 170)`}>
          <path d={torso} fill={look.top} stroke={OL} strokeWidth={7} strokeLinejoin="round" />
          <path d={`M${hw * 0.45} -226 Q${hw} -226 ${hw} -198 L${hw * 0.84} -110 L${hw * 0.35} -104 Z`} fill={look.topDark} opacity={0.55} />
          {/* belt */}
          <path d={`M${-hw * 0.86} -118 Q0 -104 ${hw * 0.86} -118 L${hw * 0.84} -110 Q0 -97 ${-hw * 0.84} -110 Z`} fill="#14161f" opacity={0.7} />
          {front ? (
            <g>
              <path d={`M${zipX - 16} -228 Q${zipX} -206 ${zipX + 16} -228`} fill={look.skinDark} stroke={OL} strokeWidth={5} />
              <path d={`M${zipX - 18} -228 L${zipX - 4} -196 M${zipX + 18} -228 L${zipX + 4} -196`} stroke={look.topDark} strokeWidth={6} strokeLinecap="round" />
              <line x1={zipX} y1={-200} x2={zipX} y2={-112} stroke={look.topDark} strokeWidth={4} />
              <rect x={zipX + hw * 0.32} y={-170} width={hw * 0.34} height={30} rx={8} fill={look.topDark} opacity={0.55} />
            </g>
          ) : (
            <path d={`M-30 -228 Q0 -190 30 -228 Q0 -214 -30 -228 Z`} fill={look.topDark} stroke={OL} strokeWidth={5} />
          )}
        </g>

        {!farFirst && (
          <>
            {sleeve(aL, -1)}
            {sleeve(aR, 1)}
          </>
        )}
        {farFirst && sleeve(armOf(farSide === 1 ? -1 : 1), farSide === 1 ? -1 : 1)}

        {/* head */}
        <g transform={headTransform}>
          {look.hairStyle === 'long' && !faceFront && <path d={longBack} fill={hairC} stroke={OL} strokeWidth={6} strokeLinejoin="round" />}
          {/* ears */}
          {faceFront && (
            <g>
              <circle cx={-(42 * Math.abs(cH) + 3)} cy={4} r={9} fill={look.skin} stroke={OL} strokeWidth={5} />
              <circle cx={42 * Math.abs(cH) + 3} cy={4} r={9} fill={look.skin} stroke={OL} strokeWidth={5} />
            </g>
          )}
          <defs>
            <radialGradient id={gid} cx="38%" cy="32%" r="80%">
              <stop offset="0" stopColor={look.skin} />
              <stop offset="0.7" stopColor={look.skin} />
              <stop offset="1" stopColor={look.skinDark} />
            </radialGradient>
          </defs>
          {faceFront ? (
            <g>
              <ellipse cx={0} cy={0} rx={44} ry={46} fill={`url(#${gid})`} stroke={OL} strokeWidth={7} />
              {/* profile ear */}
              {Math.abs(sH) > 0.55 && <ellipse cx={-sH * 12} cy={5} rx={8} ry={11} fill={look.skinDark} stroke={OL} strokeWidth={4} />}
              {look.earrings && <circle cx={-(42 * Math.abs(cH) + 3)} cy={20} r={5} fill="none" stroke="#f4c542" strokeWidth={3} />}
              {look.earrings && <circle cx={42 * Math.abs(cH) + 3} cy={20} r={5} fill="none" stroke="#f4c542" strokeWidth={3} />}
              {/* nose */}
              <ellipse cx={sH * 36} cy={9} rx={4.5 + Math.abs(sH) * 6} ry={6} fill={look.skinDark} stroke={OL} strokeWidth={3} opacity={0.95} />
              <g transform={`translate(${sH * 24} 0) scale(${squash} 1)`}>
                <ellipse cx={-27} cy={15} rx={8} ry={5} fill="#ff6a6a" opacity={0.14 + Math.max(0, smile) * 0.16} />
                <ellipse cx={27} cy={15} rx={8} ry={5} fill="#ff6a6a" opacity={0.14 + Math.max(0, smile) * 0.16} />
                {eye(-1)}
                {eye(1)}
                {look.glasses && <path d="M-1.5 -6 Q0 -9 1.5 -6" stroke="#14161f" strokeWidth={4} fill="none" />}
                <path d={browL} fill="none" stroke={browCol} strokeWidth={6.5} strokeLinecap="round" />
                <path d={browR} fill="none" stroke={browCol} strokeWidth={6.5} strokeLinecap="round" />
                {mouthEl}
                {tear > 0 &&
                  [-1, 1].map((sx) => (
                    <path key={sx} d={`M${sx * 24} ${10 + tp * 44} q6 10 0 15 q-6 -5 0 -15`} fill="#8fd3ff" opacity={(1 - tp) * tear} stroke="#fff" strokeWidth={1} />
                  ))}
              </g>
              {hairFront}
              {sweat > 0 && <path d={`M44 ${-34 + sp * 26} q9 15 0 22 q-9 -7 0 -22`} fill="#8fd3ff" opacity={sweat * (1 - sp * 0.6)} stroke="#fff" strokeWidth={1.5} />}
            </g>
          ) : (
            <g>
              <ellipse cx={0} cy={0} rx={46} ry={48} fill={hairC} stroke={OL} strokeWidth={7} />
              <path d="M-30 -30 Q0 -44 30 -30" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.15} />
              {look.hairStyle === 'bun' && <circle cx={0} cy={-54} r={17} fill={hairC} stroke={OL} strokeWidth={6} />}
              {look.beanie && <path d="M-49 -6 C-52 -58 -20 -72 0 -72 C20 -72 52 -58 49 -6 Q0 14 -49 -6 Z" fill={look.beanie} stroke={OL} strokeWidth={6} />}
              {look.hairStyle === 'bald' && <ellipse cx={0} cy={0} rx={44} ry={46} fill={look.skin} stroke={OL} strokeWidth={7} />}
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
