import React, { useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface EmojiFlyingAnimationProps {
  emoji: string;
}

const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const EmojiFlyingAnimation: React.FC<EmojiFlyingAnimationProps> = ({
  emoji,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      // Start entering animation with gravity-like easing
      await controls.start({
        opacity: 1,
        y: randInt(-200, -1000),
        transition: { duration: 1, ease: [0.33333, 0.66667, 0.66667, 1] }, // Custom cubicBezier easing for the upward motion
      });
      // Start exit animation with gravity-like easing
      await controls.start({
        opacity: 0,
        y: 0,
        transition: { duration: 1, ease: [0.33333, 0, 0.66667, 0.33333] }, // Custom cubicBezier easing for the downward motion
      });
    };

    startAnimation();
  }, [controls]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 0 }} // Start off screen
        animate={controls} // Use the animation controls
        exit={{ opacity: 0, y: 0 }} // Exit animation
        style={{
          fontSize: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          bottom: randInt(0, -100),
          left: randInt(0, window.innerWidth),
        }}
      >
        {emoji}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiFlyingAnimation;
