"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "characters" | "words";
  direction?: "top" | "bottom" | "left" | "right";
  onAnimationComplete?: () => void;
  className?: string;
}

export default function BlurText({
  text,
  delay = 50,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  className = "",
}: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const items = animateBy === "words" ? text.split(" ") : text.split("");

  const getDirectionClass = (direction: string) => {
    switch (direction) {
      case "top":
        return "translate-y-[-20px]";
      case "bottom":
        return "translate-y-[20px]";
      case "left":
        return "translate-x-[-20px]";
      case "right":
        return "translate-x-[20px]";
      default:
        return "translate-y-[-20px]";
    }
  };
  useEffect(() => {
    if (isVisible) {
      const totalDelay = items.length * delay + 500;
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, totalDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, items.length, delay, onAnimationComplete]);

  return (
    <div className={cn("inline-block", className)}>
      {items.map((item, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all duration-500 ease-out",
            isVisible
              ? "opacity-100 translate-x-0 translate-y-0 blur-0"
              : cn("opacity-0 blur-sm", getDirectionClass(direction)),
          )}
          style={{
            transitionDelay: isVisible ? `${index * delay}ms` : "0ms",
          }}
        >
          {item}
          {animateBy === "words" && index < items.length - 1 && "\u00A0"}
        </span>
      ))}
    </div>
  );
}
