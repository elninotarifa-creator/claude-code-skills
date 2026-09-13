# Motion for React / Next.js — API reference

Import from `motion/react` (v12). The legacy `framer-motion` package re-exports the same API.

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
```

## 1. The `motion` component

Every HTML/SVG tag has a `motion` version: `motion.div`, `motion.button`, `motion.path`, `motion.ul`, etc. Wrap your own component with `motion.create(Component)`.

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}   // mount-from state
  animate={{ opacity: 1, y: 0 }}    // target state
  exit={{ opacity: 0, y: -20 }}     // unmount state (needs AnimatePresence)
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
/>
```

- `initial={false}` skips the mount animation (renders directly at `animate`).
- Any animatable CSS value works: `x`, `y`, `scale`, `rotate`, `opacity`, `backgroundColor`, `color`, `boxShadow`, `clipPath`, CSS vars (`"--foo"`), etc. `x`/`y`/`scale`/`rotate` are GPU transform shortcuts — prefer them.

## 2. Transitions

Default is a **spring** for physical values, a tween for `opacity`/`color`.

```tsx
transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
transition={{ duration: 0.5, ease: "easeOut" }}            // tween
transition={{ type: "spring", bounce: 0.25, duration: 0.6 }} // bounce+duration spring
// per-property overrides:
transition={{ default: { duration: 0.3 }, scale: { type: "spring", bounce: 0.5 } }}
// orchestration:
transition={{ delay: 0.2, staggerChildren: 0.08, delayChildren: 0.1, when: "beforeChildren" }}
```

`ease` accepts `"linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn"...`, a cubic-bezier array `[0.22,1,0.36,1]`, or a custom function.

## 3. Variants — orchestrated, staggered motion

Define named states once; a parent propagates them to children automatically.

```tsx
const list = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

<motion.ul variants={list} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>{i.label}</motion.li>)}
</motion.ul>
```

Children inherit the parent's active variant name unless they override `animate`. This is the cleanest way to stagger anything. Use `staggerDirection: -1` to reverse.

## 4. Gestures (props, no event wiring)

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid #06f" }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // for whileInView
  onHoverStart={() => {}}
  onTap={() => {}}
/>
```

`whileInView` is the simplest scroll-reveal: pair with `initial={{ opacity: 0, y: 24 }}`. `viewport={{ once: true }}` so it doesn't replay.

### Drag

```tsx
<motion.div
  drag                          // or drag="x" / drag="y"
  dragConstraints={{ left: 0, right: 300 }}  // or a ref to a bounding element
  dragElastic={0.2}
  dragMomentum={false}
  whileDrag={{ scale: 1.1 }}
/>
```

## 5. AnimatePresence — exit animations

Animate components as they leave the React tree (modals, route changes, list removals).

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div key="modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

- Direct children need a **stable `key`**.
- `mode="wait"` finishes exit before the next enters (great for tab/page swaps); `mode="popLayout"` removes exiting items from layout flow so siblings reflow smoothly.
- `initial={false}` on `AnimatePresence` disables the first mount animation.

## 6. Layout animations (FLIP) & shared layout

```tsx
<motion.div layout />                          // animate any size/position change
<motion.div layout="position" />               // only position
<motion.div layoutId="card-1" />               // shared-element transition across components
```

- `layout` automatically animates when the element's layout changes (reorder, expand, flex change). Pair with `transition` to tune it.
- `layoutId` morphs one element into another mounting elsewhere (e.g. thumbnail → fullscreen, active-tab underline). Only one element with a given `layoutId` should be mounted at a time.
- Wrap reordering siblings in `<LayoutGroup>`; for shared layout across AnimatePresence, keep `layoutId` consistent.
- Gotcha: transforms and `layout` can fight — read children that need correction may need `layout` too. Avoid animating layout of elements with `overflow` clipping unless intended.

## 7. MotionValues — 60fps without re-renders

State that lives outside React render. Updating a MotionValue does **not** re-render the component.

```tsx
import { useMotionValue, useTransform, useSpring, useScroll, useMotionValueEvent } from "motion/react"

const x = useMotionValue(0)
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])   // map ranges
const smooth = useSpring(x, { stiffness: 200, damping: 30 }) // springy follower

<motion.div style={{ x, opacity }} />
```

### Scroll-linked values

```tsx
const { scrollYProgress } = useScroll()                       // whole page 0→1
const { scrollYProgress } = useScroll({ target: ref,
  offset: ["start end", "end start"] })                       // element relative to viewport
const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])

<motion.div ref={ref} style={{ scaleX: scrollYProgress }} /> // progress bar
```

Read changes imperatively with `useMotionValueEvent(scrollYProgress, "change", v => {...})`.
For pinning / scrubbed timelines / horizontal scroll, prefer the **gsap-framer-scroll-animation** skill.

## 8. Imperative animation — `useAnimate`

```tsx
const [scope, animate] = useAnimate()

async function run() {
  await animate(scope.current, { x: 100 }, { duration: 0.3 })
  await animate("li", { opacity: 1 }, { delay: stagger(0.1) })  // scoped selector + stagger
}
```

Returns a controllable animation (`.pause()`, `.play()`, `.stop()`, `.then()`). `stagger` is imported from `motion/react`.

## 9. Detect viewport — `useInView`

```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true, amount: 0.5 })
```

Boolean, no style coupling — handy for triggering counters, lazy work, or non-motion side effects.

## 10. Global config & accessibility

```tsx
import { MotionConfig, useReducedMotion } from "motion/react"

<MotionConfig reducedMotion="user" transition={{ duration: 0.4 }}>
  <App />
</MotionConfig>
```

- `reducedMotion="user"` respects the OS setting (transforms/layout become instant; opacity still fades).
- `const reduce = useReducedMotion()` to branch manually.
- Sets default `transition` for the whole subtree — define your house spring once here.

## 11. Bundle size — `LazyMotion`

```tsx
import { LazyMotion, domAnimation, m } from "motion/react"   // or domMax for layout/drag

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />   {/* use `m`, not `motion` */}
</LazyMotion>
```

Ships the smallest core and lazy-loads features. Use `m.*` everywhere inside. `domAnimation` ≈ animations+gestures; `domMax` adds layout + drag.

## Next.js notes

- Add `"use client"` to any module importing `motion/react`.
- For page/route transitions in App Router, use a client `template.tsx` wrapping `children` in `<AnimatePresence mode="wait">` keyed by `usePathname()`. See `recipes.md`.
- Avoid layout-shift flashes: set `initial={false}` for content that's server-rendered in final position.
