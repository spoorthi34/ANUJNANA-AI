import { useState, useCallback, useEffect } from "react";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnergyLadderGame from "./EnergyLadderGame";
import { useRecordActivity } from "@/hooks/useLearnerProgress";

interface WaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GameState {
  targetN: number;
  currentPoints: number[];
  round: number;
  score: number;
  totalRounds: number;
  matched: boolean;
  phase: "cinematic" | "intro" | "playing" | "results";
}

const NUM_POINTS = 20;

function generateTargetWave(n: number): number[] {
  return Array.from({ length: NUM_POINTS }, (_, i) => {
    const x = i / (NUM_POINTS - 1);
    return Math.sin(n * Math.PI * x);
  });
}

function generateFlatWave(): number[] {
  return Array.from({ length: NUM_POINTS }, () => 0);
}

export default function WaveGameModal({ isOpen, onClose }: WaveGameModalProps) {
  const [game, setGame] = useState<GameState>({
    targetN: 1,
    currentPoints: generateFlatWave(),
    round: 1,
    score: 0,
    totalRounds: 4,
    matched: false,
    phase: "cinematic",
  });
  const [cinematicTime, setCinematicTime] = useState(0);
  const [mode, setMode] = useState<"wave" | "ladder">("wave");
  const record = useRecordActivity();
  useEffect(() => { if (!isOpen) setMode("wave"); }, [isOpen]);

  // Cinematic auto-advance
  useEffect(() => {
    if (!isOpen || game.phase !== "cinematic") return;
    setCinematicTime(0);
    const timer = setInterval(() => {
      setCinematicTime((t) => {
        if (t >= 3) {
          clearInterval(timer);
          setGame((prev) => ({ ...prev, phase: "intro" }));
          return t;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [game.phase, isOpen]);
  const [selectedPoint, setSelectedPoint] = useState(Math.floor(NUM_POINTS / 2));

  const startGame = useCallback(() => {
    setGame({
      targetN: 1,
      currentPoints: generateFlatWave(),
      round: 1,
      score: 0,
      totalRounds: 4,
      matched: false,
      phase: "playing",
    });
    setSelectedPoint(Math.floor(NUM_POINTS / 2));
  }, []);

  const movePoint = useCallback((direction: "up" | "down") => {
    if (game.matched || game.phase !== "playing") return;
    setGame((prev) => {
      const newPoints = [...prev.currentPoints];
      const delta = direction === "up" ? 0.15 : -0.15;
      // Move selected point and neighbors for smoother waves
      for (let i = 0; i < NUM_POINTS; i++) {
        const dist = Math.abs(i - selectedPoint);
        if (dist <= 3) {
          const influence = 1 - dist / 4;
          newPoints[i] = Math.max(-1, Math.min(1, newPoints[i] + delta * influence));
        }
      }
      // Force endpoints to zero (boundary conditions)
      newPoints[0] = 0;
      newPoints[NUM_POINTS - 1] = 0;
      return { ...prev, currentPoints: newPoints };
    });
  }, [game.matched, game.phase, selectedPoint]);

  // Check if wave matches target
  useEffect(() => {
    if (game.phase !== "playing" || game.matched) return;
    const target = generateTargetWave(game.targetN);
    let totalError = 0;
    for (let i = 0; i < NUM_POINTS; i++) {
      totalError += Math.abs(game.currentPoints[i] - target[i]);
    }
    const avgError = totalError / NUM_POINTS;
    if (avgError < 0.15) {
      setGame((prev) => ({ ...prev, matched: true, score: prev.score + 10 }));
    }
  }, [game.currentPoints, game.targetN, game.phase, game.matched]);

  const nextRound = useCallback(() => {
    if (game.round >= game.totalRounds) {
      setGame((prev) => ({ ...prev, phase: "results" }));
      void record({ kind: "game", score: game.score, total: game.totalRounds * 10 });
    } else {
      setGame((prev) => ({
        ...prev,
        round: prev.round + 1,
        targetN: prev.targetN + 1,
        currentPoints: generateFlatWave(),
        matched: false,
      }));
      setSelectedPoint(Math.floor(NUM_POINTS / 2));
    }
  }, [game.round, game.totalRounds, game.score, record]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen || game.phase !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") movePoint("up");
      if (e.key === "ArrowDown") movePoint("down");
      if (e.key === "ArrowLeft") setSelectedPoint((p) => Math.max(1, p - 1));
      if (e.key === "ArrowRight") setSelectedPoint((p) => Math.min(NUM_POINTS - 2, p + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, game.phase, movePoint]);

  if (!isOpen) return null;

  const svgWidth = 600;
  const svgHeight = 200;
  const targetWave = generateTargetWave(game.targetN);

  const toSvgY = (val: number) => svgHeight / 2 - val * (svgHeight / 2 - 20);
  const toSvgX = (i: number) => (i / (NUM_POINTS - 1)) * svgWidth;

  const targetPath = `M ${targetWave.map((v, i) => `${toSvgX(i)},${toSvgY(v)}`).join(" L ")}`;
  const currentPath = `M ${game.currentPoints.map((v, i) => `${toSvgX(i)},${toSvgY(v)}`).join(" L ")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-game-surface rounded-2xl border border-game-border shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-game-border">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎮</span>
            <span className="font-bold text-game-cyan text-sm tracking-wider">{mode === "ladder" ? "ENERGY LADDER" : game.phase === "intro" ? "QUANTUM ARCADE" : "WAVE MATCHER"}</span>
          </div>
          <div className="flex items-center gap-4">
            {mode === "wave" && game.phase === "playing" && (
              <div className="text-xs text-game-cyan font-mono space-x-4">
                <span>Round: {game.round}/{game.totalRounds}</span>
                <span>Score: {game.score}</span>
                <span>Level: n={game.targetN}</span>
              </div>
            )}
            <Button variant="ghost"
              onClick={onClose}
              className="text-game-cyan border border-game-cyan px-3 py-1 text-xs font-bold tracking-wider hover:bg-game-cyan/10 transition-colors"
            >
              ✕ CLOSE GAME
            </Button>
          </div>
        </div>

        {mode === "ladder" ? (
          <EnergyLadderGame onBack={() => { setMode("wave"); setGame((prev) => ({ ...prev, phase: "intro" })); }} onClose={onClose} />
        ) : game.phase === "cinematic" ? (
          /* Cinematic intro */
          <div
            className="relative flex items-center justify-center overflow-hidden cursor-pointer"
            style={{ minHeight: 360 }}
            onClick={() => setGame((prev) => ({ ...prev, phase: "intro" }))}
          >
            {/* Animated background scan lines */}
            <div className="absolute inset-0 bg-game-background" />
            <div className="game-scanlines absolute inset-0 opacity-10" />

            <div className="relative text-center z-10 animate-fade-in">
              <h1
                className="text-2xl md:text-3xl font-bold tracking-[0.3em] text-game-cyan font-mono mb-3 transition-opacity duration-1000"
                style={{ opacity: cinematicTime >= 1 ? 1 : 0 }}
              >
                QUANTUM CITY
              </h1>
              <h2
                className="text-lg md:text-xl tracking-[0.2em] text-game-cyan/70 font-mono transition-opacity duration-1000"
                style={{ opacity: cinematicTime >= 2 ? 1 : 0 }}
              >
                MUSEUM OF SCIENCE
              </h2>
              <p
                className="text-xs text-game-cyan/60 mt-4 font-mono transition-opacity duration-1000"
                style={{ opacity: cinematicTime >= 2 ? 1 : 0 }}
              >
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} PM
              </p>
              <p
                className="text-[10px] text-game-cyan/60 mt-6 animate-pulse transition-opacity duration-1000"
                style={{ opacity: cinematicTime >= 3 ? 0 : cinematicTime >= 1 ? 1 : 0 }}
              >
                Click anywhere to skip
              </p>
            </div>
          </div>
        ) : game.phase === "intro" ? (
          /* Intro screen: choose a game */
          <div className="px-6 py-10 text-center">
            <div className="mx-auto w-24 h-28 rounded-t-full border-2 border-game-cyan flex flex-col items-center justify-center mb-4 shadow-[var(--game-glow)]">
              <div className="flex gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-game-cyan" />
                <div className="h-3 w-3 rounded-full bg-game-cyan" />
              </div>
              <span className="text-game-cyan text-[10px] font-mono tracking-wider">DR. PLANCK</span>
            </div>
            <h2 className="text-xl font-bold text-game-cyan mb-2 font-mono">CHOOSE YOUR GAME</h2>
            <p className="text-sm text-game-cyan/80 mb-6">Two exhibits are open in the museum today.</p>
            <div className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto text-left">
              <div className="rounded-xl border-2 border-game-cyan p-5 flex flex-col">
                <span className="text-2xl mb-2">〰️</span>
                <h3 className="font-bold text-game-cyan font-mono mb-1">WAVE MATCHER</h3>
                <p className="text-xs text-game-cyan/80 mb-4 flex-1">Sculpt the wave with ↑ and ↓ until it matches the target standing wave for each level.</p>
                <Button onClick={startGame} className="bg-primary text-primary-foreground hover:opacity-90 rounded-full font-bold tracking-wider">PLAY</Button>
              </div>
              <div className="rounded-xl border-2 border-game-magenta p-5 flex flex-col">
                <span className="text-2xl mb-2">🪜</span>
                <h3 className="font-bold text-game-magenta font-mono mb-1">ENERGY LADDER</h3>
                <p className="text-xs text-game-cyan/80 mb-4 flex-1">Pick the right energy for each level and each electron jump. Learn why levels grow with n².</p>
                <Button onClick={() => setMode("ladder")} className="bg-primary text-primary-foreground hover:opacity-90 rounded-full font-bold tracking-wider">PLAY</Button>
              </div>
            </div>
          </div>
        ) : game.phase === "results" ? (
          /* Results */
          <div className="px-8 py-16 text-center">
            <div className="text-6xl mb-4">
              {game.score >= 30 ? "🏆" : game.score >= 20 ? "🎉" : "💪"}
            </div>
            <h2 className="text-2xl font-bold text-game-cyan mb-2 font-mono">GAME OVER</h2>
            <p className="text-lg text-game-cyan mb-6">
              Final Score: <span className="font-bold text-game-cyan">{game.score}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={startGame} className="border-primary text-primary hover:bg-primary/10">
                Play Again
              </Button>
              <Button variant="outline" onClick={() => setGame((prev) => ({ ...prev, phase: "intro" }))} className="border-game-cyan text-game-cyan hover:bg-game-cyan/10">
                Other Game
              </Button>
              <Button onClick={onClose} className="bg-primary text-primary-foreground hover:opacity-90">
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* Game area */
          <div className="p-6">
            {/* Wave display */}
            <div className="border-2 border-game-magenta rounded-lg p-4 bg-game-background mb-4">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" preserveAspectRatio="none">
                {/* Target wave (faint) */}
                <path d={targetPath} fill="none" stroke="hsl(var(--game-magenta))" strokeWidth="1.5" opacity="0.4" strokeDasharray="6 4" />
                {/* Current wave */}
                <path d={currentPath} fill="none" stroke="hsl(var(--game-cyan))" strokeWidth="2.5" />
                {/* Selected point indicator */}
                <circle
                  cx={toSvgX(selectedPoint)}
                  cy={toSvgY(game.currentPoints[selectedPoint])}
                  r="8"
                  fill="hsl(var(--success))"
                  className="cursor-pointer"
                />
                {/* Clickable points */}
                {game.currentPoints.map((v, i) =>
                  i > 0 && i < NUM_POINTS - 1 ? (
                    <circle
                      key={i}
                      cx={toSvgX(i)}
                      cy={toSvgY(v)}
                      r="4"
                      fill={i === selectedPoint ? "hsl(var(--success))" : "hsl(var(--game-cyan))"}
                      opacity={i === selectedPoint ? 1 : 0.4}
                      className="cursor-pointer"
                      onClick={() => setSelectedPoint(i)}
                    />
                  ) : null
                )}
              </svg>
              <p className="text-center text-xs text-game-magenta mt-2 font-mono">
                n={game.targetN} ({game.targetN * 2} beats)
              </p>
            </div>

            {/* Match feedback */}
            {game.matched && (
              <div className="flex justify-center mb-4 animate-scale-in">
                <Button variant="ghost"
                  onClick={nextRound}
                  className="bg-success text-success-foreground font-bold px-8 py-3 rounded-lg text-sm tracking-wider hover:bg-success/90 transition-colors"
                >
                  ✓ Matched n={game.targetN} wave!
                </Button>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-6">
              <Button variant="ghost"
                onClick={() => movePoint("up")}
                className="h-20 w-20 rounded-full border-2 border-game-cyan text-game-cyan flex flex-col items-center justify-center hover:bg-game-cyan/10 transition-colors"
              >
                <ArrowUp className="h-5 w-5" />
                <span className="text-xs font-bold mt-1">UP</span>
              </Button>
              <Button variant="ghost"
                onClick={() => movePoint("down")}
                className="h-20 w-20 rounded-full border-2 border-game-magenta text-game-magenta flex flex-col items-center justify-center hover:bg-game-magenta/10 transition-colors"
              >
                <ArrowDown className="h-5 w-5" />
                <span className="text-xs font-bold mt-1">DOWN</span>
              </Button>
            </div>
            <p className="text-center text-[10px] text-game-cyan/70 mt-3">
              ↑ UP for peaks, ↓ DOWN for troughs • Click points to select • Arrow keys also work
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
