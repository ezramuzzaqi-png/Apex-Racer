import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATAR_OPTIONS, RACER_TITLES } from '../utils/constants';
import { soundEngine } from '../utils/audio';
import { X, Check, User, Sparkles, Shield } from 'lucide-react';

interface ProfileModalProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
  highScore: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  onSaveProfile,
  onClose,
  highScore,
}) => {
  const [name, setName] = useState(userProfile.username);
  const [selectedAvatarId, setSelectedAvatarId] = useState(userProfile.avatarId);
  const [selectedTitle, setSelectedTitle] = useState(userProfile.title);

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Pembalap Apex';
    onSaveProfile({
      username: cleanName,
      avatarId: selectedAvatarId,
      title: selectedTitle,
    });
    soundEngine.init();
    soundEngine.playClick();
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80 my-auto text-left relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-racing font-bold text-lg text-white leading-none">
                Profil Pembalap
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Kustomisasi nama, avatar, dan gelar balapan Anda
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Profile Card Preview */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3.5 shadow-inner">
          <div className={`w-14 h-14 rounded-2xl ${currentAvatar.badgeBg} border-2 ${currentAvatar.borderColor} flex items-center justify-center text-2xl shadow-lg shadow-black/60 flex-shrink-0`}>
            {currentAvatar.symbol}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold font-racing text-white truncate">
                {name || 'Pembalap Apex'}
              </span>
            </div>
            <span className={`text-xs font-bold font-racing ${currentAvatar.textColor}`}>
              {selectedTitle}
            </span>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span>Rekor: <span className="font-racing text-amber-400 font-bold">{highScore.toLocaleString()}</span></span>
              <span>•</span>
              <span className="truncate">{currentAvatar.specialty}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Nama Pembalap (Username) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-racing flex items-center gap-1.5">
              <span>Nama Pembalap</span>
              <span className="text-[10px] text-slate-500 lowercase font-sans font-normal">(maks. 16 karakter)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              placeholder="Masukkan nama pembalap..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-white font-racing font-bold text-sm focus:outline-none transition-colors"
            />
          </div>

          {/* 2. Pilihan Avatar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-racing flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih Avatar Balap</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = avatar.id === selectedAvatarId;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarId(avatar.id);
                      soundEngine.init();
                      soundEngine.playClick();
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/50 bg-slate-800 shadow-md shadow-rose-600/20 scale-[1.02]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${avatar.badgeBg} border ${avatar.borderColor} flex items-center justify-center text-lg shadow-sm`}>
                      {avatar.symbol}
                    </div>
                    <span className="text-[10px] font-bold font-racing text-slate-200 truncate max-w-full">
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pilihan Gelar / Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-racing flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Gelar Balap (Title)</span>
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              {RACER_TITLES.map((title) => {
                const isSelected = title === selectedTitle;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      setSelectedTitle(title);
                      soundEngine.init();
                      soundEngine.playClick();
                    }}
                    className={`py-1.5 px-2.5 rounded-lg border text-left text-xs font-racing font-semibold transition-colors cursor-pointer truncate ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <span className="mr-1 text-rose-400">✓</span>}
                    {title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] text-white font-extrabold font-racing text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
