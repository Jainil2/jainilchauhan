import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "capacity-planning",
  title: "Capacity Planning",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "Queueing theory says the last 20% of utilisation costs more than the first 80%.",
  caption:
    "A fleet sized for its average load. The demo opens at 85% utilisation, where the queueing delay has already multiplied the p99 by roughly seven, and losing one of three availability zones pushes the survivors past 100% — the plan is not survivable in its default state.",
  skillTags: ["System Design", "Performance", "Operations"],
  bridgesFrom: [
    {
      slug: "backpressure",
      sameness:
        "This IS the queue from the backpressure lab, sized in advance instead of reacted to. Arrivals per second, a service rate, and a buffer between them — identical model. Backpressure is what you do when the queue is already growing; capacity planning is choosing numbers so it does not.",
      delta:
        "The queue is now implicit and invisible. It lives in kernel accept backlogs, connection pools and thread pools rather than in a data structure you can inspect, so nothing reports its depth until latency moves. And the arrival rate is not yours to shape — it is next quarter's traffic, which you must forecast rather than throttle.",
    },
    {
      slug: "rate-limiter",
      sameness:
        "Sizing a fleet IS sizing a token bucket. Refill rate is service capacity, bucket depth is the burst you can absorb without shedding, and the arithmetic that says whether a burst fits is the same arithmetic in both labs.",
      delta:
        "The limiter enforces a number someone chose; capacity planning is where that number comes from, and getting it wrong is expensive in both directions. Too low and you reject real customers; too high and you pay for idle machines every hour of every month. The rate limiter has one failure mode, and this has two that pull against each other.",
    },
  ],
  concept:
    "Start with Little's Law, which is not an approximation: L = λW. The average number of requests in your system equals the arrival rate times the average time each one spends there. At 2,000 requests per second with a 250ms average latency you have 500 requests in flight at all times — 500 threads, connections, or goroutines occupied — regardless of how many machines you own. That single line converts a traffic number into a concurrency number, and concurrency is what you actually buy.\n\nThen the part that surprises people: latency is not linear in utilisation. For a simple queueing model the waiting time scales as 1/(1−ρ), where ρ is utilisation. At 50% utilisation queueing doubles your service time; at 80% it multiplies by five; at 90% by ten; at 95% by twenty. So a fleet running at a comfortable-sounding 85% is already spending most of its response time waiting rather than working, and the last 10% of headroom you removed to save money bought a 3x latency regression. This is why serious teams target 40–60% steady-state utilisation and treat anything above 70% as an alert, not an efficiency win.\n\nRedundancy multiplies the requirement. If you run three availability zones and must survive losing one, every zone carries a third of the traffic normally and half of it during a failure — so the fleet has to be sized for the failure case, which is 1.5x the normal per-node load. Size for N−1 across your largest failure domain, then check the arithmetic honestly: a fleet at 70% utilisation across three zones goes to 105% when one zone dies, which is not degraded service, it is a cascading failure while the autoscaler is still warming instances.\n\nAutoscaling does not remove the need for this. It has a reaction time — metric collection, evaluation period, instance boot, application warm-up, load balancer registration — that is typically three to eight minutes, and traffic spikes are faster than that. Autoscaling handles the daily curve and the weekly one; it does not handle a marketing email, a celebrity link, or a retry storm from your own clients. For those, the only defence is provisioned headroom plus load shedding, and the honest statement is that you are paying for idle capacity on purpose.\n\nFinally, the number to plan against is a percentile, not a mean. Mean CPU across a fleet hides the one shard that is at 100%; mean latency hides the p99 that your largest customer experiences on every request. Plan on p99 latency, peak-hour traffic, and the failure-mode fleet size — and then verify with a load test, because every model above assumes requests are independent and identical, and real ones are neither.",
  complexity: [
    { operation: "Concurrency from traffic (L = λW)", time: "exact, not a heuristic", space: "—" },
    { operation: "Queueing multiplier at ρ", time: "1/(1−ρ) — 5x at 80%, 20x at 95%", space: "—" },
    {
      operation: "N−1 sizing across d domains",
      time: "fleet × d/(d−1)",
      space: "cost: one spare domain",
    },
    { operation: "Autoscaler reaction", time: "3–8 min, slower than a spike", space: "—" },
  ],
  codeSnippet: {
    language: "py",
    code: `# Little's Law turns a traffic forecast into a machine count.
rps          = 2_000
p99_seconds  = 0.250
concurrency  = rps * p99_seconds        # = 500 requests in flight, always

per_server_concurrency = 64             # threads / connections / goroutines
target_utilisation     = 0.55           # NOT 0.9 -- see the multiplier below

# Queueing delay blows up near saturation. This is the number that makes
# "just run it hotter" expensive.
for rho in (0.5, 0.8, 0.9, 0.95, 0.99):
    print(rho, "->", round(1 / (1 - rho), 1), "x service time")
# 0.5 -> 2.0x   0.8 -> 5.0x   0.9 -> 10.0x   0.95 -> 20.0x   0.99 -> 100.0x

servers_at_target = ceil(concurrency / (per_server_concurrency * target_utilisation))
# = ceil(500 / 35.2) = 15

# Now survive losing one of three zones: the other two must carry everything.
zones   = 3
servers = ceil(servers_at_target * zones / (zones - 1))   # = 23
servers = ceil(servers / zones) * zones                   # = 24, evenly spread

# 24 machines to serve work that "fits" on 15. The nine extra ones are not
# waste -- they are the difference between a zone failure and an outage.`,
  },
  realWorld: [
    "Google's SRE book treats overload as a design problem: size for graceful degradation and shed load deliberately rather than letting queueing collapse a service.",
    "Netflix built predictive autoscaling because reactive scaling reacts after the latency has already moved; the forecast buys back the boot time.",
    "AWS target-tracking autoscaling asks for a target utilisation precisely because a target of 90% is a latency decision, not just a cost one.",
  ],
  pitfalls: [
    "Sizing on average utilisation. The average hides the peak hour, the hot shard, and the p99 that your biggest customer sees on every request.",
    "Targeting 80–90% utilisation to save money. Queueing delay at 90% is ten times service time, so you bought the saving with a latency regression nobody attributed to the change.",
    "Forgetting the N−1 case. A fleet at 70% across three zones is at 105% when one fails, which is a cascading failure, not degraded service.",
    "Assuming autoscaling covers spikes. It reacts in minutes; a retry storm from your own clients arrives in seconds and is amplified by the very latency it caused.",
  ],
  usedBy: [
    {
      company: "Google",
      product: "SRE practice — handling overload",
      usage:
        "Documents load shedding, graceful degradation and utilisation targets as the response to the fact that latency degrades non-linearly near saturation.",
      href: "https://sre.google/sre-book/handling-overload/",
    },
    {
      company: "Netflix",
      product: "Scryer predictive autoscaling",
      usage:
        "Forecasts traffic from historical patterns and scales ahead of demand, because reactive scaling cannot beat instance boot time.",
      href: "https://netflixtechblog.com/scryer-netflixs-predictive-auto-scaling-engine-a3f8fc922270",
    },
    {
      company: "AWS",
      product: "Target tracking scaling policies",
      usage:
        "Scales a group to hold a chosen utilisation target, making the utilisation-versus-latency tradeoff an explicit configuration value.",
      href: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html",
    },
  ],
  references: [
    {
      label: "Google SRE Book — Addressing cascading failures",
      href: "https://sre.google/sre-book/addressing-cascading-failures/",
    },
    {
      label: "Neil Gunther — Universal Scalability Law",
      href: "http://www.perfdynamics.com/Manifesto/USLscalability.html",
    },
  ],
  challenge: {
    prompt:
      "Size a fleet honestly. Use Little's Law to turn traffic and latency into concurrency, divide by what one server can hold at your target utilisation, then grow the fleet so it still meets that target after losing one whole failure domain — and round up so the servers spread evenly across domains. Report the utilisation the survivors would run at, rounded to three decimals, so the N−1 case is a number rather than a hope. Reject a target utilisation outside (0, 1] and fewer than two failure domains, because neither describes a fleet that can lose anything.",
    entry: "planCapacity",
    starter: `/**
 * @param {{rps: number, serviceMs: number, concurrencyPerServer: number,
 *          targetUtilisation: number, failureDomains: number}} input
 * @returns {{concurrency: number, servers: number, utilisationAfterLoss: number}}
 *   concurrency rounded to 6dp, utilisationAfterLoss rounded to 3dp.
 */
function planCapacity(input) {
  // L = lambda * W, then divide by effective per-server capacity, then grow
  // for the N-1 case and round up to a multiple of failureDomains.
}
`,
    tests: [
      {
        name: "Little's Law converts traffic into concurrency",
        body: `var out = solution({ rps: 200, serviceMs: 250, concurrencyPerServer: 20, targetUtilisation: 0.5, failureDomains: 3 });
assertEquals(out.concurrency, 50);`,
      },
      {
        name: "sizes for the failure case, not the happy case",
        body: `// 50 in flight, 10 usable per server -> 5 servers if nothing ever breaks.
// Surviving the loss of one of three domains needs 8, rounded to 9 so the
// three domains hold the same number.
var out = solution({ rps: 200, serviceMs: 250, concurrencyPerServer: 20, targetUtilisation: 0.5, failureDomains: 3 });
assertEquals(out.servers, 9);`,
      },
      {
        name: "reports the utilisation the survivors would run at",
        body: `// 9 servers, one domain of 3 gone, 6 x 20 = 120 slots for 50 requests.
var out = solution({ rps: 200, serviceMs: 250, concurrencyPerServer: 20, targetUtilisation: 0.5, failureDomains: 3 });
assertEquals(out.utilisationAfterLoss, 0.417);`,
      },
      {
        name: "two domains means each one carries everything alone",
        body: `var out = solution({ rps: 100, serviceMs: 100, concurrencyPerServer: 10, targetUtilisation: 0.5, failureDomains: 2 });
// concurrency 10, usable 5/server -> 2 servers, doubled to 4 for N-1.
assertEquals(out.concurrency, 10);
assertEquals(out.servers, 4);
assertEquals(out.utilisationAfterLoss, 0.5);`,
      },
      {
        name: "a trickle of traffic still needs a survivable fleet",
        body: `var out = solution({ rps: 1, serviceMs: 1, concurrencyPerServer: 64, targetUtilisation: 0.5, failureDomains: 2 });
assertEquals(out.concurrency, 0.001);
assertEquals(out.servers, 2);`,
      },
      {
        name: "no traffic needs no servers",
        body: `var out = solution({ rps: 0, serviceMs: 250, concurrencyPerServer: 20, targetUtilisation: 0.5, failureDomains: 3 });
assertEquals(out, { concurrency: 0, servers: 0, utilisationAfterLoss: 0 });`,
      },
      {
        name: "an impossible target utilisation is rejected",
        body: `assertThrows(function () {
  solution({ rps: 100, serviceMs: 100, concurrencyPerServer: 10, targetUtilisation: 0, failureDomains: 2 });
}, "zero utilisation must throw");
assertThrows(function () {
  solution({ rps: 100, serviceMs: 100, concurrencyPerServer: 10, targetUtilisation: 1.4, failureDomains: 2 });
}, "utilisation above 1 must throw");`,
      },
      {
        name: "a single failure domain cannot survive a failure",
        body: `assertThrows(function () {
  solution({ rps: 100, serviceMs: 100, concurrencyPerServer: 10, targetUtilisation: 0.5, failureDomains: 1 });
}, "one domain must throw");`,
      },
      {
        name: "the survivors never exceed the target you asked for",
        body: `// The whole point of N-1 sizing: this must hold at every traffic level.
for (var rps = 1; rps <= 4000; rps += 37) {
  var out = solution({ rps: rps, serviceMs: 180, concurrencyPerServer: 32, targetUtilisation: 0.6, failureDomains: 4 });
  assert(out.servers % 4 === 0, "fleet must spread evenly across 4 domains");
  assert(out.utilisationAfterLoss <= 0.6 + 1e-9, "N-1 utilisation " + out.utilisationAfterLoss + " exceeded the target");
}`,
      },
      {
        name: "handles a large fleet without losing precision",
        body: `var out = solution({ rps: 2000000, serviceMs: 40, concurrencyPerServer: 64, targetUtilisation: 0.5, failureDomains: 3 });
assertEquals(out.concurrency, 80000);
// 80000 / 32 = 2500 servers at target; x3/2 = 3750; already a multiple of 3.
assertEquals(out.servers, 3750);`,
      },
    ],
    hints: [
      "Validate first: targetUtilisation must be greater than 0 and at most 1, and failureDomains must be at least 2. Then concurrency is rps * serviceMs / 1000.",
      "Effective capacity per server is concurrencyPerServer * targetUtilisation. Take the ceiling of concurrency divided by that — a fractional server is not a thing you can buy.",
      "For N−1, multiply by failureDomains / (failureDomains − 1) and take the ceiling, then round that up to a multiple of failureDomains so every domain holds the same count.",
    ],
    reference: `function planCapacity(input) {
  const { rps, serviceMs, concurrencyPerServer, targetUtilisation, failureDomains } = input;

  // A target of 0 needs infinite machines; a target above 1 is asking for
  // queueing delay by definition. One domain cannot survive losing one.
  if (!(targetUtilisation > 0 && targetUtilisation <= 1)) {
    throw new Error("targetUtilisation must be in (0, 1]");
  }
  if (!(failureDomains >= 2)) {
    throw new Error("need at least two failure domains to survive losing one");
  }

  // Little's Law: L = lambda * W. Not an estimate -- an identity.
  const concurrency = Math.round(((rps * serviceMs) / 1000) * 1e6) / 1e6;
  if (concurrency <= 0) {
    return { concurrency: 0, servers: 0, utilisationAfterLoss: 0 };
  }

  // What one server actually contributes at the utilisation you are willing
  // to run at, which is well below what it could physically hold.
  const usablePerServer = concurrencyPerServer * targetUtilisation;
  const atTarget = Math.ceil(concurrency / usablePerServer);

  // Survive losing one domain: the remaining (d-1)/d of the fleet must still
  // meet the target, then round up so the domains hold equal shares.
  const forFailure = Math.ceil((atTarget * failureDomains) / (failureDomains - 1));
  const servers = Math.ceil(forFailure / failureDomains) * failureDomains;

  const survivors = servers - servers / failureDomains;
  const utilisationAfterLoss =
    Math.round((concurrency / (survivors * concurrencyPerServer)) * 1000) / 1000;

  return { concurrency, servers, utilisationAfterLoss };
}
`,
  },
};
