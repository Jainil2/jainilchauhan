import { motion, AnimatePresence } from "framer-motion";

interface TokenBucketProps {
  tokens: number;
  maxTokens: number;
  isRateLimited: boolean;
}

/**
 * SVG "token bucket" widget — a glowing container of dots that drains as the
 * user types and refills over time. Shows a 429 badge when the bucket is empty.
 */
export function TokenBucket({ tokens, maxTokens, isRateLimited }: TokenBucketProps) {
  const fillPercent = Math.min(1, tokens / maxTokens);
  const filledDots = Math.round(fillPercent * maxTokens);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        token bucket
      </p>

      {/* Bucket SVG */}
      <div className="relative">
        <svg
          width="56"
          height="68"
          viewBox="0 0 56 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Token bucket: ${filledDots} of ${maxTokens} tokens available`}
          role="img"
        >
          {/* Bucket body */}
          <path
            d="M6 14 L10 62 Q10 66 14 66 L42 66 Q46 66 46 62 L50 14 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-border"
            fill="oklch(0.20 0.02 150)"
          />
          {/* Bucket rim */}
          <rect x="4" y="10" width="48" height="6" rx="3"
            className="text-border fill-current"
            fill="oklch(0.24 0.02 150)"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Fill level */}
          <clipPath id="bucket-clip">
            <path d="M10 16 L13 62 Q13 64 14 64 L42 64 Q43 64 43 62 L46 16 Z" />
          </clipPath>
          <motion.rect
            x="10"
            width="36"
            clipPath="url(#bucket-clip)"
            fill="oklch(0.85 0.21 150 / 18%)"
            // Explicit initial to guarantee a valid numeric starting value;
            // avoids "Expected length, undefined" when fillPercent starts at 0.
            initial={{ height: 0, y: 64 }}
            animate={{
              height: Math.max(0, 48 * fillPercent),
              y: 16 + Math.max(0, 48 * (1 - fillPercent)),
            }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
          {/* Liquid surface shimmer */}
          {fillPercent > 0.02 && (
            <motion.line
              x1="10"
              x2="46"
              y1={16 + 48 * (1 - fillPercent)}
              y2={16 + 48 * (1 - fillPercent)}
              stroke="oklch(0.85 0.21 150 / 60%)"
              strokeWidth="1.5"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
        </svg>

        {/* 429 badge */}
        <AnimatePresence>
          {isRateLimited && (
            <motion.div
              key="rate-limit"
              initial={{ opacity: 0, scale: 0.7, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="absolute -top-3 -right-3 rounded border border-destructive/60 bg-destructive/20 px-1.5 py-0.5 font-mono text-xs font-bold text-destructive"
            >
              429
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(5, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: maxTokens }).map((_, i) => {
          const active = i < filledDots;
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: active
                  ? "oklch(0.85 0.21 150)"
                  : "oklch(0.30 0.02 150 / 40%)",
                boxShadow: active
                  ? "0 0 6px oklch(0.85 0.21 150 / 60%)"
                  : "none",
              }}
              transition={{ duration: 0.2 }}
              className="size-2.5 rounded-full"
            />
          );
        })}
      </div>

      {/* Token count */}
      <p className="font-mono text-xs tabular-nums text-muted-foreground">
        <span className={isRateLimited ? "text-destructive" : "text-terminal"}>
          {tokens.toFixed(1)}
        </span>
        <span className="text-border"> / {maxTokens}</span>
      </p>
    </div>
  );
}
