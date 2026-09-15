import React from 'react';
import { GameStats } from '../types';
import { Play, RotateCcw, Home, Flag, Trophy, Zap, KeyRound, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PauseModalProps {
  stats: GameStats;
  collectables: number;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  collectables,
  isMuted,
  onResume,
  onRestart,
  onGoHome,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80 flex flex-col items-center text-center my-auto">
        {/* Glowing Pause Indicator */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/20">
          <div className="flex gap-1">
            <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
            <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
          </div>
        </div>

        <h2 className="text-2xl font-black font-racing uppercase tracking-wider text-white">
          Permainan Di-Pause
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-3.5">
          Balapan dihentikan sejenak. Silakan pilih aksi berikutnya.
        </p>

        {/* Live Snapshot Stats */}
        <div className="w-full grid grid-cols-2 gap-2 mb-4 text-left">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
              <Trophy className="w-3 h-3 text-rose-400" /> Skor Saat Ini
            </div>
            <div className="text-lg font-bold font-racing text-white mt-0.5">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
              <Flag className="w-3 h-3 text-sky-400" /> Jarak Tempuh
            </div>
            <div className="text-lg font-bold font-racing text-slate-200 mt-0.5">
              {Math.floor(stats.distance).toLocaleString()} m
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
              <Zap className="w-3 h-3 text-emerald-400" /> Overtake
            </div>
            <div className="text-lg font-bold font-racing text-emerald-400 mt-0.5">
              {stats.carsOvertaken} Mobil
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
              <KeyRound className="w-3 h-3 text-amber-400" /> Sisa Core
            </div>
            <div className="text-lg font-bold font-racing text-amber-400 mt-0.5">
              {collectables} Core
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          {/* Resume Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.init();
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold font-racing text-base tracking-wider uppercase shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Lanjutkan Permainan
          </button>

          {/* Quick Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.init();
              soundEngine.playClick();
              onToggleMute();
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Suara Dimatikan (Mute)' : 'Suara Menyala (Aktif)'}</span>
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.init();
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white font-bold font-racing text-xs tracking-wide uppercase border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Mulai Ulang (Reset 0m)
          </button>

          {/* Go Home Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.init();
              soundEngine.playClick();
              onGoHome();
            }}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            Kembali ke Halaman Home
          </button>
        </div>

        <span className="text-[10px] text-slate-500 mt-2.5">
          Tekan tombol <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono text-[9px]">P</kbd> atau <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono text-[9px]">Esc</kbd> untuk lanjut
        </span>
      </div>
    </div>
  );
};
