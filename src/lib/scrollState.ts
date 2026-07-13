/**
 * Shared mutable scroll state, written by GSAP ScrollTrigger (DOM side)
 * and read by R3F's useFrame (WebGL side). Kept as a plain module-level
 * object so reads/writes never trigger React re-renders — the two worlds
 * stay decoupled and the canvas animates at frame rate.
 */
export const scrollState = {
  /** 0 at top of page, 1 at end of the hero scroll sequence */
  progress: 0,
};
