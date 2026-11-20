import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LADDER_POINTS, ladderRounds, levelEnergy } from "@/lib/energyLadder";
import { useRecordActivity } from "@/hooks/useLearnerProgress";

interface EnergyLadderGameProps { onBack: () => void; onClose: () => void; }

const LEVELS = [1, 2, 3, 4];
const ladderY = (n: number) => 230 - levelEnergy(n) * 12.5;

export default function EnergyLadderGame({ onBack, onClose }: EnergyLadderGameProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const record = useRecordActivity();
  const round = ladderRounds[index];
  const highlighted = round.kind === "level" ? [round.n] : [round.from, round.to];
  const correct = picked === round.answer;

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === round.answer) setScore((value) => value + LADDER_POINTS);
  };
  const next = () => {
    if (index === ladderRounds.length - 1) {
      setDone(true);
      void record({ kind: "game", score, total: ladderRounds.length * LADDER_POINTS });
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  };
  const restart = () => { setIndex(0); setScore(0); setPicked(null); setDone(false); };

  if (done) {
    const max = ladderRounds.length * LADDER_POINTS;
    return (
      <div className="px-8 py-16 text-center">
        <div className="text-6xl mb-4">{score === max ? "🏆" : score >= max / 2 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold text-game-cyan mb-2 font-mono">LADDER CLIMBED</h2>
        <p className="text-lg text-game-cyan mb-6">Final Score: <span className="font-bold">{score}</span> / {max}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={restart} className="border-primary text-primary hover:bg-primary/10">Play Again</Button>
          <Button variant="outline" onClick={onBack} className="border-game-cyan text-game-cyan hover:bg-game-cyan/10">Other Game</Button>
          <Button onClick={onClose} className="bg-primary text-primary-foreground hover:opacity-90">Close</Button>
        </div>
      </div>
    );
  }

  const question = round.kind === "level"
    ? <>The electron sits on level <strong>n = {round.n}</strong>. What is its energy?</>
    : <>The electron jumps from <strong>n = {round.from}</strong> down to <strong>n = {round.to}</strong>. How much energy does the photon carry?</>;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-mono text-game-cyan">
        <span>Round {index + 1}/{ladderRounds.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] items-center">
        <div className="border-2 border-game-magenta rounded-lg p-3 bg-game-background">
          <svg viewBox="0 0 300 250" className="w-full" role="img" aria-label="Energy levels of an infinite potential well">
            <path d="M40 10 V240 M260 10 V240" stroke="hsl(var(--game-cyan))" strokeWidth="4" />
            {LEVELS.map((n) => {
              const on = highlighted.includes(n);
              return (
                <g key={n}>
                  <line x1="40" x2="260" y1={ladderY(n)} y2={ladderY(n)} stroke={on ? "hsl(var(--game-magenta))" : "hsl(var(--game-cyan))"} strokeWidth={on ? 4 : 2} opacity={on ? 1 : 0.45} />
                  <text x="268" y={ladderY(n) + 4} fill="hsl(var(--game-cyan))" fontSize="11" fontFamily="monospace">n={n}</text>
                  {(picked !== null || round.kind === "jump") && on && (
                    <text x="8" y={ladderY(n) + 4} fill="hsl(var(--game-magenta))" fontSize="10" fontFamily="monospace">{picked !== null ? `${levelEnergy(n)}E₁` : "?"}</text>
                  )}
                </g>
              );
            })}
            {round.kind === "level" ? (
              <circle cx="150" cy={ladderY(round.n) - 9} r="8" fill="hsl(var(--success))" />
            ) : (
              <>
                <circle cx="150" cy={ladderY(round.from) - 9} r="8" fill="hsl(var(--success))" />
                <path d={`M150 ${ladderY(round.from) + 2} V${ladderY(round.to) - 10}`} stroke="hsl(var(--success))" strokeWidth="2.5" strokeDasharray="5 4" />
                <path d={`M143 ${ladderY(round.to) - 18} L150 ${ladderY(round.to) - 6} L157 ${ladderY(round.to) - 18}`} fill="none" stroke="hsl(var(--success))" strokeWidth="2.5" />
                <path d={`M165 ${(ladderY(round.from) + ladderY(round.to)) / 2} q8 -8 16 0 t16 0 t16 0`} fill="none" stroke="hsl(var(--game-magenta))" strokeWidth="2" />
              </>
            )}
          </svg>
          <p className="text-center text-[10px] text-game-cyan/70 font-mono mt-1">Level spacing grows with n²</p>
        </div>
        <div>
          <p className="text-sm text-game-cyan mb-4 leading-relaxed">{question}</p>
          <div className="grid grid-cols-3 gap-2">
            {round.options.map((option) => {
              const state = picked === null ? "" : option === round.answer ? "bg-success text-success-foreground border-success" : option === picked ? "border-destructive text-destructive" : "opacity-50";
              return (
                <Button key={option} variant="outline" disabled={picked !== null && option !== picked && option !== round.answer}
                  onClick={() => choose(option)}
                  className={`h-14 border-2 border-game-cyan bg-transparent text-game-cyan font-mono text-base hover:bg-game-cyan/10 ${state}`}>
                  {option} E₁
                </Button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4 animate-scale-in">
              <p className={`text-sm font-bold mb-1 ${correct ? "text-success" : "text-destructive"}`}>{correct ? "✓ Correct!" : "✗ Not quite."}</p>
              <p className="text-xs text-game-cyan/80 mb-3">
                {round.kind === "level"
                  ? `Eₙ = n² × E₁, so n = ${round.n} gives ${round.n}² = ${round.answer} E₁.`
                  : `Photon = E${round.from} − E${round.to} = ${levelEnergy(round.from)} − ${levelEnergy(round.to)} = ${round.answer} E₁.`}
              </p>
              <Button onClick={next} className="bg-primary text-primary-foreground hover:opacity-90 font-bold tracking-wider">
                {index === ladderRounds.length - 1 ? "See Results" : "Next Round →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
