---
name: motion
description: >-
  Build professional, animated websites and UI with Motion (the library formerly
  known as Framer Motion), v12. Use this skill whenever the user wants smooth
  animations, micro-interactions, page/route transitions, hover/tap effects,
  enter/exit animations, layout animations, shared-element transitions, drag
  interactions, gesture-driven UI, or springs — in React, Next.js, vanilla
  JavaScript, or Vue. Triggers on "Motion", "Framer Motion", "animate this",
  "add animations", "micro-interactions", "page transition", "fade in", "slide
  in", "AnimatePresence", "layout animation", "shared layout", "spring
  animation", "stagger", "hover effect", "professional website animations", or
  any request to make a web UI feel polished and alive. For scroll-specific work
  (parallax, pinning, scrubbing) prefer the gsap-framer-scroll-animation skill;
  for creative/visual direction pair with top-design and frontend-design.
metadata:
  author: jaime
  version: "1.0.0"
  library: motion
  library_version: "12.40.0"
  source: https://github.com/motiondivision/motion
---

# Motion — Professional Web Animations

Motion (formerly **Framer Motion**) is an open-source animation library for **JavaScript, React and Vue**. It is the de-facto standard for production web animation: a tiny hybrid engine that animates with the **Web Animations API** (hardware-accelerated, runs off the main thread) and falls back to a JS spring engine for everything WAAPI can't do.

This skill gives you the accurate v12 API and battle-tested recipes for making sites feel premium. Use it to *implement* motion; pair it with **top-design** / **frontend-design** for *creative direction* and **gsap-framer-scroll-animation** for heavy scroll choreography.

## Install

```bash
# React / Next.js / vanilla JS
npm install motion

# Vue
npm install motion-v
```

Import paths (v12):

| Import | Use for |
|---|---|
| `import { animate, scroll, inView, stagger, spring, hover, press } from "motion"` | Vanilla JS / any framework |
| `import { motion, AnimatePresence, useScroll, useTransform, ... } from "motion/react"` | **React / Next.js** (this is the modern path; the old `"framer-motion"` package still works and re-exports the same API) |
| `import { animate } from "motion/mini"` | Ultra-small (~2.5kb) vanilla animate, no extra features |
| `import * as motion from "motion/react-m"` + `LazyMotion` | Code-split React features to shrink bundle |

> Next.js App Router: `motion` components are client components. Put `"use client"` at the top of any file that imports from `motion/react`, or wrap them in a small client component.

## Decision guide — which tool?

| Need | Reach for |
|---|---|
| React component animations, gestures, exit animations | `motion.*` + `AnimatePresence` (this skill) |
| Animate plain DOM / no framework | `animate()` from `"motion"` (this skill) |
| Heavy scroll: pinning, horizontal scroll, scrubbed timelines | **gsap-framer-scroll-animation** skill (GSAP ScrollTrigger) |
| Simple scroll reveals / parallax in React | `whileInView` or `useScroll`+`useTransform` (this skill) |
| Award-level art direction, type, layout | **top-design** / **frontend-design** skills |

## Core mental model (read this first)

1. **`<motion.div>` is a normal element + animation superpowers.** Any style in `animate` animates; `initial` is the starting state; `exit` runs when it leaves the tree (needs `AnimatePresence`).
2. **Variants** are named animation states you propagate from a parent to children — the key to clean staggered, orchestrated UI.
3. **Gestures are props**: `whileHover`, `whileTap`, `whileFocus`, `whileInView`, `drag`. No event wiring.
4. **`layout` prop** animates any change in size/position automatically (FLIP). `layoutId` does shared-element transitions across components.
5. **Springs, not durations**, are the default for natural motion. Reserve eased durations for opacity/color and precise choreography.
6. **MotionValues** (`useMotionValue`, `useTransform`, `useScroll`) drive values *outside* React render for 60fps without re-renders.

## Reference files (read the one you need)

- `references/react.md` — full React/Next.js API: `motion`, variants, `AnimatePresence`, gestures, layout & shared layout, `useScroll`/`useTransform`/`useSpring`, `useAnimate`, `useInView`, `MotionConfig`, `LazyMotion`, reduced motion, SSR notes.
- `references/vanilla.md` — vanilla JS API: `animate`, `scroll`, `inView`, `stagger`, `spring`, `hover`, `press`, timelines/sequences.
- `references/recipes.md` — copy-paste recipes for professional sites: page transitions, animated navbar, staggered hero, card hover, modal, accordion, scroll reveal, magnetic button, marquee, number counter; plus performance & accessibility checklist.

## Golden rules for "professional", not "AI-generic"

- **Animate `transform` and `opacity`** (cheap, GPU). Avoid animating `width`, `height`, `top`, `left`, `margin` — use `layout` or `scale`/`x`/`y` instead.
- **Subtle > flashy.** 150–400ms, small distances (8–24px), gentle springs. Motion supports intent; it isn't the point.
- **Respect `prefers-reduced-motion`** — wrap the app in `<MotionConfig reducedMotion="user">` or branch on `useReducedMotion()`.
- **One spring config per project** for consistency (e.g. `{ type: "spring", stiffness: 300, damping: 30 }`). Define it once, reuse.
- **Stagger entrances** instead of animating everything at once — it reads as intentional, not noisy.
- Always set `initial={false}` when you don't want mount animations (e.g. on first server render) to avoid flashes.
