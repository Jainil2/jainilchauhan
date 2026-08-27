import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "coin-change",
  title: "Coin Change",
  category: "Algorithms",
  difficulty: "Intermediate",
  readingTimeMin: 4,
  blurb: "Compute minimum coins or number of ways for a target amount.",
  caption: "Change the amount and inspect the DP table. Each amount reuses smaller solved amounts.",
  skillTags: ["DSA", "Dynamic Programming"],
  concept:
    "Coin change appears in two common forms: minimum coins to make an amount, or number of combinations. For minimum coins, dp[a] = min(dp[a], dp[a - coin] + 1). The table builds from amount 0 upward.\n\nThe exact loop order changes semantics. Iterating coins outside amounts counts combinations; iterating amount outside coins can count permutations.",
  complexity: [{ operation: "Min coins", time: "O(amount * coins)", space: "O(amount)" }],
  realWorld: ["Payment systems, resource bundles, dynamic pricing, and combinatorial counting."],
  pitfalls: [
    "Unreachable amounts need Infinity/sentinel handling.",
    "Combination vs permutation loop order is easy to mix up.",
    "Greedy only works for some coin systems.",
  ],
  codeSnippet: {
    language: "ts",
    code: `// Minimum coins for an amount — unbounded knapsack, ascending loop.
export function minCoins(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      dp[a] = Math.min(dp[a], dp[a - c] + 1); // ascending -> coin reusable
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
// Greedy works for {1,5,10,25} but fails for e.g. {1,3,4} at amount 6.`,
  },
  usedBy: [
    {
      company: "NCR / vending & POS vendors",
      product: "Cash change dispensing",
      usage:
        "Dispensers minimise coin count subject to hopper stock, which greedy alone cannot guarantee.",
    },
    {
      company: "Stripe",
      product: "Payout batching & denomination splits",
      usage:
        "Splitting an amount across balances, rails or fee tiers is the same make-the-target-from-parts DP.",
      href: "https://docs.stripe.com/payouts",
    },
    {
      company: "Bitcoin Core",
      product: "UTXO coin selection",
      usage:
        "Wallets pick a subset of unspent outputs to cover a payment with minimal change and fees — branch-and-bound over the same problem.",
      href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
    },
  ],
  references: [
    {
      label: "Bitcoin Core — coin selection implementation",
      href: "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp",
    },
    {
      label: "CP-Algorithms — DP over coins",
      href: "https://cp-algorithms.com/dynamic_programming/knapsack.html",
    },
  ],
};
