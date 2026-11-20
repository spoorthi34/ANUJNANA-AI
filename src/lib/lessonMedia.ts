/** Per-subtopic media for the lesson: the guitar-string card and the two Watch Video animations. */
export type WellKind = "infinite" | "finite" | "tunnel";

export interface StringSpec {
  title: string;
  description: string;
  well: WellKind;
  /** Energy level n, or barrier thickness (1–3) for tunneling. */
  level: number;
}

export interface VideoSpec {
  title: string;
  subtitle: string;
  scene: "well" | "rope";
  well: WellKind;
  level: number;
  /** Narration lines shown one after another while the animation plays. */
  captions: string[];
}

export interface SectionMedia {
  string: StringSpec;
  videos: [VideoSpec, VideoSpec];
}

const s = (title: string, description: string, well: WellKind, level: number): StringSpec => ({ title, description, well, level });
const well = (title: string, wellKind: WellKind, level: number, captions: string[]): VideoSpec =>
  ({ title, subtitle: wellKind === "tunnel" ? "Electron at a barrier" : "Electron in the well", scene: "well", well: wellKind, level, captions });
const rope = (title: string, wellKind: WellKind, level: number, captions: string[]): VideoSpec =>
  ({ title, subtitle: "Story in the Quantum Gym", scene: "rope", well: wellKind, level, captions });

export const lessonMedia: Record<string, SectionMedia[]> = {
  "infinite-potential-well": [
    {
      string: s("A string between two walls", "The electron is like a guitar string tied to two walls that never move. Pluck it and see which shapes survive.", "infinite", 1),
      videos: [
        well("Trapped in a Box", "infinite", 1, ["An electron is trapped between two walls it can never cross.", "In quantum physics the electron is a wave, not just a ball.", "Only wave shapes that fit inside the box are allowed."]),
        rope("The Rope Between Two Friends", "infinite", 1, ["Two friends hold a rope tightly at both ends.", "Shake it gently and one big loop appears.", "The ends never move — just like the walls of the well."]),
      ],
    },
    {
      string: s("Ends that never move", "Watch both ends of the string: they always stay still. That is the boundary condition ψ(0) = ψ(a) = 0.", "infinite", 2),
      videos: [
        well("The Wave Must Touch Zero", "infinite", 2, ["At each wall the wave must be exactly zero.", "Count the half-waves: here there are two.", "Shapes that don't reach zero at the walls are not allowed."]),
        rope("Hold the Handles Still", "infinite", 2, ["The friends keep their hands perfectly still.", "Only patterns that start and end at zero can form.", "That rule is called a boundary condition."]),
      ],
    },
    {
      string: s("Loops on the string", "Each level n puts n loops on the string. Try n = 1, 2 and 3 and count the still points (nodes).", "infinite", 3),
      videos: [
        well("Counting the Loops", "infinite", 3, ["ψₙ = sin(nπx/a): n counts the half-waves.", "Here n = 3 gives three loops.", "Between the loops are nodes, where the wave stays at zero."]),
        rope("One, Two, Three Loops", "infinite", 3, ["Shake a little faster and the rope makes more loops.", "One loop, two loops, three loops — never two and a half.", "Each pattern is a different allowed state."]),
      ],
    },
    {
      string: s("Higher notes, more energy", "More loops means a higher note. The energy grows as n²: n = 2 has 4× the energy of n = 1.", "infinite", 2),
      videos: [
        well("The Energy Staircase", "infinite", 2, ["Each allowed pattern has its own energy: Eₙ = n² E₁.", "n = 2 has four times the energy of n = 1.", "The lowest step, n = 1, is already above zero."]),
        rope("Working Harder for More Loops", "infinite", 2, ["Making two loops takes much more effort than one.", "Energy rises as n² — 1, 4, 9 …", "There is no step halfway between."]),
      ],
    },
    {
      string: s("Where the particle hides", "Where the string swings widest, the particle is most likely to be found. At the still points it is never found.", "infinite", 2),
      videos: [
        well("A Map of Chances", "infinite", 2, ["|ψ|² tells us where the particle is likely to be.", "Each dot is one measurement of its position.", "No dot ever lands on a node."]),
        rope("Where the Rope Swings Most", "infinite", 2, ["The rope moves most at the middle of each loop.", "That is where the particle is most often found.", "At the still points, it is never found."]),
      ],
    },
  ],
  "finite-potential-well": [
    {
      string: s("Walls that give a little", "Now the walls are low hills. The string's ends are no longer fixed — the wave peeks into the walls.", "finite", 1),
      videos: [
        well("A Box with Softer Walls", "finite", 1, ["Now the walls have a finite height.", "The wave no longer has to be zero at the edge.", "It leaks a little way into the walls."]),
        rope("Loose Handles", "finite", 1, ["This time the friends hold the rope loosely.", "The ends wiggle a little instead of staying fixed.", "That's what a finite wall does to the wave."]),
      ],
    },
    {
      string: s("Patterns held in the valley", "Only a few patterns stay trapped. Try n = 1, 2 and 3 — each one is a bound state.", "finite", 2),
      videos: [
        well("Bound States", "finite", 2, ["A finite well holds only a few patterns.", "Each bound state still has a fixed energy.", "Deeper wells hold more states."]),
        rope("Only a Few Patterns Stay", "finite", 2, ["Shake gently: the rope keeps its pattern.", "Each pattern that stays is a bound state.", "There are only a limited number of them."]),
      ],
    },
    {
      string: s("Leaking into the walls", "Look past the walls: the string fades away smoothly instead of stopping. That fading tail is real.", "finite", 1),
      videos: [
        well("The Wave Outside the Well", "finite", 1, ["Outside the well the wave fades exponentially.", "There's a small chance to find the particle in the wall.", "Classically, that would be impossible."]),
        rope("A Tail Past the Hands", "finite", 1, ["Some of the wiggle passes the friends' hands.", "It dies away quickly, but it is there.", "The particle can be found a little outside."]),
      ],
    },
    {
      string: s("A wider valley", "A wider or deeper well fits more patterns, and its energy steps get closer together.", "finite", 3),
      videos: [
        well("Width and Energy", "finite", 3, ["A wider well fits more loops.", "Its energy steps come closer together.", "So it can hold more bound states."]),
        rope("A Longer Rope", "finite", 3, ["A longer rope makes loops more easily.", "More patterns fit with the same effort.", "Width changes the energy levels."]),
      ],
    },
    {
      string: s("Staying in or moving out", "With low energy the string stays in the valley. With too much energy it escapes over the hills.", "finite", 3),
      videos: [
        well("Bound or Free?", "finite", 3, ["Below the wall's height, the particle is bound.", "Above it, the particle can travel freely.", "Free states can have any energy."]),
        rope("Letting Go", "finite", 3, ["Shake gently and the pattern stays.", "Shake too hard and the wave runs away.", "Bound states are trapped; free states are not."]),
      ],
    },
  ],
  "quantum-tunneling": [
    {
      string: s("A wave meets a wall", "Send the wave at a barrier. Part of it bounces back, and part of it shows up on the other side.", "tunnel", 1),
      videos: [
        well("A Particle Meets a Wall", "tunnel", 1, ["A ball without enough energy bounces off the wall.", "A quantum wave behaves differently.", "Some of the wave appears on the far side."]),
        rope("The Foam Wall", "tunnel", 1, ["A soft foam wall stands in the middle of the rope.", "Send a wave toward it.", "A smaller wave comes out the other side!"]),
      ],
    },
    {
      string: s("Fading inside the barrier", "Inside the barrier the wave doesn't oscillate — it fades. Watch it shrink as it passes through.", "tunnel", 2),
      videos: [
        well("The Wave Fades Inside", "tunnel", 2, ["Inside the barrier the wave decays exponentially.", "It doesn't drop straight to zero.", "What's left at the far edge continues on."]),
        rope("Squeezing Through", "tunnel", 2, ["The foam slows the wave down.", "Its height shrinks as it pushes through.", "A little wave still makes it out."]),
      ],
    },
    {
      string: s("Thicker means harder", "Change the barrier thickness: a thicker barrier lets far less of the wave through.", "tunnel", 3),
      videos: [
        well("Barrier Width and Height", "tunnel", 3, ["A thicker or taller barrier lets less through.", "The chance drops very quickly with width.", "Thin barriers are the easiest to tunnel."]),
        rope("A Thicker Foam Wall", "tunnel", 3, ["Now the foam wall is three times thicker.", "Hardly any wave gets through.", "Width matters a lot for tunneling."]),
      ],
    },
    {
      string: s("Bounce back or pass through", "Every time, part of the wave reflects and part is transmitted. Together they add up to 100%.", "tunnel", 1),
      videos: [
        well("Reflection and Transmission", "tunnel", 1, ["Part of the wave reflects from the barrier.", "Part of it is transmitted through.", "Reflection + transmission = 100%."]),
        rope("Some Bounces Back", "tunnel", 1, ["Most of the wave bounces back toward the start.", "A smaller part keeps going.", "Nothing is lost — it's shared between the two."]),
      ],
    },
    {
      string: s("Tunneling at work", "Tunneling powers microscopes, flash memory and even the Sun. Thin barriers make it happen often.", "tunnel", 1),
      videos: [
        well("Tunneling Around Us", "tunnel", 1, ["Scanning tunneling microscopes see single atoms.", "Flash memory stores data by tunneling electrons.", "The Sun shines because protons tunnel together."]),
        rope("Tiny Tunnels Everywhere", "tunnel", 1, ["Electrons tunnel inside your phone's memory.", "Microscopes use tunneling to image atoms.", "Small things tunnel all the time."]),
      ],
    },
  ],
};

export function getSectionMedia(chapterId: string, index: number): SectionMedia {
  const sections = lessonMedia[chapterId] ?? lessonMedia["infinite-potential-well"];
  return sections[Math.min(Math.max(index, 0), sections.length - 1)];
}
