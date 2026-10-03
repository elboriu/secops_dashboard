import { describe, expect, it } from "vitest";
import { buildReconReport, validateReconTarget } from "../shared/recon";
import { runReconPipeline } from "./reconRunner";

describe("Recon scope validation", () => {
  it("normalizes an authorized public hostname", () => {
    expect(validateReconTarget("https://Example.com/path")).toEqual({ ok: true, target: "example.com" });
  });

  it("rejects command-like input and private targets by default", () => {
    expect(validateReconTarget("example.com; whoami").ok).toBe(false);
    expect(validateReconTarget("192.168.1.10").ok).toBe(false);
    expect(validateReconTarget("192.168.1.10", true)).toEqual({ ok: true, target: "192.168.1.10" });
  });
});

describe("Recon pipeline", () => {
  it("returns a bounded report when optional binaries are unavailable", async () => {
    const result = await runReconPipeline("example.com", "passive");
    expect(result.target).toBe("example.com");
    expect(result.mode).toBe("passive");
    expect(result.commands).toHaveLength(2);
    expect(result.commands.every(command => command.status === "skipped" || command.status === "completed")).toBe(true);
    expect(result.reportMarkdown).toContain("# Recon Report — example.com");
    expect(result.reportMarkdown).toContain("authorized security testing");
  });

  it("builds an empty-result report without throwing", () => {
    const report = buildReconReport({ target: "example.com", mode: "active", findings: [], commands: [], warnings: [] });
    expect(report).toContain("No findings");
    expect(report).toContain("active");
  });
});
