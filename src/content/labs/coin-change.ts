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
  challenge: {
    prompt:
      "Find the fewest coins that make an exact amount, with unlimited coins of each denomination. Greedy works for real currencies and fails for arbitrary ones, which is the point of the exercise.",
    entry: "minCoins",
    starter: `/**
 * @param {number[]} coins - denominations, each positive.
 * @param {number} amount - target.
 * @returns {number} fewest coins summing exactly to amount, or -1 if impossible.
 */
function minCoins(coins, amount) {
  // Build up every amount from 0 to the target. Each one is 1 + the best way
  // to make the remainder after taking some coin.
}
`,
    tests: [
      {
        name: "simple case",
        body: `assertEquals(solution([1, 2, 5], 11), 3);`,
      },
      {
        name: "zero needs no coins",
        body: `assertEquals(solution([1], 0), 0);`,
      },
      {
        name: "impossible amount",
        body: `assertEquals(solution([2], 3), -1);`,
      },
      {
        name: "greedy would fail here",
        body: `assertEquals(solution([1, 3, 4], 6), 2);`,
      },
      {
        name: "exact single coin",
        body: `assertEquals(solution([7], 7), 1);`,
      },
      {
        name: "no coins at all",
        body: `assertEquals(solution([], 5), -1);`,
      },
      {
        name: "coins larger than the amount are ignored",
        body: `assertEquals(solution([5, 100], 10), 2);`,
      },
      {
        name: "handles a larger target",
        body: `assertEquals(solution([1, 7, 13], 100), 10);`,
      },
    ],
    hints: [
      "Fill an array of size amount + 1 with Infinity, except index 0 which is 0.",
      "For each amount, try every coin that fits and keep the smallest 1 + best[amount - coin].",
      "Infinity at the end means the amount cannot be made, so return -1.",
    ],
    reference: `function minCoins(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity);
  best[0] = 0; // zero coins make zero
  for (let value = 1; value <= amount; value++) {
    for (const coin of coins) {
      if (coin > value) continue;
      const candidate = best[value - coin] + 1;
      if (candidate < best[value]) best[value] = candidate;
    }
  }
  return best[amount] === Infinity ? -1 : best[amount];
}
`,
  },
};
