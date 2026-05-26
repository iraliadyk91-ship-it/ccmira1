import { motion } from "framer-motion";

export function AnimatedLogo({ size = 44 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="var(--brand-brown)"
        strokeWidth="1.5"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M32 12 C 20 24, 20 40, 32 52 C 44 40, 44 24, 32 12 Z"
        fill="none"
        stroke="var(--brand-terracotta)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
        transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.circle
        cx="32"
        cy="32"
        r="3"
        fill="var(--brand-brown)"
        variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
        transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
      />
    </motion.svg>
  );
}