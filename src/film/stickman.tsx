import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GESTURE, Look, Pose, SAM } from './character';

type Point = [number, number];
const rad = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * A deliberately graphic, 2D stick-figure character. The rig stays in the same
 * coordinate space and accepts the same poses as the original character so all
 * existing shots and Remotion timelines keep working.
 */
export const Stickman: React.FC<{
  x: number;
  y: number;
  s?: number;
  pose?: Pose;
  look?: Look;
  shadow?: boolean;
}> = ({ x, y, s = 1, pose = {}, look = SAM, shadow = true }) => {
  const frame = useCurrentFrame();
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

  const ink = '#11131d';
  const accent = look.top;
  const breath = Math.sin((frame + seed * 17) * 0.1);
  const stride = walk === null ? 0 : Math.sin(walk);
  const bob = walk === null ? 0 : -Math.abs(Math.cos(walk)) * 8;
  const shoulderY = -214 - shrug * 12 + breath;
  const hipY = -120;
  const faceFront = Math.cos(rad(yaw + headYaw)) > -0.15;
  const width = Math.max(0.52, Math.abs(Math.cos(rad(yaw))));
  const blinkCycle = (frame + seed * 31) % 96;
  const blink = blinkCycle < 5 ? Math.sin((blinkCycle / 5) * Math.PI) : 0;
  const eyeOpen = Math.max(0, eyes) * (1 - blink);

  const point = (origin: Point, angle: number, length: number): Point => [
    origin[0] + Math.sin(rad(angle)) * length,
    origin[1] + Math.cos(rad(angle)) * length,
  ];

  const limb = (d: string, color = '#f6f1e8', widthPx = 10) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={ink} strokeWidth={widthPx + 9} />
      <path d={d} stroke={color} strokeWidth={widthPx} />
      <path d={d} stroke={accent} strokeWidth={2.5} opacity={0.9} />
    </g>
  );

  const legs = (side: -1 | 1) => {
    const swing = walk === null ? 0 : -side * stride * 29;
    const kneeAngle = swing - (walk === null ? 0 : Math.max(0, -swing / 29) * 32);
    const hip: Point = [side * 13 * width, hipY];
    const knee = point(hip, swing + side * 4, 61);
    const foot = point(knee, kneeAngle, 60);
    return { hip, knee, foot, path: `M${hip[0]} ${hip[1]} L${knee[0]} ${knee[1]} L${foot[0]} ${foot[1]}` };
  };

  const arms = (side: -1 | 1) => {
    const base = side < 0 ? armL : armR;
    const upper = base[0] + (side * 48 - base[0]) * shrug + Math.sin(frame * 0.08 + side + seed) * 1.5;
    const forearm = base[1] + (side * 122 - base[1]) * shrug;
    const shoulder: Point = [side * 33 * width, shoulderY];
    const elbow = point(shoulder, upper, 53);
    const hand = point(elbow, forearm, 49);
    return { shoulder, elbow, hand, path: `M${shoulder[0]} ${shoulder[1]} L${elbow[0]} ${elbow[1]} L${hand[0]} ${hand[1]}` };
  };

  const leftLeg = legs(-1);
  const rightLeg = legs(1);
  const leftArm = arms(-1);
  const rightArm = arms(1);
  const eye = (side: -1 | 1) => (
    <g key={side}>
      {eyeOpen > 0.12 ? (
        <>
          <ellipse cx={side * 15} cy={-5} rx={6} ry={Math.max(1.2, 8 * eyeOpen)} fill="#fffdf8" />
          <circle cx={side * 15 + gaze[0] * 3} cy={-5 + gaze[1] * 3} r={3.3} fill={ink} />
          <circle cx={side * 15 + gaze[0] * 3 + 1} cy={-6 + gaze[1] * 3} r={1} fill="#fff" />
        </>
      ) : (
        <path d={`M${side * 21 - 5} -4 Q${side * 15} 0 ${side * 9} -4`} fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
      )}
      {tear > 0 && <path d={`M${side * 18} 7 q6 9 0 15 q-6 -6 0 -15`} fill="#79cdf5" opacity={tear * 0.85} />}
      {look.glasses && <circle cx={side * 15} cy={-5} r={11} fill="#bfe6ff" fillOpacity={0.12} stroke={ink} strokeWidth={3} />}
    </g>
  );

  const mouthWidth = 8 + Math.max(0, smile) * 3;
  const mouthElement = mouth > 0.08 ? (
    <g>
      <path d={`M${-mouthWidth} 18 Q0 ${21 + mouth * 12} ${mouthWidth} 18 Q0 ${30 + mouth * 22} ${-mouthWidth} 18 Z`} fill="#5a2025" stroke={ink} strokeWidth={2.5} />
      {mouth > 0.32 && <path d={`M-5 25 Q0 23 5 25`} stroke="#fff4e8" strokeWidth={2} fill="none" />}
    </g>
  ) : (
    <path d={`M${-mouthWidth} 19 Q0 ${23 - smile * 5} ${mouthWidth} 19`} fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
  );

  const hair = look.hairStyle === 'bald' ? null : look.hairStyle === 'curly' ? (
    <g fill={look.hair} stroke={ink} strokeWidth={3}>
      {[-25, -13, 0, 13, 25].map((cx, i) => <circle key={cx} cx={cx} cy={-34 - (i % 2) * 5} r={11} />)}
    </g>
  ) : (
    <path d="M-34 -14 C-42 -47 -20 -57 0 -54 C25 -57 41 -41 34 -13 Q20 -34 4 -29 Q-14 -39 -34 -14 Z" fill={look.hair} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
  );

  const drawArm = (arm: ReturnType<typeof arms>, side: -1 | 1, prop?: React.ReactNode) => (
    <g key={side}>
      {limb(arm.path, look.skin, 8)}
      <circle cx={arm.hand[0]} cy={arm.hand[1]} r={8} fill={look.skin} stroke={ink} strokeWidth={3} />
      {prop && <g transform={`translate(${arm.hand[0]} ${arm.hand[1]})`}>{prop}</g>}
    </g>
  );

  return (
    <g transform={`translate(${x} ${y + bob * s}) scale(${s})`}>
      {shadow && <ellipse cx={0} cy={3 - bob} rx={47} ry={9} fill="#05060c" opacity={0.35} />}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {limb(leftLeg.path, look.pants, 11)}
        {limb(rightLeg.path, look.pants, 11)}
        {[-1, 1].map((side) => {
          const foot = side < 0 ? leftLeg.foot : rightLeg.foot;
          return <ellipse key={side} cx={foot[0] + 8} cy={foot[1] + 2} rx={12} ry={7} fill={look.shoes} stroke={ink} strokeWidth={3.5} />;
        })}

        {limb(leftArm.path, look.top, 9)}
        {limb(rightArm.path, look.top, 9)}
        {drawArm(leftArm, -1, holdL)}
        {drawArm(rightArm, 1, hold)}

        {/* Simple graphic torso: the silhouette stays unmistakably stickman. */}
        <path d="M0 -216 L0 -120" stroke={ink} strokeWidth={24} strokeLinecap="round" />
        <path d="M0 -216 L0 -120" stroke="#f6f1e8" strokeWidth={14} strokeLinecap="round" />
        <path d="M0 -210 L0 -125" stroke={accent} strokeWidth={4} strokeLinecap="round" />
        <path d="M-13 -121 Q0 -112 13 -121" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />

        <g transform={`translate(0 ${-282 + breath * 1.2}) rotate(${tilt}) scale(${width}, 1)`}>
          {look.hairStyle === 'long' && <path d="M-31 -28 Q-40 5 -33 36 L-22 31 L-25 -14 M31 -28 Q40 5 33 36 L22 31 L25 -14" fill={look.hair} stroke={ink} strokeWidth={4} />}
          {look.beanie && <g><path d="M-36 -20 Q-36 -54 0 -56 Q36 -54 36 -20 Z" fill={look.beanie} stroke={ink} strokeWidth={4} /><path d="M-38 -19 L38 -19" stroke={ink} strokeWidth={7} strokeLinecap="round" /></g>}
          <circle cx={0} cy={0} r={37} fill={look.skin} stroke={ink} strokeWidth={5} />
          {look.earrings && <><circle cx={-37} cy={13} r={3.5} fill="#ffd166" /><circle cx={37} cy={13} r={3.5} fill="#ffd166" /></>}
          {faceFront && (
            <g>
              {hair}
              <path d={`M-25 ${-18 - browH * 4} Q-16 ${-23 - brow * 3} -8 ${-18 + brow * 3}`} stroke={look.hair} strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d={`M8 ${-18 - browH * 4} Q16 ${-23 + brow * 3} 25 ${-18 + brow * 3}`} stroke={look.hair} strokeWidth={4} fill="none" strokeLinecap="round" />
              {eye(-1)}{eye(1)}
              {look.glasses && <path d="M-4 -5 L4 -5" stroke={ink} strokeWidth={3} />}
              <path d="M0 0 L-2 8" stroke={look.skinDark} strokeWidth={2.5} strokeLinecap="round" />
              {mouthElement}
              {sweat > 0 && <path d={`M31 ${-20 + ((frame * 0.7) % 18)} q8 12 0 18 q-8 -6 0 -18`} fill="#79cdf5" opacity={sweat} stroke="#fff" strokeWidth={1} />}
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
