import { motion } from "framer-motion";

const paragraphs = [
  "🧑‍🚀 Once upon a tiny time, an explorer named Quinn shrank down to the size of an electron and stepped into a magic box.",
  "🚪 The walls of the box were impossibly strong — Quinn could bounce around inside, but could never, ever get out.",
  "🌊 Whenever Quinn tried to move, something strange happened: Quinn stopped acting like a little ball and started behaving like a wave, rippling from wall to wall.",
  "🎸 The box demanded that Quinn's wave always touch zero exactly at both walls — just like a guitar string pinned down at both ends.",
  "✨ Because of this rule, Quinn could only wiggle in a few special patterns: one big hump, two humps, three humps... but never something in between.",
  "🔋 Each special pattern came with its own fixed amount of energy. Quinn could jump from pattern 1 to pattern 2, but could never rest at a wobbly, in-between energy.",
  "🏆 Quinn learned that even standing perfectly still wasn't allowed — there was always a smallest, lowest energy hum, called the zero-point energy.",
];

export default function StoryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 md:p-8 card-hover"
    >
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
        Story Mode
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
        The Tiny Explorer Inside a Magic Box
      </h2>

      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            className="text-foreground/80 leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </div>

      <div className="mt-6 rounded-2xl gradient-primary p-5">
        <p className="text-sm font-semibold text-primary-foreground">
          Moral: A trapped quantum particle cannot have any random energy. Only specific energies are
          allowed.
        </p>
      </div>
    </motion.div>
  );
}
