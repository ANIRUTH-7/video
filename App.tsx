import { useEffect, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import InThisTown, { SCENE_INFO, compositionConfig } from './film/InThisTown';
import { SCENES } from './film/core';

const fmt = (frames: number) => {
  const s = frames / compositionConfig.fps;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function App() {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener('frameupdate', onFrame);
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    return () => {
      p.removeEventListener('frameupdate', onFrame);
      p.removeEventListener('play', onPlay);
      p.removeEventListener('pause', onPause);
    };
  }, []);

  const current = SCENE_INFO.reduce((acc, s, i) => (frame >= SCENES[s.k].start ? i : acc), 0);
  const total = compositionConfig.durationInSeconds * compositionConfig.fps;

  return (
    <div className="min-h-screen bg-[#07080f] text-stone-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 lg:flex-row lg:items-start">
        {/* Player */}
        <div className="mx-auto w-full max-w-[420px] shrink-0 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-indigo-900/30">
            <Player
              ref={ref}
              component={InThisTown}
              durationInFrames={total}
              fps={compositionConfig.fps}
              compositionWidth={compositionConfig.width}
              compositionHeight={compositionConfig.height}
              controls
              loop
              clickToPlay
              acknowledgeRemotionLicense
              style={{ width: '100%', aspectRatio: '9 / 16' }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
            <span>
              {fmt(frame)} / {fmt(total)}
            </span>
            <span>1080 × 1920 · 30 fps</span>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Animated short · 43s</p>
          <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl">In This Town</h1>
          <p className="mt-3 max-w-xl text-stone-400">
            New Year’s resolutions become literal laws. Re-shot with a fully rigged character, a virtual camera with real perspective tilt and orbit, and a living
            town behind him.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {['3D-style camera rig', 'Expressive faces', 'Traffic & pedestrians', 'Directed transitions', 'Film grain'].map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-stone-300">
                {t}
              </span>
            ))}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-stone-500">Shot list</h2>
          <ol className="mt-3 space-y-2">
            {SCENE_INFO.map((s, i) => {
              const active = i === current;
              return (
                <li key={s.k}>
                  <button
                    onClick={() => {
                      ref.current?.seekTo(SCENES[s.k].start);
                      ref.current?.play();
                    }}
                    className={`group flex w-full items-start gap-4 rounded-xl border px-4 py-3 text-left transition ${
                      active ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`mt-0.5 w-8 shrink-0 text-lg font-black tabular-nums ${active ? 'text-amber-400' : 'text-stone-600'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{s.title}</span>
                        <span className="text-xs tabular-nums text-stone-500">{fmt(SCENES[s.k].start)}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-stone-400">{s.shot}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            onClick={() => (playing ? ref.current?.pause() : ref.current?.play())}
            className="mt-6 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-stone-900 transition hover:bg-amber-300"
          >
            {playing ? 'Pause' : 'Play film'}
          </button>
        </div>
      </div>
    </div>
  );
}
