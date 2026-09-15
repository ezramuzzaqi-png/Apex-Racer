import { useState, useCallback, useEffect } from 'react';
import { GameStats, CarSkin, UserProfile } from './types';
import { CAR_SKINS, AVATAR_OPTIONS, RACER_TITLES } from './utils/constants';
import { RacingCanvas } from './components/RacingCanvas';
import { ScoreHUD } from './components/ScoreHUD';
import { TouchControls } from './components/TouchControls';
import { GameOverModal } from './components/GameOverModal';
import { StandaloneHtmlModal } from './components/StandaloneHtmlModal';
import { HomeMenu } from './components/HomeMenu';
import { PauseModal } from './components/PauseModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(true);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<CarSkin>(CAR_SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [reviveTrigger, setReviveTrigger] = useState(0);

  // Persistent User Profile (Avatar, Username, Title)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('apex_player_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const legacyName = localStorage.getItem('apex_player_username') || 'Pembalap Apex';
    return {
      username: legacyName,
      avatarId: AVATAR_OPTIONS[0].id,
      title: RACER_TITLES[1],
    };
  });

  const handleSaveProfile = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('apex_player_profile', JSON.stringify(newProfile));
    localStorage.setItem('apex_player_username', newProfile.username);
  }, []);

  // Persistent Collectables Inventory (Revive Cores) - default 3
  const [collectables, setCollectables] = useState<number>(() => {
    const saved = localStorage.getItem('apex_collectables');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  // Track consecutive revives in the current run (Cost doubles each defeat: 1, 2, 4, 8, ...)
  const [reviveCountInRun, setReviveCountInRun] = useState(0);
  const currentReviveCost = Math.pow(2, reviveCountInRun);

  const handleCollectItem = useCallback(() => {
    setCollectables((prev) => {
      const updated = prev + 1;
      localStorage.setItem('apex_collectables', updated.toString());
      return updated;
    });
  }, []);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem('apex_high_score') || '0', 10),
    distance: 0,
    speedKmh: 85,
    maxSpeedReached: 85,
    carsOvertaken: 0,
    nearMissCount: 0,
    nitro: 0,
    timeSurvived: 0,
    nitroCooldown: 30.0,
    isNitroReady: false,
    isNitroActive: false,
    nitroActiveDuration: 3.5,
    nitroTimeRemaining: 0,
    phasedCarsCount: 0,
    collectables: 3,
    isReviveShieldActive: false,
    reviveShieldTimeRemaining: 0,
  });

  const [touchControls, setTouchControls] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
  });

  const handleControlChange = useCallback(
    (control: 'left' | 'right' | 'up' | 'down' | 'boost', active: boolean) => {
      setTouchControls((prev) => ({ ...prev, [control]: active }));
    },
    []
  );

  const handleStartGame = useCallback(() => {
    setIsHomeMenuOpen(false);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setIsNewRecord(false);
    setReviveCountInRun(0); // Reset revive cost back to 1 for a new run
  }, []);

  const handleTogglePause = useCallback(() => {
    if (isPlaying && !isGameOver) {
      setIsPaused((prev) => !prev);
    }
  }, [isPlaying, isGameOver]);

  const handleRevive = useCallback(() => {
    const cost = Math.pow(2, reviveCountInRun);
    if (collectables >= cost) {
      setCollectables((prev) => {
        const next = Math.max(0, prev - cost);
        localStorage.setItem('apex_collectables', next.toString());
        return next;
      });
      setReviveCountInRun((prev) => prev + 1); // Doubles the cost for next defeat
      setReviveTrigger((prev) => prev + 1);
      setIsGameOver(false);
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [collectables, reviveCountInRun]);

  const handleGoHome = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsGameOver(false);
    setIsHomeMenuOpen(true);
    setReviveCountInRun(0); // Reset revive cost when returning to home
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats, newRec: boolean) => {
    setStats(finalStats);
    setIsNewRecord(newRec);
    setIsGameOver(true);
    setIsPaused(false);
  }, []);

  // Keyboard shortcuts (Pause: P or Esc, Mute: M, Restart on GameOver: Space/Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsMuted((prev) => !prev);
      }
      if ((e.code === 'KeyP' || e.code === 'Escape') && isPlaying && !isGameOver) {
        setIsPaused((prev) => !prev);
      }
      if (isGameOver && (e.code === 'Space' || e.code === 'Enter')) {
        handleStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleStartGame]);

  return (
    <main className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient racing atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,72,0.08),transparent_70%)] pointer-events-none" />

      {/* Main Game Container */}
      <div className="relative w-full h-full max-w-lg max-h-[96vh] flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Heads Up Display */}
        <ScoreHUD
          stats={{ ...stats, collectables }}
          isMuted={isMuted}
          isPaused={isPaused}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onTogglePause={handleTogglePause}
          onOpenProfileModal={() => {
            if (isPlaying && !isGameOver) {
              setIsPaused(true);
            }
            setIsProfileModalOpen(true);
          }}
          onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
          userProfile={userProfile}
        />

        {/* The HTML5 Canvas Game */}
        <RacingCanvas
          isPlaying={isPlaying}
          isPaused={isPaused}
          isGameOver={isGameOver}
          selectedSkin={selectedSkin}
          isMuted={isMuted}
          collectables={collectables}
          reviveTrigger={reviveTrigger}
          externalControls={touchControls}
          onCollectItem={handleCollectItem}
          onStatsUpdate={(newStats) => setStats({ ...newStats, collectables })}
          onGameOver={handleGameOver}
        />

        {/* Menu Home with Driver Profile & Edit Profile trigger */}
        {isHomeMenuOpen && !isPlaying && (
          <HomeMenu
            userProfile={userProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            collectables={collectables}
            selectedSkin={selectedSkin}
            onSelectSkin={setSelectedSkin}
            highScore={stats.highScore}
            onStartGame={handleStartGame}
            onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
          />
        )}

        {/* Mobile / Casual Touch Controls (hidden when paused or game over) */}
        {isPlaying && !isGameOver && !isPaused && (
          <TouchControls
            onControlChange={handleControlChange}
            nitroLevel={stats.nitro}
            nitroCooldown={stats.nitroCooldown}
            isNitroReady={stats.isNitroReady}
            isNitroActive={stats.isNitroActive}
            nitroTimeRemaining={stats.nitroTimeRemaining}
          />
        )}

        {/* In-Game Pause Modal */}
        {isPlaying && isPaused && !isGameOver && (
          <PauseModal
            stats={stats}
            collectables={collectables}
            isMuted={isMuted}
            onResume={() => setIsPaused(false)}
            onRestart={handleStartGame}
            onGoHome={handleGoHome}
            onToggleMute={() => setIsMuted((prev) => !prev)}
          />
        )}

        {/* Game Over Screen Modal with Revive Button */}
        {isGameOver && (
          <GameOverModal
            stats={stats}
            collectables={collectables}
            reviveCost={currentReviveCost}
            reviveCount={reviveCountInRun}
            onRestart={handleStartGame}
            onRevive={handleRevive}
            onGoHome={handleGoHome}
            isNewRecord={isNewRecord}
          />
        )}

        {/* Edit Driver Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onClose={() => setIsProfileModalOpen(false)}
            highScore={stats.highScore}
          />
        )}

        {/* Standalone HTML Code Modal */}
        {isHtmlModalOpen && (
          <StandaloneHtmlModal onClose={() => setIsHtmlModalOpen(false)} />
        )}
      </div>
    </main>
  );
}
