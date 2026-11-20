/** Energy of level n in an infinite well, in units of the ground-state energy E₁. */
export const levelEnergy = (n: number) => n * n;

/** Photon energy released or absorbed when the electron jumps between two levels, in E₁. */
export const photonEnergy = (from: number, to: number) => Math.abs(levelEnergy(to) - levelEnergy(from));

export type LadderRound =
  | { kind: "level"; n: number; options: number[]; answer: number }
  | { kind: "jump"; from: number; to: number; options: number[]; answer: number };

const level = (n: number, options: number[]): LadderRound => ({ kind: "level", n, options, answer: levelEnergy(n) });
const jump = (from: number, to: number, options: number[]): LadderRound => ({ kind: "jump", from, to, options, answer: photonEnergy(from, to) });

// Distractors are the usual mistakes: using n instead of n², or subtracting levels instead of energies.
export const ladderRounds: LadderRound[] = [
  level(2, [2, 4, 3]),
  level(3, [6, 3, 9]),
  jump(2, 1, [1, 3, 4]),
  level(4, [16, 8, 4]),
  jump(3, 1, [2, 9, 8]),
  jump(4, 2, [2, 12, 16]),
];

export const LADDER_POINTS = 10;
