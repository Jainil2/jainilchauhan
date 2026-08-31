import type { LabMeta } from "../types";

export const lab: LabMeta = {
  slug: "graceful-shutdown",
  title: "Graceful Shutdown",
  category: "System Design",
  difficulty: "Intermediate",
  readingTimeMin: 6,
  blurb: "SIGTERM is not a stop signal. It is the start of a race you have to win.",
  caption:
    "A pod receiving SIGTERM with a 30s grace period and a load balancer that takes 8s to notice. The default state already drops requests — some killed mid-flight at the deadline, and some that arrived after the process stopped accepting, because the balancer was still routing to it.",
  skillTags: ["System Design", "Operations", "Reliability"],
  bridgesFrom: [
    {
      slug: "load-balancer",
      sameness:
        "A graceful shutdown IS a health check failing, on purpose. The balancer you built removes a backend when its health probe goes red; flipping your own readiness endpoint to red is you invoking that exact mechanism against yourself, so the pool drains you before you stop serving.",
      delta:
        "You control when the probe flips but not when the balancer believes it. Between the two there is a propagation window — probe interval times failure threshold, typically five to fifteen seconds — during which traffic still arrives at a process that has decided it is leaving. Every request in that window is a 502 unless you keep serving through it.",
    },
    {
      slug: "message-queue",
      sameness:
        "For a worker, shutdown IS the acknowledgement problem. A consumer that dies with a message in hand and no ack sends that message back to the queue after the visibility timeout, which is the same at-least-once redelivery you already reasoned about.",
      delta:
        "The redelivery is now caused by your own deploy, and it happens to every worker at once during a rolling restart. Duplicates arrive in a burst rather than a trickle, so handlers that are 'almost idempotent' fail visibly on exactly the day you ship.",
    },
  ],
  concept:
    "When an orchestrator wants a process gone it sends SIGTERM, waits, and then sends SIGKILL. In Kubernetes the wait is terminationGracePeriodSeconds, thirty seconds by default, and SIGKILL is not negotiable — the kernel does not ask. Everything a well-behaved service does at shutdown has to fit inside that window.\n\nThe subtle part is that two things happen at once, and their order is not guaranteed. The kubelet sends SIGTERM to your process and, in parallel, the endpoints controller removes you from the Service, which eventually propagates to kube-proxy on every node and to whatever load balancer sits in front. The propagation is asynchronous and takes seconds. If your process reacts to SIGTERM by immediately closing its listener, every request routed during that window is refused — a burst of 502s attributed to the deploy, not to a bug.\n\nThe correct sequence is therefore deliberately slow. Flip readiness to failing, then keep serving normally for a fixed sleep — five to fifteen seconds, longer than the balancer's detection time — and only then stop accepting new connections. Now drain: let in-flight requests finish, close idle keep-alive connections, and wait on the ones still running. Finally close database pools and flush buffered telemetry, in that order, because a flush that needs a network call must happen before you tear down networking.\n\nIn-flight work is where the grace period gets spent. A request whose remaining duration exceeds the deadline will be killed, and the client sees a connection reset with no status code, which no retry policy handles well. Long-running requests therefore need either a shorter deadline than the grace period, or a design that makes them resumable. Worker processes have the same problem in a different shape: stop pulling new messages first, then finish the batch in hand, then ack. A worker that acks early and dies loses work silently; one that acks late and dies duplicates work loudly, and loud is the one you want.\n\nAll of this is invisible in staging, because staging has one replica and no traffic. It shows up as a small, persistent error spike on every production deploy, which teams learn to describe as 'normal deploy noise'. It is not noise. It is a measurable number of user-visible failures per release, and it is fixed with a sleep, a readiness flip and an ordered close.",
  complexity: [
    { operation: "Readiness flip → balancer notices", time: "5–15 s typical", space: "—" },
    {
      operation: "Drain in-flight requests",
      time: "bounded by grace period",
      space: "O(in-flight)",
    },
    { operation: "SIGTERM → SIGKILL", time: "30 s default in Kubernetes", space: "—" },
    {
      operation: "Requests lost",
      time: "O(1) per unfinished request",
      space: "blast radius: one pod",
    },
  ],
  codeSnippet: {
    language: "go",
    code: `func main() {
	srv := &http.Server{Addr: ":8080", Handler: mux}
	go srv.ListenAndServe()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
	<-stop

	// 1. Fail readiness FIRST. The balancer has not heard yet, so we are
	//    still in the pool and must keep answering normally.
	ready.Store(false)

	// 2. Serve through the propagation window. This sleep is the whole
	//    trick: without it, every request routed in the next few seconds
	//    hits a closed listener and becomes a 502.
	time.Sleep(10 * time.Second)

	// 3. Stop accepting, then wait for in-flight handlers. Shutdown closes
	//    idle keep-alives immediately and blocks on active ones.
	//    The context is shorter than terminationGracePeriodSeconds so we
	//    finish before SIGKILL rather than because of it.
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("drain timed out, %v requests killed", inflight.Load())
	}

	// 4. Only now tear down dependencies, and flush telemetry before the
	//    network goes away.
	tracer.ForceFlush(ctx)
	db.Close()
}`,
  },
  realWorld: [
    "Kubernetes sends SIGTERM and removes the pod from Service endpoints concurrently, which is why a preStop sleep is the standard fix for deploy-time 502s.",
    "AWS Application Load Balancers hold a deregistration delay (300s by default) so in-flight requests to a draining target complete before the connection is closed.",
    "Envoy exposes an explicit drain sequence — fail health checks, drain listeners, then close — and hot restart hands connections to the new process rather than dropping them.",
  ],
  pitfalls: [
    "Closing the listener in the SIGTERM handler. It is the obvious code and it guarantees a 502 burst on every deploy, because the balancer is still routing to you.",
    "A grace period shorter than your slowest request. The request is killed with no status code, so the client cannot tell a deploy from a crash and will not retry safely.",
    "Acknowledging queue messages before the work is durable. A shutdown mid-handler then loses the message with no error anywhere — the failure mode nobody detects.",
    "Flushing traces and metrics after closing the network stack. The buffered evidence of the shutdown is exactly the evidence you lose.",
  ],
  usedBy: [
    {
      company: "Kubernetes",
      product: "Pod termination lifecycle",
      usage:
        "Defines the SIGTERM → grace period → SIGKILL contract and the preStop hook, and documents that endpoint removal happens concurrently with the signal.",
      href: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination",
    },
    {
      company: "AWS",
      product: "Elastic Load Balancing target groups",
      usage:
        "deregistration_delay.timeout_seconds keeps a deregistering target in draining state so open requests finish before the connection is torn down.",
      href: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html",
    },
    {
      company: "Envoy",
      product: "Draining",
      usage:
        "Drains listeners on a configurable schedule, failing health checks first so upstream balancers remove the instance before connections close.",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/draining",
    },
  ],
  references: [
    {
      label: "Kubernetes — Pod lifecycle: termination",
      href: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination",
    },
    {
      label: "Envoy — Draining",
      href: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/draining",
    },
  ],
  challenge: {
    prompt:
      "Score a shutdown. Given the requests a process is handling, the moment SIGTERM arrived and the grace period, work out which requests finish, which get killed at the deadline, and which arrived after SIGTERM because the load balancer had not caught up yet — those are refused outright, since the listener is already closing. Also report how long the drain actually took, which is not the grace period but the moment the last surviving request finished.",
    entry: "drain",
    starter: `/**
 * @param {Array<{id: number, startedAt: number, durationMs: number}>} requests
 * @param {number} sigtermAt
 * @param {number} graceMs
 * @returns {{completed: number[], killed: number[], leaked: number[], drainMs: number}}
 *   each id list ascending; drainMs is 0 when nothing completes.
 */
function drain(requests, sigtermAt, graceMs) {
  // A request that started at or after sigtermAt should never have reached
  // this process: it leaked past a stale balancer. Everything else finishes
  // if it can beat sigtermAt + graceMs, and is killed if it cannot.
}
`,
    tests: [
      {
        name: "everything in flight finishes inside the grace period",
        body: `var r = [
  { id: 1, startedAt: -100, durationMs: 300 },
  { id: 2, startedAt: -50, durationMs: 200 },
];
assertEquals(solution(r, 0, 30000), { completed: [1, 2], killed: [], leaked: [], drainMs: 200 });`,
      },
      {
        name: "a request longer than the grace period is killed",
        // Negative startedAt means "already in flight when the signal landed",
        // which is the whole point of this case. At startedAt === sigtermAt it
        // would have leaked instead, per the test two rows down.
        body: `var r = [{ id: 1, startedAt: -1000, durationMs: 45000 }];
assertEquals(solution(r, 0, 30000), { completed: [], killed: [1], leaked: [], drainMs: 0 });`,
      },
      {
        name: "a request arriving after SIGTERM leaked past the balancer",
        body: `// The pod is draining but the load balancer has not noticed yet.
var r = [{ id: 1, startedAt: 3000, durationMs: 10 }];
assertEquals(solution(r, 0, 30000), { completed: [], killed: [], leaked: [1], drainMs: 0 });`,
      },
      {
        name: "arriving exactly at SIGTERM counts as leaked",
        body: `var r = [{ id: 1, startedAt: 0, durationMs: 10 }];
assertEquals(solution(r, 0, 30000).leaked, [1]);`,
      },
      {
        name: "finishing exactly on the deadline still counts as completed",
        body: `var r = [{ id: 1, startedAt: -1000, durationMs: 31000 }];
var out = solution(r, 0, 30000);
assertEquals(out.completed, [1]);
assertEquals(out.drainMs, 30000);`,
      },
      {
        name: "drainMs reports the real drain, not the grace period",
        body: `// Nobody should conclude a deploy took 30s because the budget was 30s.
var r = [{ id: 1, startedAt: -100, durationMs: 1600 }];
assertEquals(solution(r, 0, 30000).drainMs, 1500);`,
      },
      {
        name: "a zero grace period kills everything still running",
        body: `var r = [
  { id: 1, startedAt: -10, durationMs: 20 },
  { id: 2, startedAt: -5, durationMs: 5 },
];
var out = solution(r, 0, 0);
assertEquals(out.killed, [1]);
assertEquals(out.completed, [2]);`,
      },
      {
        name: "ids come back ascending whatever order they arrived in",
        body: `var r = [
  { id: 9, startedAt: -1, durationMs: 5 },
  { id: 2, startedAt: -1, durationMs: 99999 },
  { id: 5, startedAt: -1, durationMs: 5 },
  { id: 3, startedAt: 10, durationMs: 1 },
];
var out = solution(r, 0, 1000);
assertEquals(out.completed, [5, 9]);
assertEquals(out.killed, [2]);
assertEquals(out.leaked, [3]);`,
      },
      {
        name: "no traffic at all",
        body: `assertEquals(solution([], 0, 30000), { completed: [], killed: [], leaked: [], drainMs: 0 });`,
      },
      {
        name: "handles a busy process",
        body: `var r = [];
for (var i = 1; i <= 5000; i++) r.push({ id: i, startedAt: -i, durationMs: i % 2 === 0 ? 10 : 60000 });
var out = solution(r, 0, 30000);
assertEquals(out.completed.length, 2500);
assertEquals(out.killed.length, 2500);
assertEquals(out.leaked.length, 0);`,
      },
    ],
    hints: [
      "Split the requests into three buckets in one pass: startedAt >= sigtermAt is leaked; otherwise compare startedAt + durationMs against sigtermAt + graceMs.",
      "The deadline comparison is inclusive — a request finishing exactly on the deadline made it, because SIGKILL lands at the deadline, not before it.",
      "drainMs is derived from the completed set only: the latest finish time minus sigtermAt, floored at zero, and zero when nothing completed.",
    ],
    reference: `function drain(requests, sigtermAt, graceMs) {
  const deadline = sigtermAt + graceMs;
  const completed = [];
  const killed = [];
  const leaked = [];
  let lastFinish = sigtermAt;

  for (const req of requests) {
    // Arrived after we decided to leave: the balancer is still routing to a
    // process that is closing its listener. These are the deploy 502s.
    if (req.startedAt >= sigtermAt) {
      leaked.push(req.id);
      continue;
    }
    const finishesAt = req.startedAt + req.durationMs;
    if (finishesAt <= deadline) {
      completed.push(req.id);
      if (finishesAt > lastFinish) lastFinish = finishesAt;
    } else {
      // SIGKILL lands at the deadline. The client sees a reset, not a status
      // code, which is why long requests need their own shorter timeout.
      killed.push(req.id);
    }
  }

  const asc = (a, b) => a - b;
  return {
    completed: completed.sort(asc),
    killed: killed.sort(asc),
    leaked: leaked.sort(asc),
    drainMs: completed.length === 0 ? 0 : Math.max(0, lastFinish - sigtermAt),
  };
}
`,
  },
};
