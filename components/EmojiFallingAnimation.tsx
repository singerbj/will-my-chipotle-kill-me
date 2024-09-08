import React, { useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface EmojiFallingAnimationProps {
  emoji: string;
}

const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const EmojiFallingAnimation: React.FC<EmojiFallingAnimationProps> = ({
  emoji,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      await controls.start({
        opacity: 1,
        y: randInt(200, 1500),
        transition: { duration: randInt(0.5, 3) },
      });
      await controls.start({
        opacity: 0,
        transition: { duration: 0.5 },
      });
    };

    startAnimation();
  }, [controls]);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={controls}
        style={{
          fontSize: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: randInt(-100, 0),
          left: randInt(0, window.innerWidth),
        }}
      >
        {emoji}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiFallingAnimation;
