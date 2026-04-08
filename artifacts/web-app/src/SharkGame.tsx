import { useEffect, useRef, useCallback } from "react";
import type { Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const COIN_SIZE = 28;
const SHARK_BASE = 110;
const SHARK_MAX = 160;
const GROW_PER_COIN = 3.5;
const SHARK_SPEED = 4;
const SPAWN_INTERVAL = 1800;
const MAX_COINS = 5;

interface Coin {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

function CartoonShark() {
  return (
    <svg viewBox="0 0 200 160" fill="none" style={{ width: "100%", height: "100%" }}>
      <g>
        <path d="M60 85 Q40 70 20 90 Q25 78 42 75 Z" fill="#1a7ab5" />
        <path d="M56 95 Q36 95 22 110 Q30 98 48 92 Z" fill="#1a7ab5" opacity="0.8" />

        <path d="M145 80 Q170 60 180 75 Q168 72 155 78 Z" fill="#1a7ab5" />
        <path d="M145 90 Q170 100 180 88 Q168 90 155 88 Z" fill="#1a7ab5" />

        <ellipse cx="105" cy="85" rx="55" ry="38" fill="#2596d1" />

        <path d="M100 47 Q105 18 115 48 Q108 40 100 47Z" fill="#145374" />
        <path d="M95 50 Q98 25 108 48" fill="#1a7ab5" />

        <ellipse cx="105" cy="90" rx="44" ry="28" fill="#3aaae0" />

        <path d="M65 78 Q60 88 65 98 Q68 88 65 78Z" fill="#1e80b0" opacity="0.4" />
        <path d="M72 76 Q68 84 72 92 Q74 84 72 76Z" fill="#1e80b0" opacity="0.3" />
        <path d="M79 75 Q76 82 79 89 Q81 82 79 75Z" fill="#1e80b0" opacity="0.2" />

        <path d="M70 85 Q90 115 135 105 Q150 98 155 85 Q150 80 135 78 Q100 70 70 85Z" fill="#ffffff" />

        <path d="M155 82 Q162 76 170 80 Q162 82 155 82Z" fill="#1a7ab5" opacity="0.6" />

        <ellipse cx="138" cy="72" rx="10" ry="11" fill="#ffffff" />
        <ellipse cx="140" cy="73" rx="5.5" ry="6" fill="#0c2d48" />
        <ellipse cx="141.5" cy="71" rx="2.2" ry="2.5" fill="#ffffff" />
        <ellipse cx="138" cy="76" rx="1" ry="1" fill="#ffffff" opacity="0.5" />

        <path d="M142 66 Q148 60 152 64 Q148 63 144 66Z" fill="#145374" opacity="0.3" />

        <path d="M148 86 Q155 84 160 87 Q155 90 148 90 Z" fill="#ffffff" />
        <path d="M148 87 L150 86 L150 88 Z" fill="#c0392b" />
        <path d="M151 86 L153 85 L153 88 Z" fill="#ffffff" />
        <path d="M154 85.5 L156 85 L156 88.5 Z" fill="#c0392b" />
        <path d="M157 85.5 L159 86 L158 89 Z" fill="#ffffff" />

        <path d="M148 89 L150 90 L150 88 Z" fill="#c0392b" />
        <path d="M151 90 L153 90.5 L153 88 Z" fill="#ffffff" />
        <path d="M154 90.5 L156 90.5 L156 88 Z" fill="#c0392b" />
        <path d="M157 90 L159 89 L158 88 Z" fill="#ffffff" />

        <path d="M147 85 Q152 82 161 85" stroke="#0c2d48" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M147 91 Q152 94 161 90" stroke="#0c2d48" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        <ellipse cx="130" cy="98" rx="6" ry="4" fill="rgba(255,120,120,0.2)" />
      </g>
    </svg>
  );
}

export default function SharkGame({
  progress,
  lang,
}: {
  progress: string;
  lang: Lang;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sharkRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef(SHARK_BASE);
  const coinsRef = useRef<Coin[]>([]);
  const coinIdRef = useRef(0);
  const scoreRef = useRef(0);
  const sharkElRef = useRef<HTMLDivElement>(null);
  const scoreElRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const angleRef = useRef(0);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const tailPhaseRef = useRef(0);

  const spawnCoin = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    if (coinsRef.current.length >= MAX_COINS) return;
    const pad = 40;
    const x = pad + Math.random() * (el.clientWidth - pad * 2);
    const y = pad + Math.random() * (el.clientHeight - pad * 2);
    coinsRef.current.push({
      id: coinIdRef.current++,
      x,
      y,
      opacity: 0,
      scale: 0,
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || initialized.current) return;
    initialized.current = true;

    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    sharkRef.current = { x: cx, y: cy };
    targetRef.current = { x: cx, y: cy };

    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnCoin(), i * 400);
    }

    const handlePointer = (e: PointerEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      targetRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    el.addEventListener("pointerdown", handlePointer as EventListener);
    el.addEventListener("pointermove", handlePointer as EventListener);
    el.addEventListener("touchstart", handlePointer as EventListener, {
      passive: true,
    });
    el.addEventListener("touchmove", handlePointer as EventListener, {
      passive: true,
    });

    const loop = (ts: number) => {
      const shark = sharkRef.current;
      const target = targetRef.current;
      const vel = velocityRef.current;

      const dx = target.x - shark.x;
      const dy = target.y - shark.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const accel = Math.min(0.12, dist * 0.003);
        vel.vx += (dx / dist) * accel;
        vel.vy += (dy / dist) * accel;
      }

      vel.vx *= 0.92;
      vel.vy *= 0.92;

      const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
      const maxSpeed = SHARK_SPEED * 1.5;
      if (speed > maxSpeed) {
        vel.vx = (vel.vx / speed) * maxSpeed;
        vel.vy = (vel.vy / speed) * maxSpeed;
      }

      shark.x += vel.vx;
      shark.y += vel.vy;

      if (speed > 0.3) {
        const targetAngle = Math.atan2(vel.vy, vel.vx);
        let angleDiff = targetAngle - angleRef.current;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        angleRef.current += angleDiff * 0.1;
      }

      tailPhaseRef.current += speed * 0.15 + 0.02;

      if (ts - lastSpawnRef.current > SPAWN_INTERVAL) {
        spawnCoin();
        lastSpawnRef.current = ts;
      }

      const size = sizeRef.current;
      const eatRadius = size * 0.35 + COIN_SIZE * 0.3;
      const container = coinsContainerRef.current;

      coinsRef.current = coinsRef.current.filter((coin) => {
        const cdx = shark.x - coin.x;
        const cdy = shark.y - coin.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < eatRadius && coin.opacity > 0.5) {
          sizeRef.current = Math.min(sizeRef.current + GROW_PER_COIN, SHARK_MAX);
          scoreRef.current++;
          if (scoreElRef.current) {
            scoreElRef.current.textContent = `🪙 ${scoreRef.current}`;
          }
          const coinEl = container?.querySelector(
            `[data-coin-id="${coin.id}"]`
          ) as HTMLElement;
          if (coinEl) {
            coinEl.style.transform = "scale(1.5)";
            coinEl.style.opacity = "0";
            coinEl.style.transition = "all 0.2s ease-out";
          }
          return false;
        }

        if (coin.opacity < 1) coin.opacity = Math.min(coin.opacity + 0.04, 1);
        if (coin.scale < 1) coin.scale = Math.min(coin.scale + 0.06, 1);

        const coinEl = container?.querySelector(
          `[data-coin-id="${coin.id}"]`
        ) as HTMLElement;
        if (coinEl) {
          coinEl.style.left = `${coin.x - COIN_SIZE / 2}px`;
          coinEl.style.top = `${coin.y - COIN_SIZE / 2}px`;
          coinEl.style.opacity = String(coin.opacity);
          coinEl.style.transform = `scale(${coin.scale})`;
        }
        return true;
      });

      if (container) {
        const existing = container.children;
        const coinIds = new Set(coinsRef.current.map((c) => String(c.id)));
        for (let i = existing.length - 1; i >= 0; i--) {
          const child = existing[i] as HTMLElement;
          if (!coinIds.has(child.dataset.coinId || "")) {
            child.remove();
          }
        }
        for (const coin of coinsRef.current) {
          if (!container.querySelector(`[data-coin-id="${coin.id}"]`)) {
            const div = document.createElement("div");
            div.dataset.coinId = String(coin.id);
            div.style.cssText = `position:absolute;width:${COIN_SIZE}px;height:${COIN_SIZE}px;display:flex;align-items:center;justify-content:center;font-size:20px;pointer-events:none;transition:transform 0.15s,opacity 0.15s;will-change:transform,opacity,left,top;`;
            div.textContent = "🪙";
            container.appendChild(div);
          }
        }
      }

      if (sharkElRef.current) {
        const angleDeg = angleRef.current * (180 / Math.PI);
        const facingLeft = Math.abs(angleRef.current) > Math.PI / 2;
        const flipY = facingLeft ? -1 : 1;
        const tiltDeg = facingLeft ? (180 - angleDeg) : angleDeg;
        const bob = Math.sin(tailPhaseRef.current * 0.5) * 2;
        const wobble = Math.sin(tailPhaseRef.current) * (speed > 0.5 ? 3 : 1);

        sharkElRef.current.style.left = `${shark.x - size / 2}px`;
        sharkElRef.current.style.top = `${shark.y - size / 2 + bob}px`;
        sharkElRef.current.style.width = `${size}px`;
        sharkElRef.current.style.height = `${size}px`;
        sharkElRef.current.style.transform = `scaleY(${flipY}) rotate(${tiltDeg + wobble}deg)`;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      el.removeEventListener("pointerdown", handlePointer as EventListener);
      el.removeEventListener("pointermove", handlePointer as EventListener);
      el.removeEventListener("touchstart", handlePointer as EventListener);
      el.removeEventListener("touchmove", handlePointer as EventListener);
    };
  }, [spawnCoin]);

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(160deg, #eef6fb 0%, #e0f0f8 30%, #d0e8f2 60%, #f2f8fb 100%)",
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes ldSpin { to{transform:rotate(360deg)} }
        @keyframes waveBg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
        }
      `}</style>

      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          zIndex: 1,
        }}
      >
        <div ref={coinsContainerRef} style={{ position: "absolute", inset: 0 }} />

        <div
          ref={sharkElRef}
          style={{
            position: "absolute",
            width: SHARK_BASE,
            height: SHARK_BASE,
            transition: "width 0.3s, height 0.3s",
            willChange: "left, top, transform",
            filter: "drop-shadow(0 4px 12px rgba(12,45,72,0.3))",
            zIndex: 2,
          }}
        >
          <CartoonShark />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          ref={scoreElRef}
          style={{
            fontSize: "1.1rem",
            fontWeight: 900,
            color: "#145374",
            marginBottom: 8,
            letterSpacing: "0.02em",
          }}
        >
          🪙 0
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            margin: "0 auto 10px",
            borderRadius: "50%",
            border: "3px solid rgba(46,139,192,0.12)",
            borderTopColor: "#145374",
            animation: "ldSpin 0.7s linear infinite",
          }}
        />
        <p
          style={{
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "-0.01em",
            background: "linear-gradient(90deg,#145374,#2e8bc0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            textAlign: "center",
          }}
        >
          {progress || (lang === "es" ? "Preparando tu contenido..." : "Curating your feed...")}
        </p>
        <p
          style={{
            fontSize: "0.6rem",
            fontWeight: 600,
            color: "rgba(20,83,116,0.4)",
            marginTop: 8,
            letterSpacing: "0.04em",
          }}
        >
          {lang === "es" ? "Toca para guiar al tiburón" : "Tap to guide the shark"}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background:
            "linear-gradient(to top, rgba(46,139,192,0.06) 0%, transparent 100%)",
          backgroundSize: "200% 200%",
          animation: "waveBg 6s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </div>
  );
}
