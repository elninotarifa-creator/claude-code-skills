# Motion for vanilla JS — API reference

Framework-agnostic. Works with plain HTML, Webflow, Astro, Svelte, Vue, etc. v12.

```js
import { animate, scroll, inView, stagger, spring, hover, press } from "motion"
// ultra-small alternative (animate only, ~2.5kb):
import { animate } from "motion/mini"
```

## `animate(target, keyframes, options)`

`target` = a selector string, element, NodeList, array of elements, or a plain object/MotionValue.

```js
// single value
animate("#box", { opacity: 1, x: 100 }, { duration: 0.5, ease: "easeOut" })

// keyframe arrays
animate(".dot", { y: [0, -30, 0] }, { duration: 1, repeat: Infinity })

// spring
animate(el, { scale: 1.2 }, { type: "spring", stiffness: 300, damping: 20 })

// animate a plain number (great for counters / canvas)
animate(0, 100, { duration: 2, onUpdate: v => el.textContent = Math.round(v) })

// animate a CSS variable
animate(document.documentElement, { "--hue": 200 }, { duration: 1 })
```

Returns an `AnimationPlaybackControls`: `.pause()`, `.play()`, `.stop()`, `.cancel()`, `.complete()`, `.time`, `.speed`, and a thenable (`await animate(...)`).

### Options

`duration` (s), `delay` (number or function for stagger), `ease`, `repeat`, `repeatType` (`"loop" | "reverse" | "mirror"`), `repeatDelay`, `type: "spring"` with `stiffness`/`damping`/`mass`/`bounce`, `onUpdate`, `onComplete`.

## Sequences (timelines)

Pass an array of `[target, keyframes, options]` segments. `at` controls timing (`"<"` = with previous, `"-0.2"` = relative, absolute number).

```js
animate([
  ["#title", { opacity: 1, y: 0 }, { duration: 0.4 }],
  ["#subtitle", { opacity: 1 }, { at: "-0.2" }],
  [".cta", { scale: [0.9, 1] }, { at: "<" }],
])
```

## `stagger(duration, options)`

Use as the `delay` to offset a group.

```js
animate(".item", { opacity: 1, y: 0 }, { delay: stagger(0.08, { from: "center" }) })
// from: "first" | "last" | "center" | index number
```

## `scroll(onScrollOrAnimation, options)`

Scroll-linked progress, off main thread when possible.

```js
// drive an animation by scroll progress
scroll(animate(".bar", { scaleX: [0, 1] }))

// or a callback with progress 0→1
scroll(p => { document.querySelector(".bar").style.transform = `scaleX(${p})` })

// element-relative
scroll(animate("#hero", { opacity: [1, 0] }), {
  target: document.querySelector("#hero"),
  offset: ["start start", "end start"],
})
```

For pinning, horizontal scroll, and complex scrubbed timelines, prefer GSAP via the **gsap-framer-scroll-animation** skill.

## `inView(target, onStart, options)`

Fires when an element enters the viewport; return a cleanup for when it leaves.

```js
inView(".reveal", (el) => {
  animate(el, { opacity: 1, y: 0 }, { duration: 0.6 })
  return () => animate(el, { opacity: 0 })   // optional: on leave
}, { amount: 0.3 })   // amount: 0..1 or "some" | "all"; margin: "-100px"
```

## `hover(target, onStart)` and `press(target, onStart)`

Robust pointer gestures (handle touch, cancel, filter actual hover-capable devices).

```js
hover(".card", (el) => {
  animate(el, { scale: 1.04 }, { type: "spring", stiffness: 300 })
  return () => animate(el, { scale: 1 })   // on hover end
})

press("button", (el) => {
  animate(el, { scale: 0.95 })
  return () => animate(el, { scale: 1 })   // on release
})
```

## `spring(options)` generator

Create a reusable spring easing for use outside `animate` (e.g. with WAAPI).

```js
const bouncy = spring({ stiffness: 300, damping: 10 })
```

## Accessibility

```js
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
animate(el, { opacity: 1 }, { duration: reduce ? 0 : 0.6 })
```
Keep transform-distance animations instant under reduced motion; opacity fades are usually fine.
