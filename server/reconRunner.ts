import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import {
  buildReconReport,
  isFindingInScope,
  type ReconCommandResult,
  type ReconFinding,
  type ReconMode,
  type ReconPipelineResult,
  type ReconToolStatus,
  validateReconTarget,
} from "@shared/recon";

const execFileAsync = promisify(execFile);
const MAX_OUTPUT_BYTES = 2_000_000;
const DEFAULT_TIMEOUT_MS = 120_000;
const RECON_TOOL_DIR = process.env.RECON_TOOL_DIR || "/opt/recon/bin";

const toolDefinitions = [
  { name: "subfinder", label: "Subfinder", purpose: "Fast passive subdomain discovery", mode: "passive" as const },
  { name: "amass", label: "OWASP Amass", purpose: "Passive attack-surface mapping", mode: "passive" as const },
  { name: "dnsx", label: "DNSx", purpose: "Scoped DNS record enrichment", mode: "enrichment" as const },
  { name: "httpx", label: "HTTPx", purpose: "Scoped HTTP metadata probing", mode: "active" as const },
];

function preferredBinary(name: string) {
  return `${RECON_TOOL_DIR}/${name}`;
}

async function resolveBinary(name: string) {
  try {
    const explicit = preferredBinary(name);
    try {
      await execFileAsync("test", ["-x", explicit]);
      return explicit;
    } catch {
      const result = await execFileAsync("which", [name]);
      return result.stdout.trim() || null;
    }
  } catch {
    return null;
  }
}

export async function getReconToolStatus(): Promise<ReconToolStatus[]> {
  return Promise.all(toolDefinitions.map(async tool => {
    const binary = await resolveBinary(tool.name);
    let version: string | undefined;
    if (binary) {
      try {
        const result = await execFileAsync(binary, ["-version"], { timeout: 4_000, maxBuffer: 64_000 });
        version = `${result.stdout || result.stderr}`.trim().split("\n")[0];
      } catch {
        version = "installed";
      }
    }
    return { ...tool, installed: Boolean(binary), version };
  }));
}

type CommandRun = ReconCommandResult & { binary: string | null };

function runCommand(binary: string | null, label: string, tool: string, args: string[], input = "", timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CommandRun> {
  if (!binary) {
    return Promise.resolve({
      binary,
      tool,
      label,
      status: "skipped",
      durationMs: 0,
      stdout: "",
      stderr: `${tool} is not installed in the Recon runtime.`,
      exitCode: null,
    });
  }

  return new Promise(resolve => {
    const startedAt = Date.now();
    const child = spawn(binary, args, {
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, HOME: process.env.HOME || "/tmp" },
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const append = (current: string, chunk: Buffer) => {
      if (current.length >= MAX_OUTPUT_BYTES) return current;
      return `${current}${chunk.toString("utf8")}`.slice(0, MAX_OUTPUT_BYTES);
    };

    const finish = (status: CommandRun["status"], exitCode: number | null, errorText = "") => {
      if (settled) return;
      settled = true;
      if (errorText) stderr = `${stderr}\n${errorText}`.trim();
      resolve({ binary, tool, label, status, durationMs: Date.now() - startedAt, stdout, stderr, exitCode });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 2_000).unref();
    }, timeoutMs);

    child.stdout.on("data", chunk => { stdout = append(stdout, chunk); });
    child.stderr.on("data", chunk => { stderr = append(stderr, chunk); });
    child.on("error", error => {
      clearTimeout(timer);
      finish("failed", null, error.message);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) finish("failed", code, `Timed out after ${timeoutMs}ms.`);
      else if (code === 0) finish("completed", code);
      else finish("failed", code, signal ? `Exited with signal ${signal}.` : undefined);
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

function parseJsonLines(stdout: string) {
  return stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean).flatMap(line => {
    try { return [JSON.parse(line) as Record<string, unknown>]; } catch { return []; }
  });
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asStrings(value: unknown) {
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean);
  if (typeof value === "string" && value) return [value];
  return [];
}

function addFinding(findings: ReconFinding[], finding: ReconFinding, target: string) {
  if (!finding.asset || !isFindingInScope(finding.asset, target)) return;
  const key = `${finding.type}:${finding.asset.toLowerCase()}`;
  if (findings.some(existing => `${existing.type}:${existing.asset.toLowerCase()}` === key)) return;
  findings.push(finding);
}

function parseSubfinderOutput(stdout: string, target: string, findings: ReconFinding[]) {
  const jsonRows = parseJsonLines(stdout);
  if (jsonRows.length) {
    for (const row of jsonRows) {
      const asset = asString(row.host) || asString(row.subdomain) || asString(row.name);
      if (asset) addFinding(findings, { type: "subdomain", asset, source: asString(row.source) || "subfinder", severity: "info", evidence: JSON.stringify(row) }, target);
    }
    return;
  }
  for (const asset of stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
    addFinding(findings, { type: "subdomain", asset, source: "subfinder", severity: "info" }, target);
  }
}

function parseAmassOutput(stdout: string, target: string, findings: ReconFinding[]) {
  const jsonRows = parseJsonLines(stdout);
  if (jsonRows.length) {
    for (const row of jsonRows) {
      const asset = asString(row.name) || asString(row.host) || asString(row.domain);
      if (asset) addFinding(findings, { type: "subdomain", asset, source: "amass", severity: "info", evidence: JSON.stringify(row) }, target);
    }
    return;
  }
  for (const asset of stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
    addFinding(findings, { type: "subdomain", asset, source: "amass", severity: "info" }, target);
  }
}

function parseDnsxOutput(stdout: string, target: string, findings: ReconFinding[]) {
  const jsonRows = parseJsonLines(stdout);
  if (jsonRows.length) {
    for (const row of jsonRows) {
      const asset = asString(row.host) || asString(row.name) || asString(row.input);
      if (!asset) continue;
      const records = ["a", "aaaa", "cname", "mx", "ns", "txt", "resp"].flatMap(key => asStrings(row[key]));
      const ip = asStrings(row.a)[0] || asStrings(row.aaaa)[0];
      addFinding(findings, { type: "dns", asset, source: "dnsx", severity: "low", ip, records, evidence: JSON.stringify(row) }, target);
    }
    return;
  }
  for (const line of stdout.split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
    const [asset, ...records] = line.split(/\s+/);
    addFinding(findings, { type: "dns", asset, source: "dnsx", severity: "low", records }, target);
  }
}

function parseHttpxOutput(stdout: string, target: string, findings: ReconFinding[]) {
  const jsonRows = parseJsonLines(stdout);
  if (jsonRows.length) {
    for (const row of jsonRows) {
      const url = asString(row.url) || asString(row.input) || asString(row.host);
      const asset = asString(row.host) || (url ? new URL(url).hostname : undefined);
      if (!asset) continue;
      const statusCode = typeof row.status_code === "number" ? row.status_code : undefined;
      addFinding(findings, {
        type: "http",
        asset,
        source: "httpx",
        severity: statusCode && statusCode >= 500 ? "medium" : "low",
        url,
        statusCode,
        title: asString(row.title),
        technologies: asStrings(row.tech),
        ip: asStrings(row.host_ip)[0] || asStrings(row.a)[0],
        evidence: JSON.stringify(row),
      }, target);
    }
    return;
  }
  for (const line of stdout.split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
    let asset = line;
    try { asset = new URL(line).hostname; } catch { /* text output may not be a URL */ }
    addFinding(findings, { type: "http", asset, source: "httpx", severity: "low", url: line }, target);
  }
}

export async function runReconPipeline(rawTarget: string, mode: ReconMode, allowPrivate = false): Promise<ReconPipelineResult> {
  const targetResult = validateReconTarget(rawTarget, allowPrivate);
  if (!targetResult.ok) throw new Error(targetResult.error);
  const target = targetResult.target;
  const findings: ReconFinding[] = [];
  const commands: ReconCommandResult[] = [];
  const warnings: string[] = [];
  const binaries = new Map<string, string | null>();
  for (const definition of toolDefinitions) binaries.set(definition.name, await resolveBinary(definition.name));

  const subfinder = await runCommand(binaries.get("subfinder") || null, "Subfinder", "subfinder", ["-d", target, "-silent", "-json"], "", 90_000);
  commands.push(subfinder);
  if (subfinder.status === "completed") parseSubfinderOutput(subfinder.stdout, target, findings);
  if (subfinder.status === "skipped") warnings.push("Subfinder is unavailable; passive discovery was partially skipped.");

  const amass = await runCommand(binaries.get("amass") || null, "OWASP Amass", "amass", ["enum", "-passive", "-d", target], "", 120_000);
  commands.push(amass);
  if (amass.status === "completed") parseAmassOutput(amass.stdout, target, findings);
  if (amass.status === "skipped") warnings.push("OWASP Amass is unavailable; deep passive discovery was skipped.");

  if (mode === "active") {
    const hosts = [target, ...findings.filter(finding => finding.type === "subdomain").map(finding => finding.asset)].filter((value, index, values) => values.indexOf(value) === index);
    const input = `${hosts.join("\n")}\n`;
    const dnsx = await runCommand(binaries.get("dnsx") || null, "DNSx", "dnsx", ["-silent", "-json", "-resp", "-a", "-aaaa", "-cname", "-mx", "-ns", "-txt", "-rl", "25"], input, 90_000);
    commands.push(dnsx);
    if (dnsx.status === "completed") parseDnsxOutput(dnsx.stdout, target, findings);
    if (dnsx.status === "skipped") warnings.push("DNSx is unavailable; DNS enrichment was skipped.");

    const httpx = await runCommand(binaries.get("httpx") || null, "HTTPx", "httpx", ["-silent", "-json", "-status-code", "-title", "-tech-detect", "-follow-redirects", "-rl", "20", "-t", "10", "-timeout", "10"], input, 120_000);
    commands.push(httpx);
    if (httpx.status === "completed") parseHttpxOutput(httpx.stdout, target, findings);
    if (httpx.status === "skipped") warnings.push("HTTPx is unavailable; HTTP enrichment was skipped.");
  }

  for (const command of commands) {
    if (command.status === "failed") warnings.push(`${command.label} failed: ${command.stderr.slice(0, 240) || "unknown error"}`);
  }

  const result = { target, mode, findings, commands, warnings };
  return { ...result, reportMarkdown: buildReconReport(result) };
}
