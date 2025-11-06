"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./PillNav.css";

interface PillNavItem {
  label: string;
  href?: string;
  id?: string;
}

interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  onItemClick?: (item: PillNavItem, index: number) => void;
}

const PillNav = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#2563eb",
  pillColor = "#ffffff",
  hoveredPillTextColor = "#ffffff",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  onItemClick,
}: PillNavProps) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (item: PillNavItem, index: number) => {
    setActiveIndex(index);
    onItemClick?.(item, index);
  };

  const handleItemHover = (index: number) => {
    setHoveredIndex(index);
  };

  const handleItemLeave = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    if (initialLoadAnimation && navRef.current) {
      const nav = navRef.current;
      nav.style.opacity = "0";
      nav.style.transform = "translateY(-10px)";

      setTimeout(() => {
        nav.style.transition = "all 0.6s ease-out";
        nav.style.opacity = "1";
        nav.style.transform = "translateY(0)";
      }, 100);
    }
  }, [initialLoadAnimation]);

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn("pill-nav-container", className)}
      style={cssVars}
      ref={navRef}
    >
      <nav className="pill-nav" aria-label="Form Navigation">
        <div className="pill-nav-items">
          <ul className="pill-list" role="menubar">
            {items.map((item, index) => (
              <li key={item.id || `item-${index}`} role="none">
                <button
                  role="menuitem"
                  className={cn(
                    "pill",
                    activeIndex === index && "is-active",
                    hoveredIndex === index && "is-hovered",
                  )}
                  aria-label={item.label}
                  onClick={() => handleItemClick(item, index)}
                  onMouseEnter={() => handleItemHover(index)}
                  onMouseLeave={handleItemLeave}
                  style={{
                    transform:
                      hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease-out",
                  }}
                >
                  <span className="hover-circle" aria-hidden="true" />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;
