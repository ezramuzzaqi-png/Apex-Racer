import React from 'react';
import { GameStats, UserProfile } from '../types';
import { Volume2, VolumeX, Flag, KeyRound, ShieldAlert, Pause, Play, User, Gauge, Zap } from 'lucide-react';
import { AVATAR_OPTIONS } from '../utils/constants';

interface ScoreHUDProps {
  stats: GameStats;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenProfileModal: () => void;
  onOpenHtmlModal: () => void;
  userProfile?: UserProfile;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = ({
  stats,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenProfileModal,
  onOpenHtmlModal,
  userProfile,
}) => {
  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === userProfile?.avatarId) || AVATAR_OPTIONS[0];

  return (
    <header className="absolute top-0 left-0 right-0 p-2.5 sm:p-3.5 z-20 pointer-events-none flex flex-col gap-2 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
      <div className="flex items-start justify-between w-full gap-2">
        {/* Left Column: Score, Telemetry & Stable Core Badge */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Score & Driver Tag (clickable to view / edit driver profile) */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="bg-slate-900/90 hover:bg-slate-800/95 active:scale-[0.99] backdrop-blur-md border border-slate-700/60 hover:border-slate-600 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 flex items-center gap-2.5 transition-all text-left cursor-pointer group"
            title="Klik untuk melihat Profil Pembalap"
          >
            <div className={`w-8 h-8 rounded-lg ${currentAvatar.badgeBg} border ${currentAvatar.borderColor} flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:scale-105 transition-transform`}>
              {currentAvatar.symbol}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Skor</span>
                {userProfile && (
                  <span className="text-[10px] text-rose-400 font-medium truncate max-w-[85px]">
                    • {userProfile.username}
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold font-racing text-white leading-none">
                {stats.score.toLocaleString()}
              </div>
            </div>
          </button>

          {/* Clean Telemetry Card: Jarak (Number + m on same line) & Overtake (No Tembus in-game) */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/50 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Flag className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              {/* Jarak: explicitly formatted so number and 'm' stay strictly together on one line */}
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-tight">
                  Jarak
                </span>
                <div className="text-slate-100 font-racing text-sm font-bold whitespace-nowrap flex items-baseline gap-1 leading-tight">
                  <span>{Math.floor(stats.distance).toLocaleString()}</span>
                  <span className="text-[10.5px] font-sans font-normal text-slate-400">m</span>
                </div>
              </div>

              {/* Overtake */}
              <div className="border-l border-slate-700/80 pl-3 flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-tight">
                  Overtake
                </span>
                <div className="text-emerald-400 font-racing text-sm font-bold whitespace-nowrap leading-tight">
                  {stats.carsOvertaken}
                </div>
              </div>
            </div>
          </div>

          {/* STABLE DIMENSION Revive Core Badge (Fixed height & width, no jittering) */}
          <div className="bg-amber-950/85 backdrop-blur-md border border-amber-500/50 rounded-xl px-2.5 h-7 shadow-md flex items-center gap-2 w-[112px] flex-shrink-0">
            <div className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-2.5 h-2.5 text-amber-300" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Core:</span>
            <span className="text-xs font-black font-racing text-amber-300 ml-auto">
              {stats.collectables || 0}
            </span>
          </div>
        </div>

        {/* Right Column: Speedometer, Nitro, Audio & Quick Action Controls */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          {/* Quick Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Pause Game Button */}
            <button
              onClick={onTogglePause}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/40'
                  : 'bg-slate-800/85 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-white'
              }`}
              title={isPaused ? 'Lanjutkan Permainan (P)' : 'Pause Permainan (P)'}
              aria-label="Pause atau Lanjutkan Balapan"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Driver Profile Button (Replaces Car Skin Selector in-game) */}
            <button
              onClick={onOpenProfileModal}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800/85 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Buka Profil Pembalap"
            >
              <div className={`w-4 h-4 rounded ${currentAvatar.badgeBg} border ${currentAvatar.borderColor} flex items-center justify-center text-[9px] font-bold`}>
                {currentAvatar.symbol}
              </div>
              <span className="hidden sm:inline max-w-[85px] truncate font-racing">
                {userProfile?.username || 'Profil'}
              </span>
              <span className="sm:hidden font-racing">Profil</span>
            </button>

            {/* HTML Code Modal Button */}
            <button
              onClick={onOpenHtmlModal}
              className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-800/85 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Dapatkan file HTML tunggal"
            >
              HTML
            </button>

            {/* Sound Mute Toggle Button */}
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-slate-800/85 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={isMuted ? 'Nyalakan Suara (M)' : 'Bisukan Suara (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Speedometer and Nitro Display */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg shadow-black/40 min-w-[145px] sm:min-w-[165px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                <Gauge className="w-3 h-3 text-sky-400" />
                Kecepatan
              </div>
              <div className="text-[10px] text-amber-400 font-semibold font-racing">
                Top {stats.maxSpeedReached}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-bold font-racing text-white flex items-baseline justify-end gap-1 leading-none my-0.5">
              {stats.speedKmh}
              <span className="text-[11px] font-normal text-slate-400 font-sans">km/h</span>
            </div>

            {/* Nitro Gauge with Cooldown */}
            <div className="mt-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold mb-0.5">
                <span className={`flex items-center gap-1 ${stats.isNitroActive ? 'text-cyan-300 animate-pulse' : stats.isNitroReady ? 'text-sky-400' : 'text-slate-400'}`}>
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  {stats.isNitroActive ? 'MENEMBUS!' : stats.isNitroReady ? 'NITRO READY' : 'COOLDOWN'}
                </span>
                <span className="font-racing text-[10px]">
                  {stats.isNitroActive ? (
                    <span className="text-cyan-300">{(stats.nitroTimeRemaining || 0).toFixed(1)}s</span>
                  ) : stats.nitroCooldown > 0 ? (
                    <span className="text-amber-400">{(stats.nitroCooldown || 0).toFixed(1)}s</span>
                  ) : (
                    <span className="text-emerald-400">SIAP!</span>
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                <div
                  className={`h-full transition-all duration-75 ${
                    stats.isNitroActive
                      ? 'bg-gradient-to-r from-cyan-400 to-sky-200 animate-pulse'
                      : stats.isNitroReady
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-300 shadow-sm shadow-cyan-400'
                      : 'bg-gradient-to-r from-slate-600 to-amber-500'
                  }`}
                  style={{
                    width: `${
                      stats.isNitroActive
                        ? ((stats.nitroTimeRemaining || 0) / (stats.nitroActiveDuration || 3.5)) * 100
                        : stats.isNitroReady
                        ? 100
                        : Math.max(0, Math.min(100, ((30 - (stats.nitroCooldown || 30)) / 30) * 100))
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-0.5 text-[9px] text-slate-400 font-medium">
                <span>Durasi:</span>
                <span className="text-sky-300 font-mono">
                  {(stats.nitroActiveDuration || 3.5).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Second Revive Shield Active Indicator Banner */}
      {stats.isReviveShieldActive && (
        <div className="self-center bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 text-slate-950 px-4 py-1 rounded-full shadow-lg shadow-amber-500/40 border border-amber-300 flex items-center gap-2 font-racing font-bold text-xs sm:text-sm animate-pulse">
          <ShieldAlert className="w-4 h-4 text-slate-950" />
          <span>PERISAI REVIVE: KEBAL & TEMBUS MOBIL ({(stats.reviveShieldTimeRemaining || 0).toFixed(1)}s)</span>
        </div>
      )}
    </header>
  );
};
