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
import { DepthLayer as Layer } from './depth';
import { GESTURE, MAYA, Phone } from './character';
import { Stickman as Character } from './stickman';
import { Clock, MOOD, TownLayers } from './world';

type SP = { frame: number };
type A2 = [number, number];
const la = (a: A2, b: A2, t: number): A2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const deg = (r: number) => (r * 180) / Math.PI;
const talk = (f: number, from: number, to: number, speed = 0.85) => (f >= from && f < to ? 0.15 + 0.85 * Math.abs(Math.sin((f - from) * speed)) : 0);

/* ---------------------------------------------------------------------------
 * Scene 1 — CRANE DOWN from the clock tower (low angle), then slow 360° orbit
 * ------------------------------------------------------------------------- */
