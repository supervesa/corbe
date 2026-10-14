import type { CSSProperties } from 'react';

let isInitialized = false;

function initAmbientLight() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const root = document.documentElement;
  let targetTilt = 0;
  let currentTilt = 0;
  let rafId: number | null = null;

  // Auringon kulma: 360° / 24h = 15° tunnissa (klo 12:00 = 180deg eli valo ylhäältä)
  const getSunAngle = () => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    return (hours * 15) % 360;
  };

  const applyAngle = (offset: number) => {
    const angle = (getSunAngle() + offset + 360) % 360;
    root.style.setProperty('--light-angle', `${angle.toFixed(1)}deg`);
  };

  applyAngle(0);
  window.setInterval(() => {
    if (rafId === null) applyAngle(currentTilt);
  }, 60_000);

  // Hidas ja arvokas vaimennus (inertia) puhelimen liikkeelle
  const animate = () => {
    const diff = targetTilt - currentTilt;
    if (Math.abs(diff) > 0.05) {
      currentTilt += diff * 0.04;
      applyAngle(currentTilt);
      rafId = requestAnimationFrame(animate);
    } else {
      currentTilt = targetTilt;
      applyAngle(currentTilt);
      rafId = null;
    }
  };

  const onOrientation = (e: DeviceOrientationEvent) => {
    const gamma = Math.max(-45, Math.min(45, e.gamma ?? 0));
    const beta = Math.max(-30, Math.min(30, (e.beta ?? 45) - 45));
    targetTilt = gamma * 0.7 + beta * 0.3;

    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
  };

  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  if (typeof DOE.requestPermission === 'function') {
    const requestOnTouch = async () => {
      try {
        if ((await DOE.requestPermission!()) === 'granted') {
          window.addEventListener('deviceorientation', onOrientation, { passive: true });
        }
      } catch {
        // Jatketaan pelkällä auringon kulmalla, jos lupaa ei anneta
      }
      window.removeEventListener('touchstart', requestOnTouch);
    };
    window.addEventListener('touchstart', requestOnTouch, { passive: true });
  } else {
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
  }
}

/**
 * Palauttaa hienovaraisen, kellonaikaan ja puhelimen asentoon reagoivan reunatyylin.
 * @param surfaceColor Elementin oma taustaväri (oletuksena var(--c-surface, #141416))
 */
export function ambientBorder(surfaceColor = 'var(--c-surface, #141416)'): CSSProperties {
  initAmbientLight();

  return {
    border: '1px solid transparent',
    background: `
      linear-gradient(${surfaceColor}, ${surfaceColor}) padding-box,
      linear-gradient(
        var(--light-angle, 180deg),
        rgba(255, 255, 255, 0.13) 0%,
        rgba(255, 255, 255, 0.04) 40%,
        rgba(255, 255, 255, 0.015) 100%
      ) border-box
    `,
  };
}