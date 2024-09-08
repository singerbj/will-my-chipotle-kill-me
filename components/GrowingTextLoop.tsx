import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const GrowingTextLoop = ({ messages }: { messages: string[] }) => {
  const controls = useAnimation();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        await controls.start({
          opacity: 1,
          transition: { duration: 1.5 },
          transform: "translateY(0px)",
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await controls.start({
          opacity: 0,
          transition: { duration: 0.75 },
          transform: "translateY(20px)",
        });

        await new Promise((resolve) => setTimeout(resolve, 250));

        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);

        await controls.start({
          opacity: 1,
          transition: { duration: 1.5 },
          transform: "translateY(0px)",
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));
        await controls.start({
          opacity: 0,
          transition: { duration: 0.75 },
          transform: "translateY(-20px)",
        });

        await new Promise((resolve) => setTimeout(resolve, 250));

        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }
    };

    sequence();
  }, [controls, messages.length]);

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0 }}
      className="text-center"
    >
      <p>{messages[currentMessageIndex]}</p>
    </motion.div>
  );
};

export default GrowingTextLoop;
