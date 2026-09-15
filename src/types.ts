export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface CarSkin {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  stripeColor: string;
  glassColor: string;
  glowColor: string;
}

export interface UserProfile {
  username: string;
  avatarId: string;
  title: string;
}

export interface EnemyCar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  stripeColor: string;
  modelType: 'supercar' | 'f1' | 'gt';
  lane: number;
  hasOvertaken: boolean;
  nearMissAwarded: boolean;
  isPhased?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'flame' | 'smoke' | 'spark' | 'debris' | 'phase';
}

export interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export interface CollectableItem {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'revive_core';
  lane: number;
  collected?: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  distance: number;
  speedKmh: number;
  maxSpeedReached: number;
  carsOvertaken: number;
  nearMissCount: number;
  nitro: number;
  timeSurvived: number;
  nitroCooldown: number;
  isNitroReady: boolean;
  isNitroActive: boolean;
  nitroActiveDuration: number;
  nitroTimeRemaining: number;
  phasedCarsCount: number;
  collectables: number;
  isReviveShieldActive?: boolean;
  reviveShieldTimeRemaining?: number;
  crashReason?: 'car' | 'barrier';
}
