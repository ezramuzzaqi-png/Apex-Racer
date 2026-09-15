import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Zap } from 'lucide-react';

interface TouchControlsProps {
  onControlChange: (control: 'left' | 'right' | 'up' | 'down' | 'boost', active: boolean) => void;
  nitroLevel: number;
  nitroCooldown?: number;
  isNitroReady?: boolean;
  isNitroActive?: boolean;
  nitroTimeRemaining?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onControlChange,
  nitroLevel: _nitroLevel,
  nitroCooldown = 0,
  isNitroReady = false,
  isNitroActive = false,
  nitroTimeRemaining = 0,
}) => {
  const handleTouch = (
    control: 'left' | 'right' | 'up' | 'down' | 'boost',
    active: boolean
  ) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange(control, active);
  };

  return (
    <div className="absolute bottom-3 left-0 right-0 px-4 flex items-end justify-between pointer-events-none z-20 select-none">
      {/* Left steering pad */}
      <div className="flex gap-2.5 pointer-events-auto">
        <button
          onTouchStart={handleTouch('left', true)}
          onTouchEnd={handleTouch('left', false)}
          onMouseDown={handleTouch('left', true)}
          onMouseUp={handleTouch('left', false)}
          onMouseLeave={handleTouch('left', false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-rose-600/90 border border-slate-700 active:border-rose-400 text-white flex items-center justify-center backdrop-blur-md shadow-lg active:scale-95 transition-all text-xl cursor-pointer"
          aria-label="Belok Kiri"
        >
          <ChevronLeft className="w-8 h-8 text-slate-200" />
        </button>

        <button
          onTouchStart={handleTouch('right', true)}
          onTouchEnd={handleTouch('right', false)}
          onMouseDown={handleTouch('right', true)}
          onMouseUp={handleTouch('right', false)}
          onMouseLeave={handleTouch('right', false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-rose-600/90 border border-slate-700 active:border-rose-400 text-white flex items-center justify-center backdrop-blur-md shadow-lg active:scale-95 transition-all text-xl cursor-pointer"
          aria-label="Belok Kanan"
        >
          <ChevronRight className="w-8 h-8 text-slate-200" />
        </button>
      </div>

      {/* Right control pad: Brake, Accelerate & Nitro */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex flex-col gap-2">
          <button
            onTouchStart={handleTouch('up', true)}
            onTouchEnd={handleTouch('up', false)}
            onMouseDown={handleTouch('up', true)}
            onMouseUp={handleTouch('up', false)}
            onMouseLeave={handleTouch('up', false)}
            className="w-12 h-12 rounded-xl bg-slate-900/80 active:bg-emerald-600/90 border border-slate-700 active:border-emerald-400 text-white flex items-center justify-center backdrop-blur-md shadow-md active:scale-95 transition-all cursor-pointer"
            aria-label="Gas / Maju"
          >
            <ChevronUp className="w-6 h-6 text-emerald-400" />
          </button>
          <button
            onTouchStart={handleTouch('down', true)}
            onTouchEnd={handleTouch('down', false)}
            onMouseDown={handleTouch('down', true)}
            onMouseUp={handleTouch('down', false)}
            onMouseLeave={handleTouch('down', false)}
            className="w-12 h-12 rounded-xl bg-slate-900/80 active:bg-amber-600/90 border border-slate-700 active:border-amber-400 text-white flex items-center justify-center backdrop-blur-md shadow-md active:scale-95 transition-all cursor-pointer"
            aria-label="Rem / Mundur"
          >
            <ChevronDown className="w-6 h-6 text-amber-400" />
          </button>
        </div>

        {/* Nitro button */}
        <button
          onTouchStart={handleTouch('boost', true)}
          onTouchEnd={handleTouch('boost', false)}
          onMouseDown={handleTouch('boost', true)}
          onMouseUp={handleTouch('boost', false)}
          onMouseLeave={handleTouch('boost', false)}
          disabled={!isNitroReady && !isNitroActive}
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex flex-col items-center justify-center border shadow-xl backdrop-blur-md active:scale-95 transition-all cursor-pointer ${
            isNitroActive
              ? 'bg-gradient-to-r from-cyan-500 to-sky-400 border-white text-white shadow-cyan-400/50 animate-pulse'
              : isNitroReady
              ? 'bg-sky-600 hover:bg-sky-500 active:bg-cyan-500 border-sky-300 text-white shadow-sky-500/40'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-80 cursor-not-allowed'
          }`}
          aria-label="Nitro Boost"
        >
          {isNitroActive ? (
            <>
              <Zap className="w-6 h-6 fill-current animate-spin" />
              <span className="text-[8px] font-bold tracking-wider uppercase font-racing text-white">
                TEMBUS {nitroTimeRemaining.toFixed(1)}s
              </span>
            </>
          ) : isNitroReady ? (
            <>
              <Zap className="w-6 h-6 fill-current animate-bounce" />
              <span className="text-[9px] font-bold tracking-wider uppercase font-racing">
                NITRO SIAP
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold font-racing text-amber-400">
                {Math.ceil(nitroCooldown)}s
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                COOLDOWN
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
