import React, { useRef, useEffect } from 'react';
import { CarSkin, UserProfile } from '../types';
import { CAR_SKINS, AVATAR_OPTIONS } from '../utils/constants';
import { soundEngine } from '../utils/audio';
import { drawCar } from '../utils/renderer';
import { Trophy, Play, KeyRound, Sparkles, Code2, ShieldAlert, UserCog, ChevronRight } from 'lucide-react';

interface HomeMenuProps {
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
  collectables: number;
  selectedSkin: CarSkin;
  onSelectSkin: (skin: CarSkin) => void;
  highScore: number;
  onStartGame: () => void;
  onOpenHtmlModal: () => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  userProfile,
  onOpenProfileModal,
  collectables,
  selectedSkin,
  onSelectSkin,
  highScore,
  onStartGame,
  onOpenHtmlModal,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live preview car in the garage
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 100, 130);
    drawCar(
      ctx,
      (100 - 44) / 2,
      (130 - 82) / 2,
      44,
      82,
      selectedSkin,
      0,
      true,
      false,
      false,
      false,
      0,
      0
    );
  }, [selectedSkin]);

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === userProfile.avatarId) || AVATAR_OPTIONS[0];

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl my-auto text-center flex flex-col gap-3.5">
        
        {/* Header / Branding */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <img
              src="/favicon.svg"
              alt="Apex Racer Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-rose-600/30 object-cover border border-rose-500/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-black font-racing uppercase tracking-wider text-white leading-none">
                Apex Racer 2D
              </h1>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-racing">
                Grand Prix Edition
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenHtmlModal}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download atau salin file HTML mandiri"
          >
            <Code2 className="w-3.5 h-3.5 text-rose-400" />
            <span>HTML Code</span>
          </button>
        </div>

        {/* 1. Profil Pembalap Interaktif dengan Tombol Ganti Profil */}
        <div className="bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 border border-slate-800 rounded-xl p-3 text-left shadow-inner flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Badge */}
            <div className={`w-12 h-12 rounded-xl ${currentAvatar.badgeBg} border-2 ${currentAvatar.borderColor} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
              {currentAvatar.symbol}
            </div>

            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Pembalap Aktif
              </span>
              <div className="text-base font-bold font-racing text-white tracking-wide truncate">
                {userProfile.username}
              </div>
              <div className={`text-xs font-bold font-racing ${currentAvatar.textColor} truncate`}>
                {userProfile.title}
              </div>
            </div>
          </div>

          {/* Tombol Ganti Profil */}
          <button
            type="button"
            onClick={() => {
              soundEngine.init();
              soundEngine.playClick();
              onOpenProfileModal();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
            title="Ganti Avatar, Nama, atau Gelar Profil"
          >
            <UserCog className="w-3.5 h-3.5 text-rose-400" />
            <span>Ganti Profil</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* 2. Dompet Collectable (Revive Cores) */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-left shadow-lg shadow-black/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20 flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Revive Core (Collectable)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Lanjut game over tanpa reset skor & jarak
                </div>
              </div>
            </div>

            {/* Total Balance */}
            <div className="flex items-baseline gap-1 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-500/40 flex-shrink-0">
              <span className="text-xl font-black font-racing text-amber-400 leading-none">
                {collectables}
              </span>
              <span className="text-[10px] font-bold text-amber-300 uppercase">Core</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-slate-400">
            <span>✨ Fitur Revive:</span>
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              Lanjut dari progres terakhir + Kebal 5 detik
            </span>
          </div>
        </div>

        {/* 3. Garasi & Pilihan Warna Mobil */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-racing flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Pilih Warna Mobil Sport
            </span>
            <span className="text-xs font-bold text-rose-400 font-racing truncate max-w-[140px]">
              {selectedSkin.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Canvas Preview */}
            <div className="w-[84px] h-[104px] flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.1),transparent_70%)] pointer-events-none" />
              <canvas
                ref={previewCanvasRef}
                width={100}
                height={130}
                className="w-[84px] h-[104px] object-contain relative z-10"
              />
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-1.5 flex-grow">
              {CAR_SKINS.map((skin) => {
                const isSelected = skin.id === selectedSkin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => {
                      onSelectSkin(skin);
                      soundEngine.init();
                      soundEngine.playClick();
                    }}
                    className={`h-11 rounded-lg border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white ring-2 ring-rose-500/80 scale-105 shadow-md shadow-rose-500/30 bg-slate-800'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                    title={skin.name}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: skin.primaryColor }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: skin.stripeColor }}
                      />
                    </div>
                    <span className="text-[8px] font-medium text-slate-300 mt-1 truncate max-w-full">
                      {skin.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rekor Skor Ringkas */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rekor Skor Tertinggi:</span>
          </div>
          <span className="font-racing font-bold text-amber-400 text-sm">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Tombol Mulai Balapan */}
        <button
          type="button"
          onClick={() => {
            soundEngine.init();
            soundEngine.playClick();
            onStartGame();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] text-white font-extrabold font-racing text-lg tracking-wider uppercase shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          Mulai Balapan
        </button>
      </div>
    </div>
  );
};
