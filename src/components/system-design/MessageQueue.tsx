import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSimulationStore } from "@/lib/useSimulationStore";
import { Database, Send, ServerCrash, Cpu, Settings2, Info } from "lucide-react";

const PARTITIONS_COUNT = 3;
const PAYLOADS = ["UserSignup", "PaymentProcessed", "EmailSent", "DataExported"];
const KEYS = ["user_42", "user_99", "sys_1", "cron_job", "webhook_stripe"];

interface Message {
  id: number;
  key: string;
  payload: string;
  partition: number;
  offset: number;
}

interface PartitionState {
  messages: Message[];
  leo: number; // Log End Offset
  consumerOffset: number;
}

// Simple string hash
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export function MessageQueue() {
  const reduce = useReducedMotion();
  const { simulationsEnabled } = useSimulationStore();
  
  const [partitions, setPartitions] = useState<PartitionState[]>([
    { messages: [], leo: 0, consumerOffset: 0 },
    { messages: [], leo: 0, consumerOffset: 0 },
    { messages: [], leo: 0, consumerOffset: 0 }
  ]);
  
  const [consumed, setConsumed] = useState<Message[]>([]);
  const [messageId, setMessageId] = useState(1);
  const [consumerStatus, setConsumerStatus] = useState<"active" | "lagging">("active");

  // Controls
  const [autoProduce, setAutoProduce] = useState(false);
  const [producerRate, setProducerRate] = useState(2); // msgs per sec
  const [consumerRate, setConsumerRate] = useState(3); // msgs per sec
  const [strategy, setStrategy] = useState<"round-robin" | "hash">("round-robin");

  const animate = simulationsEnabled && !reduce;

  function publishEvent() {
    const payload = PAYLOADS[Math.floor(Math.random() * PAYLOADS.length)];
    const key = KEYS[Math.floor(Math.random() * KEYS.length)];
    
    setPartitions((prev) => {
      const next = prev.map(p => ({ ...p, messages: [...p.messages] })); // Deep copy partitions
      
      let partitionIndex = 0;
      if (strategy === "round-robin") {
        partitionIndex = messageId % PARTITIONS_COUNT;
      } else {
        partitionIndex = hashString(key) % PARTITIONS_COUNT;
      }
      
      const targetPartition = next[partitionIndex];
      const offset = targetPartition.leo;
      
      const newMessage: Message = { id: messageId, key, payload, partition: partitionIndex, offset };
      
      targetPartition.messages.push(newMessage);
      targetPartition.leo += 1;
      
      return next;
    });
    
    setMessageId((id) => id + 1);
  }

  // Auto Producer loop
  useEffect(() => {
    if (!simulationsEnabled || !autoProduce) return;
    const interval = setInterval(publishEvent, 1000 / producerRate);
    return () => clearInterval(interval);
  }, [simulationsEnabled, autoProduce, producerRate, strategy, messageId]);

  // Consumer loop
  useEffect(() => {
    if (!simulationsEnabled) return;

    const interval = setInterval(() => {
      setPartitions((prev) => {
        let consumedMsg: Message | null = null;
        const next = prev.map(p => ({ ...p, messages: [...p.messages] }));
        
        // Find a partition that has unconsumed messages (Consumer offset < LEO)
        // We round-robin the consumption across partitions
        for (let i = 0; i < PARTITIONS_COUNT; i++) {
          const p = next[i];
          if (p.consumerOffset < p.leo && p.messages.length > 0) {
            // Find the message matching the consumer offset
            const msgIndex = p.messages.findIndex(m => m.offset === p.consumerOffset);
            if (msgIndex !== -1) {
              consumedMsg = p.messages[msgIndex];
              p.consumerOffset += 1;
              // To prevent infinite array growth in the UI, we remove it from the visual array
              p.messages.splice(msgIndex, 1);
              break; 
            }
          }
        }
        
        if (consumedMsg) {
          setConsumed((c) => [...c.slice(-4), consumedMsg!]);
        }
        
        return next;
      });
    }, 1000 / consumerRate);

    return () => clearInterval(interval);
  }, [simulationsEnabled, consumerRate]);

  // Check for lag
  useEffect(() => {
    const totalPending = partitions.reduce((acc, p) => acc + (p.leo - p.consumerOffset), 0);
    if (totalPending > 8) {
      setConsumerStatus("lagging");
    } else {
      setConsumerStatus("active");
    }
  }, [partitions]);

  function reset() {
    setPartitions([
      { messages: [], leo: 0, consumerOffset: 0 },
      { messages: [], leo: 0, consumerOffset: 0 },
      { messages: [], leo: 0, consumerOffset: 0 }
    ]);
    setConsumed([]);
    setMessageId(1);
    setAutoProduce(false);
    setConsumerStatus("active");
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card/60 p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-muted-foreground flex justify-between">
              Producer Rate <span>{producerRate}/s</span>
            </label>
            <input 
              type="range" min="1" max="10" step="1" 
              value={producerRate} onChange={(e) => setProducerRate(Number(e.target.value))}
              className="accent-terminal w-32"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-muted-foreground flex justify-between">
              Consumer Rate <span>{consumerRate}/s</span>
            </label>
            <input 
              type="range" min="1" max="10" step="1" 
              value={consumerRate} onChange={(e) => setConsumerRate(Number(e.target.value))}
              className="accent-cyan-accent w-32"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-muted-foreground">Partition Strategy</label>
            <select 
              value={strategy} 
              onChange={(e) => setStrategy(e.target.value as any)}
              className="rounded border border-border bg-background px-2 py-1 font-mono text-xs text-foreground outline-none focus:border-terminal"
            >
              <option value="round-robin">Round-Robin</option>
              <option value="hash">Hash(Key)</option>
            </select>
          </div>
        </div>

        <button
          onClick={reset}
          className="rounded border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          reset
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
        
        {/* PRODUCER */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-4 flex items-center justify-center rounded-full border border-cyan-accent/30 bg-cyan-accent/10 p-3 text-cyan-accent">
            <Send className="size-5" />
          </div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-foreground">Producer</p>
          
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => setAutoProduce(!autoProduce)}
              className={`w-full rounded border py-2 font-mono text-xs transition-colors ${
                autoProduce 
                  ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20" 
                  : "border-border bg-background text-foreground hover:border-terminal/50 hover:text-terminal"
              }`}
            >
              {autoProduce ? "Stop Auto" : "Start Auto"}
            </button>
            <button
              onClick={publishEvent}
              disabled={autoProduce}
              className="w-full rounded border border-cyan-accent/40 bg-cyan-accent/10 py-2 font-mono text-xs text-cyan-accent transition-colors hover:bg-cyan-accent/20 hover:glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Publish 1
            </button>
          </div>
        </div>

        {/* TOPIC / PARTITIONS */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4 relative">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground">Kafka Topic</p>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1"><Info className="size-3" /> hover msg for details</span>
              <Database className="size-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mt-2">
            {partitions.map((partition, idx) => (
              <div key={idx} className="flex h-14 w-full flex-col overflow-hidden rounded border border-border bg-background/50">
                <div className="flex items-center justify-between border-b border-border/50 bg-black/20 px-2 py-0.5">
                  <span className="font-mono text-[9px] text-muted-foreground">P-{idx}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    LEO: <span className="text-cyan-accent">{partition.leo}</span> | Offset: <span className="text-terminal">{partition.consumerOffset}</span>
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-2 overflow-hidden px-2">
                  <AnimatePresence mode="popLayout">
                    {partition.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        layout={animate}
                        initial={animate ? { opacity: 0, scale: 0.5, x: -20 } : false}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={animate ? { opacity: 0, scale: 0.5, y: 20 } : { opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="group relative flex shrink-0 cursor-pointer items-center justify-center rounded bg-terminal/15 px-2 py-1 font-mono text-xs border border-terminal/30 text-terminal hover:bg-terminal hover:text-black"
                      >
                        #{msg.id}
                        
                        {/* Tooltip Payload */}
                        <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 flex-col rounded border border-border bg-card p-2 text-left shadow-xl group-hover:flex">
                          <pre className="font-mono text-[9px] text-muted-foreground leading-tight">
{`{
  "id": ${msg.id},
  "offset": ${msg.offset},
  "partition": ${msg.partition},
  "key": "${msg.key}",
  "payload": "${msg.payload}"
}`}
                          </pre>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONSUMER GROUP */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/60 p-4 relative overflow-hidden">
          <div className={`mb-4 flex items-center justify-center rounded-full border p-3 transition-colors ${
            consumerStatus === "lagging" ? "border-destructive/30 bg-destructive/10 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-terminal/30 bg-terminal/10 text-terminal"
          }`}>
            {consumerStatus === "lagging" ? <ServerCrash className="size-5" /> : <Cpu className="size-5" />}
          </div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-foreground text-center">
            Consumer<br />Group
          </p>
          
          <div className="flex flex-col items-center gap-1">
            <p className={`font-mono text-xs px-2 py-0.5 rounded ${consumerStatus === "lagging" ? "bg-destructive/20 text-destructive animate-pulse" : "bg-terminal/20 text-terminal"}`}>
              {consumerStatus === "lagging" ? "LAGGING" : "ACTIVE"}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground mt-1">
              Lag: {partitions.reduce((acc, p) => acc + (p.leo - p.consumerOffset), 0)} msgs
            </p>
          </div>
          
          <div className="mt-4 flex w-full flex-col gap-1">
            <AnimatePresence>
              {consumed.map((msg) => (
                <motion.div
                  key={`consumed-${msg.id}`}
                  initial={animate ? { opacity: 0, y: -10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full truncate rounded border border-border bg-background/50 px-2 py-1 text-center font-mono text-[9px] text-muted-foreground"
                >
                  ✓ P{msg.partition}:{msg.offset} {msg.payload}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
