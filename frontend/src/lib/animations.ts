"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * High-performance 3D tilt effect on hover using GSAP quickTo.
 * Disables when dragging or in reduced-motion mode.
 */
export function useCardTilt<T extends HTMLElement = HTMLElement>(
  disabled: boolean = false
) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Hardware accelerated quickTo setters
    const setRotateX = gsap.quickTo(el, "rotateX", {
      duration: 0.35,
      ease: "power2.out",
    });
    const setRotateY = gsap.quickTo(el, "rotateY", {
      duration: 0.35,
      ease: "power2.out",
    });
    const setY = gsap.quickTo(el, "y", {
      duration: 0.35,
      ease: "power2.out",
    });
    const setScale = gsap.quickTo(el, "scale", {
      duration: 0.35,
      ease: "power2.out",
    });

    // Ensure 3D perspective context
    gsap.set(el, {
      transformPerspective: 900,
      transformStyle: "preserve-3d",
      willChange: "transform",
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (subtle: max 7 deg)
      const rotateX = -((y - centerY) / centerY) * 7;
      const rotateY = ((x - centerX) / centerX) * 7;

      setRotateX(rotateX);
      setRotateY(rotateY);
      setY(-4);
      setScale(1.018);
    };

    const onMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
      setY(0);
      setScale(1);
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(el);
      // Clean up inline styles safely
      gsap.set(el, {
        clearProps: "transform,transformPerspective,transformStyle,willChange",
      });
    };
  }, [disabled]);

  return elementRef;
}

/**
 * Micro-bounce animation for like button.
 */
export function animateLikeButton(element: HTMLElement | null) {
  if (!element) return;
  gsap.fromTo(
    element,
    { scale: 0.75 },
    { scale: 1.35, duration: 0.16, ease: "back.out(2.5)", yoyo: true, repeat: 1 }
  );
}

/**
 * Master sequential entrance:
 * 1. Surrounding layout elements (navbar, sidebar rail, columns) appear first.
 * 2. Only after those elements settle, cards are dealt into the board one by one ("دونه دونه").
 */
export function animatePageAndCardsSequence() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const tl = gsap.timeline();

  const rail = document.querySelector(".sidebar-rail");
  const navGlobal = document.querySelector(".navbar-global");
  const navControls = document.querySelector(".navbar-controls");
  const columns = document.querySelectorAll(".board-column, .solo-column");
  const cards = document.querySelectorAll(".task-card, .solo-card");

  if (rail) {
    tl.fromTo(
      rail,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.32, ease: "power2.out", clearProps: "all" },
      0
    );
  }

  if (navGlobal) {
    tl.fromTo(
      navGlobal,
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.32, ease: "power2.out", clearProps: "all" },
      0.06
    );
  }

  if (navControls) {
    tl.fromTo(
      navControls,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "all" },
      0.12
    );
  }

  if (columns.length) {
    tl.fromTo(
      columns,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "all",
      },
      0.18
    );
  }

  // Cards are dealt in ONE BY ONE after all surrounding components are in place
  if (cards.length) {
    tl.fromTo(
      cards,
      {
        opacity: 0,
        y: 35,
        scale: 0.88,
        rotateZ: (i) => (i % 2 === 0 ? -2 : 2),
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateZ: 0,
        duration: 0.42,
        stagger: {
          each: 0.09, // Distinct one-by-one deal-in pacing
          from: "start",
        },
        ease: "back.out(1.4)",
        clearProps: "all",
      },
      ">+=0.05"
    );
  }

  return tl;
}

/**
 * Deal-in animation for cards one by one when filtering, changing phase, or switching view.
 */
export function animateCardsDealSequence(containerSelector: string = ".task-card") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = document.querySelectorAll(containerSelector);
  if (!cards.length) return;

  gsap.fromTo(
    cards,
    {
      opacity: 0,
      y: 28,
      scale: 0.9,
      rotateZ: (i) => (i % 2 === 0 ? -1.8 : 1.8),
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateZ: 0,
      duration: 0.38,
      stagger: {
        each: 0.08,
        from: "start",
      },
      ease: "back.out(1.3)",
      clearProps: "all",
    }
  );
}

/**
 * Stagger entrance animation for newly rendered board cards.
 */
export function animateCardsEntrance(containerSelector: string) {
  animateCardsDealSequence(containerSelector);
}

/**
 * Staggered cascade reveal for drawer items when drawer opens.
 */
export function animateDrawerCascade(container: HTMLElement | null) {
  if (!container) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = container.querySelectorAll(
    ".drawer-title-group, .ai-header-status, .ai-message-bubble, .team-member-item, .notification-card, .activity-event"
  );
  if (!items.length) return;

  gsap.fromTo(
    items,
    { opacity: 0, x: -14 },
    {
      opacity: 1,
      x: 0,
      duration: 0.32,
      stagger: 0.04,
      ease: "power2.out",
      clearProps: "all",
    }
  );
}

/**
 * Smooth pop-in animation for a newly added chat message bubble.
 */
export function animateNewMessage(element: HTMLElement | null) {
  if (!element) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.fromTo(
    element,
    { opacity: 0, y: 14, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.5)",
      clearProps: "all",
    }
  );
}
