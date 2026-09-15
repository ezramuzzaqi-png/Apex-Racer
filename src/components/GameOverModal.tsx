import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Trophy, Award, Gauge, Flag, Zap, KeyRound, ShieldAlert, Home } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface GameOverModalProps {
  stats: GameStats;
  collectables: number;
  reviveCost: number;
  reviveCount: number;
  onRestart: () => void;
  onRevive: () => void;
  onGoHome: () => void;
  isNewRecord: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  collectables,
  reviveCost,
  reviveCount,
  onRestart,
  onRevive,
  onGoHome,
  isNewRecord,
}) => {
  const hasCollectable = collectables >= reviveCost;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80 flex flex-col items-center text-center my-auto">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center mb-2">
          <RotateCcw className="w-6 h-6 animate-spin-reverse" />
        </div>

        <h2 className="text-2xl font-bold font-racing uppercase tracking-wider text-white">
          Game Over
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-3">
          {stats.crashReason === 'barrier'
            ? 'Mobil balap Anda menabrak pembatas jalan!'
            : 'Mobil balap Anda menabrak mobil lawan di lintasan!'}
        </p>

        {isNewRecord && (
          <div className="mb-3 w-full bg-amber-500/15 border border-amber-500/30 rounded-xl py-1.5 px-3 flex items-center justify-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Rekor Skor Baru Tercipta!
          </div>
        )}

        {/* Primary Score Board */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Skor Akhir
          </div>
          <div className="text-3xl font-bold font-racing text-rose-400 my-0.5">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Rekor Terbaik: <span className="font-bold text-amber-400 font-racing">{stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3.5 text-left">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <Flag className="w-3 h-3 text-sky-400" /> Jarak
            </div>
            <div className="text-sm font-bold font-racing text-slate-200 mt-0.5">
              {Math.floor(stats.distance)} m
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <Gauge className="w-3 h-3 text-emerald-400" /> Top Speed
            </div>
            <div className="text-sm font-bold font-racing text-slate-200 mt-0.5">
              {stats.maxSpeedReached} km/h
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <Zap className="w-3 h-3 text-purple-400" /> Overtake
            </div>
            <div className="text-sm font-bold font-racing text-slate-200 mt-0.5">
              {stats.carsOvertaken} Mobil
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <Zap className="w-3 h-3 text-cyan-400" /> Ditembus
            </div>
            <div className="text-sm font-bold font-racing text-cyan-300 mt-0.5">
              {stats.phasedCarsCount || 0} Mobil
            </div>
          </div>
        </div>

        {/* 1. REVIVE FEATURE WITH MULTIPLYING COLLECTABLE COST (1, 2, 4, 8, ...) */}
        <div className="w-full bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-xl p-3 mb-3 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Revive Core ({reviveCost} Core)</span>
            </div>
            <div className="text-xs font-racing font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">
              Punya: {collectables} Core
            </div>
          </div>

          <button
            type="button"
            disabled={!hasCollectable}
            onClick={() => {
              if (hasCollectable) {
                soundEngine.init();
                soundEngine.playRevive();
                onRevive();
              }
            }}
            className={`w-full py-2.5 px-3 rounded-lg font-bold font-racing uppercase tracking-wider text-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-lg ${
              hasCollectable
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Pakai {reviveCost} Core • Lanjut Progres Ini!</span>
            </div>
            <span className="text-[10px] opacity-90 normal-case font-normal font-sans">
              {hasCollectable
                ? `Lanjut dari ${Math.floor(stats.distance)}m & skor ${stats.score.toLocaleString()} (Kebal 5 Detik)`
                : `Core tidak cukup! (Butuh ${reviveCost} Core, Anda punya ${collectables})`}
            </span>
          </button>

          <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-300/80 flex items-center justify-between px-0.5">
            <span>Revive ke-{reviveCount + 1} di sesi ini</span>
            <span className="font-semibold text-amber-400">
              {reviveCount === 0 ? 'Biaya berlipat 2x jika kalah lagi' : `Kalah lagi = ${reviveCost * 2} Core (2x lipat)`}
            </span>
          </div>
        </div>

        {/* 2. Standard Restart & Home Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-bold font-racing tracking-wide uppercase border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Mulai Ulang Dari Awal (Reset 0m)
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            Kembali ke Menu Home
          </button>
        </div>

        <span className="text-[10px] text-slate-500 mt-2">
          Atau tekan tombol <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono text-[9px]">Spasi</kbd> untuk mulai ulang
        </span>
      </div>
    </div>
  );
};
