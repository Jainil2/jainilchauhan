import { create } from "zustand";

export interface SimulationState {
  activeNodes: string[];
  tokenCount: number;
  simulationsEnabled: boolean;
  setSimulationsEnabled: (enabled: boolean) => void;
  killNode: (id: string) => void;
  restoreNode: (id: string) => void;
  drainTokens: (amount: number) => void;
  replenishTokens: (amount: number, max: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Default 3 nodes
  activeNodes: ["node-1", "node-2", "node-3"],
  // Start with 10 tokens
  tokenCount: 10,
  simulationsEnabled: true,

  setSimulationsEnabled: (enabled) => set({ simulationsEnabled: enabled }),

  killNode: (id) =>
    set((state) => ({
      activeNodes: state.activeNodes.filter((nodeId) => nodeId !== id),
    })),

  restoreNode: (id) =>
    set((state) => ({
      activeNodes: state.activeNodes.includes(id) ? state.activeNodes : [...state.activeNodes, id],
    })),

  drainTokens: (amount) =>
    set((state) => ({
      tokenCount: Math.max(0, state.tokenCount - amount),
    })),

  replenishTokens: (amount, max) =>
    set((state) => ({
      tokenCount: Math.min(max, state.tokenCount + amount),
    })),
}));
