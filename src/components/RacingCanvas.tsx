import React, { useRef, useEffect, useCallback } from 'react';
import { CarSkin, EnemyCar, FloatText, GameStats, Particle, CollectableItem } from '../types';
import { ENEMY_COLORS } from '../utils/constants';
import {
  drawCar,
  drawCollectables,
  drawFloatTexts,
  drawParticles,
  drawRoad,
  drawSpeedStreaks,
  checkCollision,
  checkNearMiss,
} from '../utils/renderer';
import { soundEngine } from '../utils/audio';

interface RacingCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  selectedSkin: CarSkin;
  isMuted: boolean;
  collectables: number;
  reviveTrigger: number;
  externalControls: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    boost: boolean;
  };
  onCollectItem: () => void;
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (stats: GameStats, isNewRecord: boolean) => void;
}

export const RacingCanvas: React.FC<RacingCanvasProps> = ({
  isPlaying,
  isPaused,
  isGameOver,
  selectedSkin,
  isMuted,
  collectables,
  reviveTrigger,
  externalControls,
  onCollectItem,
  onStatsUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Logical internal resolution
  const GAME_W = 440;
  const GAME_H = 720;
  const ROAD_W = 340;
  const ROAD_X = (GAME_W - ROAD_W) / 2;
  const LANES = 3;
  const LANE_W = ROAD_W / LANES;

  // Mutable Game Engine References for 60fps Loop
  const stateRef = useRef({
    score: 0,
    highScore: parseInt(localStorage.getItem('apex_high_score') || '0', 10),
    distance: 0,
    baseSpeed: 3.2, // Relaxed & beginner-friendly start speed
    currentSpeed: 3.2,
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
    isReviveShieldActive: false,
    reviveShieldTimeRemaining: 0,
    roadOffset: 0,
    cameraShake: 0,
    isBoosting: false,
    enemyIdCounter: 1,
    floatIdCounter: 1,
    spawnTimer: 0,
    spawnInterval: 115, // Spacious spacing when starting
    collectableTimer: 150, // Early first spawn (~1s) so player gets cores easily
  });

  const playerRef = useRef({
    x: GAME_W / 2 - 22,
    y: GAME_H - 145,
    width: 44,
    height: 82,
    vx: 0,
    maxVx: 6.8,
    angle: 0,
  });

  const enemiesRef = useRef<EnemyCar[]>([]);
  const collectablesRef = useRef<CollectableItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<FloatText[]>([]);
  const keysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
  });

  const lastReviveTriggerRef = useRef(0);

  // Keep audio mute state synchronized
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Handle Pause audio
  useEffect(() => {
    if (isPaused) {
      soundEngine.stopEngine();
    } else if (isPlaying && !isGameOver) {
      soundEngine.startEngine();
    }
  }, [isPaused, isPlaying, isGameOver]);

  // Merge external controls (touch pad) with local keys
  useEffect(() => {
    keysRef.current.left = externalControls.left;
    keysRef.current.right = externalControls.right;
    keysRef.current.up = externalControls.up;
    keysRef.current.down = externalControls.down;
    keysRef.current.boost = externalControls.boost;
  }, [externalControls]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysRef.current.boost = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysRef.current.boost = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn Enemy Function
  const spawnEnemy = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES);
    const laneCenterX = ROAD_X + lane * LANE_W + LANE_W / 2;
    const enemyW = 42;
    const enemyH = 80;

    // Check if lane is already occupied near top
    const isOccupied = enemiesRef.current.some(
      (e) => e.y < 130 && Math.abs(e.x + e.width / 2 - laneCenterX) < 35
    );
    if (isOccupied) return;

    const palette = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
    const enemySpeed = stateRef.current.baseSpeed * (0.35 + Math.random() * 0.35);

    enemiesRef.current.push({
      id: stateRef.current.enemyIdCounter++,
      x: laneCenterX - enemyW / 2,
      y: -enemyH - 30,
      width: enemyW,
      height: enemyH,
      speed: enemySpeed,
      color: palette.primary,
      stripeColor: palette.stripe,
      modelType: 'supercar',
      lane,
      hasOvertaken: false,
      nearMissAwarded: false,
      isPhased: false,
    });
  }, [LANES, LANE_W, ROAD_X]);

  // Spawn Collectable Item (Revive Core) - Smart lane finder so cores spawn reliably
  const spawnCollectable = useCallback(() => {
    // Try all lanes to find one clear of enemy cars near spawn point
    const candidateLanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const itemW = 32;
    const itemH = 32;

    let chosenLane = -1;
    let chosenCenterX = 0;

    for (const lane of candidateLanes) {
      const laneCenterX = ROAD_X + lane * LANE_W + LANE_W / 2;
      const isOccupied = enemiesRef.current.some(
        (e) => e.y < 160 && Math.abs(e.x + e.width / 2 - laneCenterX) < 45
      );
      if (!isOccupied) {
        chosenLane = lane;
        chosenCenterX = laneCenterX;
        break;
      }
    }

    // If all lanes currently crowded, retry soon (in ~45 frames) instead of waiting a full cycle
    if (chosenLane === -1) {
      stateRef.current.collectableTimer = 165;
      return;
    }

    collectablesRef.current.push({
      id: stateRef.current.floatIdCounter++,
      x: chosenCenterX - itemW / 2,
      y: -itemH - 35,
      width: itemW,
      height: itemH,
      type: 'revive_core',
      lane: chosenLane,
      collected: false,
    });
  }, [LANE_W, ROAD_X]);

  // Create Explosion Particles on Crash
  const createExplosion = (cx: number, cy: number) => {
    soundEngine.playCrash();
    stateRef.current.cameraShake = 18;

    for (let i = 0; i < 45; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff', '#334155'];
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 30 + Math.random() * 25,
        maxLife: 55,
        type: Math.random() > 0.3 ? 'flame' : 'debris',
      });
    }
  };

  // Trigger Near-Miss Combo
  const triggerNearMiss = (ex: number, ey: number) => {
    stateRef.current.nearMissCount++;
    stateRef.current.score += 150;
    soundEngine.playNearMiss();

    floatTextsRef.current.push({
      id: stateRef.current.floatIdCounter++,
      text: 'NEAR MISS! +150',
      x: ex + 20,
      y: ey,
      color: '#facc15',
      alpha: 1,
      life: 45,
    });
  };

  // Reset Engine States or Revive when game state updates
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      soundEngine.init();
      soundEngine.startEngine();

      const isRevive = reviveTrigger > lastReviveTriggerRef.current;
      lastReviveTriggerRef.current = reviveTrigger;

      if (isRevive) {
        // RESUME / REVIVE FROM LAST PROGRESS
        playerRef.current.x = GAME_W / 2 - playerRef.current.width / 2;
        playerRef.current.y = GAME_H - 145;
        playerRef.current.vx = 0;
        playerRef.current.angle = 0;

        stateRef.current.currentSpeed = stateRef.current.baseSpeed;
        stateRef.current.isReviveShieldActive = true;
        stateRef.current.reviveShieldTimeRemaining = 5.0; // 5 SECONDS INVULNERABILITY

        // Clear any enemy cars dangerously close to respawn area
        enemiesRef.current = enemiesRef.current.filter(
          (e) => e.y < playerRef.current.y - 300 || e.y > playerRef.current.y + 160
        );

        soundEngine.playRevive();

        // Spawn golden revival halo sparks
        for (let p = 0; p < 24; p++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 6;
          particlesRef.current.push({
            x: playerRef.current.x + playerRef.current.width / 2,
            y: playerRef.current.y + playerRef.current.height / 2,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            size: 3 + Math.random() * 4,
            color: '#facc15',
            alpha: 1,
            life: 30,
            maxLife: 30,
            type: 'phase',
          });
        }

        floatTextsRef.current.push({
          id: stateRef.current.floatIdCounter++,
          text: '🛡️ REVIVE! KEBAL 5 DETIK',
          x: playerRef.current.x + 22,
          y: playerRef.current.y - 30,
          color: '#fde047',
          alpha: 1,
          life: 60,
        });
      } else {
        // FRESH GAME START FROM ZERO
        stateRef.current.score = 0;
        stateRef.current.distance = 0;
        stateRef.current.baseSpeed = 3.2; // Beginner-friendly calm start
        stateRef.current.currentSpeed = 3.2;
        stateRef.current.speedKmh = 85;
        stateRef.current.maxSpeedReached = 85;
        stateRef.current.carsOvertaken = 0;
        stateRef.current.nearMissCount = 0;
        stateRef.current.nitro = 0;
        stateRef.current.timeSurvived = 0;
        stateRef.current.spawnTimer = 0;
        stateRef.current.spawnInterval = 115;
        stateRef.current.collectableTimer = 150; // Spawns early core on restart
        stateRef.current.nitroCooldown = 30.0;
        stateRef.current.isNitroReady = false;
        stateRef.current.isNitroActive = false;
        stateRef.current.nitroActiveDuration = 3.5;
        stateRef.current.nitroTimeRemaining = 0;
        stateRef.current.phasedCarsCount = 0;
        stateRef.current.isReviveShieldActive = false;
        stateRef.current.reviveShieldTimeRemaining = 0;

        playerRef.current.x = GAME_W / 2 - playerRef.current.width / 2;
        playerRef.current.y = GAME_H - 145;
        playerRef.current.vx = 0;
        playerRef.current.angle = 0;

        enemiesRef.current = [];
        collectablesRef.current = [];
        particlesRef.current = [];
        floatTextsRef.current = [];
      }
    } else if (isGameOver) {
      soundEngine.stopEngine();
    }
  }, [isPlaying, isGameOver, reviveTrigger, GAME_W, GAME_H]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastStatsTime = 0;

    const loop = (timestamp: number) => {
      const state = stateRef.current;
      const player = playerRef.current;

      // ----------------------------------------------------
      // 1. UPDATE PHYSICS & GAME LOGIC (ONLY IF PLAYING & NOT PAUSED)
      // ----------------------------------------------------
      if (isPlaying && !isGameOver && !isPaused) {
        state.timeSurvived += 1 / 60;

        // Dynamic Nitro Duration: Increases as the car travels further!
        const currentMaxDuration = 3.5 + Math.min(14.0, (state.distance / 400) * 0.5);
        state.nitroActiveDuration = currentMaxDuration;

        // 5-Second Revive Shield Countdown
        if (state.isReviveShieldActive) {
          state.reviveShieldTimeRemaining -= 1 / 60;
          if (state.reviveShieldTimeRemaining <= 0) {
            state.isReviveShieldActive = false;
            state.reviveShieldTimeRemaining = 0;
            floatTextsRef.current.push({
              id: state.floatIdCounter++,
              text: 'PERISAI SELESAI',
              x: player.x + 22,
              y: player.y - 15,
              color: '#94a3b8',
              alpha: 1,
              life: 40,
            });
          }
        }

        // Nitro Cooldown & Activation Handling
        if (!state.isNitroActive) {
          if (state.nitroCooldown > 0) {
            const wasAbove = state.nitroCooldown > 0;
            state.nitroCooldown = Math.max(0, state.nitroCooldown - 1 / 60);
            state.isNitroReady = false;
            state.nitro = Math.max(0, Math.min(100, ((30 - state.nitroCooldown) / 30) * 100));

            if (state.nitroCooldown === 0 && wasAbove) {
              state.isNitroReady = true;
              soundEngine.playNitroReady();
              floatTextsRef.current.push({
                id: state.floatIdCounter++,
                text: '⚡ NITRO SIAP! [SPACE]',
                x: player.x + 22,
                y: player.y - 20,
                color: '#38bdf8',
                alpha: 1,
                life: 50,
              });
            }
          } else {
            state.isNitroReady = true;
            state.nitro = 100;
          }

          // Trigger Nitro Activation when Ready
          if (state.isNitroReady && keysRef.current.boost) {
            state.isNitroActive = true;
            state.isNitroReady = false;
            state.nitroTimeRemaining = state.nitroActiveDuration;
            soundEngine.playNitroWhoosh();
            state.cameraShake = 6;
            floatTextsRef.current.push({
              id: state.floatIdCounter++,
              text: `⚡ NITRO ON! (${state.nitroActiveDuration.toFixed(1)}s TEMBUS)`,
              x: player.x + 22,
              y: player.y - 30,
              color: '#00f0ff',
              alpha: 1,
              life: 55,
            });
          }
        }

        // When Nitro is Active
        if (state.isNitroActive) {
          state.isBoosting = true;
          state.nitroTimeRemaining -= 1 / 60;
          state.nitro = Math.max(0, (state.nitroTimeRemaining / state.nitroActiveDuration) * 100);
          state.currentSpeed = state.baseSpeed * 1.65;

          // Exhaust flame & quantum phasing sparks
          if (Math.random() > 0.1) {
            particlesRef.current.push({
              x: player.x + 11 + (Math.random() * 4 - 2),
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 8 + Math.random() * 4,
              size: 3 + Math.random() * 3,
              color: '#38bdf8',
              alpha: 0.9,
              life: 14,
              maxLife: 14,
              type: 'flame',
            });
            particlesRef.current.push({
              x: player.x + player.width - 11 + (Math.random() * 4 - 2),
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 8 + Math.random() * 4,
              size: 3 + Math.random() * 3,
              color: '#38bdf8',
              alpha: 0.9,
              life: 14,
              maxLife: 14,
              type: 'flame',
            });
            // Quantum phase trail particles
            particlesRef.current.push({
              x: player.x + Math.random() * player.width,
              y: player.y + Math.random() * player.height,
              vx: (Math.random() - 0.5) * 2,
              vy: 3 + Math.random() * 3,
              size: 3 + Math.random() * 3,
              color: '#00f0ff',
              alpha: 0.8,
              life: 15,
              maxLife: 15,
              type: 'phase',
            });
          }

          // Check if Nitro Duration Exhausted
          if (state.nitroTimeRemaining <= 0) {
            state.isNitroActive = false;
            state.isBoosting = false;
            state.nitroCooldown = 30.0;
            state.isNitroReady = false;
            state.nitroTimeRemaining = 0;
            state.nitro = 0;
            floatTextsRef.current.push({
              id: state.floatIdCounter++,
              text: 'COOLDOWN 30s',
              x: player.x + 22,
              y: player.y - 15,
              color: '#94a3b8',
              alpha: 1,
              life: 40,
            });
          }
        } else {
          state.isBoosting = false;
          if (keysRef.current.up) {
            state.currentSpeed = state.baseSpeed * 1.25;
          } else if (keysRef.current.down) {
            state.currentSpeed = state.baseSpeed * 0.65;
          } else {
            state.currentSpeed = state.baseSpeed;
          }
        }

        // Road scroll offset
        state.roadOffset += state.currentSpeed * 2.8;

        // Distance & Speed Metrics
        state.distance += state.currentSpeed * 0.28;
        state.score += Math.round(state.currentSpeed * (state.isBoosting ? 2.5 : 1));
        state.speedKmh = Math.round(25 + state.currentSpeed * 20);
        if (state.speedKmh > state.maxSpeedReached) {
          state.maxSpeedReached = state.speedKmh;
        }

        // Update Web Audio engine pitch
        const speedRatio = (state.currentSpeed - 2.5) / 9;
        soundEngine.updateEnginePitch(speedRatio, state.isBoosting);

        // PROGRESSIVE DIFFICULTY:
        // Starts calm at 3.2 (~85 km/h), smoothly accelerates up to 8.5+ (~240+ km/h) as distance mounts!
        state.baseSpeed = 3.2 + Math.min(6.2, (state.distance / 320) * 0.45);
        state.spawnInterval = Math.max(46, 115 - Math.floor(state.distance / 280) * 6);

        // Lateral steering dynamics
        if (keysRef.current.left) {
          player.vx = Math.max(-player.maxVx, player.vx - 1.0);
          player.angle = Math.max(-14, player.angle - 3);
        } else if (keysRef.current.right) {
          player.vx = Math.min(player.maxVx, player.vx + 1.0);
          player.angle = Math.min(14, player.angle + 3);
        } else {
          player.vx *= 0.82;
          player.angle *= 0.8;
        }

        player.x += player.vx;

        // FATAL ROAD BARRIER COLLISION DETECTION (Left and Right Road Guardrails/Curbs)
        const hitLeftBarrier = player.x <= ROAD_X + 2;
        const hitRightBarrier = player.x + player.width >= ROAD_X + ROAD_W - 2;

        if (hitLeftBarrier || hitRightBarrier) {
          // Position player at point of barrier impact
          if (hitLeftBarrier) {
            player.x = ROAD_X;
          } else {
            player.x = ROAD_X + ROAD_W - player.width;
          }
          player.vx = 0;

          const impactX = hitLeftBarrier ? ROAD_X : ROAD_X + ROAD_W;
          const impactY = player.y + player.height / 2;

          createExplosion(player.x + player.width / 2, player.y + player.height / 2);
          createExplosion(impactX, impactY);

          // Spawn intense sparks and debris scraping along the barrier
          for (let p = 0; p < 25; p++) {
            const ang = hitLeftBarrier
              ? (Math.random() * Math.PI) - Math.PI / 2
              : (Math.random() * Math.PI) + Math.PI / 2;
            const spd = 3 + Math.random() * 8;
            particlesRef.current.push({
              x: impactX,
              y: impactY + (Math.random() * 30 - 15),
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 2,
              size: 2 + Math.random() * 4,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
              alpha: 1,
              life: 25,
              maxLife: 25,
              type: 'spark',
            });
          }

          floatTextsRef.current.push({
            id: state.floatIdCounter++,
            text: '💥 MENABRAK PEMBATAS!',
            x: player.x + 20,
            y: player.y - 20,
            color: '#ef4444',
            alpha: 1,
            life: 50,
          });

          soundEngine.playCrash();

          const isNewRec = state.score > state.highScore;
          if (isNewRec) {
            state.highScore = state.score;
            localStorage.setItem('apex_high_score', state.highScore.toString());
          }

          onGameOver(
            {
              score: state.score,
              highScore: state.highScore,
              distance: state.distance,
              speedKmh: state.speedKmh,
              maxSpeedReached: state.maxSpeedReached,
              carsOvertaken: state.carsOvertaken,
              nearMissCount: state.nearMissCount,
              nitro: state.nitro,
              timeSurvived: state.timeSurvived,
              nitroCooldown: state.nitroCooldown,
              isNitroReady: state.isNitroReady,
              isNitroActive: state.isNitroActive,
              nitroActiveDuration: state.nitroActiveDuration,
              nitroTimeRemaining: state.nitroTimeRemaining,
              phasedCarsCount: state.phasedCarsCount,
              collectables,
              isReviveShieldActive: false,
              reviveShieldTimeRemaining: 0,
              crashReason: 'barrier',
            },
            isNewRec
          );
          return;
        }

        // Forward / Backward subtle position trim
        if (keysRef.current.up && player.y > 100) player.y -= 2.0;
        if (keysRef.current.down && player.y < GAME_H - 120) player.y += 2.8;

        // Spawn Enemies
        state.spawnTimer++;
        if (state.spawnTimer >= state.spawnInterval) {
          spawnEnemy();
          state.spawnTimer = 0;
        }

        // Spawn Collectable Revive Cores (Every ~210 frames, ~3.5s)
        state.collectableTimer++;
        if (state.collectableTimer >= 210) {
          spawnCollectable();
          state.collectableTimer = 0;
        }

        // Update Collectables with Magnetic Pull & Generous Pickup Area
        for (let i = collectablesRef.current.length - 1; i >= 0; i--) {
          const col = collectablesRef.current[i];
          // Comfortable floating speed, giving player ample time to steer
          col.y += state.currentSpeed * 1.5 + 1.2;

          const colCenterX = col.x + col.width / 2;
          const colCenterY = col.y + col.height / 2;
          const carCenterX = player.x + player.width / 2;
          const carCenterY = player.y + player.height / 2;
          const dx = carCenterX - colCenterX;
          const dy = carCenterY - colCenterY;
          const dist = Math.hypot(dx, dy);

          // Magnetic suction: Pull core towards player car when approaching
          if (!col.collected && dist < 95) {
            const pullFactor = Math.min(8.0, (100 - dist) * 0.16);
            col.x += (dx / dist) * pullFactor;
            col.y += (dy / dist) * pullFactor;
          }

          // Generous collection check: proximity < 55px OR expanded collision box
          const isCollected =
            !col.collected &&
            (dist < 55 ||
              checkCollision(
                player.x - 16,
                player.y - 16,
                player.width + 32,
                player.height + 32,
                col.x,
                col.y,
                col.width,
                col.height
              ));

          // Check if player collects it
          if (isCollected) {
            col.collected = true;
            onCollectItem();
            soundEngine.playCollect();
            state.score += 500;

            // Golden sparkle particles
            for (let p = 0; p < 24; p++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 6;
              particlesRef.current.push({
                x: colCenterX,
                y: colCenterY,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 3 + Math.random() * 4,
                color: '#facc15',
                alpha: 1,
                life: 25,
                maxLife: 25,
                type: 'phase',
              });
            }

            floatTextsRef.current.push({
              id: state.floatIdCounter++,
              text: '+1 REVIVE CORE! 🔑',
              x: col.x - 10,
              y: col.y,
              color: '#facc15',
              alpha: 1,
              life: 55,
            });

            collectablesRef.current.splice(i, 1);
            continue;
          }

          // Cull passed collectables
          if (col.y > GAME_H + 90) {
            collectablesRef.current.splice(i, 1);
          }
        }

        // Update Enemies
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i];
          e.y += (state.currentSpeed - e.speed) * 1.8 + 2.0;

          // Near Miss
          if (!e.nearMissAwarded && checkNearMiss(player.x, player.y, player.width, player.height, e.x, e.y, e.width, e.height)) {
            e.nearMissAwarded = true;
            triggerNearMiss(e.x, e.y);
          }

          // Overtake count
          if (!e.hasOvertaken && e.y > player.y + player.height) {
            e.hasOvertaken = true;
            state.carsOvertaken++;
            state.score += 75;
          }

          // COLLISION DETECTION: NITRO OR 5-SECOND REVIVE SHIELD PHASES THROUGH!
          if (checkCollision(player.x, player.y, player.width, player.height, e.x, e.y, e.width, e.height)) {
            if (state.isNitroActive || state.isReviveShieldActive) {
              // GHOST / PHASING MODE: Player passes through enemy car without crashing!
              if (!e.isPhased) {
                e.isPhased = true;
                state.phasedCarsCount++;
                state.score += 250;
                soundEngine.playPhaseThru();

                const sparkColor = state.isReviveShieldActive ? '#facc15' : '#38bdf8';
                for (let p = 0; p < 16; p++) {
                  const ang = Math.random() * Math.PI * 2;
                  const spd = 2 + Math.random() * 5;
                  particlesRef.current.push({
                    x: e.x + e.width / 2,
                    y: e.y + e.height / 2,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    size: 3 + Math.random() * 3,
                    color: sparkColor,
                    alpha: 1,
                    life: 20,
                    maxLife: 20,
                    type: 'phase',
                  });
                }

                floatTextsRef.current.push({
                  id: state.floatIdCounter++,
                  text: state.isReviveShieldActive ? '🛡️ TEMBUS! +250' : '⚡ MENEMBUS! +250',
                  x: e.x + 20,
                  y: e.y,
                  color: state.isReviveShieldActive ? '#facc15' : '#00f0ff',
                  alpha: 1,
                  life: 45,
                });
              }
            } else {
              // Normal fatal crash
              createExplosion(player.x + player.width / 2, player.y + player.height / 2);
              createExplosion(e.x + e.width / 2, e.y + e.height / 2);

              const isNewRec = state.score > state.highScore;
              if (isNewRec) {
                state.highScore = state.score;
                localStorage.setItem('apex_high_score', state.highScore.toString());
              }

              onGameOver(
                {
                  score: state.score,
                  highScore: state.highScore,
                  distance: state.distance,
                  speedKmh: state.speedKmh,
                  maxSpeedReached: state.maxSpeedReached,
                  carsOvertaken: state.carsOvertaken,
                  nearMissCount: state.nearMissCount,
                  nitro: state.nitro,
                  timeSurvived: state.timeSurvived,
                  nitroCooldown: state.nitroCooldown,
                  isNitroReady: state.isNitroReady,
                  isNitroActive: state.isNitroActive,
                  nitroActiveDuration: state.nitroActiveDuration,
                  nitroTimeRemaining: state.nitroTimeRemaining,
                  phasedCarsCount: state.phasedCarsCount,
                  collectables,
                  isReviveShieldActive: false,
                  reviveShieldTimeRemaining: 0,
                  crashReason: 'car',
                },
                isNewRec
              );
              break;
            }
          }

          // Cull passed enemies below screen
          if (e.y > GAME_H + 120) {
            enemiesRef.current.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          p.alpha = p.life / p.maxLife;
          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
          const t = floatTextsRef.current[i];
          t.y -= 1.2;
          t.life--;
          t.alpha = t.life / 45;
          if (t.life <= 0) {
            floatTextsRef.current.splice(i, 1);
          }
        }

        // Camera shake decay
        if (state.cameraShake > 0) {
          state.cameraShake *= 0.88;
          if (state.cameraShake < 0.2) state.cameraShake = 0;
        }

        // Send Stats to HUD (throttled every 80ms)
        if (timestamp - lastStatsTime > 80) {
          lastStatsTime = timestamp;
          onStatsUpdate({
            score: state.score,
            highScore: state.highScore,
            distance: state.distance,
            speedKmh: state.speedKmh,
            maxSpeedReached: state.maxSpeedReached,
            carsOvertaken: state.carsOvertaken,
            nearMissCount: state.nearMissCount,
            nitro: state.nitro,
            timeSurvived: state.timeSurvived,
            nitroCooldown: state.nitroCooldown,
            isNitroReady: state.isNitroReady,
            isNitroActive: state.isNitroActive,
            nitroActiveDuration: state.nitroActiveDuration,
            nitroTimeRemaining: state.nitroTimeRemaining,
            phasedCarsCount: state.phasedCarsCount,
            collectables,
            isReviveShieldActive: state.isReviveShieldActive,
            reviveShieldTimeRemaining: state.reviveShieldTimeRemaining,
          });
        }
      }

      // ----------------------------------------------------
      // 2. RENDERING PIPELINE (Runs continuously for crisp visuals & frozen paused view)
      // ----------------------------------------------------
      ctx.save();

      // Camera Shake transform
      if (state.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.cameraShake;
        const shakeY = (Math.random() - 0.5) * state.cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Asphalt Road & Curbs
      drawRoad(ctx, GAME_W, GAME_H, state.roadOffset, ROAD_X, ROAD_W, LANES);

      // 2. Speed Streaks when fast or nitro
      const speedRatio = (state.currentSpeed - 2.5) / 8;
      drawSpeedStreaks(ctx, GAME_W, GAME_H, ROAD_X, ROAD_W, speedRatio, state.isBoosting);

      // 3. Draw Collectables on Road
      drawCollectables(ctx, collectablesRef.current, timestamp);

      // 4. Draw Enemy Cars
      for (const enemy of enemiesRef.current) {
        drawCar(
          ctx,
          enemy.x,
          enemy.y,
          enemy.width,
          enemy.height,
          {
            primaryColor: enemy.color,
            secondaryColor: '#1e293b',
            stripeColor: enemy.stripeColor,
            glassColor: '#0f172a',
          },
          0,
          false,
          false,
          enemy.isPhased,
          false,
          0,
          timestamp
        );
      }

      // 5. Draw Player Car (with Nitro Glow, Blinking effect, & Revive Phasing Shield)
      drawCar(
        ctx,
        player.x,
        player.y,
        player.width,
        player.height,
        selectedSkin,
        player.angle,
        true,
        state.isBoosting,
        false,
        state.isReviveShieldActive,
        state.reviveShieldTimeRemaining,
        timestamp
      );

      // 6. Draw Particles (Flame, Smoke, Explosions, Phase sparks)
      drawParticles(ctx, particlesRef.current);

      // 7. Draw Floating Combo Texts
      drawFloatTexts(ctx, floatTextsRef.current);

      ctx.restore();

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, [
    isPlaying,
    isPaused,
    isGameOver,
    selectedSkin,
    spawnEnemy,
    spawnCollectable,
    onGameOver,
    onStatsUpdate,
    onCollectItem,
    collectables,
    GAME_W,
    GAME_H,
    ROAD_W,
    ROAD_X,
    LANES,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={GAME_W}
        height={GAME_H}
        className="w-auto h-full max-h-[88vh] aspect-[440/720] rounded-2xl shadow-2xl shadow-black/80 border border-slate-800 object-contain bg-slate-950 select-none"
      />
    </div>
  );
};
