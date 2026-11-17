import { useEffect, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import InThisTown, { SCENE_INFO, compositionConfig } from './film/InThisTown';
import { SCENES } from './film/core';

const fmt = (frames: number) => {
  const seconds = frames / compositionConfig.fps;
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export default function App() {
  const playerRef = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const duration = compositionConfig.durationInSeconds * compositionConfig.fps;
  const currentScene = SCENE_INFO.reduce((active, scene, index) => (frame >= SCENES[scene.k].start ? index : active), 0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (event: { detail: { frame: number } }) => setFrame(event.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#080a11] text-stone-100 selection:bg-amber-300 selection:text-stone-950">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:py-10">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-300 text-xl font-black text-stone-950">F</span>
            <div>
              <p className="text-sm font-bold tracking-wide">FRAMEFORGE</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Short film studio</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-200">Vertical · 9:16</span>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(320px,470px)_minmax(0,1fr)] lg:gap-12">
          <section className="mx-auto w-full max-w-[470px] lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black shadow-2xl shadow-indigo-950/40 ring-1 ring-white/5">
              <Player
                ref={playerRef}
                component={InThisTown}
                durationInFrames={duration}
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
            <div className="mt-3 flex items-center justify-between px-1 text-xs text-stone-400">
              <span className="font-mono tabular-nums">{fmt(frame)} <span className="text-stone-600">/</span> {fmt(duration)}</span>
              <span>1080 × 1920 <span className="mx-1 text-stone-700">·</span> 30 fps</span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-300">Now playing</span>
                <span className="text-stone-500">Shot {String(currentScene + 1).padStart(2, '0')} / {SCENE_INFO.length}</span>
              </div>
              <p className="mt-2 truncate text-sm font-bold">{SCENE_INFO[currentScene]?.title}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-amber-300 transition-[width]" style={{ width: `${(frame / duration) * 100}%` }} />
              </div>
            </div>
          </section>

          <section className="min-w-0 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">Animated short · 43 seconds</p>
            <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl">In This<br /><span className="text-amber-300">Town.</span></h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-stone-400">
              A hand-drawn stickman story staged inside a cinematic, layered 3D world. New Year’s resolutions become literal laws—and the town makes sure he keeps them.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium">
              {['2D stickman character rig', '3D parallax environments', 'Expressive poses', 'Cinematic camera moves', 'Vertical-first storytelling'].map((feature) => (
                <span key={feature} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-stone-300">{feature}</span>
              ))}
            </div>

            <div className="mt-9 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Storyboard</h2>
              <span className="text-xs text-stone-600">Select a shot to preview</span>
            </div>
            <ol className="mt-3 space-y-2">
              {SCENE_INFO.map((scene, index) => {
                const active = index === currentScene;
                return (
                  <li key={scene.k}>
                    <button
                      onClick={() => {
                        playerRef.current?.seekTo(SCENES[scene.k].start);
                        playerRef.current?.play();
                      }}
                      className={`group flex w-full items-start gap-4 rounded-2xl border px-4 py-3.5 text-left transition duration-200 ${active ? 'border-amber-300/40 bg-amber-300/[0.08]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'}`}
                    >
                      <span className={`mt-0.5 w-8 shrink-0 font-mono text-lg font-bold tabular-nums ${active ? 'text-amber-300' : 'text-stone-700 group-hover:text-stone-500'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={`font-semibold ${active ? 'text-white' : 'text-stone-300'}`}>{scene.title}</span>
                          <span className="font-mono text-[11px] tabular-nums text-stone-600">{fmt(SCENES[scene.k].start)}</span>
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-stone-500">{scene.shot}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <button
              onClick={() => (playing ? playerRef.current?.pause() : playerRef.current?.play())}
              className="mt-6 rounded-full bg-amber-300 px-6 py-3 text-sm font-extrabold text-stone-950 shadow-lg shadow-amber-300/10 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              {playing ? 'Pause preview' : 'Play film'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
