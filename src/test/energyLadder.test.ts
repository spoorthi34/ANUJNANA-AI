import { describe, expect, it } from "vitest";
import { ladderRounds, levelEnergy, photonEnergy } from "@/lib/energyLadder";

describe("energy ladder game", () => {
  it("uses E_n = n² E₁ for well levels", () => {
    expect([1, 2, 3, 4].map(levelEnergy)).toEqual([1, 4, 9, 16]);
  });

  it("gives the photon energy as the difference between level energies", () => {
    expect(photonEnergy(3, 1)).toBe(8);
    expect(photonEnergy(2, 4)).toBe(12);
  });

  it("offers the correct answer exactly once in every round", () => {
    for (const round of ladderRounds) {
      const expected = round.kind === "level" ? levelEnergy(round.n) : photonEnergy(round.from, round.to);
      expect(round.answer).toBe(expected);
      expect(round.options.filter((option) => option === expected)).toHaveLength(1);
      expect(new Set(round.options).size).toBe(round.options.length);
    }
  });
});
