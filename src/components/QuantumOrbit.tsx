import { motion } from "framer-motion";

export function QuantumOrbit() {
  const orbits = [
    { rx: 120, ry: 44, rotate: 0, duration: 8, dotColor: "hsl(var(--primary))" },
    { rx: 120, ry: 44, rotate: 60, duration: 11, dotColor: "hsl(var(--secondary))" },
    { rx: 120, ry: 44, rotate: 120, duration: 14, dotColor: "hsl(var(--primary))" },
  ];

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto" aria-hidden="true">
      <svg viewBox="0 0 320 320" className="w-full h-full">
        <defs>
          <radialGradient id="nucleusGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </radialGradient>
        </defs>

        <g transform="translate(160,160)">
          {orbits.map((o, i) => (
            <ellipse
              key={i}
              rx={o.rx}
              ry={o.ry}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              transform={`rotate(${o.rotate})`}
              opacity={0.6}
            />
          ))}

          <motion.circle
            r="20"
            fill="url(#nucleusGradient)"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {orbits.map((o, i) => (
            <motion.g
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: o.duration, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <g transform={`rotate(${o.rotate})`}>
                <circle cx={o.rx} cy="0" r="7" fill={o.dotColor} />
                <circle cx={o.rx} cy="0" r="12" fill={o.dotColor} opacity={0.2} />
              </g>
            </motion.g>
          ))}
        </g>
      </svg>

      <motion.div
        className="absolute top-4 right-6 h-3 w-3 rounded-full bg-secondary/70"
        animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-8 left-4 h-2 w-2 rounded-full bg-primary/70"
        animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
}
