import React, { useState } from "react";
import { useGlobalStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TokenBucketContact() {
  const { tokenBucket, isSimulationsEnabled } = useGlobalStore();
  const [status, setStatus] = useState<"idle" | "success" | "rate_limited">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSimulationsEnabled) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    const success = tokenBucket.consumeToken();
    if (success) {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
      setFormData({ name: "", email: "", message: "" });
    } else {
      setStatus("rate_limited");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl relative">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent pointer-events-none" />

      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Get in Touch
        </CardTitle>
        <CardDescription>
          {isSimulationsEnabled ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Token Bucket Rate Limiter Active
            </span>
          ) : (
            "Send me a message to start a conversation."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Your Message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="min-h-[120px] bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors resize-none"
            />
          </div>
          <Button
            type="submit"
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="flex items-center justify-center gap-2 relative z-10">
              Send Message <Send className="w-4 h-4" />
            </span>
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Message sent successfully!
            </motion.div>
          )}
          {status === "rate_limited" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" /> Rate limit exceeded. Please wait for tokens to
              refill.
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Simulation Vis */}
      {isSimulationsEnabled && (
        <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t border-white/10 bg-black/20">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Bucket Status
          </div>
          <div className="flex gap-2">
            {[...Array(tokenBucket.maxTokens)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < tokenBucket.tokens ? 1 : 0.8,
                  opacity: i < tokenBucket.tokens ? 1 : 0.3,
                  backgroundColor: i < tokenBucket.tokens ? "#8b5cf6" : "#374151",
                }}
                className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center border border-white/10"
              >
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </motion.div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Refill rate: 1 token / {tokenBucket.refillRateMs / 1000}s
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
