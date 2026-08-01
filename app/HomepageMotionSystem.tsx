"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homepageStages, type HomepageStage } from "@/lib/motion/homepageStages";

gsap.registerPlugin(ScrollTrigger);

export function HomepageMotionSystem() {
  const hud = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<HomepageStage>(homepageStages[0]);
  const stageKey = useRef("");

  useEffect(() => {
    const element = document.querySelector<HTMLElement>("#main-content.home-overview");
    const hudElement = hud.current;
    if (!element || !hudElement) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sectionOffsets: { top: number; index: number }[] = [];

    const measure = () => {
      const rootTop = element.getBoundingClientRect().top + window.scrollY;
      const raw = homepageStages.map((item, index) => {
        const target = element.querySelector<HTMLElement>(`#${item.section}`);
        return { top: target ? target.getBoundingClientRect().top + window.scrollY - rootTop : 0, index };
      });
      sectionOffsets = raw.map((entry) => {
        const group = raw.filter((candidate) => candidate.top === entry.top);
        if (group.length === 1) return entry;
        const groupPosition = group.findIndex((candidate) => candidate.index === entry.index);
        const nextTop = raw.find((candidate) => candidate.top > entry.top)?.top ?? element.scrollHeight;
        return { ...entry, top: entry.top + ((nextTop - entry.top) * groupPosition) / group.length };
      }).sort((a, b) => a.top - b.top || a.index - b.index);
    };

    const resolveStage = (localY: number) => {
      let resolved = 0;
      sectionOffsets.forEach((entry) => {
        if (entry.top <= localY) resolved = Math.max(resolved, entry.index);
      });
      return resolved;
    };

    const applyStage = (nextIndex: number, nextStage = homepageStages[nextIndex]) => {
      const nextKey = `${nextIndex}:${nextStage.service}:${nextStage.event}:${nextStage.status}`;
      if (nextKey === stageKey.current) return;
      stageKey.current = nextKey;
      element.dataset.activeJourneyStage = nextStage.id;
      element.querySelectorAll<HTMLElement>("[data-home-stage]").forEach((node) => {
        const nodeIndex = Number(node.dataset.homeStage ?? 0);
        node.dataset.homeState = nodeIndex < nextIndex ? "completed" : nodeIndex === nextIndex ? "active" : "pending";
      });
      setStage(nextStage);
    };

    const onLifecycleStage = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number; stage: HomepageStage }>).detail;
      if (detail) applyStage(detail.index, detail.stage);
    };
    window.addEventListener("homepage:lifecycle-stage", onLifecycleStage);

    if (reduced.matches) {
      element.dataset.motionMode = "reduced";
      element.style.setProperty("--journey-progress", "1");
      element.querySelectorAll<HTMLElement>("[data-home-stage]").forEach((node) => node.dataset.homeState = "visible");
      return () => window.removeEventListener("homepage:lifecycle-stage", onLifecycleStage);
    }

    const context = gsap.context(() => {
      measure();
      const media = gsap.matchMedia();
      media.add({ desktop: "(min-width: 761px)", mobile: "(max-width: 760px)" }, (match) => {
        element.dataset.motionMode = match.conditions?.desktop ? "desktop" : "mobile";
        gsap.set(hudElement, { autoAlpha: 0 });
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top 55%",
          end: "bottom 55%",
          invalidateOnRefresh: true,
          onRefresh: measure,
          onToggle: ({ isActive }) => gsap.to(hudElement, { autoAlpha: isActive ? 1 : 0, duration: 0.2, overwrite: true }),
          onUpdate: (self) => {
            element.style.setProperty("--journey-progress", self.progress.toFixed(4));
            const localY = self.progress * Math.max(1, element.scrollHeight - window.innerHeight) + window.innerHeight * 0.55;
            const lifecycleRect = element.querySelector("#request-lifecycle")?.getBoundingClientRect();
            if (lifecycleRect && lifecycleRect.top <= window.innerHeight * .55 && lifecycleRect.bottom >= window.innerHeight * .55) return;
            applyStage(resolveStage(localY));
          },
        });
        return () => trigger.kill();
      });
      return () => media.revert();
    }, element);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("homepage:lifecycle-stage", onLifecycleStage);
      context.revert();
    };
  }, []);

  return <>
    <div className="homepage-system-spine" aria-hidden="true"><i /><b /></div>
    <div ref={hud} className="homepage-trace-hud" aria-live="polite">
      <span>TRACE / req_home_7f2a</span>
      <strong>{stage.mobileLabel}</strong>
      <p>{stage.event}</p>
      <b>{stage.status} · {stage.latency}</b>
    </div>
  </>;
}
