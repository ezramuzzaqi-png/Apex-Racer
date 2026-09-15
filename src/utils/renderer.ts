import { CarSkin, EnemyCar, FloatText, Particle, CollectableItem } from '../types';

export function drawRoad(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  roadOffset: number,
  roadX: number,
  roadWidth: number,
  lanes: number
) {
  // 1. Draw side barriers / grass shoulder
  ctx.fillStyle = '#10151a';
  ctx.fillRect(0, 0, width, height);

  // Left shoulder texture
  ctx.fillStyle = '#161c24';
  ctx.fillRect(0, 0, roadX, height);
  // Right shoulder texture
  ctx.fillRect(roadX + roadWidth, 0, width - (roadX + roadWidth), height);

  // 2. Road asphalt surface
  const asphaltGrad = ctx.createLinearGradient(roadX, 0, roadX + roadWidth, 0);
  asphaltGrad.addColorStop(0, '#1c2229');
  asphaltGrad.addColorStop(0.1, '#242b35');
  asphaltGrad.addColorStop(0.5, '#28313d');
  asphaltGrad.addColorStop(0.9, '#242b35');
  asphaltGrad.addColorStop(1, '#1c2229');
  ctx.fillStyle = asphaltGrad;
  ctx.fillRect(roadX, 0, roadWidth, height);

  // 3. Rumble strips / kerbs on road edges (red and white)
  const curbWidth = 14;
  const curbSegmentHeight = 36;
  const curbOffset = roadOffset % (curbSegmentHeight * 2);

  for (let y = -curbSegmentHeight * 2; y < height + curbSegmentHeight * 2; y += curbSegmentHeight) {
    const isRed = Math.floor((y + roadOffset) / curbSegmentHeight) % 2 === 0;
    ctx.fillStyle = isRed ? '#e11d48' : '#f8fafc';

    // Left curb
    ctx.fillRect(roadX - curbWidth, y, curbWidth, curbSegmentHeight);
    // Right curb
    ctx.fillRect(roadX + roadWidth, y, curbWidth, curbSegmentHeight);
  }

  // Outer guardrails
  ctx.fillStyle = '#475569';
  ctx.fillRect(roadX - curbWidth - 4, 0, 4, height);
  ctx.fillRect(roadX + roadWidth + curbWidth, 0, 4, height);

  // 4. Lane divider dashes
  const laneWidth = roadWidth / lanes;
  const dashHeight = 42;
  const gapHeight = 32;
  const totalDash = dashHeight + gapHeight;
  const dashOffset = roadOffset % totalDash;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 4;
  ctx.setLineDash([dashHeight, gapHeight]);
  ctx.lineDashOffset = -dashOffset;

  for (let i = 1; i < lanes; i++) {
    const lx = roadX + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(lx, -dashHeight);
    ctx.lineTo(lx, height + dashHeight);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset dash
}

export function drawCollectables(
  ctx: CanvasRenderingContext2D,
  collectables: CollectableItem[],
  timestamp: number
) {
  for (const item of collectables) {
    if (item.collected) continue;
    // Subtle, gentle floating float without harsh bobbing or size changing
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const radius = 15; // Rock-solid constant radius

    ctx.save();

    // 0. Soft vertical beacon trail guiding player's eyes to this lane
    const beamGrad = ctx.createLinearGradient(cx, cy, cx, Math.max(0, cy - 60));
    beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(cx - 12, Math.max(0, cy - 60), 24, 60);

    // If item is just entering at top, show subtle downward arrow indicator
    if (item.y < 35 && item.y > -item.height) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(cx - 8, 8);
      ctx.lineTo(cx + 8, 8);
      ctx.lineTo(cx, 16);
      ctx.closePath();
      ctx.fill();
    }
    
    // 1. Stable soft ambient glow
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 10;

    // 2. Outer golden boundary ring (fixed circle, never warps or jitters in size)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Inner solid gradient core
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, '#fde047');
    coreGrad.addColorStop(0.75, '#f59e0b');
    coreGrad.addColorStop(1, '#b45309');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.fill();

    // 4. Sharp, stable Core Key icon inside
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;

    // Key ring head
    ctx.beginPath();
    ctx.arc(cx, cy - 3.5, 3.8, 0, Math.PI * 2);
    ctx.rect(cx - 1.2, cy - 2.5, 2.4, 9);
    ctx.rect(cx, cy + 1.5, 2.5, 1.8);
    ctx.rect(cx, cy + 4.5, 2.2, 1.8);
    ctx.fill();
    ctx.stroke();

    // Specular highlight spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 3.5, cy - 5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Stable label badge above
    ctx.font = 'bold 8.5px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.fillText('REVIVE CORE', cx, cy - radius - 5);

    ctx.restore();
  }
}

export function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  skin: {
    primaryColor: string;
    secondaryColor: string;
    stripeColor: string;
    glassColor: string;
    glowColor?: string;
  },
  steerAngle: number = 0,
  isPlayer: boolean = false,
  isBoosting: boolean = false,
  isPhased: boolean = false,
  isReviveShieldActive: boolean = false,
  reviveShieldTimeRemaining: number = 0,
  timestamp: number = 0
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((steerAngle * Math.PI) / 180);

  // Phasing opacity
  if (isPhased) {
    ctx.globalAlpha = 0.5;
  }

  // Revive Shield Blinking Effect: alternates opacity rapidly so car blinks!
  if (isPlayer && isReviveShieldActive) {
    const isBlink = Math.floor(timestamp / 75) % 2 === 0;
    ctx.globalAlpha = isBlink ? 0.35 : 0.95;
  }

  const hw = width / 2;
  const hh = height / 2;

  // Revive Invulnerability Celestial Shield Dome (5-second protection)
  if (isPlayer && isReviveShieldActive) {
    ctx.save();
    // Dual pulsating golden & cyan energy ring
    const shieldPulse = Math.sin(timestamp * 0.015) * 3;
    const shieldRadiusW = hw + 14 + shieldPulse;
    const shieldRadiusH = hh + 14 + shieldPulse;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 22;
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -timestamp * 0.05;

    ctx.beginPath();
    ctx.ellipse(0, 0, shieldRadiusW, shieldRadiusH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glowing aura
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.setLineDash([6, 3]);
    ctx.lineDashOffset = timestamp * 0.04;
    ctx.beginPath();
    ctx.ellipse(0, 0, shieldRadiusW - 4, shieldRadiusH - 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
    ctx.fill();

    ctx.restore();
  }

  // Quantum Phase Shield Aura for Player Car during Nitro Boost
  if (isPlayer && isBoosting) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.roundRect(-hw - 8, -hh - 8, width + 16, height + 16, 16);
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.restore();
  }

  // 1. Soft ground shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(-hw - 4, -hh - 2, width + 8, height + 8, 12);
  ctx.fill();
  ctx.restore();

  // 2. Headlight light cone / glow (front faces negative Y for top-down racing)
  if (isPlayer) {
    ctx.save();
    const lightGrad = ctx.createLinearGradient(0, -hh, 0, -hh - 140);
    lightGrad.addColorStop(0, 'rgba(255, 255, 240, 0.4)');
    lightGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.12)');
    lightGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');

    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(-hw + 8, -hh + 5);
    ctx.lineTo(-hw - 22, -hh - 130);
    ctx.lineTo(hw + 22, -hh - 130);
    ctx.lineTo(hw - 8, -hh + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. Wheels / Tires (4 tires)
  const wheelW = 9;
  const wheelH = 18;
  const wheelSteer = isPlayer ? steerAngle * 0.4 : 0;

  // Function to render a tire
  const drawWheel = (wx: number, wy: number, steer: number) => {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate((steer * Math.PI) / 180);
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(-wheelW / 2, -wheelH / 2, wheelW, wheelH, 4);
    ctx.fill();
    // Rim highlight
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(-1.5, -wheelH / 4, 3, wheelH / 2);
    ctx.restore();
  };

  // Front wheels (steerable)
  drawWheel(-hw + 1, -hh + 18, wheelSteer);
  drawWheel(hw - 1, -hh + 18, wheelSteer);
  // Rear wheels (fixed)
  drawWheel(-hw + 1, hh - 18, 0);
  drawWheel(hw - 1, hh - 18, 0);

  // 4. Main Body Chassis
  ctx.save();
  // Base sport car outline
  ctx.fillStyle = skin.primaryColor;
  ctx.beginPath();
  // Front nose curve
  ctx.moveTo(-hw + 10, -hh);
  ctx.quadraticCurveTo(0, -hh - 6, hw - 10, -hh);
  // Right side aero scoop
  ctx.lineTo(hw - 4, -hh + 20);
  ctx.lineTo(hw - 2, hh - 18);
  ctx.lineTo(hw - 6, hh);
  // Rear diffuser
  ctx.quadraticCurveTo(0, hh + 4, -hw + 6, hh);
  // Left side aero scoop
  ctx.lineTo(-hw + 2, hh - 18);
  ctx.lineTo(-hw + 4, -hh + 20);
  ctx.closePath();
  ctx.fill();

  // Edge bevel / shading
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = skin.secondaryColor;
  ctx.stroke();

  // 5. Dual White Racing Stripes
  const stripeW = 4;
  const stripeGap = 3;
  ctx.fillStyle = skin.stripeColor;
  // Left stripe
  ctx.fillRect(-stripeGap - stripeW, -hh - 4, stripeW, height + 6);
  // Right stripe
  ctx.fillRect(stripeGap, -hh - 4, stripeW, height + 6);

  // 6. Cockpit & Windshield
  ctx.fillStyle = skin.glassColor;
  ctx.beginPath();
  // Front windshield arc
  ctx.moveTo(-hw + 10, -hh + 24);
  ctx.quadraticCurveTo(0, -hh + 18, hw - 10, -hh + 24);
  // Right window
  ctx.lineTo(hw - 9, -hh + 54);
  // Rear window arc
  ctx.quadraticCurveTo(0, -hh + 58, -hw + 9, -hh + 54);
  ctx.closePath();
  ctx.fill();

  // Glass reflection shine
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-hw + 13, -hh + 28);
  ctx.lineTo(-hw + 10, -hh + 48);
  ctx.stroke();

  // Driver helmet / interior hint
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, -hh + 38, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Rear Aerodynamic Spoiler / Wing
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-hw + 4, hh - 8, width - 8, 5);
  // Spoiler endplates
  ctx.fillStyle = skin.primaryColor;
  ctx.fillRect(-hw + 2, hh - 11, 4, 10);
  ctx.fillRect(hw - 6, hh - 11, 4, 10);

  // 8. Headlights and Taillights
  // Front headlights (Bright white/cyan LEDs)
  ctx.fillStyle = isPlayer ? '#ffffff' : '#fef08a';
  ctx.beginPath();
  ctx.roundRect(-hw + 6, -hh + 1, 7, 4, 1);
  ctx.roundRect(hw - 13, -hh + 1, 7, 4, 1);
  ctx.fill();

  // Rear taillights (Glowing neon red)
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(-hw + 7, hh - 2, 7, 3, 1);
  ctx.roundRect(hw - 14, hh - 2, 7, 3, 1);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 9. Nitro Exhaust Flames (if boosting)
  if (isBoosting) {
    const flameLen = 22 + Math.random() * 16;
    const flameGrad = ctx.createLinearGradient(0, hh, 0, hh + flameLen);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#38bdf8');
    flameGrad.addColorStop(0.7, '#0284c7');
    flameGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

    ctx.fillStyle = flameGrad;
    // Left exhaust flame
    ctx.beginPath();
    ctx.moveTo(-hw + 9, hh + 2);
    ctx.lineTo(-hw + 14, hh + 2);
    ctx.lineTo(-hw + 11.5, hh + flameLen);
    ctx.closePath();
    ctx.fill();

    // Right exhaust flame
    ctx.beginPath();
    ctx.moveTo(hw - 14, hh + 2);
    ctx.lineTo(hw - 9, hh + 2);
    ctx.lineTo(hw - 11.5, hh + flameLen);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Invulnerability countdown label over car
  if (isPlayer && isReviveShieldActive && reviveShieldTimeRemaining > 0) {
    ctx.save();
    ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#fde047';
    ctx.fillText(`🛡️ KEBAL ${reviveShieldTimeRemaining.toFixed(1)}s`, 0, -hh - 22);
    ctx.restore();
  }

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.type === 'debris') {
      ctx.translate(p.x, p.y);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    } else if (p.type === 'phase') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function drawFloatTexts(ctx: CanvasRenderingContext2D, texts: FloatText[]) {
  for (const t of texts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.alpha);
    ctx.fillStyle = t.color;
    ctx.font = 'bold 15px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

export function drawSpeedStreaks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  roadX: number,
  roadWidth: number,
  speedRatio: number,
  isBoosting: boolean
) {
  if (speedRatio < 0.6 && !isBoosting) return;

  const count = isBoosting ? 18 : 8;
  ctx.save();
  ctx.strokeStyle = isBoosting ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = isBoosting ? 2.5 : 1.5;

  for (let i = 0; i < count; i++) {
    const rx = roadX + 15 + Math.random() * (roadWidth - 30);
    const ry = Math.random() * height;
    const len = 30 + speedRatio * 70 + (isBoosting ? 50 : 0);

    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx, ry + len);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Checks bounding-box collision with slight tolerance (insets)
 * to avoid unfair clipping on cosmetic corners or wings.
 */
export function checkCollision(
  pX: number,
  pY: number,
  pW: number,
  pH: number,
  eX: number,
  eY: number,
  eW: number,
  eH: number
): boolean {
  // 6px horizontal inset, 8px vertical inset for fair arcade play
  const insetX = 6;
  const insetY = 8;

  const pLeft = pX + insetX;
  const pRight = pX + pW - insetX;
  const pTop = pY + insetY;
  const pBottom = pY + pH - insetY;

  const eLeft = eX + insetX;
  const eRight = eX + eW - insetX;
  const eTop = eY + insetY;
  const eBottom = eY + eH - insetY;

  return pLeft < eRight && pRight > eLeft && pTop < eBottom && pBottom > eTop;
}

/**
 * Detects if the player closely passed an enemy without colliding (Near Miss)
 */
export function checkNearMiss(
  pX: number,
  pY: number,
  pW: number,
  pH: number,
  eX: number,
  eY: number,
  eW: number,
  eH: number
): boolean {
  const marginX = 22; // Side proximity
  const marginY = 15;

  const inProximity =
    pX + pW + marginX >= eX &&
    pX - marginX <= eX + eW &&
    pY + pH + marginY >= eY &&
    pY - marginY <= eY + eH;

  return inProximity;
}
