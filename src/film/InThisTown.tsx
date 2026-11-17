import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Grain, IN, INOUT, OUT, SCENES, ip } from './core';
import { SceneOne, SceneTwo, SceneThree, SceneFour, SceneFive, SceneSix, SceneSeven, SceneEight, SceneNine, SceneTen, SceneEleven, SceneTwelve } from './scenes';

export const compositionConfig = {
  id: 'InThisTown',
  durationInSeconds: 43,
  fps: 30,
  width: 1080,
  height: 1920,
};

export type SceneKey = keyof typeof SCENES;
export const SCENE_INFO: { k: SceneKey; title: string; shot: string }[] = [
  { k: 's1', title: 'The Town', shot: 'Low-angle crane down from the clock tower, then a full 360° orbit' },
  { k: 's2', title: 'The Resolution', shot: 'Arcing close-up with rack focus, freeze-frame punch-in' },
  { k: 's3', title: 'Harmless', shot: 'Tight shrug, then a side tracking shot to the door' },
  { k: 's4', title: 'Gone', shot: 'Low-angle macro, vanish, dutch push-in, hand pats the empty table' },
  { k: 's5', title: 'Suspicion', shot: 'High-to-low arc around him, he turns and stares down the lens' },
  { k: 's6', title: 'Car Won’t Start', shot: 'Dutch close-up, ignition shake, whip pan to the dashboard' },
  { k: 's7', title: 'Locked Out', shot: 'Front tracking shot, look-back, low-angle slam punch-in' },
  { k: 's8', title: 'On Time', shot: 'Tracking orbit: low front → profile → high rear' },
  { k: 's9', title: 'The Call', shot: 'Split screen: slow push vs. handheld dutch roll in the rain' },
  { k: 's10', title: '9:59', shot: 'Extreme close-up of the eyes, hard cut to macro dolly on the watch' },
  { k: 's11', title: 'Sorry', shot: 'Held close-up, rack focus, tears, imperceptible push' },
  { k: 's12', title: 'The Law', shot: 'Crane-up pull-back orbit to a high-angle wide, cut to black' },
];

const SCENE_COMP: Record<SceneKey, React.FC<{ frame: number }>> = {
  s1: SceneOne,
  s2: SceneTwo,
  s3: SceneThree,
  s4: SceneFour,
  s5: SceneFive,
  s6: SceneSix,
  s7: SceneSeven,
  s8: SceneEight,
  s9: SceneNine,
  s10: SceneTen,
  s11: SceneEleven,
  s12: SceneTwelve,
};

/* Transition INTO scene k (boundary between k-1 and k) */
type Tr = 'push' | 'whipL' | 'whipU' | 'flash' | 'iris' | 'roll' | 'dip' | 'dissolve';
const TRANSITIONS: Record<SceneKey, Tr> = {
  s1: 'dissolve',
  s2: 'push',
  s3: 'whipL',
  s4: 'flash',
  s5: 'iris',
  s6: 'whipU',
  s7: 'push',
  s8: 'roll',
  s9: 'whipL',
  s10: 'push',
  s11: 'dip',
  s12: 'dissolve',
};
const T = 15;

/** p: 0..1 progress of the transition */
const trStyle = (type: Tr, p: number, role: 'in' | 'out'): React.CSSProperties => {
  const e = INOUT(p);
  switch (type) {
    case 'push':
      return role === 'out'
        ? { transform: `scale(${1 + IN(p) * 0.9})`, filter: `blur(${IN(p) * 16}px)`, opacity: 1 - ip(p, [0.55, 1], [0, 1], OUT) }
        : { transform: `scale(${1.35 - OUT(p) * 0.35})`, filter: `blur(${(1 - OUT(p)) * 14}px)`, opacity: ip(p, [0, 0.5], [0, 1], OUT) };
    case 'whipL':
      return role === 'out'
        ? { transform: `translateX(${-e * 1180}px)`, filter: `blur(${Math.sin(p * Math.PI) * 26}px)` }
        : { transform: `translateX(${(1 - e) * 1180}px)`, filter: `blur(${Math.sin(p * Math.PI) * 26}px)` };
    case 'whipU':
      return role === 'out'
        ? { transform: `translateY(${-e * 2000}px)`, filter: `blur(${Math.sin(p * Math.PI) * 26}px)` }
        : { transform: `translateY(${(1 - e) * 2000}px)`, filter: `blur(${Math.sin(p * Math.PI) * 26}px)` };
    case 'roll':
      return role === 'out'
        ? { transform: `rotate(${e * 18}deg) scale(${1 + e * 0.5})`, opacity: 1 - ip(p, [0.4, 1], [0, 1]) }
        : { transform: `rotate(${(1 - e) * -18}deg) scale(${1.4 - e * 0.4})`, opacity: ip(p, [0, 0.6], [0, 1]) };
    case 'iris':
      return role === 'out' ? {} : { clipPath: `circle(${e * 140}% at 50% 50%)` };
    case 'flash':
      return role === 'out' ? { opacity: 1 - ip(p, [0.3, 1], [0, 1]) } : { opacity: ip(p, [0, 0.7], [0, 1]) };
    case 'dip':
      return role === 'out' ? { opacity: 1 - ip(p, [0, 0.55], [0, 1]) } : { opacity: ip(p, [0.45, 1], [0, 1]) };
    default:
      return role === 'out' ? { opacity: 1 - e } : { opacity: e };
  }
};

const InThisTown: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const keys = Object.keys(SCENES) as SceneKey[];

  // flash overlay for flash/iris transitions
  let flash = 0;
  keys.forEach((k, i) => {
    if (i === 0) return;
    const tr = TRANSITIONS[k];
    const p = (frame - SCENES[k].start) / T;
    if (p >= 0 && p <= 1 && (tr === 'flash' || tr === 'iris')) flash = Math.max(flash, Math.sin(p * Math.PI) * (tr === 'flash' ? 0.9 : 0.35));
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0d16', width, height, overflow: 'hidden' }}>
      {keys.map((k, i) => {
        const sc = SCENES[k];
        const last = i === keys.length - 1;
        if (frame < sc.start || frame > sc.end + (last ? 0 : T)) return null;
        const C = SCENE_COMP[k];

        let style: React.CSSProperties = {};
        const inP = (frame - sc.start) / T;
        if (i === 0) {
          style = { opacity: ip(frame, [0, 10], [0, 1]) };
        } else if (inP < 1) {
          style = trStyle(TRANSITIONS[k], Math.max(0, inP), 'in');
        }
        const nextK = keys[i + 1];
        if (nextK) {
          const outP = (frame - sc.end) / T;
          if (outP > 0) style = trStyle(TRANSITIONS[nextK], Math.min(1, outP), 'out');
        }
        return (
          <AbsoluteFill key={k} style={style}>
            <C frame={frame - sc.start} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: '#fff4dc', opacity: flash, pointerEvents: 'none' }} />
      <Grain f={frame} />
    </AbsoluteFill>
  );
};

export default InThisTown;
