"use client";

import { useSyncExternalStore } from "react";
import { createInitialSimulationState, executeSimulationRequest, setSimulationPreset, setSimulationScenario, stepSimulation } from "./engine";
import type { ArchitecturePreset, SimulationScenario } from "./types";

type Listener = () => void;

class SimulationStore {
  private state = createInitialSimulationState();
  private listeners = new Set<Listener>();
  private timer: number | null = null;
  private subscribers = 0;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    this.subscribers += 1;
    this.ensureTimer();
    return () => {
      this.listeners.delete(listener);
      this.subscribers = Math.max(0, this.subscribers - 1);
      this.ensureTimer();
    };
  };

  getSnapshot = () => this.state;

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private ensureTimer() {
    if (typeof window === "undefined") return;
    const hidden = document.visibilityState === "hidden";
    const shouldRun = this.subscribers > 0 && !this.state.paused && !hidden;
    if (shouldRun && this.timer == null) {
      this.timer = window.setInterval(() => {
        this.state = stepSimulation(this.state);
        this.emit();
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 3500 : 1700);
    }
    if (!shouldRun && this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  execute(endpointId: string, params: Record<string, string> = {}, body = "", scenarioOverride?: SimulationScenario) {
    const result = executeSimulationRequest(this.state, endpointId, params, body, scenarioOverride);
    this.state = result.state;
    this.emit();
    this.ensureTimer();
    return result;
  }

  setScenario(scenario: SimulationScenario) {
    this.state = setSimulationScenario(this.state, scenario);
    this.emit();
    this.ensureTimer();
  }

  setPreset(preset: ArchitecturePreset) {
    this.state = setSimulationPreset(this.state, preset);
    this.emit();
    this.ensureTimer();
  }

  togglePaused() {
    this.state = { ...this.state, paused: !this.state.paused };
    this.emit();
    this.ensureTimer();
  }

  reset() {
    this.state = createInitialSimulationState(this.state.preset, this.state.scenario, this.state.seed);
    this.emit();
    this.ensureTimer();
  }

  clearLogs() {
    this.state = { ...this.state, logs: [] };
    this.emit();
  }

  refreshVisibility() {
    this.ensureTimer();
  }
}

export const simulationStore = new SimulationStore();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => simulationStore.refreshVisibility());
}

export function useSimulationState() {
  return useSyncExternalStore(simulationStore.subscribe, simulationStore.getSnapshot, simulationStore.getSnapshot);
}
