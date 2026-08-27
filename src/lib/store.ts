import { create } from "zustand";

// --- Types ---
export interface SimulationState {
  isSimulationsEnabled: boolean;
  toggleSimulations: () => void;
}

export interface TokenBucketState {
  tokens: number;
  maxTokens: number;
  refillRateMs: number;
  consumeToken: () => boolean;
  refillTokens: () => void;
  resetBucket: () => void;
}

// Combine all slices into a unified store type
export type GlobalStore = SimulationState & {
  tokenBucket: TokenBucketState;
};

// --- Store Implementation ---
export const useGlobalStore = create<GlobalStore>((set, get) => ({
  // Global Simulation Toggle
  isSimulationsEnabled: true,
  toggleSimulations: () => set((state) => ({ isSimulationsEnabled: !state.isSimulationsEnabled })),

  // Token Bucket Rate Limiter Simulation
  tokenBucket: {
    tokens: 5,
    maxTokens: 5,
    refillRateMs: 2000,
    consumeToken: () => {
      const currentTokens = get().tokenBucket.tokens;
      if (currentTokens > 0) {
        set((state) => ({
          tokenBucket: { ...state.tokenBucket, tokens: state.tokenBucket.tokens - 1 },
        }));
        return true;
      }
      return false;
    },
    refillTokens: () => {
      set((state) => {
        const { tokens, maxTokens } = state.tokenBucket;
        if (tokens < maxTokens) {
          return { tokenBucket: { ...state.tokenBucket, tokens: tokens + 1 } };
        }
        return state;
      });
    },
    resetBucket: () =>
      set((state) => ({
        tokenBucket: { ...state.tokenBucket, tokens: state.tokenBucket.maxTokens },
      })),
  },
}));

// Setup automatic token refill interval
if (typeof window !== "undefined") {
  setInterval(() => {
    useGlobalStore.getState().tokenBucket.refillTokens();
  }, useGlobalStore.getState().tokenBucket.refillRateMs);
}
