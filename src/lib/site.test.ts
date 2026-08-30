import { afterEach, describe, expect, it, vi } from "vitest";
import { PLATFORM_URL, SITE_URL, absoluteUrl, joinUrl, migratedLabUrl } from "./site";

/**
 * These guard the launch switches, which are the kind of thing that is wrong
 * exactly once, on the day it matters, in front of a crawler.
 *
 * The module reads `import.meta.env` at load, so the env-dependent functions
 * are tested twice: in their default (unconfigured) state directly, and with a
 * stubbed env through a fresh import.
 */
describe("joinUrl", () => {
  it("joins without a double slash", () => {
    expect(joinUrl("https://x.dev", "/lab")).toBe("https://x.dev/lab");
    expect(joinUrl("https://x.dev/", "/lab")).toBe("https://x.dev/lab");
    expect(joinUrl("https://x.dev/", "lab")).toBe("https://x.dev/lab");
  });

  it("keeps the trailing slash on a root URL", () => {
    // A bare origin and an origin with a trailing slash are the same page but
    // not the same string, and a canonical is compared as a string.
    expect(joinUrl("https://x.dev", "/")).toBe("https://x.dev/");
    expect(joinUrl("https://x.dev/", "")).toBe("https://x.dev/");
  });

  it("does not leave a trailing slash on a deeper path", () => {
    expect(joinUrl("https://x.dev", "/lab/kv-cache/")).toBe("https://x.dev/lab/kv-cache");
  });
});

describe("with no domain configured (the state this repo ships in)", () => {
  it("has no site URL and no platform URL", () => {
    expect(SITE_URL).toBe("");
    expect(PLATFORM_URL).toBe("");
  });

  it("emits no canonical rather than one pointing at a placeholder host", () => {
    expect(absoluteUrl("/lab/kv-cache")).toBeUndefined();
    expect(absoluteUrl("/")).toBeUndefined();
  });

  it("redirects nothing", () => {
    expect(migratedLabUrl("/lab")).toBeUndefined();
    expect(migratedLabUrl("/lab/kv-cache")).toBeUndefined();
  });
});

describe("with a domain configured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function reimport(env: Record<string, string>) {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    vi.resetModules();
    return import("./site");
  }

  it("builds absolute URLs once SITE_URL is set", async () => {
    const site = await reimport({ VITE_SITE_URL: "https://example.test" });
    expect(site.absoluteUrl("/lab/kv-cache")).toBe("https://example.test/lab/kv-cache");
    expect(site.absoluteUrl("/")).toBe("https://example.test/");
  });

  it("redirects /lab once the platform has moved", async () => {
    const site = await reimport({ VITE_PLATFORM_URL: "https://platform.test" });
    expect(site.migratedLabUrl("/lab/kv-cache")).toBe("https://platform.test/lab/kv-cache");
  });

  it("never redirects on the platform build — that would be a loop", async () => {
    const site = await reimport({
      VITE_SITE: "delta",
      VITE_PLATFORM_URL: "https://platform.test",
    });
    expect(site.isPlatform).toBe(true);
    expect(site.migratedLabUrl("/lab/kv-cache")).toBeUndefined();
  });
});
