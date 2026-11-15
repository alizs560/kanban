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

      // Calculate tilt angles (subtle: max 8 deg)
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
 * Stagger entrance animation for newly rendered board cards.
 */
export function animateCardsEntrance(containerSelector: string) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = document.querySelectorAll(containerSelector);
  if (!targets.length) return;

  gsap.fromTo(
    targets,
    { opacity: 0, y: 18, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.035,
      ease: "power2.out",
      clearProps: "opacity,transform",
    }
  );
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
