import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Heart, Zap, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Orb {
  id: number;
  x: number;
  y: number;
  r: number;
  vy: number;
  kind: "allowed" | "forbidden";
  label: string;
}

const CANVAS_W = 480;
const CANVAS_H = 360;
const PLAYER_R = 16;

let idCounter = 0;

export function GameCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>();
  const stateRef = useRef({
    playerX: CANVAS_W / 2,
    orbs: [] as Orb[],
    spawnTimer: 0,
    keys: { left: false, right: false },
  });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const comboRef = useRef(combo);
  const xpRef = useRef(xp);
  const runningRef = useRef(running);
  scoreRef.current = score;
  livesRef.current = lives;
  comboRef.current = combo;
  xpRef.current = xp;
  runningRef.current = running;

  const reset = useCallback(() => {
    stateRef.current = {
      playerX: CANVAS_W / 2,
      orbs: [],
      spawnTimer: 0,
      keys: { left: false, right: false },
    };
    setScore(0);
    setLives(3);
    setCombo(0);
    setXp(0);
    setGameOver(false);
  }, []);

  const [hasStarted, setHasStarted] = useState(false);

  const start = useCallback(() => {
    reset();
    setRunning(true);
    setHasStarted(true);
  }, [reset]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") stateRef.current.keys.left = true;
      if (e.key === "ArrowRight") stateRef.current.keys.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") stateRef.current.keys.left = false;
      if (e.key === "ArrowRight") stateRef.current.keys.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = ["n=1", "n=2", "n=3", "n=4", "n=5"];
    const forbiddenLabels = ["V=∞", "V=∞", "x<0"];

    const loop = () => {
      const s = stateRef.current;

      if (runningRef.current) {
        const speed = 6;
        if (s.keys.left) s.playerX -= speed;
        if (s.keys.right) s.playerX += speed;
        s.playerX = Math.max(PLAYER_R, Math.min(CANVAS_W - PLAYER_R, s.playerX));

        s.spawnTimer -= 1;
        if (s.spawnTimer <= 0) {
          s.spawnTimer = 45;
          const isForbidden = Math.random() < 0.35;
          s.orbs.push({
            id: idCounter++,
            x: 30 + Math.random() * (CANVAS_W - 60),
            y: -20,
            r: 18,
            vy: 1.8 + Math.random() * 1.6,
            kind: isForbidden ? "forbidden" : "allowed",
            label: isForbidden
              ? forbiddenLabels[Math.floor(Math.random() * forbiddenLabels.length)]
              : labels[Math.floor(Math.random() * labels.length)],
          });
        }

        s.orbs.forEach((o) => (o.y += o.vy));

        const remaining: Orb[] = [];
        for (const o of s.orbs) {
          const dx = o.x - s.playerX;
          const dy = o.y - (CANVAS_H - 30);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hit = dist < o.r + PLAYER_R;

          if (hit) {
            if (o.kind === "allowed") {
              const newCombo = comboRef.current + 1;
              setCombo(newCombo);
              const gained = 10 * Math.max(1, Math.min(newCombo, 5));
              setScore((sc) => sc + gained);
              setXp((x) => x + 5);
            } else {
              setCombo(0);
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  runningRef.current = false;
                  setRunning(false);
                  setGameOver(true);
                }
                return Math.max(0, nl);
              });
            }
            continue;
          }
          if (o.y - o.r > CANVAS_H) {
            if (o.kind === "allowed") setCombo(0);
            continue;
          }
          remaining.push(o);
        }
        s.orbs = remaining;
      }

      // draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bg.addColorStop(0, "hsl(217, 91%, 97%)");
      bg.addColorStop(1, "hsl(160, 84%, 96%)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // well walls
      ctx.strokeStyle = "hsl(217, 20%, 80%)";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, CANVAS_W - 20, CANVAS_H - 20);

      s.orbs.forEach((o) => {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.kind === "allowed" ? "hsl(160, 84%, 39%)" : "hsl(0, 72%, 55%)";
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(o.label, o.x, o.y);
      });

      // player
      ctx.beginPath();
      ctx.arc(s.playerX, CANVAS_H - 30, PLAYER_R, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(217, 91%, 60%)";
      ctx.fill();
      ctx.strokeStyle = "hsl(217, 91%, 40%)";
      ctx.lineWidth = 2;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!runningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    stateRef.current.playerX = Math.max(PLAYER_R, Math.min(CANVAS_W - PLAYER_R, x));
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground">Collect the Allowed Energy Levels</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Trophy className="h-4 w-4 text-primary" /> {score}
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Heart className="h-4 w-4 text-destructive" /> {lives}
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Flame className="h-4 w-4 text-warning" /> x{Math.max(1, Math.min(combo, 5))}
          </span>
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Zap className="h-4 w-4 text-accent" /> {xp} XP
          </span>
        </div>
      </div>

      <div className="relative mx-auto" style={{ maxWidth: CANVAS_W }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerMove={handlePointerMove}
          className="w-full rounded-xl border border-border touch-none"
        />

        {!running && !gameOver && !hasStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-sm rounded-xl">
            <p className="text-sm text-muted-foreground max-w-xs text-center px-4">
              Use ← → arrow keys or drag on mobile to catch green allowed energy states (n=1,2,3…) and dodge red forbidden zones.
            </p>
            <Button variant="hero" onClick={start}>
              <Play className="h-4 w-4 mr-2" /> Start Game
            </Button>
          </div>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl"
          >
            <p className="text-lg font-bold text-foreground">Game Over</p>
            <p className="text-sm text-muted-foreground">Score: {score} • XP earned: {xp}</p>
            <Button variant="hero" onClick={start}>
              <RotateCcw className="h-4 w-4 mr-2" /> Play Again
            </Button>
          </motion.div>
        )}

        {running && (
          <button
            onClick={() => setRunning(false)}
            className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-card/80 border border-border flex items-center justify-center hover:bg-muted"
          >
            <Pause className="h-4 w-4 text-foreground" />
          </button>
        )}

        {!running && !gameOver && hasStarted && (
          <button
            onClick={() => setRunning(true)}
            className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-card/80 border border-border flex items-center justify-center hover:bg-muted"
          >
            <Play className="h-4 w-4 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
