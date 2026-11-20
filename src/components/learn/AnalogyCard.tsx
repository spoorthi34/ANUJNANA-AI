import { motion } from "framer-motion";

function GuitarString() {
  return (
    <svg viewBox="0 0 220 120" className="w-full h-auto">
      <rect x="10" y="10" width="10" height="100" rx="2" className="fill-muted-foreground/40" />
      <rect x="200" y="10" width="10" height="100" rx="2" className="fill-muted-foreground/40" />
      <motion.path
        d="M 20 60 Q 115 10 210 60"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: ["M 20 60 Q 115 10 210 60", "M 20 60 Q 115 110 210 60", "M 20 60 Q 115 10 210 60"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export default function AnalogyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass-card rounded-3xl overflow-hidden card-hover"
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-6 flex flex-col justify-center items-center bg-secondary/5">
          <GuitarString />
          <p className="text-xs text-muted-foreground mt-2">A vibrating guitar string, fixed at both ends</p>
        </div>
        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-foreground mb-2">Standing Waves, Fixed Ends</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            A guitar string tied down at both ends can only vibrate in specific shapes — patterns with a
            whole number of half-wavelengths between the fixed ends. Any other shape cancels itself out.
            The particle inside an infinite well behaves the same way: its wave function must be zero at
            the walls, so only certain standing-wave shapes — and therefore only certain energies — survive.
          </p>
        </div>
      </div>
      <div className="gradient-accent px-6 py-3 text-center">
        <p className="text-sm font-medium text-primary-foreground">
          Quantum particles behave like standing waves inside the box.
        </p>
      </div>
    </motion.div>
  );
}
