import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "cost-modeling",
  title: "Cost Modeling",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb:
    "Find the dominant term first. Optimising anything else is a rounding error with a sprint attached.",
  caption:
    "Six cost lines for one service at 300M requests a month. The demo opens with the dominant line already on top: 250,000 custom metric series at five cents each cost more than the servers, the database and the egress put together.",
  skillTags: ["System Design", "Cost", "Operations"],
  bridgesFrom: [
    {
      slug: "inference-cost",
      sameness:
        "It IS the inference cost model, with the request in place of the token. Same three moves: find the unit that scales, price it, then multiply by volume to get a number per unit and a number per month. The insight that one term dominates and the rest are noise is identical.",
      delta:
        "The units multiply. A token has one price; a request pulls compute, storage, egress, log ingest and metric series behind it, each metered differently and some of them priced per gigabyte of data you never chose to produce. So the dominant term is rarely the one you provisioned, and it moves as the system grows — which is why the model has to be recomputed rather than remembered.",
    },
    {
      slug: "capacity-planning",
      sameness:
        "This IS the capacity plan with a price tag on each row. The fleet size that came out of Little's Law and the N−1 rule is the same integer that goes into the compute line here — one artefact, read twice.",
      delta:
        "Reading it as money reverses some of the conclusions. Headroom you justified as reliability now has an invoice attached, and the honest question becomes what an hour of degraded service is worth against the cost of the idle capacity that prevents it. That is a business decision the queueing arithmetic cannot make for you.",
    },
  ],
  concept:
    "A cost model is one table: every line item, its unit, its unit price, and the volume. It exists to answer two questions — what does one request cost, and which line dominates — and it is almost always the case that one line is more than half the bill while the team's optimisation effort is spread evenly across all of them. Getting the dominant term right is most of the value; getting the third-largest term to two decimal places is none of it.\n\nThe surprising lines are consistently the metered ones nobody provisioned. Compute is visible: you chose the instance count, you can see it in a console. Egress is invisible until the invoice arrives, and at roughly $0.09 per gigabyte for internet transfer from a major cloud — plus cross-availability-zone charges on traffic that never leaves the region — a chatty API can spend more moving bytes than computing them. Observability is worse, because it is priced per gigabyte ingested and per custom metric series retained, and both of those are set by a developer adding a label rather than by anyone planning capacity. A single high-cardinality label can add six figures a year with no code review comment.\n\nUnit economics is where the model becomes useful rather than interesting. Divide total monthly cost by monthly requests, or by active tenants, or by whatever unit your revenue is denominated in, and track it over time. A rising absolute bill on a falling cost-per-request is a growing healthy business; a flat bill on a falling request count is a leak. The unit also exposes the customers you lose money on — in a multi-tenant system, cost is power-law distributed exactly like usage, so a handful of tenants routinely consume a majority of the infrastructure while paying a flat fee.\n\nThe two big structural levers are commitment and architecture. Committing to a term — reserved instances, savings plans, committed-use discounts — buys 30% to 70% off in exchange for accepting risk about future usage, and it is nearly free money for a stable baseline while being a trap for a workload you might rearchitect. Architecture is the larger lever and the slower one: Dropbox's move off S3 onto its own storage saved money at a scale where building storage was cheaper than renting it, which is a decision that is correct for very few companies and enormously expensive for the rest.\n\nThe discipline that makes any of this stick is attribution. Costs must be tagged by service, team and environment, and the report must go to the people who can change the number. Untagged spend grows without an owner, and the single most common finding in a cost review is not an inefficiency at all — it is a staging environment, a forgotten cluster, or a log pipeline that nobody remembers turning on.",
  complexity: [
    { operation: "Compute (on-demand)", time: "per instance-hour", space: "visible, provisioned" },
    { operation: "Internet egress", time: "~$0.09/GB", space: "invisible until invoiced" },
    {
      operation: "Custom metric series",
      time: "per series per month",
      space: "set by one added label",
    },
    { operation: "Commitment discount", time: "30–70% off", space: "cost: locked-in usage risk" },
  ],
  codeSnippet: {
    language: "py",
    code: `# One table. Every line: unit, unit price, volume. Then find the dominant
# term before optimising anything.
REQUESTS = 300_000_000     # per month

lines = {
    # servers you chose, and can see in a console
    "compute":  24 * 730 * 0.192,                     #    3,364
    "database": 1_120.00,                             #    1,120
    "storage":    340.00,                             #      340
    # metered by data volume, not by a decision anyone made
    "egress":   REQUESTS * 40_960 / 1e9 * 0.09,       #    1,106
    "logs":     REQUESTS *  2_048 / 1e9 * 2.50,       #    1,536
    # priced per SERIES: 25 metrics x 10^4 label combinations
    "metrics":  25 * 10 ** 4 * 0.05,                  #   12,500  <-- dominant
}

total = sum(lines.values())
dominant, dominant_cost = max(lines.items(), key=lambda kv: kv[1])

print(f"total          \${total:,.0f}")                  # $19,966
print(f"per 1M req     \${total / (REQUESTS / 1e6):,.2f}")  # $66.55
print(f"dominant       {dominant} at {dominant_cost / total:.0%}")  # metrics at 63%

# The line that dominates is the one nobody provisioned. Adding a fifth
# label to those metrics multiplies 250k series by ten: +$112,500/month,
# from a one-line diff that passes review.`,
  },
  realWorld: [
    "Cloudflare published a line-by-line comparison of cloud egress prices against wholesale bandwidth cost, arguing the markup is the dominant term for data-heavy services.",
    "Dropbox moved the bulk of its storage off S3 onto custom hardware once its scale made owning cheaper than renting — the architectural lever, taken deliberately.",
    "The FinOps Foundation's framework exists because the binding constraint is usually attribution: untagged spend has no owner and therefore no one to reduce it.",
  ],
  pitfalls: [
    "Optimising the visible line. Compute is what you can see in a console; egress, log ingest and metric series are what the invoice is actually made of.",
    "Adding a metric label without checking cardinality. Series are priced individually, so one dimension of ten values multiplies that metric's cost by ten.",
    "Buying commitments for a workload you plan to rearchitect. The discount is real and so is the obligation, and a migration mid-term pays for both designs at once.",
    "Tracking only the absolute bill. A rising bill with a falling cost per request is growth; a flat bill with falling traffic is a leak, and the totals cannot tell them apart.",
  ],
  usedBy: [
    {
      company: "Cloudflare",
      product: "Egress cost analysis",
      usage:
        "Published cloud egress pricing against wholesale transit rates to argue that data transfer, not compute, dominates the bill for bandwidth-heavy workloads.",
      href: "https://blog.cloudflare.com/aws-egregious-egress/",
    },
    {
      company: "Dropbox",
      product: "Magic Pocket",
      usage:
        "Migrated exabyte-scale storage from S3 to purpose-built infrastructure, the case study for when owning beats renting on unit cost.",
      href: "https://dropbox.tech/infrastructure/inside-the-magic-pocket",
    },
    {
      company: "AWS",
      product: "Data transfer cost guidance",
      usage:
        "Documents the data-transfer charges — internet, cross-AZ, cross-region — that make up the line item most architecture diagrams omit entirely.",
      href: "https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/",
    },
  ],
  references: [
    { label: "FinOps Foundation — FinOps Framework", href: "https://www.finops.org/framework/" },
    {
      label: "AWS — Overview of data transfer costs for common architectures",
      href: "https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/",
    },
  ],
  challenge: {
    prompt:
      "Build the cost model. Given the line items — each with a unit price and a volume — and the month's request count, return the total, the cost of one request, and which line dominates plus its share of the bill. Everything is in microcents so the arithmetic stays in integers and nothing is lost to floating point; round the per-request figure and the share to the nearest whole microcent and whole percent. Zero requests is not an error: a service with no traffic still costs exactly what it costs, and reporting that honestly is the point.",
    entry: "costModel",
    starter: `/**
 * @param {Array<{name: string, unitCostMicrocents: number, units: number}>} components
 * @param {number} monthlyRequests
 * @returns {{totalMicrocents: number, microcentsPerRequest: number,
 *            dominant: string|null, dominantSharePct: number}}
 *   dominant: the costliest line, ties broken by name ascending; null when
 *   there are no components. Throws on a negative price or volume.
 */
function costModel(components, monthlyRequests) {
  // Sum, find the biggest line, divide by requests. Integers throughout.
}
`,
    tests: [
      {
        name: "one line item",
        body: `var c = [{ name: "compute", unitCostMicrocents: 1000, units: 500 }];
assertEquals(solution(c, 1000), {
  totalMicrocents: 500000,
  microcentsPerRequest: 500,
  dominant: "compute",
  dominantSharePct: 100,
});`,
      },
      {
        name: "the dominant line is not the one you provisioned",
        body: `var c = [
  { name: "compute", unitCostMicrocents: 730000, units: 24 },
  { name: "egress", unitCostMicrocents: 9000000, units: 40 },
  { name: "logs", unitCostMicrocents: 50000, units: 900 },
];
var out = solution(c, 1000000);
assertEquals(out.totalMicrocents, 422520000);
assertEquals(out.dominant, "egress");
assertEquals(out.dominantSharePct, 85);`,
      },
      {
        name: "cost per request rounds to the nearest microcent",
        body: `var c = [{ name: "compute", unitCostMicrocents: 1, units: 1000 }];
// 1000 / 300 = 3.33...
assertEquals(solution(c, 300).microcentsPerRequest, 3);`,
      },
      {
        name: "zero traffic still costs money",
        body: `var c = [{ name: "compute", unitCostMicrocents: 1000, units: 500 }];
var out = solution(c, 0);
assertEquals(out.totalMicrocents, 500000);
assertEquals(out.microcentsPerRequest, 0);`,
      },
      {
        name: "a tie on cost is broken by name so the answer is stable",
        body: `var c = [
  { name: "beta", unitCostMicrocents: 100, units: 10 },
  { name: "alpha", unitCostMicrocents: 500, units: 2 },
];
assertEquals(solution(c, 100).dominant, "alpha");`,
      },
      {
        name: "a zero-cost line never wins over a real one",
        body: `var c = [
  { name: "aaa-free-tier", unitCostMicrocents: 0, units: 99999 },
  { name: "zzz-database", unitCostMicrocents: 7, units: 3 },
];
var out = solution(c, 21);
assertEquals(out.dominant, "zzz-database");
assertEquals(out.dominantSharePct, 100);
assertEquals(out.microcentsPerRequest, 1);`,
      },
      {
        name: "no line items at all",
        body: `assertEquals(solution([], 1000), {
  totalMicrocents: 0,
  microcentsPerRequest: 0,
  dominant: null,
  dominantSharePct: 0,
});`,
      },
      {
        name: "an all-zero bill reports a share of zero rather than dividing by it",
        body: `var c = [
  { name: "b", unitCostMicrocents: 0, units: 10 },
  { name: "a", unitCostMicrocents: 0, units: 10 },
];
var out = solution(c, 1000);
assertEquals(out.totalMicrocents, 0);
assertEquals(out.dominantSharePct, 0);
assertEquals(out.dominant, "a");`,
      },
      {
        name: "negative prices and volumes are rejected",
        body: `assertThrows(function () {
  solution([{ name: "credit", unitCostMicrocents: -100, units: 5 }], 10);
}, "a negative price must throw");
assertThrows(function () {
  solution([{ name: "compute", unitCostMicrocents: 100, units: -5 }], 10);
}, "a negative volume must throw");`,
      },
      {
        name: "handles a fully itemised bill",
        body: `var c = [];
for (var i = 0; i < 10000; i++) c.push({ name: "c-" + i, unitCostMicrocents: 1000, units: 1000 });
var out = solution(c, 1000000);
assertEquals(out.totalMicrocents, 10000000000);
assertEquals(out.microcentsPerRequest, 10000);
assertEquals(out.dominant, "c-0");
assertEquals(out.dominantSharePct, 0);`,
      },
    ],
    hints: [
      "Validate as you sum: any negative price or volume means the caller handed you a credit or a bug, and silently absorbing it produces a model nobody can trust.",
      "Track the best line while summing — compare cost first, and only fall back to comparing names when two lines cost the same.",
      "Guard both divisions. Zero requests gives a per-request cost of zero, and a zero total gives a share of zero, rather than NaN in a report someone forwards to finance.",
    ],
    reference: `function costModel(components, monthlyRequests) {
  let totalMicrocents = 0;
  let dominant = null;
  let dominantCost = -1;

  for (const line of components) {
    if (line.unitCostMicrocents < 0 || line.units < 0) {
      throw new Error("negative price or volume in line " + line.name);
    }
    const cost = line.unitCostMicrocents * line.units;
    totalMicrocents += cost;

    // Biggest line wins; equal lines fall back to the name so the report does
    // not change between runs for no reason.
    if (cost > dominantCost || (cost === dominantCost && line.name < dominant)) {
      dominantCost = cost;
      dominant = line.name;
    }
  }

  // A service with no traffic still costs what it costs. Zero is the honest
  // answer here, not an error and not a divide by zero.
  const microcentsPerRequest =
    monthlyRequests > 0 ? Math.round(totalMicrocents / monthlyRequests) : 0;
  const dominantSharePct =
    totalMicrocents > 0 ? Math.round((dominantCost * 100) / totalMicrocents) : 0;

  return { totalMicrocents, microcentsPerRequest, dominant, dominantSharePct };
}
`,
  },
};
