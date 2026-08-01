# Unified homepage motion

The homepage uses one typed backend journey defined in `lib/motion/homepageStages.ts`. The scoped controller in `app/HomepageMotionSystem.tsx` derives the trace HUD, system-spine progress, active section, event, status, and latency from the current journey stage. The request lifecycle publishes its canonical stage into that controller, keeping its node, counter, route, packet, metadata, and homepage trace synchronized.

## Architecture decision

The previous independent reveal, lifecycle, and idle-animation model was not coherent enough to repair only with timing changes. The visual design and section components remain intact, but coordination now comes from a unified request journey. Local section motion remains responsible only for the backend concept inside that section.

- GSAP plugins are registered once per module.
- Every timeline, media query, and ScrollTrigger is scoped and reverted on unmount.
- The homepage controller owns one cross-section ScrollTrigger.
- The lifecycle owns one responsive ScrollTrigger and derives all visible state from its progress.
- Architecture packets follow actual SVG paths instead of unrelated pixel offsets.
- Font completion and `invalidateOnRefresh` prevent stale measurements after resize or hot reload.

## Responsive variants

Desktop uses a restrained horizontal lifecycle route and one scrubbed pinned explanation. Tablet reduces label density and glow. Mobile switches to a vertical stepped flow without pinning, with one active request state at a time and no hover dependency. Ultrawide content remains constrained by the existing section layout rather than stretching route geometry.

## Reduced motion and accessibility

Reduced motion renders the architecture and lifecycle statically, hides the live trace HUD, disables continuous packets through existing motion rules, and never makes content depend on animation completion. The HUD ignores pointer events, status changes are announced politely, and scroll motion never moves keyboard focus or covers controls.

## Performance and lifecycle

Architecture, metrics, queue, and log activity is visibility-gated. The journey controller updates a CSS variable during scroll and changes React state only when the canonical stage changes. Cleanup removes event listeners and reverts GSAP contexts, media queries, timelines, pin spacers, and ScrollTriggers on navigation.

## Extending the journey

Add one typed record to `homepageStages`, assign a stable section target, and annotate the corresponding homepage element with `data-home-stage`. Keep progress and node-state calculations in the pure helpers so forward, reverse, mobile, reduced-motion, and deterministic tests share one behavior.

Current Chromium, Firefox, and WebKit are supported. MotionPath is limited to SVG routes with static SVG fallbacks; mobile and reduced-motion layouts do not depend on motion-path support.
