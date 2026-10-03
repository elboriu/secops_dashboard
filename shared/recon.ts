export const RECON_MODES = ["passive", "active"] as const;
export type ReconMode = (typeof RECON_MODES)[number];

export const RECON_FINDING_TYPES = ["subdomain", "dns", "http"] as const;
export type ReconFindingType = (typeof RECON_FINDING_TYPES)[number];

export type ReconSeverity = "info" | "low" | "medium" | "high";

export interface ReconFinding {
  type: ReconFindingType;
  asset: string;
  source: string;
  severity: ReconSeverity;
  ip?: string;
  url?: string;
  statusCode?: number;
  title?: string;
  technologies?: string[];
  records?: string[];
  evidence?: string;
}

export interface ReconToolStatus {
  name: string;
  label: string;
  installed: boolean;
  version?: string;
  purpose: string;
  mode: "passive" | "active" | "enrichment";
}

export interface ReconCommandResult {
  tool: string;
  label: string;
  status: "completed" | "skipped" | "failed";
  durationMs: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface ReconPipelineResult {
  target: string;
  mode: ReconMode;
  findings: ReconFinding[];
  commands: ReconCommandResult[];
  reportMarkdown: string;
  warnings: string[];
}

const hostnameLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;

function isValidIpv4(value: string) {
  return ipv4Pattern.test(value) && value.split(".").every(part => Number(part) >= 0 && Number(part) <= 255);
}

function isPrivateIpv4(value: string) {
  if (!isValidIpv4(value)) return false;
  const [first, second] = value.split(".").map(Number);
  return first === 10 || first === 127 || first === 0 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
}

export function isFindingInScope(asset: string, target: string) {
  const normalizedAsset = asset.trim().toLowerCase().replace(/\.$/, "");
  return normalizedAsset === target || normalizedAsset.endsWith(`.${target}`);
}

export function validateReconTarget(input: string, allowPrivate = false): { ok: true; target: string } | { ok: false; error: string } {
  const raw = input.trim().toLowerCase();
  if (!raw) return { ok: false, error: "Target is required." };
  if (raw.includes("@") || raw.includes(" ") || raw.includes("\\") || raw.includes(";")) {
    return { ok: false, error: "Enter a hostname or IPv4 address only; paths, credentials, and command syntax are not accepted." };
  }

  const withoutScheme = raw.replace(/^https?:\/\//, "");
  const target = withoutScheme.split(/[/?#]/, 1)[0].replace(/\.$/, "");
  if (!target || target.length > 253) return { ok: false, error: "Target must be a valid hostname." };

  if (isValidIpv4(target)) {
    if (!allowPrivate && isPrivateIpv4(target)) return { ok: false, error: "Private and loopback targets are disabled by default." };
    return { ok: true, target };
  }

  const labels = target.split(".");
  if (labels.length < 2 || labels.some(label => !hostnameLabel.test(label))) {
    return { ok: false, error: "Use a public hostname such as example.com or app.example.com." };
  }
  if (!allowPrivate && (target === "localhost" || target.endsWith(".localhost") || target.endsWith(".local"))) {
    return { ok: false, error: "Local-only hostnames are disabled by default." };
  }
  return { ok: true, target };
}

export function buildReconReport(result: Omit<ReconPipelineResult, "reportMarkdown">) {
  const counts = result.findings.reduce<Record<string, number>>((summary, finding) => {
    summary[finding.type] = (summary[finding.type] ?? 0) + 1;
    return summary;
  }, {});

  const findingLines = result.findings.slice(0, 250).map(finding => {
    const detail = [
      finding.url,
      finding.ip,
      finding.statusCode ? `HTTP ${finding.statusCode}` : undefined,
      finding.title,
      finding.technologies?.length ? finding.technologies.join(", ") : undefined,
      finding.records?.length ? finding.records.join(", ") : undefined,
    ].filter(Boolean).join(" · ");
    return `| ${finding.type} | ${finding.asset} | ${finding.source} | ${finding.severity} | ${detail || "—"} |`;
  });

  const commandLines = result.commands.map(command => `- **${command.label}** — ${command.status} (${command.durationMs}ms)`).join("\n");
  const warningBlock = result.warnings.length ? `\n## Warnings\n${result.warnings.map(warning => `- ${warning}`).join("\n")}\n` : "";

  return [
    `# Recon Report — ${result.target}`,
    "",
    `- **Mode:** ${result.mode}`,
    `- **Generated:** ${new Date().toISOString()}`,
    `- **Total findings:** ${result.findings.length}`,
    `- **Subdomains:** ${counts.subdomain ?? 0}`,
    `- **DNS records:** ${counts.dns ?? 0}`,
    `- **HTTP services:** ${counts.http ?? 0}`,
    "",
    "## Tool Pipeline",
    commandLines || "- No tools completed.",
    warningBlock,
    "## Findings",
    "",
    "| Type | Asset | Source | Severity | Details |",
    "| --- | --- | --- | --- | --- |",
    ...(findingLines.length ? findingLines : ["| — | No findings | — | info | — |"]),
    "",
    "> This report is generated for authorized security testing and asset inventory. Validate every finding before taking action.",
  ].join("\n");
}
