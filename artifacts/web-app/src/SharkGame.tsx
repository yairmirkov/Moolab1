import { useEffect, useRef, useCallback } from "react";
import type { Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const COIN_SIZE = 28;
const SHARK_BASE = 36;
const SHARK_MAX = 60;
const GROW_PER_COIN = 1.8;
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
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

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

      const dx = target.x - shark.x;
      const dy = target.y - shark.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 2) {
        const speed = Math.min(SHARK_SPEED, dist * 0.08);
        shark.x += (dx / dist) * speed;
        shark.y += (dy / dist) * speed;
        angleRef.current = Math.atan2(dy, dx);
      }

      if (ts - lastSpawnRef.current > SPAWN_INTERVAL) {
        spawnCoin();
        lastSpawnRef.current = ts;
      }

      const size = sizeRef.current;
      const eatRadius = size * 0.5 + COIN_SIZE * 0.3;
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
        const flip = Math.abs(angleRef.current) > Math.PI / 2 ? -1 : 1;
        const tilt = angleRef.current * (180 / Math.PI) * 0.15;
        sharkElRef.current.style.left = `${shark.x - size / 2}px`;
        sharkElRef.current.style.top = `${shark.y - size / 2}px`;
        sharkElRef.current.style.width = `${size}px`;
        sharkElRef.current.style.height = `${size}px`;
        sharkElRef.current.style.transform = `scaleX(${flip}) rotate(${tilt * flip}deg)`;
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
        @keyframes sharkSwim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes coinBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes ldSpin { to{transform:rotate(360deg)} }
        @keyframes ripple { 0%{transform:scale(0.5);opacity:0.4} 100%{transform:scale(2.5);opacity:0} }
        @keyframes waveBg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
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
            filter: "drop-shadow(0 3px 8px rgba(12,45,72,0.25))",
            zIndex: 2,
          }}
        >
          <svg
            viewBox="0 0 80 60"
            fill="none"
            style={{ width: "100%", height: "100%" }}
          >
            <ellipse cx="40" cy="32" rx="28" ry="14" fill="#2e8bc0" />
            <ellipse cx="40" cy="32" rx="24" ry="11" fill="#4aa3d4" />
            <path d="M38 18 L40 4 L44 18" fill="#145374" />
            <path d="M14 28 L4 20 L16 30" fill="#145374" opacity="0.8" />
            <path d="M62 30 L74 26 L64 34" fill="#145374" opacity="0.7" />
            <path
              d="M60 30 Q68 32 66 36 Q62 34 60 34Z"
              fill="#145374"
              opacity="0.6"
            />
            <ellipse cx="52" cy="28" rx="3.5" ry="3.5" fill="#fff" />
            <ellipse cx="53" cy="28" rx="1.8" ry="1.8" fill="#0c2d48" />
            <ellipse cx="53.5" cy="27" rx="0.7" ry="0.7" fill="#fff" />
            <ellipse cx="40" cy="32" rx="20" ry="8" fill="rgba(255,255,255,0.08)" />
            <path
              d="M48 38 Q44 42 36 42 Q32 42 30 40"
              stroke="#fff"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </svg>
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
