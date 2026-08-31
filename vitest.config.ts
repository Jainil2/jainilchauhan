import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Deliberately NOT built on @lovable.dev/vite-tanstack-config. That preset adds
// the tanstackStart and cloudflare plugins, which expect a full app build and
// break a plain unit run. Unit tests here are pure logic, so all they need is
// the `@` alias.
export default defineConfig({
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
