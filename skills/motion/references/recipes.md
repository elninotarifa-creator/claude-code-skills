# Motion — production recipes for professional sites

Copy-paste patterns. React examples import from `motion/react` (add `"use client"` in Next.js). Tune the shared spring once and reuse it.

```tsx
// house style — define once, import everywhere
export const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
```

## 1. Staggered hero entrance

```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }
const line = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } } }

<motion.section variants={container} initial="hidden" animate="show">
  <motion.h1 variants={line}>Build something remarkable</motion.h1>
  <motion.p  variants={line}>A subheading that fades in just after.</motion.p>
  <motion.div variants={line}><button>Get started</button></motion.div>
</motion.section>
```

## 2. Scroll reveal (simplest)

```tsx
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: EASE_OUT }}
/>
```
Make a reusable `<Reveal>` wrapper and apply it to sections. For parallax/pinning → gsap-framer-scroll-animation skill.

## 3. Scroll progress bar

```tsx
const { scrollYProgress } = useScroll()
<motion.div style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
  className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50" />
```

## 4. Card hover lift

```tsx
<motion.article
  whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,.12)" }}
  whileTap={{ scale: 0.99 }}
  transition={SPRING}
/>
```

## 5. Modal / dialog with backdrop

```tsx
<AnimatePresence>
  {open && (
    <>
      <motion.div key="backdrop" className="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={close} />
      <motion.div key="dialog" className="dialog"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={SPRING} role="dialog" aria-modal>
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

## 6. Accordion / expand (auto-height via layout)

```tsx
<motion.div layout transition={SPRING}>
  <button onClick={() => setOpen(!open)}>Title</button>
  <AnimatePresence initial={false}>
    {open && (
      <motion.div layout key="body"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{ overflow: "hidden" }}
        transition={{ duration: 0.3, ease: EASE_OUT }}>
        {content}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

## 7. Animated nav underline (shared layout)

```tsx
{tabs.map(t => (
  <button key={t.id} onClick={() => setActive(t.id)} className="relative">
    {t.label}
    {active === t.id && (
      <motion.span layoutId="underline"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black"
        transition={SPRING} />
    )}
  </button>
))}
```

## 8. Next.js App Router page transition

`app/template.tsx` (a template re-mounts on navigation):

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main key={path}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}>
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
```

## 9. Magnetic button (MotionValue + spring)

```tsx
const x = useMotionValue(0), y = useMotionValue(0)
const sx = useSpring(x, SPRING), sy = useSpring(y, SPRING)
function onMove(e: React.MouseEvent) {
  const r = e.currentTarget.getBoundingClientRect()
  x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
  y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
}
<motion.button style={{ x: sx, y: sy }}
  onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0) }} />
```

## 10. Infinite marquee

```tsx
<motion.div style={{ display: "flex", gap: 40 }}
  animate={{ x: ["0%", "-50%"] }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
  {[...logos, ...logos].map((l, i) => <img key={i} src={l} />)}
</motion.div>
```

## 11. Number counter on view

```tsx
const ref = useRef(null)
const inView = useInView(ref, { once: true })
const [n, setN] = useState(0)
useEffect(() => {
  if (!inView) return
  const controls = animate(0, 1240, { duration: 1.5, ease: "easeOut", onUpdate: v => setN(Math.round(v)) })
  return () => controls.stop()
}, [inView])
<span ref={ref}>{n.toLocaleString()}</span>
// `animate` here is imported from "motion/react"
```

## Vanilla equivalents (no framework)

```js
import { animate, inView, hover, stagger, scroll } from "motion"

inView(".reveal", el => animate(el, { opacity: 1, y: 0 }, { duration: 0.6 }), { amount: 0.3 })
hover(".card", el => { animate(el, { y: -6 }); return () => animate(el, { y: 0 }) })
animate(".hero h1, .hero p", { opacity: 1, y: 0 }, { delay: stagger(0.1) })
scroll(animate(".bar", { scaleX: [0, 1] }))   // progress bar
```

## Performance & accessibility checklist

- ✅ Animate only `transform` (`x/y/scale/rotate`) and `opacity`. Use `layout` for size/position changes instead of `width/height/top/left`.
- ✅ Wrap the app in `<MotionConfig reducedMotion="user">`; verify with the OS "reduce motion" setting on.
- ✅ Keep durations 150–400ms, distances 8–24px, gentle springs. Stagger groups; don't fire everything at once.
- ✅ `viewport={{ once: true }}` so reveals don't replay and thrash.
- ✅ In Next.js, `"use client"` on motion modules; `initial={false}` to avoid hydration flashes.
- ✅ Use `LazyMotion` + `m.*` for bundle size on content-heavy sites.
- ✅ Give every `AnimatePresence` child a stable `key`.
- ✅ Don't animate `box-shadow`/`filter` in long loops on many elements (expensive) — fake with layered opacity where possible.
