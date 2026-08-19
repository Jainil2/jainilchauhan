import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Github, Linkedin, Mail, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { SectionHeading } from "./SectionHeading";
import { sendContactMessage } from "@/lib/contact.functions";
import { useTokenBucket } from "@/hooks/useTokenBucket";
import { TokenBucket } from "@/components/system-design/TokenBucket";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255, "Email is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(2000, "Message is too long"),
});

const REQUIRED_TOKENS = 1;

export function Contact() {
  const sendFn = useServerFn(sendContactMessage);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const mountedAt = useRef<number>(Date.now());
  const prevLengthRef = useRef(0);

  const { tokens, maxTokens, onType, canSubmit, isRateLimited } =
    useTokenBucket(REQUIRED_TOKENS);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newLength = e.target.value.length;
    const delta = newLength - prevLengthRef.current;
    if (delta > 0) onType(delta); // only drain on new characters
    prevLengthRef.current = newLength;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const honeypot = String(fd.get("website") ?? "");
    if (honeypot) {
      toast.success("Message sent", {
        description: "Thanks — I'll get back to you soon.",
      });
      e.currentTarget.reset();
      return;
    }
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "name" | "email" | "message";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const form = e.currentTarget;
    try {
      const elapsedMs = Date.now() - mountedAt.current;
      await sendFn({ data: { ...parsed.data, elapsedMs, website: "" } });
      toast.success("Message sent", {
        description: "Thanks — I'll get back to you soon.",
      });
      form.reset();
      prevLengthRef.current = 0;
    } catch {
      toast.error("Couldn't send message", { description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-terminal focus:outline-none focus:ring-1 focus:ring-terminal";

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading id="contact" prompt="./contact --start" title="Contact" />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-pretty font-mono text-2xl font-semibold text-foreground sm:text-3xl">
            Have a problem worth solving?{" "}
            <span className="text-terminal">Let&apos;s talk.</span>
          </h3>
          <p className="mt-3 max-w-xl text-muted-foreground">
            I&apos;m open to backend, platform, and distributed-systems roles —
            full-time, contract, or interesting one-off engagements. Drop a note
            and I&apos;ll reply within a couple of days.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
            {/* Honeypot field — hidden from users, visible to most bots. */}
            <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="name" className="font-mono text-xs text-muted-foreground">
                name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                maxLength={100}
                className={inputClass}
                placeholder="your name"
              />
              {errors.name && (
                <p className="mt-1 font-mono text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="font-mono text-xs text-muted-foreground">
                email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={255}
                className={inputClass}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 font-mono text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="message" className="font-mono text-xs text-muted-foreground">
                message
              </label>
              {/* Shake animation when rate limited */}
              <motion.div
                animate={isRateLimited ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  maxLength={2000}
                  onChange={handleMessageChange}
                  className={`${inputClass} ${isRateLimited ? "border-destructive/60 focus:border-destructive focus:ring-destructive" : ""}`}
                  placeholder="What are you building?"
                />
              </motion.div>
              {errors.message && (
                <p className="mt-1 font-mono text-xs text-destructive">{errors.message}</p>
              )}
              {isRateLimited && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 font-mono text-xs text-destructive"
                >
                  429 Too Many Requests — wait for tokens to replenish.
                </motion.p>
              )}
            </div>

            {/* Submit row with token bucket */}
            <div className="flex items-end gap-5">
              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="inline-flex items-center gap-2 rounded-md bg-terminal px-5 py-2.5 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:glow-terminal disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> sending...
                  </>
                ) : (
                  <>send message →</>
                )}
              </button>

              {/* Token bucket visualizer */}
              <TokenBucket
                tokens={tokens}
                maxTokens={maxTokens}
                isRateLimited={isRateLimited}
              />
            </div>
          </form>
        </div>

        <aside className="space-y-3 rounded-lg border border-border bg-card/60 p-6 font-mono text-sm">
          <p className="text-xs uppercase tracking-wider text-cyan-accent">
            // direct lines
          </p>

          <a
            href="mailto:jainil.chauhan@example.com"
            className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 p-3 text-foreground transition-colors hover:border-terminal/50 hover:text-terminal"
          >
            <Mail className="size-4" />
            jainil.chauhan@example.com
          </a>
          <a
            href="https://www.linkedin.com/in/jainil-chauhan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 p-3 text-foreground transition-colors hover:border-terminal/50 hover:text-terminal"
          >
            <Linkedin className="size-4" />
            linkedin.com/in/jainil-chauhan
          </a>
          <a
            href="https://github.com/jainil-chauhan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 p-3 text-foreground transition-colors hover:border-terminal/50 hover:text-terminal"
          >
            <Github className="size-4" />
            github.com/jainil-chauhan
          </a>

          <a
            href="/jainil-chauhan-resume.pdf"
            download
            className="mt-2 flex items-center justify-center gap-2 rounded-md border border-terminal/40 bg-terminal/10 p-3 text-terminal transition-all hover:bg-terminal/20 hover:glow-terminal"
          >
            <Download className="size-4" />
            download resume.pdf
          </a>
        </aside>
      </div>
    </section>
  );
}