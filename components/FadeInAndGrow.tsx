import React, { ReactNode, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const FadeInAndGrow = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: 1,
        height: "auto",
        transition: { duration: 1.5, delay },
      }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
};

export default FadeInAndGrow;
