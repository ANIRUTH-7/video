import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import {
  Bokeh,
  BOKEH,
  Cam,
  CaptionText,
  DustField,
  FONT,
  INOUT,
  IN,
  LightLeak,
  Layer,
  OUT,
  BACK,
  SOFT,
  PopText,
  RainField,
  SpeedLines,
  Tint,
  Vignette,
  camAt,
  ip,
  kick,
  shake,
} from './core';
import { Character, GESTURE, MAYA, Phone } from './character';
import { Clock, MOOD, TownLayers } from './world';

type SP = { frame: number };
type A2 = [number, number];
const la = (a: A2, b: A2, t: number): A2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const deg = (r: number) => (r * 180) / Math.PI;
const talk = (f: number, from: number, to: number, speed = 0.85) => (f >= from && f < to ? 0.15 + 0.85 * Math.abs(Math.sin((f - from) * speed)) : 0);

/* ---------------------------------------------------------------------------
 * Scene 1 — CRANE DOWN from the clock tower (low angle), then slow 360° orbit
 * ------------------------------------------------------------------------- */
export const SceneOne: React.FC<SP> = ({ frame: f }) => {
  const ang = ip(f, [0, 185], [0, Math.PI * 2], INOUT);
  const camX = Math.sin(ang) * 300;
  const c0 = camAt(f, [
    { t: 0, zoom: 1.4, y: 560, rx: -15, rot: -2 },
    { t: 70, zoom: 1.0, y: 0, rx: 0, rot: 0 },
    { t: 140, zoom: 1.2, y: -50, rx: -9, rot: 1.5 },
    { t: 195, zoom: 1.55, y: -150, rx: -4, rot: 0 },
  ]);
  const cam = { ...c0, ry: c0.ry + Math.sin(ang) * 10 };
  const sh = shake(f, 2.5, 1);
  const sec = ip(f, [0, 70], [44, 60], INOUT);
  const yaw = 180 + deg(ang);
  const hips = ip(f, [96, 112], [0, 1], OUT);
  const lookUp = ip(f, [0, 10], [1, 1]) * (1 - ip(f, [70, 100], [0, 1], OUT));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#070a1f 0%,#1a1844 55%,#4a2a5e 78%,#2a2050 100%)' }}>
      <Cam cam={cam} sh={sh} oy={72}>
        <TownLayers cx={camX} f={f} mood={MOOD.night} stars fireworks walkers cars tower={{ h: 11, m: 59 + Math.min(sec, 60) / 60, sec: sec % 60 }} />
        <Layer d={1} cx={camX}>
          <circle cx={540} cy={1190} r={300} fill="#ffd98a" opacity={0.08 + 0.03 * Math.sin(f * 0.2)} />
          <Character
            x={540}
            y={1420}
            s={1.7}
            pose={{
              yaw,
              armL: la(GESTURE.idleL, GESTURE.hipsL, hips),
              armR: la(GESTURE.idleR, GESTURE.hipsR, hips),
              gaze: [0, -0.9 * lookUp],
              smile: 0.35 + hips * 0.3,
              browH: 0.5 * lookUp,
              mouth: talk(f, 100, 185, 0.7) * 0.8,
              headYaw: f < 100 ? Math.sin(f * 0.05) * 6 : 0,
            }}
          />
        </Layer>
        <Layer d={1.8} cx={camX} blur={3}>
          <rect x={-20} y={500} width={46} height={1500} fill="#05060c" />
          <circle cx={3} cy={500} r={34} fill="#ffe2a0" opacity={0.6} />
          <rect x={1060} y={600} width={46} height={1400} fill="#05060c" />
          <circle cx={1083} cy={600} r={34} fill="#ffe2a0" opacity={0.6} />
        </Layer>
      </Cam>
      <DustField f={f} color="#ffd98a" op={0.6} n={30} />
      <LightLeak f={f} color="#8a5cff" o={0.2} />
      <Tint c="#1a1050" o={0.12} />
      <Vignette />
      <CaptionText text="In this town, New Year’s resolutions become literal laws." frame={f} start={4} end={95} />
      <CaptionText text="Say it out loud on January first... and the town makes sure you keep it." frame={f} start={95} end={190} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 2 — CLOSE-UP, arcing dolly, rack focus, FREEZE FRAME punch-in
 * ------------------------------------------------------------------------- */
export const SceneTwo: React.FC<SP> = ({ frame: f }) => {
  const fz = Math.min(f, 46);
  const cam = camAt(f, [
    { t: 0, zoom: 1.0, x: -70, ry: -9, rx: -4 },
    { t: 46, zoom: 1.2, x: 40, ry: 7, rx: 0, e: Easing.out(Easing.quad) },
    { t: 54, zoom: 1.3, x: 20, ry: 5, e: OUT },
    { t: 105, zoom: 1.36, x: 0, ry: 4, e: SOFT },
  ]);
  const sh = f < 46 ? shake(f, 2, 2) : { x: 0, y: 0, r: 0 };
  const det = ip(f, [46, 58], [0, 1], OUT);
  const flash = ip(f, [44, 48, 56], [0, 0.3, 0], OUT);
  const bgBlur = ip(f, [0, 30], [24, 12], OUT);
  const br = ip(f, [46, 58], [0, 1], OUT);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#1a1440 0%,#4a2a5e 60%,#2a1c40 100%)' }}>
      <Cam cam={cam} sh={sh} oy={50}>
        <AbsoluteFill style={{ filter: `blur(${bgBlur}px)` }}>
          <TownLayers cx={ip(f, [0, 105], [-60, 60], INOUT)} f={f} mood={MOOD.night} />
        </AbsoluteFill>
        <Bokeh f={f} cx={ip(f, [0, 105], [-80, 80], INOUT)} blur={10} o={0.2} />
        <Layer d={1} cx={0}>
          <circle cx={540} cy={900} r={440} fill="#ffd166" opacity={0.13} />
          <Character
            x={540}
            y={2250}
            s={4.6}
            shadow={false}
            pose={{
              yaw: ip(f, [0, 46], [-30, 10], SOFT),
              mouth: f < 44 ? talk(fz, 2, 44, 0.9) : 0,
              smile: 0.3 + det * 0.4,
              brow: -0.5 * det,
              browH: -0.15 * det + (f < 44 ? 0.2 : 0),
              gaze: [ip(f, [0, 46], [0.5, 0.1]), -0.1],
              eyes: 1 - det * 0.12,
              tilt: Math.sin(fz * 0.2) * 1.5,
              headYaw: Math.sin(fz * 0.09) * 5,
              seed: 3,
            }}
          />
        </Layer>
      </Cam>
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" opacity={br}>
          <g fill="none" stroke="#ffd166" strokeWidth={6} strokeLinecap="round">
            <path d="M110 330 L110 250 L190 250" />
            <path d="M970 330 L970 250 L890 250" />
            <path d="M110 1450 L110 1530 L190 1530" />
            <path d="M970 1450 L970 1530 L890 1530" />
          </g>
        </svg>
      </AbsoluteFill>
      <LightLeak f={f} color="#ffb36b" o={0.25} />
      <Tint c="#ffd166" o={flash} />
      <PopText text="“I’ll never be late again.”" frame={f} start={22} top="19%" size={72} color="#ffd166" glow="#ff9e2c" />
      <Vignette strength={0.75} />
      <CaptionText text="Mine was simple. ‘I’ll never be late again.’" frame={f} start={2} end={90} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 3 — shrug in a tight shot, then TRACKING SHOT alongside him to the door
 * ------------------------------------------------------------------------- */
export const SceneThree: React.FC<SP> = ({ frame: f }) => {
  const sx = ip(f, [16, 52], [300, 830], Easing.inOut(Easing.quad));
  const camX = sx - 470;
  const walking = f >= 16 && f < 52;
  const shrug = ip(f, [0, 5], [0, 1], OUT) * ip(f, [11, 17], [1, 0], IN);
  const yaw = ip(f, [8, 26], [0, 84], INOUT);
  const op = ip(f, [44, 54], [1, 0], IN);
  const cam = camAt(f, [
    { t: 0, zoom: 1.55, y: -110, rx: -5, ry: 8, rot: 2 },
    { t: 22, zoom: 1.2, y: -20, rx: -2, ry: -3, rot: 0 },
    { t: 60, zoom: 1.0, y: 10, rx: 0, ry: -9, rot: 0 },
  ]);
  const sh = shake(f, 2.5, 3);
  const glow = ip(f, [30, 50], [0.2, 0.9], OUT);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#3a2a6a 0%,#c06a7a 55%,#f0a070 80%)' }}>
      <Cam cam={cam} sh={sh} ox={44} oy={62}>
        <TownLayers cx={camX} f={f} mood={MOOD.dusk} walkers birds clouds="#f0b0a0" />
        <Layer d={1} cx={camX}>
          <polygon points="560,780 1000,560 1440,780" fill="#4a2f4a" stroke="#0a0c14" strokeWidth={8} />
          <rect x={600} y={760} width={880} height={530} fill="#7a4a62" stroke="#0a0c14" strokeWidth={8} />
          <rect x={780} y={970} width={150} height={320} fill="#ffcf7a" opacity={glow} />
          <rect x={780} y={970} width={150} height={320} fill="none" stroke="#0a0c14" strokeWidth={10} />
          <rect x={1100} y={900} width={170} height={160} fill="#ffcf7a" opacity={0.55 + 0.1 * Math.sin(f * 0.3)} stroke="#0a0c14" strokeWidth={8} />
          <rect x={740} y={1290} width={230} height={26} fill="#5a4a6e" stroke="#0a0c14" strokeWidth={6} />
          <g opacity={op}>
            <Character
              x={sx}
              y={1330}
              s={1.5}
              pose={{
                yaw,
                walk: walking ? f * 0.5 : null,
                shrug,
                smile: 0.55,
                brow: -0.2,
                browH: 0.7 * shrug,
                eyes: 1,
                gaze: [yaw > 40 ? 0.8 : 0.3, 0],
                mouth: f < 14 ? talk(f, 3, 14, 0.9) * 0.7 : 0,
                tilt: shrug * -6,
                headYaw: yaw > 40 ? 0 : -shrug * 10,
              }}
            />
          </g>
        </Layer>
        <Layer d={1.6} cx={camX} blur={2}>
          <rect x={-300} y={1500} width={2600} height={14} fill="#0a0c14" opacity={0.7} />
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={i} x={-300 + i * 150} y={1440} width={16} height={140} fill="#0a0c14" opacity={0.7} />
          ))}
        </Layer>
      </Cam>
      <DustField f={f} color="#ffd9a0" op={0.4} n={25} />
      <LightLeak f={f} color="#ffb36b" o={0.3} />
      <Vignette />
      <CaptionText text="I thought it was harmless." frame={f} start={2} end={60} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 4 — LOW-ANGLE macro on the ringing alarm, vanish, push-in + dutch roll,
 *           a hand sweeps in and pats the empty nightstand
 * ------------------------------------------------------------------------- */
export const SceneFour: React.FC<SP> = ({ frame: f }) => {
  const ringing = f < 30;
  const rs = ringing ? shake(f, 10, 3) : { x: 0, y: 0, r: 0 };
  const vanish = f < 30 ? 1 : ip(f, [30, 44], [1, 0], IN);
  const flick = f >= 30 && f < 44 ? (Math.floor(f / 2) % 2 ? 1 : 0.3) : 1;
  const cam = camAt(
    f,
    [
      { t: 0, zoom: 2.3, rx: -10, rot: -3, ry: 7, y: 30 },
      { t: 30, zoom: 2.0, rx: -6, rot: 2, ry: -3, y: 0 },
      { t: 40, zoom: 2.0, rx: -2, rot: -2, ry: 0 },
      { t: 72, zoom: 2.9, rx: 2, rot: -5, ry: 4, e: OUT },
      { t: 115, zoom: 3.3, rx: 3, rot: -7, ry: -4, e: SOFT },
    ],
    OUT
  );
  const sh = shake(f, f < 38 ? 3 : 6, 4);
  const t = ip(f, [30, 62], [0, 1], OUT);
  const reach = ip(f, [46, 66], [0, 1], OUT);
  const pat = ip(f, [66, 72], [0, 1]) * Math.sin(Math.max(0, f - 66) * 0.32) * 46;
  const hx = 1640 - reach * 1080 + pat;
  const hy = 1068 + Math.sin(f * 0.3) * 2;
  const retreat = ip(f, [96, 112], [0, 1], IN);
  const hxx = hx + retreat * 500;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#f2c58a 0%,#c98a6a 50%,#6a4a58 100%)' }}>
      <Cam cam={cam} sh={sh} ox={50} oy={52.6}>
        <Layer d={0.4} cx={0} blur={ip(f, [0, 40, 70], [10, 10, 14])}>
          <rect x={-600} y={-300} width={2300} height={1700} fill="#d9a67a" />
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={i} x={-500 + i * 120} y={-300} width={50} height={1700} fill="#c8956a" opacity={0.5} />
          ))}
          <polygon points="700,300 1000,1300 560,1300" fill="#fff2c0" opacity={0.25 + 0.05 * Math.sin(f * 0.1)} />
          <rect x={720} y={260} width={240} height={340} fill="#ffe9a8" stroke="#0a0c14" strokeWidth={8} />
        </Layer>
        <Layer d={1} cx={0}>
          <rect x={-800} y={1320} width={2700} height={900} fill="#6a4a4a" />
          <rect x={380} y={1090} width={320} height={26} fill="#8a5a3a" stroke="#0a0c14" strokeWidth={8} />
          <rect x={400} y={1116} width={280} height={230} fill="#7a4a2e" stroke="#0a0c14" strokeWidth={8} />
          <rect x={430} y={1160} width={220} height={70} rx={8} fill="#8a5a3a" stroke="#0a0c14" strokeWidth={6} />
          <circle cx={540} cy={1195} r={9} fill="#e0b050" />
          <ellipse cx={540} cy={1094} rx={104} ry={12} fill="#3a2220" opacity={0.45} />
          {/* ring marks */}
          {ringing &&
            [-1, 1].map((sd) =>
              [0, 1, 2].map((k) => (
                <path
                  key={`${sd}${k}`}
                  d={`M${540 + sd * (150 + k * 30)} ${900 - k * 14} q${sd * 16} 30 0 60`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={7}
                  strokeLinecap="round"
                  opacity={Math.floor(f / 2 + k) % 2 ? 0.9 : 0.25}
                />
              ))
            )}
          <g opacity={vanish * flick} transform={`translate(${540 + rs.x} ${1010 + rs.y}) rotate(${rs.r * 8}) scale(${vanish})`}>
            <circle cx={-62} cy={-86} r={36} fill="#d9a441" stroke="#0a0c14" strokeWidth={7} transform={`rotate(${ringing ? Math.sin(f * 2.2) * 10 : 0} -62 -86)`} />
            <circle cx={62} cy={-86} r={36} fill="#d9a441" stroke="#0a0c14" strokeWidth={7} transform={`rotate(${ringing ? -Math.sin(f * 2.2) * 10 : 0} 62 -86)`} />
            <line x1={0} y1={-130} x2={0} y2={-100} stroke="#0a0c14" strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={0} r={92} fill="#f0d9a0" stroke="#0a0c14" strokeWidth={9} />
            <circle cx={0} cy={0} r={70} fill="#fff3cf" stroke="#0a0c14" strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-48} stroke="#0a0c14" strokeWidth={7} strokeLinecap="round" transform="rotate(195)" />
            <line x1={0} y1={0} x2={0} y2={-60} stroke="#0a0c14" strokeWidth={5} strokeLinecap="round" transform="rotate(180)" />
            <line x1={-50} y1={80} x2={-70} y2={100} stroke="#0a0c14" strokeWidth={9} strokeLinecap="round" />
            <line x1={50} y1={80} x2={70} y2={100} stroke="#0a0c14" strokeWidth={9} strokeLinecap="round" />
          </g>
          {f >= 30 &&
            [...Array(20)].map((_, k) => {
              const a = (k / 20) * Math.PI * 2;
              const v = 0.7 + ((k * 37) % 10) / 20;
              return <circle key={k} cx={540 + Math.cos(a) * v * t * 170} cy={1010 + Math.sin(a) * v * t * 170} r={Math.max(0, 8 * (1 - t))} fill="#ffe9a8" opacity={1 - t} />;
            })}
          {/* the hand */}
          {f >= 46 && (
            <g>
              <path d={`M1900 760 L${hxx + 120} ${hy - 30}`} stroke="#0a0c14" strokeWidth={118} strokeLinecap="round" fill="none" />
              <path d={`M1900 760 L${hxx + 120} ${hy - 30}`} stroke="#e8553d" strokeWidth={104} strokeLinecap="round" fill="none" />
              <g transform={`translate(${hxx} ${hy})`}>
                {[-26, -9, 9, 26].map((o, i) => (
                  <g key={i}>
                    <line x1={-26} y1={o * 0.8 + 4} x2={-84 + Math.abs(o) * 0.3} y2={o + 4} stroke="#0a0c14" strokeWidth={30} strokeLinecap="round" />
                    <line x1={-26} y1={o * 0.8 + 4} x2={-84 + Math.abs(o) * 0.3} y2={o + 4} stroke="#f2c8a2" strokeWidth={19} strokeLinecap="round" />
                  </g>
                ))}
                <ellipse cx={20} cy={0} rx={56} ry={40} fill="#f2c8a2" stroke="#0a0c14" strokeWidth={7} />
                <ellipse cx={-6} cy={-32} rx={32} ry={14} fill="#f2c8a2" stroke="#0a0c14" strokeWidth={6} transform="rotate(-14)" />
                <rect x={78} y={-46} width={30} height={90} fill="#f1ece0" stroke="#0a0c14" strokeWidth={6} />
              </g>
            </g>
          )}
        </Layer>
      </Cam>
      <LightLeak f={f} color="#ffcf7a" o={0.35} />
      <Tint c="#ffb060" o={0.08} />
      <Vignette strength={0.75} />
      <PopText text="GONE" frame={f} start={66} top="20%" size={124} color="#ff6b5a" glow="#ff2a2a" />
      <CaptionText text="Until the next morning, my alarm clock vanished." frame={f} start={2} end={62} />
      <CaptionText text="Not broken — gone." frame={f} start={62} end={111} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 5 — slow ARC around him (high -> low), dutch roll, turns to camera
 * ------------------------------------------------------------------------- */
export const SceneFive: React.FC<SP> = ({ frame: f }) => {
  const p = ip(f, [0, 99], [-1, 1], INOUT);
  const cam = camAt(f, [
    { t: 0, zoom: 1.05, y: 90, rx: 8, ry: -14, rot: -2 },
    { t: 50, zoom: 1.22, y: 0, rx: 0, ry: -2, rot: 0 },
    { t: 99, zoom: 1.55, y: -70, rx: -7, ry: 12, rot: 2.5 },
  ]);
  const sh = shake(f, 2, 5);
  const sweat = ip(f, [40, 60], [0, 1], OUT);
  const turn = ip(f, [58, 76], [0, 1], INOUT);
  const scratch = ip(f, [18, 32], [0, 1], OUT) * (1 - ip(f, [60, 72], [0, 1]));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#3b4a63 0%,#2a3347 60%,#1c2232 100%)' }}>
      <Cam cam={cam} sh={sh} ox={50} oy={62}>
        <Layer d={0.4} cx={p * 170} blur={3}>
          <rect x={-1000} y={-200} width={3200} height={1530} fill="#46566f" />
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={-900 + i * 130} y={-200} width={50} height={1530} fill="#3d4c64" />
          ))}
          <rect x={700} y={380} width={300} height={420} fill="#9fb8d8" opacity={0.35 + 0.08 * Math.sin(f * 0.12)} stroke="#0a0c14" strokeWidth={10} />
          <polygon points="700,800 1000,800 1160,1330 540,1330" fill="#cfe6ff" opacity={0.06} />
        </Layer>
        <Layer d={1} cx={p * 170}>
          <rect x={-1000} y={1320} width={3200} height={900} fill="#2a2f40" />
          <rect x={620} y={1050} width={360} height={30} fill="#5a4a50" stroke="#0a0c14" strokeWidth={8} />
          <rect x={640} y={1080} width={320} height={250} fill="#4a3a44" stroke="#0a0c14" strokeWidth={8} />
          <rect x={680} y={1130} width={240} height={70} rx={8} fill="#5a4a50" stroke="#0a0c14" strokeWidth={6} />
          <ellipse cx={800} cy={1052} rx={78} ry={10} fill="#1c2232" opacity={0.7} />
          <ellipse cx={800} cy={1052} rx={78} ry={10} fill="none" stroke="#8fa8c8" strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
          <Character
            x={330}
            y={1330}
            s={1.45}
            pose={{
              yaw: 52,
              armR: la(GESTURE.idleR, GESTURE.scratchR, scratch),
              tilt: 5 + Math.sin(f * 0.12) * 2 - turn * 5,
              headYaw: -52 * turn,
              sweat,
              brow: 0.9 - turn * 1.4,
              browH: 0.2 - turn * 0.5,
              smile: -0.1 - turn * 0.4,
              mouth: turn > 0.6 ? 0 : 0.12,
              eyes: 1.1 - turn * 0.35,
              gaze: [0.9 * (1 - turn), 0.5 * (1 - turn)],
              lean: -3 + scratch * 2,
            }}
          />
        </Layer>
        <Layer d={1.7} cx={p * 170} blur={6}>
          <rect x={-190} y={420} width={110} height={1700} fill="#0a0c14" />
          <circle cx={-135} cy={420} r={60} fill="#0a0c14" />
        </Layer>
      </Cam>
      <PopText text="?" frame={f} start={20} top="22%" size={140} color="#ffd166" glow="#ff9e2c" />
      <LightLeak f={f} color="#8fb8ff" o={0.2} />
      <Tint c="#6a8ab8" o={0.1} />
      <Vignette strength={0.8} />
      <CaptionText text="Like the town didn’t trust me to set it myself anymore." frame={f} start={2} end={99} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 6 — in-car CLOSE-UP with dutch angle, key insert shake, WHIP PAN to dash
 * ------------------------------------------------------------------------- */
export const SceneSix: React.FC<SP> = ({ frame: f }) => {
  const world = ip(f, [62, 76], [0, 1080], INOUT);
  const cam = camAt(f, [
    { t: 0, zoom: 1.12, ry: -6, rot: 0, rx: -3, blur: 0 },
    { t: 60, zoom: 1.3, ry: 5, rot: -4, rx: 0, blur: 0 },
    { t: 69, zoom: 1.15, ry: 0, rot: 0, blur: 16 },
    { t: 78, zoom: 1.0, ry: 0, rot: 3, rx: 0, blur: 0 },
    { t: 135, zoom: 1.3, ry: -4, rot: -2, rx: -2, blur: 0 },
  ]);
  const sh = shake(f, f < 60 ? 5 : 3, 6);
  const k = kick(f, 24, 14) + kick(f, 38, 11);
  const keyA = 40 * Math.abs(Math.sin(f * 0.18)) * ip(f, [6, 12], [0, 1], OUT) * ip(f, [56, 62], [1, 0], IN);
  const pulse = 0.6 + 0.4 * Math.sin(f * 0.4);
  const rage = ip(f, [20, 58], [0, 1], OUT);
  const jit = f > 14 && f < 60 ? Math.sin(f * 1.7) * 5 : 0;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0f1220 0%,#1b2038 100%)' }}>
      <Cam cam={cam} sh={{ x: sh.x + k, y: sh.y + k * 0.5, r: sh.r }} oy={55}>
        <Layer d={0.5} cx={world} blur={8}>
          {BOKEH.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y * 0.7 + 150} r={b.r * 0.8} fill={`hsl(${b.hue},90%,60%)`} opacity={0.2 + 0.08 * Math.sin((f + b.ph) * 0.1)} />
          ))}
        </Layer>
        <Layer d={1} cx={world}>
          <rect x={0} y={0} width={1080} height={240} fill="#0d0f18" />
          <rect x={0} y={0} width={70} height={1920} fill="#0d0f18" />
          <rect x={1010} y={0} width={70} height={1920} fill="#0d0f18" />
          <Character
            x={540}
            y={1800}
            s={3.1}
            shadow={false}
            pose={{
              yaw: ip(f, [0, 60], [-10, 12]),
              armL: [GESTURE.wheelL[0] - jit * 0.5, GESTURE.wheelL[1] + jit],
              armR: [GESTURE.wheelR[0] + jit * 0.5, GESTURE.wheelR[1] - jit],
              mouth: f > 14 ? talk(f, 14, 62, 0.55) * 0.9 : 0,
              brow: 0.9 - rage * 1.5,
              browH: 0.3 - rage * 0.6,
              smile: -0.3 - rage * 0.5,
              eyes: 1.15 - rage * 0.15,
              gaze: [ip(f, [50, 62], [0, 1]), 0.3],
              tilt: f > 14 ? Math.sin(f * 0.6) * 5 : 0,
              sweat: ip(f, [20, 40], [0, 1], OUT),
              lean: jit * 0.3,
              seed: 6,
            }}
          />
          <path d="M0 1500 Q540 1400 1080 1500 L1080 2000 L0 2000 Z" fill="#141722" stroke="#0a0c14" strokeWidth={8} />
          <g transform={`rotate(${jit * 0.8} 540 1480)`}>
            <ellipse cx={540} cy={1480} rx={330} ry={116} fill="none" stroke="#0a0c14" strokeWidth={42} />
            <ellipse cx={540} cy={1480} rx={330} ry={116} fill="none" stroke="#2a2f45" strokeWidth={26} />
            <line x1={540} y1={1480} x2={300} y2={1530} stroke="#2a2f45" strokeWidth={22} strokeLinecap="round" />
            <line x1={540} y1={1480} x2={780} y2={1530} stroke="#2a2f45" strokeWidth={22} strokeLinecap="round" />
          </g>
          <circle cx={840} cy={1380} r={44} fill="#0d0f18" stroke="#2a2f45" strokeWidth={6} />
          <rect x={832} y={1352} width={16} height={46} rx={4} fill="#d9a441" stroke="#0a0c14" strokeWidth={4} transform={`rotate(${keyA} 840 1380)`} />
          <circle cx={220} cy={1360} r={26} fill="#ff4d4d" opacity={f > 12 ? pulse : 0.1} />
          <g transform="translate(1080 0)">
            <rect x={0} y={0} width={1080} height={240} fill="#0d0f18" />
            <rect x={0} y={0} width={70} height={1920} fill="#0d0f18" />
            <rect x={1010} y={0} width={70} height={1920} fill="#0d0f18" />
            <path d="M0 1380 Q540 1280 1080 1380 L1080 2000 L0 2000 Z" fill="#141722" stroke="#0a0c14" strokeWidth={8} />
            <rect x={170} y={1000} width={740} height={340} rx={40} fill="#0b0e16" stroke="#2a2f45" strokeWidth={8} />
            <text x={540} y={1190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#ff4d4d" opacity={0.6 + 0.4 * pulse} style={{ filter: 'drop-shadow(0 0 18px #ff2a2a)' }}>
              8:01
            </text>
            <text x={540} y={1280} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffb347">
              ENGINE LOCKED
            </text>
            <circle cx={230} cy={1060} r={14} fill="#ff4d4d" opacity={pulse} />
            <circle cx={850} cy={1060} r={14} fill="#ff4d4d" opacity={1 - pulse * 0.5} />
          </g>
        </Layer>
      </Cam>
      <PopText text="CLICK" frame={f} start={14} end={30} top="30%" size={84} color="#ffd166" />
      <PopText text="CLICK" frame={f} start={34} end={50} top="30%" size={84} color="#ffd166" />
      <SpeedLines f={f} o={ip(f, [62, 70, 78], [0, 0.6, 0])} />
      <Tint c="#3a4a8a" o={0.1} />
      <Vignette strength={0.8} />
      <CaptionText text="Then my car wouldn’t start if I left even one minute past schedule." frame={f} start={2} end={135} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 7 — front-facing TRACKING shot out the door, look back, SLAM punch-in
 * ------------------------------------------------------------------------- */
export const SceneSeven: React.FC<SP> = ({ frame: f }) => {
  const sx = ip(f, [4, 54], [780, 1100], Easing.inOut(Easing.quad));
  const walking = f >= 4 && f < 56;
  const camX = sx - 440;
  const closed = ip(f, [78, 84], [0, 1], IN);
  const leaf = 0.22 + 0.78 * closed;
  const p = ip(f, [56, 78], [1, 0], INOUT);
  const C = 2 * Math.PI * 70;
  const yaw = f < 56 ? ip(f, [0, 12], [60, 88]) : ip(f, [56, 72], [88, -18], OUT);
  const jolt = kick(f, 80, 16);
  const sh = shake(f, 2.5, 7);
  const lockS = ip(f, [82, 96], [0, 1], BACK);
  const startle = ip(f, [80, 86], [0, 1], OUT);
  const cam = camAt(f, [
    { t: 0, zoom: 1.25, y: -70, rx: -7, ry: 9, rot: 1 },
    { t: 56, zoom: 1.08, y: 0, rx: 0, ry: -4, rot: 0 },
    { t: 78, zoom: 1.15, rx: -4, ry: -6 },
    { t: 88, zoom: 1.5, y: -30, rx: -9, ry: -2, rot: 3, e: OUT },
    { t: 140, zoom: 1.62, rx: -5, ry: 3, rot: -2, e: SOFT },
  ]);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#f7b267 0%,#f48c5a 45%,#c4566a 100%)' }}>
      <Cam cam={cam} sh={{ x: sh.x + jolt, y: sh.y + jolt * 0.6, r: sh.r + jolt * 0.05 }} ox={41} oy={62}>
        <TownLayers cx={camX} f={f} mood={MOOD.sunrise} walkers birds clouds="#ffd0a0" />
        <Layer d={1} cx={camX}>
          <polygon points="440,660 960,440 1480,660" fill="#6a3a4a" stroke="#0a0c14" strokeWidth={8} />
          <rect x={480} y={640} width={1020} height={650} fill="#a8606a" stroke="#0a0c14" strokeWidth={8} />
          <rect x={1160} y={800} width={190} height={170} fill="#ffe9a8" stroke="#0a0c14" strokeWidth={8} />
          <rect x={675} y={970} width={170} height={320} fill="#ffcf7a" stroke="#0a0c14" strokeWidth={10} />
          <g transform={`translate(675 1290) scale(${leaf} 1)`}>
            <rect x={0} y={-320} width={170} height={320} fill="#4a2a3a" stroke="#0a0c14" strokeWidth={10 / Math.max(leaf, 0.3)} />
            <circle cx={140} cy={-150} r={9} fill="#e0b050" />
          </g>
          {f >= 54 && (
            <g opacity={ip(f, [54, 60], [0, 1], OUT) * (1 - closed)}>
              <circle cx={760} cy={760} r={70} fill="none" stroke="#0a0c14" strokeWidth={22} />
              <circle cx={760} cy={760} r={70} fill="none" stroke={p > 0.4 ? '#ffd166' : '#ff4d4d'} strokeWidth={14} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 760 760)" />
            </g>
          )}
          <g transform={`translate(760 880) scale(${lockS})`} opacity={lockS > 0 ? 1 : 0}>
            <path d="M-26 -10 L-26 -34 A26 26 0 0 1 26 -34 L26 -10" fill="none" stroke="#0a0c14" strokeWidth={14} />
            <rect x={-40} y={-12} width={80} height={62} rx={10} fill="#ff4d4d" stroke="#0a0c14" strokeWidth={8} />
          </g>
          <g opacity={ip(f, [0, 6], [0, 1])}>
            <Character
              x={sx}
              y={1330}
              s={1.5}
              pose={{
                yaw,
                walk: walking ? f * 0.55 : null,
                headYaw: f >= 56 ? -ip(f, [60, 76], [0, 40], OUT) : 0,
                mouth: ip(f, [80, 86], [0, 0.9], OUT) * (f < 100 ? 1 : 0.6),
                shrug: ip(f, [84, 92], [0, 1], OUT),
                sweat: ip(f, [84, 100], [0, 1], OUT),
                brow: f > 80 ? 0.8 : 0,
                browH: startle * 0.8,
                eyes: 1 + startle * 0.3,
                smile: f > 80 ? -0.4 : 0.3,
                gaze: [f > 62 ? -0.9 : 0.6, 0],
                lean: startle * -5 * Math.exp(-(f - 80) / 20),
              }}
            />
          </g>
        </Layer>
        <Layer d={1.6} cx={camX} blur={3}>
          <rect x={-300} y={1520} width={2800} height={14} fill="#0a0c14" opacity={0.65} />
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={i} x={-300 + i * 150} y={1460} width={16} height={150} fill="#0a0c14" opacity={0.65} />
          ))}
        </Layer>
      </Cam>
      <PopText text="LOCKED" frame={f} start={82} top="20%" size={110} color="#ff5a4d" glow="#ff2a2a" />
      <LightLeak f={f} color="#ffd08a" o={0.3} />
      <Tint c="#ff8a4a" o={0.07} />
      <Vignette />
      <CaptionText text="My own front door locked behind me if I hesitated too long leaving the house." frame={f} start={2} end={135} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 8 — hero TRACKING ORBIT: low-angle front 3/4 -> profile -> high rear
 * ------------------------------------------------------------------------- */
export const SceneEight: React.FC<SP> = ({ frame: f }) => {
  const hx = 300 + f * 4.6;
  const camX = hx - 540;
  const cam = camAt(f, [
    { t: 0, zoom: 1.35, y: -80, rx: -12, ry: -11, rot: -1.5 },
    { t: 38, zoom: 1.05, y: 10, rx: -3, ry: 0, rot: 0 },
    { t: 75, zoom: 1.12, y: 0, rx: 5, ry: 7, rot: 1 },
    { t: 120, zoom: 1.4, y: -30, rx: 10, ry: 14, rot: 0 },
  ]);
  const sh = shake(f, 2, 8);
  const yaw = ip(f, [0, 110], [28, 152], SOFT);
  const clocks = [-500, 300, 1100, 1900].map((x) => ({ x, h: 9, m: 41 }));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#ffd29a 0%,#f4a06a 50%,#d8606a 100%)' }}>
      <Cam cam={cam} sh={sh} oy={64}>
        <TownLayers cx={camX} f={f} mood={MOOD.sunrise} postClocks={clocks} tower={{ h: 9, m: 41 }} walkers cars birds clouds="#ffe2b8" />
        <Layer d={1} cx={camX}>
          <circle cx={hx} cy={1180} r={260} fill="#fff0b0" opacity={0.14} />
          <Character
            x={hx}
            y={1420}
            s={1.6}
            pose={{
              yaw,
              walk: f * 0.55,
              smile: 0.75,
              browH: 0.35,
              mouth: f % 40 < 14 ? 0.35 : 0,
              gaze: [0.7, -0.1],
              tilt: Math.sin(f * 0.27) * 2,
              lean: -3,
              seed: 8,
            }}
          />
        </Layer>
        <Layer d={1.7} cx={camX} blur={5}>
          <rect x={-60} y={640} width={46} height={1400} fill="#3a1c30" />
          <rect x={1100} y={700} width={46} height={1400} fill="#3a1c30" />
        </Layer>
      </Cam>
      <DustField f={f} color="#fff0b0" op={0.5} n={30} />
      <SpeedLines f={f} o={0.12} />
      <LightLeak f={f} color="#fff0b0" o={0.4} speed={1} />
      <Tint c="#ff9a4a" o={0.08} />
      <Vignette />
      <CaptionText text="I thought I was losing control. But I wasn’t late. Not once." frame={f} start={2} end={120} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 9 — SPLIT SCREEN: his side slow push, her side handheld + dutch roll
 * ------------------------------------------------------------------------- */
export const SceneNine: React.FC<SP> = ({ frame: f }) => {
  const sh = shake(f, 6, 9);
  const cry = Math.abs(Math.sin(f * 0.5));
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.3);
  const topZoom = ip(f, [0, 165], [1.02, 1.2], SOFT);
  const topX = ip(f, [0, 165], [30, -30], SOFT);
  const botZoom = ip(f, [0, 165], [1.05, 1.22], INOUT);
  const botRot = ip(f, [0, 165], [-2.5, 2.5], SOFT);
  return (
    <AbsoluteFill style={{ background: '#10131f' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '50%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${topX}px,0) scale(${topZoom})`, transformOrigin: '50% 62%' }}>
          <svg width="100%" height="100%" viewBox="0 0 1080 960">
            <defs>
              <linearGradient id="s9top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2b3566" />
                <stop offset="1" stopColor="#141831" />
              </linearGradient>
            </defs>
            <rect width={1080} height={960} fill="url(#s9top)" />
            <g transform={`translate(${topX * -0.6} 0)`}>
              <rect x={90} y={330} width={260} height={330} fill="#0c1230" stroke="#0a0c14" strokeWidth={8} />
              {Array.from({ length: 10 }).map((_, i) => (
                <rect key={i} x={110 + (i % 5) * 46} y={360 + Math.floor(i / 5) * 90} width={22} height={34} fill="#ffd98a" opacity={0.7} />
              ))}
              <circle cx={930} cy={430} r={190} fill="#ffd98a" opacity={0.1 + 0.03 * pulse} />
              <rect x={900} y={430} width={14} height={470} fill="#0a0c14" />
            </g>
            <rect x={0} y={880} width={1080} height={80} fill="#0e1124" />
            <Character
              x={540}
              y={905}
              s={1.35}
              pose={{
                yaw: ip(f, [0, 165], [-22, 18], SOFT),
                armR: GESTURE.phoneR,
                hold: <Phone glow={0.5 + 0.5 * pulse} />,
                mouth: talk(f, 20, 140, 0.45) * 0.5,
                tilt: -5,
                brow: 0.8,
                browH: 0.2,
                smile: -0.25,
                gaze: [-0.5, 0.5],
                sweat: ip(f, [60, 100], [0, 0.8], OUT),
                seed: 1,
              }}
            />
          </svg>
        </div>
        <Vignette strength={0.7} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: '50%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) rotate(${botRot + sh.r}deg) scale(${botZoom})`, transformOrigin: '55% 40%' }}>
          <svg width="100%" height="100%" viewBox="0 0 1080 960">
            <defs>
              <linearGradient id="s9bot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1a0f1e" />
                <stop offset="1" stopColor="#2a1020" />
              </linearGradient>
              <clipPath id="s9clip">
                <path d="M425 282 L478 150 L712 150 L772 276 Z" />
              </clipPath>
            </defs>
            <rect width={1080} height={960} fill="url(#s9bot)" />
            {BOKEH.slice(0, 14).map((b, i) => (
              <circle key={i} cx={(b.x + 200) * 0.45} cy={120 + (b.y % 300)} r={b.r * 0.5} fill="hsl(355,90%,55%)" opacity={0.2 + 0.2 * Math.sin((f + b.ph) * 0.15)} />
            ))}
            <rect x={-80} y={300} width={220} height={140} rx={30} fill="#190f1d" />
            <rect x={950} y={300} width={260} height={140} rx={30} fill="#190f1d" />
            <rect x={0} y={440} width={1080} height={520} fill="#171019" />
            {Array.from({ length: 7 }).map((_, i) => (
              <rect key={i} x={((i * 180 - f * 6) % 1260) - 100} y={620} width={110} height={12} rx={5} fill="#3a2a3a" />
            ))}
            <circle cx={170} cy={340} r={120} fill="#ff2a3a" opacity={0.15 + 0.2 * pulse} />
            <path d="M170 440 L170 340 Q170 300 215 295 L370 280 Q410 130 480 118 L720 118 Q790 125 820 270 L880 290 Q920 305 920 345 L920 440 Z" fill="#7a2a3a" stroke="#0a0c14" strokeWidth={8} />
            <path d="M425 282 L478 150 L712 150 L772 276 Z" fill="#1a2236" stroke="#0a0c14" strokeWidth={6} />
            <g clipPath="url(#s9clip)">
              <Character
                x={598}
                y={486}
                s={0.95}
                look={MAYA}
                shadow={false}
                pose={{
                  yaw: -18 + Math.sin(f * 0.1) * 5,
                  armR: GESTURE.phoneR,
                  hold: <Phone glow={0.8} />,
                  mouth: cry * 0.9,
                  tilt: Math.sin(f * 0.5) * 5,
                  brow: 1,
                  browH: 0.4,
                  smile: -0.9,
                  eyes: 0.8,
                  tear: 1,
                  gaze: [0.4, 0.5],
                  lean: Math.sin(f * 0.5) * 2,
                  seed: 5,
                }}
              />
            </g>
            <rect x={170} y={310} width={22} height={40} fill="#ff2a3a" opacity={0.5 + 0.5 * pulse} />
            <circle cx={300} cy={440} r={55} fill="#14161f" stroke="#0a0c14" strokeWidth={8} />
            <circle cx={780} cy={440} r={55} fill="#14161f" stroke="#0a0c14" strokeWidth={8} />
            <circle cx={300} cy={440} r={20} fill="#3a3f55" />
            <circle cx={780} cy={440} r={20} fill="#3a3f55" />
          </svg>
          <RainField f={f} color="#9fc4ff" vbH={960} />
        </div>
        <Vignette strength={0.75} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 8,
          marginTop: -4,
          background: 'linear-gradient(90deg, rgba(110,193,255,0), #6ec1ff, rgba(110,193,255,0))',
          opacity: 0.7 + 0.3 * pulse,
          boxShadow: '0 0 24px #6ec1ff',
        }}
      />
      <CaptionText text="Then last night, my best friend called, crying, stuck in traffic, begging me to wait for her." frame={f} start={2} end={165} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 10 — EXTREME CLOSE-UP on his eyes, hard cut to MACRO dolly on the watch
 * ------------------------------------------------------------------------- */
const CUT = 26;
export const SceneTen: React.FC<SP> = ({ frame: f }) => {
  if (f < CUT) {
    const cam = camAt(f, [
      { t: 0, zoom: 1.0, rot: -3, x: 40, ry: -6 },
      { t: CUT, zoom: 1.22, rot: 0, x: -20, ry: 4 },
    ]);
    return (
      <AbsoluteFill style={{ background: 'linear-gradient(180deg,#1b1f3a 0%,#0f1224 100%)' }}>
        <Cam cam={cam} sh={shake(f, 3, 4)} oy={46}>
          <Bokeh f={f} cx={0} blur={14} o={0.14} scaleX={0.5} />
          <Layer d={1} cx={0}>
            <Character
              x={540}
              y={3760}
              s={10}
              shadow={false}
              pose={{
                yaw: -6,
                brow: 1,
                browH: 0.6,
                eyes: 1.18,
                smile: -0.3,
                mouth: 0,
                gaze: [ip(f, [2, 9], [0.9, -0.1]), ip(f, [12, 20], [0, 1])],
                sweat: ip(f, [0, 10], [0.4, 1]),
                seed: 10,
              }}
            />
          </Layer>
        </Cam>
        <Tint c="#ff2a3a" o={0.06} />
        <Vignette strength={0.85} />
        <CaptionText text="I checked my watch. Nine fifty-nine. She needed one more minute." frame={f} start={2} end={120} />
      </AbsoluteFill>
    );
  }
  const g = f - CUT;
  const cam = camAt(g, [
    { t: 0, zoom: 1.0, rx: 6, ry: -9, rot: -3 },
    { t: 90, zoom: 2.5, rx: 0, ry: 3, rot: 0 },
  ]);
  const sh = shake(f, ip(g, [0, 90], [2, 5], INOUT), 4);
  const secVal = 53 + ip(g, [44, 48], [0, 1], BACK);
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.25);
  const flash = ip(g, [0, 3, 10], [0.7, 0.4, 0], OUT);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#1b1f3a 0%,#0f1224 100%)' }}>
      <Cam cam={cam} sh={sh} oy={50}>
        <Bokeh f={f} cx={0} blur={12} o={0.12} scaleX={0.5} />
        <Layer d={1} cx={0}>
          {/* sleeve, skin forearm, hand */}
          <rect x={430} y={1380} width={220} height={700} rx={30} fill="#e8553d" stroke="#0a0c14" strokeWidth={10} />
          <rect x={420} y={1340} width={240} height={70} rx={20} fill="#b73a2a" stroke="#0a0c14" strokeWidth={10} />
          <rect x={460} y={300} width={160} height={1060} rx={44} fill="#f2c8a2" stroke="#0a0c14" strokeWidth={10} />
          <ellipse cx={540} cy={220} rx={150} ry={170} fill="#f2c8a2" stroke="#0a0c14" strokeWidth={10} />
          {[-96, -32, 32, 96].map((o, i) => (
            <rect key={i} x={540 + o - 28} y={-120} width={56} height={230} rx={28} fill="#f2c8a2" stroke="#0a0c14" strokeWidth={8} />
          ))}
          <rect x={650} y={940} width={34} height={40} rx={8} fill="#c8a040" stroke="#0a0c14" strokeWidth={6} />
          <rect x={430} y={540} width={220} height={240} rx={26} fill="#2a2f40" stroke="#0a0c14" strokeWidth={10} />
          <rect x={430} y={1140} width={220} height={200} rx={26} fill="#2a2f40" stroke="#0a0c14" strokeWidth={10} />
          <circle cx={540} cy={960} r={206} fill="#2a2f40" stroke="#0a0c14" strokeWidth={12} />
          <circle cx={540} cy={960} r={206} fill="none" stroke="#ff4d4d" strokeWidth={4} opacity={0.3 + 0.4 * pulse} />
          <Clock cx={540} cy={960} r={170} h={9} m={59 + secVal / 60} sec={secVal} />
          <path d="M400 760 Q540 700 680 760" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.18} />
        </Layer>
      </Cam>
      <DustField f={f} color="#ffd98a" op={0.35} n={25} />
      <PopText text="9:59" frame={g} start={26} top="16%" size={124} color="#ff6b5a" glow="#ff2a2a" />
      <Tint c="#ffffff" o={flash} />
      <Tint c="#ff2a3a" o={0.05 + 0.04 * pulse} />
      <Vignette strength={0.85} />
      <CaptionText text="I checked my watch. Nine fifty-nine. She needed one more minute." frame={f} start={2} end={120} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 11 — held CLOSE-UP, rack focus, tears, slow imperceptible push
 * ------------------------------------------------------------------------- */
export const SceneEleven: React.FC<SP> = ({ frame: f }) => {
  const cam = camAt(f, [
    { t: 0, zoom: 1.0, ry: -4, x: 20, rx: 2 },
    { t: 84, zoom: 1.1, ry: 3, x: -10, rx: 0 },
  ], SOFT);
  const mouth = f < 38 ? talk(f, 2, 38, 0.6) * 0.8 : 0.12 * Math.abs(Math.sin(f * 0.9));
  const glow = 0.7 + 0.3 * Math.sin(f * 0.12);
  const bgBlur = ip(f, [0, 40], [20, 12], OUT);
  const sob = f > 38 ? Math.sin(f * 0.8) * 1.2 : 0;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0f1c2a 0%,#12242e 100%)' }}>
      <Cam cam={cam} sh={{ x: 0, y: sob, r: 0 }} oy={50}>
        <Layer d={0.3} cx={0} blur={bgBlur}>
          {BOKEH.slice(0, 10).map((b, i) => (
            <circle key={i} cx={b.x * 0.5} cy={b.y} r={b.r} fill="#4a9aa8" opacity={0.1 * glow + 0.04} />
          ))}
          <circle cx={900} cy={600} r={240} fill="#ffe2a0" opacity={0.1 * glow} />
        </Layer>
        <Layer d={1} cx={0}>
          <Character
            x={470}
            y={2230}
            s={4.5}
            shadow={false}
            pose={{
              yaw: -18,
              armR: GESTURE.phoneR,
              hold: <Phone glow={0.8} />,
              mouth,
              tilt: -6 + sob,
              brow: 1,
              browH: 0.3,
              smile: -0.7,
              eyes: 0.85,
              tear: ip(f, [0, 20], [0.4, 1]),
              gaze: [-0.4, 0.6],
              seed: 11,
            }}
          />
        </Layer>
      </Cam>
      <LightLeak f={f} color="#5ad0e0" o={0.12} />
      <Tint c="#2a6a7a" o={0.12} />
      <Vignette strength={0.85} />
      <CaptionText text="I said, ‘I’m sorry... I can’t be late.’" frame={f} start={2} end={84} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------------------
 * Scene 12 — CRANE-UP pull-back orbit to a high-angle wide, cut to black
 * ------------------------------------------------------------------------- */
export const SceneTwelve: React.FC<SP> = ({ frame: f }) => {
  const ang = ip(f, [0, 150], [0, Math.PI * 0.9], INOUT);
  const camX = Math.sin(ang) * 260;
  const cam = camAt(f, [
    { t: 0, zoom: 2.5, y: 160, rx: -9, ry: -12, rot: 2 },
    { t: 60, zoom: 1.6, y: 40, rx: 2, ry: -2, rot: 0 },
    { t: 150, zoom: 0.8, y: -120, rx: 15, ry: 14, rot: -1 },
  ]);
  const sh = shake(f, 1.8, 12);
  const clocks = [-500, 300, 1100, 1900].map((x) => ({ x, h: 12, m: 0 }));
  const black = ip(f, [136, 141], [0, 1], IN);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0a0f1c 0%,#1b2433 70%,#222a36 100%)' }}>
      <Cam cam={cam} sh={sh} oy={63}>
        <TownLayers cx={camX} f={f} mood={MOOD.cold} stars walkers cars postClocks={clocks} tower={{ h: 12, m: 0 }} />
        <Layer d={1} cx={camX}>
          <Character
            x={540}
            y={1420}
            s={1.4}
            pose={{
              yaw: ip(f, [0, 150], [-8, 155], INOUT),
              tilt: -9,
              lean: 4,
              brow: 1,
              browH: 0.2,
              smile: -0.7,
              eyes: 0.8,
              mouth: 0,
              gaze: [0, 0.8],
              armR: [10, 12],
              armL: [-10, -12],
              tear: 0.6,
            }}
          />
        </Layer>
        <Layer d={1.5} cx={camX} blur={4}>
          <ellipse cx={540} cy={1500} rx={900} ry={60} fill="#cfe6ff" opacity={0.06 + 0.02 * Math.sin(f * 0.08)} />
        </Layer>
      </Cam>
      <DustField f={f} color="#cfe6ff" op={0.35} n={35} />
      <Tint c="#0a1020" o={ip(f, [100, 150], [0, 0.35], INOUT)} />
      <Vignette strength={0.85} />
      <CaptionText text="In this town, resolutions don’t care who gets hurt. They just care that you keep them." frame={f} start={2} end={141} />
      <Tint c="#05060a" o={black} />
    </AbsoluteFill>
  );
};
