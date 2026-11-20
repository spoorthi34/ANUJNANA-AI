export interface LessonQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LessonSection {
  title: string;
  content: string;
  simpleTitle: string;
  simpleContent: string;
  analogy: string;
}

export interface LessonChapter {
  id: string;
  chapterNumber: number;
  title: string;
  analogyTitle: string;
  analogy: string;
  sections: LessonSection[];
  quizQuestions: LessonQuizQuestion[];
}

export const lessonChapters: LessonChapter[] = [
  {
    id: "infinite-potential-well",
    chapterNumber: 1,
    title: "Infinite Potential Well",
    analogyTitle: "The quantum guitar string",
    analogy: "The electron is like a string tied between two immovable walls. It can only vibrate in specific standing-wave patterns.",
    sections: [
      {
        title: "The Infinite Potential Well",
        content: "Imagine a particle trapped between two perfectly rigid walls at x = 0 and x = a. Inside the box its potential energy is zero; at the walls it rises without limit, so the particle cannot escape.\n\nWelcome to Chapter 1! Sketch the box, mark both walls, and ask yourself: why can the particle not simply sit still? A quantum particle also behaves as a wave, and only patterns that meet the walls correctly can exist.",
        simpleTitle: "Trapped Inside a Perfect Box",
        simpleContent: "A tiny particle is trapped inside a box with unbreakable walls. It cannot escape, and because it behaves like a wave, only certain wave shapes fit inside. Those allowed shapes give the particle specific energy values. Even its calmest state has some energy.",
        analogy: "Think of a guitar string tied at both ends. It can only vibrate in patterns that fit between those ends.",
      },
      {
        title: "Boundary Conditions",
        content: "The wave function must be zero at each impenetrable wall: ψ(0) = 0 and ψ(a) = 0. These boundary conditions rule out most possible wave shapes.\n\nHow many half-wavelengths can fit between two fixed ends? Try sketching the first three patterns and mark the points where the wave must remain still.",
        simpleTitle: "The Wave Meets the Walls",
        simpleContent: "The wave must stop at both walls. Only shapes with a whole number of half-waves fit between the two fixed ends. The ends decide which patterns are possible.",
        analogy: "A skipping rope held at both handles can only make patterns that keep the handles still.",
      },
      {
        title: "Allowed Wave Patterns",
        content: "The allowed stationary states are ψₙ(x) = √(2/a) sin(nπx/a), where n = 1, 2, 3, … . The integer n counts the half-wavelengths inside the box.\n\nCompare n = 1, 2, and 3. Where are the nodes in each pattern, and how does the number of loops change?",
        simpleTitle: "Patterns That Fit",
        simpleContent: "The first pattern has one loop, the next has two, and the next has three. The number n tells us how many half-wave shapes fit in the box. Each pattern is a different allowed state.",
        analogy: "Like notes on a string, each allowed pattern has its own shape and its own sound.",
      },
      {
        title: "Quantized Energy",
        content: "Each allowed pattern has energy Eₙ = n²π²ℏ²/(2ma²). Energy comes in separate levels rather than a continuous range, and the levels grow with n².\n\nThe ground state is n = 1, not n = 0. What does that tell you about whether a confined particle can have zero energy?",
        simpleTitle: "Energy Comes in Steps",
        simpleContent: "The particle cannot choose any energy it likes. Each wave pattern has its own step on an energy staircase. The first step is already above zero, so the quietest state still has energy.",
        analogy: "You can stand on a stair, but not halfway between two stairs. Quantum energy comes in separate steps.",
      },
      {
        title: "Probability Density",
        content: "The probability density is |ψₙ(x)|². It tells us where position measurements are more or less likely to find the particle; a node has zero probability in that state.\n\nSketch the density for n = 1 and n = 2. How does the number of nodes change, and what would repeated measurements reveal?",
        simpleTitle: "Where Might the Particle Be?",
        simpleContent: "The wave gives us a map of where we might find the particle. At a node, the chance is zero. Repeating the measurement many times reveals the pattern of likely positions.",
        analogy: "A weather map shows where rain is likely; a probability map shows where the particle is likely.",
      },
    ],
    quizQuestions: [
      { question: "What is an infinite potential well?", options: ["A box with infinitely high walls", "A well with finite depth", "A circular container", "A well with no bottom"], correctIndex: 0 },
      { question: "What value must the wave function have at an impenetrable wall?", options: ["Its maximum", "Infinity", "Zero", "One"], correctIndex: 2 },
      { question: "How does the energy of the nth state scale?", options: ["As n", "As n²", "As √n", "It is constant"], correctIndex: 1 },
      { question: "What does a node mean for position probability?", options: ["It is greatest there", "It is zero there", "It is always one half", "It cannot be determined"], correctIndex: 1 },
      { question: "What is true of the ground-state energy in the infinite well?", options: ["It is zero", "It is negative", "It is above zero", "It is continuous"], correctIndex: 2 },
    ],
  },
  {
    id: "finite-potential-well",
    chapterNumber: 2,
    title: "Finite Potential Well",
    analogyTitle: "A valley with low hills",
    analogy: "A particle in a finite well is like a marble in a valley with hills: it is mostly inside, but its wave can extend into the slopes.",
    sections: [
      {
        title: "A Well with Finite Walls",
        content: "A finite potential well has a lower potential-energy region surrounded by barriers of limited height. Unlike an infinite wall, a finite barrier does not force the wave function to end abruptly.\n\nDraw the well and label its depth V₀. If the particle's energy is below the barrier, what might its wave look like near the edges?",
        simpleTitle: "A Box with Softer Walls",
        simpleContent: "This box has walls that are high but not impossible to cross. The particle is usually inside, but its wave can reach a little way into the walls.",
        analogy: "Imagine a valley surrounded by gentle hills rather than tall, unbreakable walls.",
      },
      {
        title: "Bound States",
        content: "For energies below the outside potential, the particle can be bound to the well. Only certain standing-wave states satisfy the matching conditions at both edges, so the bound-state energies are discrete.\n\nHow might making the well wider change the number of patterns that can fit?",
        simpleTitle: "Patterns Held in the Valley",
        simpleContent: "Some wave patterns can stay mostly inside the valley. Only certain patterns fit, so the particle still has special allowed energies.",
        analogy: "A larger room can fit more dance steps; a wider well can support more bound wave patterns.",
      },
      {
        title: "The Wave Outside the Well",
        content: "At a finite barrier, the bound-state wave function continues beyond the well and decreases exponentially into the classically forbidden region. It does not abruptly become zero at the edge.\n\nWhere would you expect the particle to be most likely: deep inside the well or far out in the barrier? Explain your sketch.",
        simpleTitle: "The Wave Leaks a Little",
        simpleContent: "The wave does not stop right at the edge. It fades as it reaches into the wall, so there is a small chance of finding the particle near the outside.",
        analogy: "A smell is strongest near its source and fades as it spreads farther away.",
      },
      {
        title: "Well Width and Energy",
        content: "The well's width and depth affect its bound states. A wider or deeper well can support more bound levels, while a narrow or shallow well may support fewer.\n\nCompare two sketches with different widths. Which one can hold more distinct standing-wave patterns?",
        simpleTitle: "How Many Steps Fit?",
        simpleContent: "A wider or deeper valley can hold more wave patterns. A narrow, shallow valley may have only a few allowed states.",
        analogy: "A longer shelf has room for more books; a wider well has room for more bound states.",
      },
      {
        title: "Bound and Unbound States",
        content: "Below the outside barrier, states are bound and have discrete energies. At or above the outside potential, the particle can travel away from the well and the energy spectrum is no longer the same set of bound levels.\n\nUse an energy diagram to distinguish a particle held by the well from one free to move outside it.",
        simpleTitle: "Staying In or Moving Out",
        simpleContent: "A particle with low enough energy can stay held in the well. With enough energy, it can move away into the surrounding space.",
        analogy: "A ball below the top of a hill stays in the valley; one with enough energy can roll over it.",
      },
    ],
    quizQuestions: [
      { question: "How are the walls of a finite potential well different?", options: ["They have limited height", "They are infinitely high", "They do not affect the wave", "They are always negative"], correctIndex: 0 },
      { question: "What happens to a bound-state wave function in the barrier?", options: ["It ends abruptly", "It decreases into the barrier", "It becomes infinite", "It is always constant"], correctIndex: 1 },
      { question: "What kind of energies do bound states have?", options: ["A continuous range only", "Discrete allowed levels", "Only zero energy", "No energy"], correctIndex: 1 },
      { question: "Which well can generally support more bound patterns?", options: ["A wider or deeper well", "A narrower and shallower well", "Only an infinite well", "Width makes no difference"], correctIndex: 0 },
      { question: "What can happen when a particle has enough energy to exceed the well barrier?", options: ["It must remain bound", "It can move away from the well", "Its wave function disappears", "Its energy becomes zero"], correctIndex: 1 },
    ],
  },
  {
    id: "quantum-tunneling",
    chapterNumber: 3,
    title: "Quantum Tunneling",
    analogyTitle: "A wave through a barrier",
    analogy: "A quantum wave can extend through a barrier, leaving a chance of detecting the particle on the other side—even when classical physics forbids it.",
    sections: [
      {
        title: "Meeting a Quantum Barrier",
        content: "Classically, a particle with energy below a barrier cannot pass over it. Quantum mechanics describes the particle with a wave function, which can extend into and sometimes through the barrier.\n\nSketch an incoming wave approaching a barrier. What would classical physics predict, and what extra possibility does the quantum picture allow?",
        simpleTitle: "A Particle Meets a Wall",
        simpleContent: "A tiny particle reaches a barrier that is too high for it to climb in the usual way. But its quantum wave can spread into the barrier, leaving a small chance of appearing on the other side.",
        analogy: "A water wave can reach beyond a breakwater even when a solid object could not pass over it.",
      },
      {
        title: "Inside the Barrier",
        content: "Within a classically forbidden barrier, the wave function typically decreases exponentially rather than vanishing immediately. If the barrier is not too wide, some amplitude can remain at its far edge.\n\nCompare the wave at the near and far sides. How does the remaining amplitude relate to transmission probability?",
        simpleTitle: "The Wave Fades Inside",
        simpleContent: "Inside the barrier, the wave gets smaller. If the barrier is narrow enough, a little wave can make it all the way through.",
        analogy: "A flashlight beam becomes dimmer as it passes through a thicker curtain.",
      },
      {
        title: "Barrier Width and Height",
        content: "Tunneling probability falls rapidly as a barrier becomes wider or higher, and increases when the particle energy approaches the barrier height. The effect depends on the barrier and particle, not on a particle gaining extra energy to jump over it.\n\nRank three barriers by expected transmission: narrow, medium, and wide. Explain your ordering.",
        simpleTitle: "Some Barriers Are Harder",
        simpleContent: "A wider or taller barrier makes tunneling less likely. A thinner or lower barrier gives the wave a better chance of reaching the other side.",
        analogy: "It is easier for a sound to pass through a thin door than a thick wall.",
      },
      {
        title: "Reflection and Transmission",
        content: "When a wave meets a barrier, it can be partly reflected and partly transmitted. For a particle incident on a simple barrier, the probabilities of reflection and transmission add to one when all outcomes are included.\n\nDraw the incoming, reflected, and transmitted parts. Which outcomes would repeated measurements reveal?",
        simpleTitle: "Some Bounces Back",
        simpleContent: "When the particle's wave reaches the barrier, some can bounce back and some can pass through. Repeating the experiment shows the chances of each result.",
        analogy: "A ball bouncing from a wall is like reflection; a small part of a wave getting through is transmission.",
      },
      {
        title: "Where Tunneling Appears",
        content: "Tunneling is important in phenomena such as alpha decay and in devices such as the scanning tunneling microscope. It is not a person-sized object casually passing through an everyday wall; the probability depends strongly on mass and barrier properties.\n\nChoose one example and identify what plays the role of the barrier and what is measured on the other side.",
        simpleTitle: "Tiny-Scale Applications",
        simpleContent: "Tunneling helps explain some changes in atoms and helps special microscopes measure surfaces. It matters most for tiny particles and very small barriers.",
        analogy: "A scanning tunneling microscope senses a surface by measuring a tiny current across a very small gap.",
      },
    ],
    quizQuestions: [
      { question: "What does quantum tunneling allow?", options: ["A chance to cross a classically forbidden barrier", "A particle to gain unlimited energy", "A wave function to vanish everywhere", "A barrier to become zero"], correctIndex: 0 },
      { question: "How does the wave function behave inside a simple forbidden barrier?", options: ["It typically decreases", "It is always infinite", "It becomes a constant maximum", "It must instantly become zero"], correctIndex: 0 },
      { question: "What generally happens when a barrier gets wider?", options: ["Transmission becomes more likely", "Transmission probability falls", "The particle's mass becomes zero", "Nothing can change"], correctIndex: 1 },
      { question: "What can happen when a wave meets a barrier?", options: ["Only transmission", "Only reflection", "Reflection and transmission", "The particle disappears"], correctIndex: 2 },
      { question: "Which is an application or example related to tunneling?", options: ["Scanning tunneling microscope", "A classical pendulum", "A magnifying glass", "A thermometer"], correctIndex: 0 },
    ],
  },
];

export const defaultLessonChapter = lessonChapters[0];