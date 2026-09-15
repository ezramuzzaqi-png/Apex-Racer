/**
 * Generates a clean, standalone, single-file HTML containing all HTML, CSS,
 * and pure JavaScript (HTML5 Canvas) without any external libraries.
 */
export function getStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Apex Racer 2D - Top Down Sport Racing</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body {
      background-color: #0b0f14;
      color: #f8fafc;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      touch-action: none;
    }
    #game-container {
      position: relative;
      width: 100%;
      max-width: 440px;
      height: 92vh;
      max-height: 760px;
      background: #111;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 2px #27272a;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    /* HUD Overlay */
    #hud {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
      background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
    }
    .hud-box {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 6px 12px;
      backdrop-filter: blur(4px);
    }
    .hud-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
    }
    .hud-val {
      font-size: 18px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: #f8fafc;
    }
    .nitro-bar-container {
      width: 100%;
      height: 6px;
      background: #334155;
      border-radius: 3px;
      margin-top: 4px;
      overflow: hidden;
    }
    #nitro-fill {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #38bdf8);
      transition: width 0.1s;
    }

    /* Screen UI (Menu & Game Over) */
    .screen-overlay {
      position: absolute;
      inset: 0;
      background: rgba(11, 15, 20, 0.88);
      backdrop-filter: blur(6px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
      z-index: 10;
    }
    .screen-overlay.hidden {
      display: none;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
      color: #f43f5e;
      text-transform: uppercase;
    }
    p.subtitle {
      color: #cbd5e1;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .btn {
      background: linear-gradient(135deg, #e11d48, #be123c);
      color: white;
      border: none;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
      transition: transform 0.1s, filter 0.2s;
    }
    .btn:hover {
      filter: brightness(1.1);
    }
    .btn:active {
      transform: scale(0.96);
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 260px;
      padding: 8px 0;
      border-bottom: 1px solid #334155;
      font-size: 14px;
      color: #cbd5e1;
    }
    .stat-row span:last-child {
      font-weight: 700;
      color: #fff;
    }

    /* Touch Controls for Mobile */
    #touch-controls {
      display: none;
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      justify-content: space-between;
      pointer-events: none;
      z-index: 5;
    }
    @media (hover: none) and (pointer: coarse) {
      #touch-controls {
        display: flex;
      }
    }
    .touch-btn-group {
      display: flex;
      gap: 10px;
      pointer-events: auto;
    }
    .touch-btn {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.25);
      color: white;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .touch-btn:active {
      background: rgba(225, 29, 72, 0.85);
      border-color: #f43f5e;
    }
    .touch-btn.nitro {
      background: rgba(2, 132, 199, 0.8);
      border-color: #38bdf8;
    }
    .touch-btn.nitro:active {
      background: #0284c7;
    }
  </style>
</head>
<body>

  <div id="game-container">
    <canvas id="gameCanvas"></canvas>

    <!-- Heads Up Display (HUD) -->
    <div id="hud">
      <div class="hud-box">
        <div class="hud-label">Skor</div>
        <div class="hud-val" id="hud-score">0</div>
        <div class="hud-label" style="margin-top:4px;">Jarak</div>
        <div class="hud-val" style="font-size:14px;" id="hud-dist">0 m</div>
      </div>
      <div class="hud-box" style="text-align: right;">
        <div class="hud-label">Kecepatan</div>
        <div class="hud-val" id="hud-speed">140 <span style="font-size:12px">km/h</span></div>
        <div class="hud-label" style="margin-top:4px;">Nitro</div>
        <div class="nitro-bar-container">
          <div id="nitro-fill"></div>
        </div>
      </div>
    </div>

    <!-- Start / Menu Overlay -->
    <div id="menu-overlay" class="screen-overlay">
      <h1>Apex Racer 2D</h1>
      <p class="subtitle">Kemudikan supercar sport, gunakan Nitro untuk menembus mobil lawan!</p>

      <!-- Car Color Selector -->
      <div style="margin-bottom: 14px; width: 100%; max-width: 280px; background: rgba(15,23,42,0.8); border: 1px solid #334155; border-radius: 10px; padding: 10px;">
        <div style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Pilih Warna Mobil:</div>
        <div id="color-chips" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <!-- Injected via JS -->
        </div>
      </div>

      <div style="margin-bottom: 14px; font-size: 11px; color: #94a3b8; line-height: 1.5; text-align: left; background: rgba(15,23,42,0.6); padding: 8px 12px; border-radius: 8px; border: 1px solid #1e293b;">
        ⏱️ <b>Cooldown Nitro 30s:</b> Tunggu 30 detik dari awal game & setelah pakai<br>
        ⚡ <b>Menembus Lawan:</b> Saat Nitro aktif, mobil Anda kebal menembus lawan!<br>
        📈 <b>Durasi Skala Jarak:</b> Durasi Nitro makin panjang seiring jarak tempuh
      </div>

      <button class="btn" id="start-btn">MULAI BALAPAN</button>
    </div>

    <!-- Game Over Overlay -->
    <div id="gameover-overlay" class="screen-overlay hidden">
      <h1 style="color: #ef4444;">GAME OVER</h1>
      <p class="subtitle">Mobil balap Anda menabrak lawan!</p>
      <div style="width: 100%; max-width: 260px; margin-bottom: 20px;">
        <div class="stat-row"><span>Skor Akhir</span><span id="final-score">0</span></div>
        <div class="stat-row"><span>Jarak Tempuh</span><span id="final-dist">0 m</span></div>
        <div class="stat-row"><span>Mobil Dilewati</span><span id="final-overtake">0</span></div>
        <div class="stat-row"><span>Mobil Ditembus</span><span id="final-phased" style="color:#38bdf8">0</span></div>
        <div class="stat-row"><span>Rekor Tertinggi</span><span id="high-score" style="color:#f59e0b">0</span></div>
      </div>
      <button class="btn" id="restart-btn">MAIN LAGI</button>
    </div>

    <!-- Touch controls for mobile devices -->
    <div id="touch-controls">
      <div class="touch-btn-group">
        <div class="touch-btn" id="btn-left">◀</div>
        <div class="touch-btn" id="btn-right">▶</div>
      </div>
      <div class="touch-btn-group">
        <div class="touch-btn" id="btn-down">▼</div>
        <div class="touch-btn nitro" id="btn-nitro">⚡</div>
      </div>
    </div>
  </div>

  <script>
    // ==========================================
    // 1. INISIALISASI CANVAS & KONFIGURASI GAME
    // ==========================================
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('game-container');

    // Resolusi internal game canvas
    const GAME_W = 440;
    const GAME_H = 720;
    canvas.width = GAME_W;
    canvas.height = GAME_H;

    // Konfigurasi Jalan & Jalur (3 Lanes)
    const ROAD_W = 340;
    const ROAD_X = (GAME_W - ROAD_W) / 2;
    const LANES = 3;
    const LANE_W = ROAD_W / LANES;

    // State Game
    let isPlaying = false;
    let isGameOver = false;
    let score = 0;
    let distance = 0;
    let baseSpeed = 5;
    let currentSpeed = 5;
    let speedKmh = 140;
    let roadOffset = 0;
    let carsOvertaken = 0;
    let nitro = 0;
    let isBoosting = false;
    let highScore = parseInt(localStorage.getItem('apex_high_score') || '0', 10);

    // Nitro Rules: 30s Cooldown & Distance Scaling Duration & Car Phasing
    let nitroCooldown = 30.0;
    let isNitroReady = false;
    let isNitroActive = false;
    let nitroActiveDuration = 3.5;
    let nitroTimeRemaining = 0;
    let phasedCarsCount = 0;

    // Partikel & Efek
    let particles = [];
    let speedLines = [];

    // Pilihan Warna Mobil Sport
    const CAR_SKINS = [
      { name: 'Crimson Fury', primary: '#e11d48', stripe: '#ffffff' },
      { name: 'Cyber Neon', primary: '#06b6d4', stripe: '#facc15' },
      { name: 'Viper Emerald', primary: '#10b981', stripe: '#ffffff' },
      { name: 'Sunset Amber', primary: '#f97316', stripe: '#fef08a' },
      { name: 'Electric Violet', primary: '#8b5cf6', stripe: '#38bdf8' },
      { name: 'Stealth Shadow', primary: '#334155', stripe: '#ef4444' }
    ];
    let selectedSkinIdx = 0;

    // Mobil Pemain
    const player = {
      x: GAME_W / 2 - 22,
      y: GAME_H - 140,
      width: 44,
      height: 82,
      vx: 0,
      vy: 0,
      maxVx: 6.5,
      angle: 0,
      primaryColor: CAR_SKINS[0].primary,
      stripeColor: CAR_SKINS[0].stripe,
      glassColor: '#0f172a'
    };

    // Daftar Mobil Lawan
    let enemies = [];
    let enemySpawnTimer = 0;
    let enemySpawnInterval = 85; // frame interval spawn

    // Input Controller
    const keys = { left: false, right: false, up: false, down: false, boost: false };

    // Palet Warna Mobil Lawan
    const ENEMY_PALETTES = [
      { primary: '#2563eb', stripe: '#93c5fd' }, // Biru
      { primary: '#d97706', stripe: '#fde68a' }, // Amber
      { primary: '#059669', stripe: '#a7f3d0' }, // Hijau
      { primary: '#7c3aed', stripe: '#ddd6fe' }, // Ungu
      { primary: '#475569', stripe: '#cbd5e1' }  // Silver
    ];

    // ==========================================
    // 2. INPUT HANDLER (KEYBOARD & TOUCH)
    // ==========================================
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
      if (e.code === 'Space') { keys.boost = true; e.preventDefault(); }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (e.code === 'Space') keys.boost = false;
    });

    // Touch Support
    const setupTouchBtn = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
      el.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
      el.addEventListener('mousedown', () => { keys[keyName] = true; });
      el.addEventListener('mouseup', () => { keys[keyName] = false; });
      el.addEventListener('mouseleave', () => { keys[keyName] = false; });
    };
    setupTouchBtn('btn-left', 'left');
    setupTouchBtn('btn-right', 'right');
    setupTouchBtn('btn-down', 'down');
    setupTouchBtn('btn-nitro', 'boost');

    // Setup color chips on menu
    const chipsContainer = document.getElementById('color-chips');
    CAR_SKINS.forEach((skin, idx) => {
      const btn = document.createElement('button');
      btn.style.width = '32px';
      btn.style.height = '32px';
      btn.style.borderRadius = '50%';
      btn.style.backgroundColor = skin.primary;
      btn.style.border = idx === 0 ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.title = skin.name;

      const stripeDot = document.createElement('div');
      stripeDot.style.width = '6px';
      stripeDot.style.height = '6px';
      stripeDot.style.borderRadius = '50%';
      stripeDot.style.backgroundColor = skin.stripe;
      btn.appendChild(stripeDot);

      btn.addEventListener('click', () => {
        selectedSkinIdx = idx;
        player.primaryColor = skin.primary;
        player.stripeColor = skin.stripe;
        Array.from(chipsContainer.children).forEach((c, i) => {
          c.style.border = i === idx ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)';
        });
      });
      chipsContainer.appendChild(btn);
    });

    // ==========================================
    // 3. COLLISION DETECTION (DETEKSI TABRAKAN)
    // ==========================================
    function checkCollision(r1, r2) {
      const insetX = 6;
      const insetY = 8;
      return (
        r1.x + insetX < r2.x + r2.width - insetX &&
        r1.x + r1.width - insetX > r2.x + insetX &&
        r1.y + insetY < r2.y + r2.height - insetY &&
        r1.y + r1.height - insetY > r2.y + insetY
      );
    }

    // ==========================================
    // 4. SPAWN MOBIL MUSUH / LAWAN
    // ==========================================
    function spawnEnemy() {
      const lane = Math.floor(Math.random() * LANES);
      const laneCenterX = ROAD_X + lane * LANE_W + LANE_W / 2;
      const enemyW = 42;
      const enemyH = 80;

      const isOccupied = enemies.some(e => e.y < 120 && Math.abs((e.x + e.width / 2) - laneCenterX) < 30);
      if (isOccupied) return;

      const palette = ENEMY_PALETTES[Math.floor(Math.random() * ENEMY_PALETTES.length)];
      const enemySpeed = baseSpeed * 0.45 + Math.random() * 1.5;

      enemies.push({
        x: laneCenterX - enemyW / 2,
        y: -enemyH - 20,
        width: enemyW,
        height: enemyH,
        speed: enemySpeed,
        primaryColor: palette.primary,
        stripeColor: palette.stripe,
        glassColor: '#0f172a',
        hasOvertaken: false,
        isPhased: false
      });
    }

    // Ledakan saat tabrakan
    function createExplosion(x, y) {
      for (let i = 0; i < 35; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.4 ? '#ef4444' : (Math.random() > 0.5 ? '#f59e0b' : '#334155'),
          alpha: 1,
          life: 30 + Math.random() * 20
        });
      }
    }

    // ==========================================
    // 5. UPDATE GAME LOGIC
    // ==========================================
    function update() {
      if (!isPlaying || isGameOver) return;

      // Durasi Nitro meningkat seiring bertambahnya jarak tempuh
      nitroActiveDuration = 3.5 + Math.min(14.0, (distance / 400) * 0.5);

      // Logika Cooldown 30 Detik & Aktivasi Nitro
      if (!isNitroActive) {
        if (nitroCooldown > 0) {
          nitroCooldown = Math.max(0, nitroCooldown - 1 / 60);
          isNitroReady = false;
          nitro = Math.max(0, Math.min(100, ((30 - nitroCooldown) / 30) * 100));
          if (nitroCooldown === 0) {
            isNitroReady = true;
          }
        } else {
          isNitroReady = true;
          nitro = 100;
        }

        // Aktifkan nitro jika tombol ditekan dan siap
        if (isNitroReady && keys.boost) {
          isNitroActive = true;
          isNitroReady = false;
          nitroTimeRemaining = nitroActiveDuration;
        }
      }

      // Saat Nitro Aktif (Mendapat Boost & Menembus Lawan)
      if (isNitroActive) {
        isBoosting = true;
        nitroTimeRemaining -= 1 / 60;
        nitro = Math.max(0, (nitroTimeRemaining / nitroActiveDuration) * 100);
        currentSpeed = baseSpeed * 1.65;

        // Partikel knalpot & quantum aura
        particles.push({
          x: player.x + 12 + (Math.random() * 4 - 2),
          y: player.y + player.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 7 + Math.random() * 3,
          size: 3 + Math.random() * 3,
          color: '#38bdf8',
          alpha: 0.9,
          life: 14
        });
        particles.push({
          x: player.x + player.width - 12 + (Math.random() * 4 - 2),
          y: player.y + player.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 7 + Math.random() * 3,
          size: 3 + Math.random() * 3,
          color: '#38bdf8',
          alpha: 0.9,
          life: 14
        });
        particles.push({
          x: player.x + Math.random() * player.width,
          y: player.y + Math.random() * player.height,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3,
          size: 2 + Math.random() * 2,
          color: '#00f0ff',
          alpha: 0.8,
          life: 12
        });

        // Cek durasi habis
        if (nitroTimeRemaining <= 0) {
          isNitroActive = false;
          isBoosting = false;
          nitroCooldown = 30.0; // Cooldown 30 detik dimulai lagi!
          isNitroReady = false;
          nitroTimeRemaining = 0;
          nitro = 0;
        }
      } else {
        isBoosting = false;
        if (keys.up) {
          currentSpeed = baseSpeed * 1.2;
        } else if (keys.down) {
          currentSpeed = baseSpeed * 0.7; // Rem
        } else {
          currentSpeed = baseSpeed;
        }
      }

      // Scrolling background track
      roadOffset += currentSpeed * 2.8;

      // Progress Skor & Jarak
      distance += currentSpeed * 0.25;
      score += Math.round(currentSpeed * (isBoosting ? 2.5 : 1));
      speedKmh = Math.round(110 + currentSpeed * 16);

      // Peningkatan Kesulitan Bertahap Seiring Waktu
      baseSpeed = 5 + Math.min(6, distance / 3000);
      enemySpawnInterval = Math.max(45, 85 - Math.floor(distance / 2500) * 8);

      // Pergerakan Mobil Pemain
      if (keys.left) {
        player.vx = Math.max(-player.maxVx, player.vx - 0.9);
        player.angle = Math.max(-12, player.angle - 2.5);
      } else if (keys.right) {
        player.vx = Math.min(player.maxVx, player.vx + 0.9);
        player.angle = Math.min(12, player.angle + 2.5);
      } else {
        player.vx *= 0.82;
        player.angle *= 0.8;
      }

      player.x += player.vx;

      // Batasi pemain tetap berada di batas jalan aspal
      const minX = ROAD_X + 6;
      const maxX = ROAD_X + ROAD_W - player.width - 6;
      if (player.x < minX) { player.x = minX; player.vx = 0; }
      if (player.x > maxX) { player.x = maxX; player.vx = 0; }

      // Kontrol maju-mundur vertikal terbatas
      if (keys.up && player.y > 100) player.y -= 2.2;
      if (keys.down && player.y < GAME_H - 120) player.y += 3;

      // Spawn Lawan
      enemySpawnTimer++;
      if (enemySpawnTimer >= enemySpawnInterval) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      // Update Mobil Lawan
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += (currentSpeed - e.speed) * 1.8 + 2;

        // Overtake counter
        if (!e.hasOvertaken && e.y > player.y + player.height) {
          e.hasOvertaken = true;
          carsOvertaken++;
          score += 50;
        }

        // DETEKSI TABRAKAN & PENETRASI MOBIL SAAT NITRO
        if (checkCollision(player, e)) {
          if (isNitroActive) {
            // MENEMBUS MOBIL LAIN (PHASING)
            if (!e.isPhased) {
              e.isPhased = true;
              phasedCarsCount++;
              score += 250;
              for (let p = 0; p < 12; p++) {
                const ang = Math.random() * Math.PI * 2;
                particles.push({
                  x: e.x + e.width / 2,
                  y: e.y + e.height / 2,
                  vx: Math.cos(ang) * 4,
                  vy: Math.sin(ang) * 4,
                  size: 3,
                  color: '#38bdf8',
                  alpha: 1,
                  life: 20
                });
              }
            }
          } else {
            triggerGameOver();
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            createExplosion(e.x + e.width / 2, e.y + e.height / 2);
            return;
          }
        }

        // Hapus lawan yang sudah lewat di bawah layar
        if (e.y > GAME_H + 100) {
          enemies.splice(i, 1);
        }
      }

      // Update Partikel
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / 30;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update Tampilan HUD
      document.getElementById('hud-score').innerText = score;
      document.getElementById('hud-dist').innerText = Math.floor(distance) + ' m';
      document.getElementById('hud-speed').innerHTML = speedKmh + ' <span style="font-size:12px">km/h</span>';
      document.getElementById('nitro-fill').style.width = nitro + '%';
      if (isNitroActive) {
        document.getElementById('nitro-fill').style.background = 'linear-gradient(90deg, #00f0ff, #38bdf8)';
      } else if (isNitroReady) {
        document.getElementById('nitro-fill').style.background = 'linear-gradient(90deg, #0284c7, #38bdf8)';
      } else {
        document.getElementById('nitro-fill').style.background = '#eab308';
      }
    }

    // ==========================================
    // 6. DRAW / RENDERING (GAMBAR KE CANVAS)
    // ==========================================
    function drawCarBody(x, y, w, h, skin, angle, isPlayerCar, boosting) {
      ctx.save();
      if (skin && skin.isPhased) {
        ctx.globalAlpha = 0.45;
      }
      if (isPlayerCar && isNitroActive) {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
      }
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((angle * Math.PI) / 180);

      const hw = w / 2;
      const hh = h / 2;

      // 1. Bayangan mobil
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-hw - 3, -hh - 2, w + 6, h + 6, 8);
      ctx.fill();

      // 2. Lampu Sorot Depan
      if (isPlayerCar) {
        const beam = ctx.createLinearGradient(0, -hh, 0, -hh - 120);
        beam.addColorStop(0, 'rgba(255, 255, 220, 0.35)');
        beam.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(-hw + 8, -hh);
        ctx.lineTo(-hw - 18, -hh - 110);
        ctx.lineTo(hw + 18, -hh - 110);
        ctx.lineTo(hw - 8, -hh);
        ctx.closePath();
        ctx.fill();
      }

      // 3. 4 Roda Ban
      const drawTire = (tx, ty) => {
        ctx.fillStyle = '#111827';
        ctx.fillRect(tx - 4, ty - 8, 8, 16);
      };
      drawTire(-hw + 2, -hh + 16);
      drawTire(hw - 2, -hh + 16);
      drawTire(-hw + 2, hh - 16);
      drawTire(hw - 2, hh - 16);

      // 4. Bodi Utama Mobil Sport
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath();
      ctx.moveTo(-hw + 8, -hh);
      ctx.quadraticCurveTo(0, -hh - 5, hw - 8, -hh);
      ctx.lineTo(hw - 3, hh - 12);
      ctx.lineTo(hw - 6, hh);
      ctx.quadraticCurveTo(0, hh + 4, -hw + 6, hh);
      ctx.lineTo(-hw + 3, hh - 12);
      ctx.closePath();
      ctx.fill();

      // 5. Garis Balap (Racing Stripes)
      ctx.fillStyle = skin.stripeColor;
      ctx.fillRect(-6, -hh, 4, h);
      ctx.fillRect(2, -hh, 4, h);

      // 6. Kaca / Windshield
      ctx.fillStyle = skin.glassColor;
      ctx.beginPath();
      ctx.moveTo(-hw + 10, -hh + 22);
      ctx.quadraticCurveTo(0, -hh + 16, hw - 10, -hh + 22);
      ctx.lineTo(hw - 8, -hh + 50);
      ctx.quadraticCurveTo(0, -hh + 54, -hw + 8, -hh + 50);
      ctx.closePath();
      ctx.fill();

      // 7. Spoiler Belakang
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 4, hh - 7, w - 8, 5);

      // 8. Lampu Belakang (Merah Menyala)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-hw + 6, hh - 2, 7, 3);
      ctx.fillRect(hw - 13, hh - 2, 7, 3);

      // 9. Efek Api Nitro (Boost)
      if (boosting) {
        const fl = 20 + Math.random() * 14;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-hw + 7, hh + 2);
        ctx.lineTo(-hw + 13, hh + 2);
        ctx.lineTo(-hw + 10, hh + fl);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(hw - 13, hh + 2);
        ctx.lineTo(hw - 7, hh + 2);
        ctx.lineTo(hw - 10, hh + fl);
        ctx.fill();
      }

      ctx.restore();
    }

    function render() {
      // Bersihkan canvas
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      // 1. Bahu jalan & pembatas (Grass / Barrier)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // 2. Permukaan Jalan Aspal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ROAD_X, 0, ROAD_W, GAME_H);

      // 3. Kerb Pinggir Jalan (Merah-Putih Rumble Strip)
      const curbH = 34;
      const curbW = 12;
      for (let y = -curbH; y < GAME_H + curbH; y += curbH) {
        const isRed = Math.floor((y + roadOffset) / curbH) % 2 === 0;
        ctx.fillStyle = isRed ? '#e11d48' : '#f8fafc';
        ctx.fillRect(ROAD_X - curbW, y, curbW, curbH);
        ctx.fillRect(ROAD_X + ROAD_W, y, curbW, curbH);
      }

      // 4. Marka Garis Putih Putus-putus
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 4;
      ctx.setLineDash([36, 28]);
      ctx.lineDashOffset = -roadOffset;

      for (let i = 1; i < LANES; i++) {
        const lx = ROAD_X + i * LANE_W;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, GAME_H);
        ctx.stroke();
      }
      ctx.setLineDash([]); // reset

      // 5. Gambar Mobil Lawan
      enemies.forEach(e => {
        drawCarBody(e.x, e.y, e.width, e.height, e, 0, false, false);
      });

      // 6. Gambar Mobil Pemain
      drawCarBody(player.x, player.y, player.width, player.height, player, player.angle, true, isBoosting);

      // 7. Gambar Partikel
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // ==========================================
    // 7. GAME OVER & STATE MANAGEMENT
    // ==========================================
    function triggerGameOver() {
      isGameOver = true;
      isPlaying = false;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('apex_high_score', highScore);
      }

      document.getElementById('final-score').innerText = score;
      document.getElementById('final-dist').innerText = Math.floor(distance) + ' m';
      document.getElementById('final-overtake').innerText = carsOvertaken;
      document.getElementById('final-phased').innerText = phasedCarsCount;
      document.getElementById('high-score').innerText = highScore;

      setTimeout(() => {
        document.getElementById('gameover-overlay').classList.remove('hidden');
      }, 500);
    }

    function resetGame() {
      player.x = GAME_W / 2 - player.width / 2;
      player.y = GAME_H - 140;
      player.vx = 0;
      player.angle = 0;
      enemies = [];
      particles = [];
      score = 0;
      distance = 0;
      carsOvertaken = 0;
      phasedCarsCount = 0;
      baseSpeed = 5;
      currentSpeed = 5;
      nitroCooldown = 30.0;
      isNitroReady = false;
      isNitroActive = false;
      nitroActiveDuration = 3.5;
      nitroTimeRemaining = 0;
      nitro = 0;
      isGameOver = false;
      isPlaying = true;
      document.getElementById('gameover-overlay').classList.add('hidden');
      document.getElementById('menu-overlay').classList.add('hidden');
    }

    document.getElementById('start-btn').addEventListener('click', () => {
      resetGame();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      resetGame();
    });

    // ==========================================
    // 8. GAME LOOP UTAMA (SMOOTH 60 FPS)
    // ==========================================
    function gameLoop() {
      update();
      render();
      requestAnimationFrame(gameLoop);
    }

    // Jalankan Loop pertama kali
    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;
}
