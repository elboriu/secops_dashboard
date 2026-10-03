import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock3, Download, FileSearch, Globe2, Loader2, Radar, RefreshCw, Server, ShieldCheck, Terminal, Wifi } from "lucide-react";

const toolAccent: Record<string, string> = {
  subfinder: "text-cyan-300 border-cyan-400/30 bg-cyan-400/5",
  amass: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/5",
  dnsx: "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
  httpx: "text-amber-300 border-amber-400/30 bg-amber-400/5",
};

const severityClass: Record<string, string> = {
  info: "text-slate-300 bg-slate-400/10 border-slate-400/20",
  low: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  medium: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  high: "text-rose-300 bg-rose-400/10 border-rose-400/20",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function downloadReport(report: string, target: string) {
  const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `recon-${target.replace(/[^a-z0-9.-]/gi, "-")}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReconCenter() {
  const [target, setTarget] = useState("");
  const [mode, setMode] = useState<"passive" | "active">("passive");
  const [allowPrivate, setAllowPrivate] = useState(false);
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [resultData, setResultData] = useState<Awaited<ReturnType<typeof trpc.recon.start.useMutation>>["data"]>(undefined);
  const [findingFilter, setFindingFilter] = useState("all");

  const toolsQuery = trpc.recon.tools.useQuery(undefined, { refetchInterval: 30_000 });
  const historyQuery = trpc.recon.history.useQuery();
  const detailsQuery = trpc.recon.details.useQuery(
    { scanId: selectedScanId || 0 },
    { enabled: selectedScanId !== null },
  );
  const startRecon = trpc.recon.start.useMutation({
    onSuccess: data => {
      setSelectedScanId(data.scanId);
      setResultData(data);
      historyQuery.refetch();
    },
  });

  const selectedDetails = detailsQuery.data;
  const activeTarget = resultData?.target ?? selectedDetails?.scan.target;
  const activeStatus = resultData ? "completed" : selectedDetails?.scan.status;
  const activeTimestamp = resultData ? new Date() : selectedDetails?.scan.completedAt ?? selectedDetails?.scan.createdAt;
  const activeFindings = resultData?.findings ?? selectedDetails?.findings ?? [];
  const activeReport = resultData?.reportMarkdown ?? selectedDetails?.scan.reportMarkdown ?? "";
  const filteredFindings = useMemo(
    () => findingFilter === "all" ? activeFindings : activeFindings.filter(finding => finding.type === findingFilter),
    [activeFindings, findingFilter],
  );
  const installedTools = toolsQuery.data?.filter(tool => tool.installed).length ?? 0;

  const start = () => {
    startRecon.mutate({
      target,
      mode,
      allowPrivate,
      confirmAuthorization: true,
    });
  };

  return (
    <div className="recon-shell space-y-6">
      <section className="recon-hero relative overflow-hidden rounded-2xl border border-cyan-300/20 p-6 lg:p-8">
        <div className="recon-grid absolute inset-0" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/80"><Radar className="h-4 w-4" /> Authorized attack-surface intelligence</div>
            <h1 className="recon-title text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">Recon Center</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Discover public assets, resolve scoped infrastructure, and enrich exposed services from one controlled workflow. Every run is stored with its tool output and a portable report.</p>
          </div>
          <div className="recon-live-pill flex items-center gap-2 self-start rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Engine ready · {installedTools}/{toolsQuery.data?.length ?? 4} tools</div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <section className="recon-panel rounded-2xl border border-white/10 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70"><FileSearch className="h-4 w-4" /> New operation</div><h2 className="text-xl font-semibold text-white">Map a target surface</h2></div><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400">Scope locked</span></div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="recon-target">Target domain or public IPv4</label>
          <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/60" /><input id="recon-target" value={target} onChange={event => setTarget(event.target.value)} placeholder="example.com" className="recon-input w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10" /></div><button type="button" onClick={start} disabled={!authorizationConfirmed || !target.trim() || startRecon.isPending} className="recon-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{startRecon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} {startRecon.isPending ? "Running…" : "Start Recon"}</button></div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setMode("passive")} className={`recon-mode-card rounded-xl border p-4 text-left transition ${mode === "passive" ? "active border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white">Passive Recon</span><ShieldCheck className="h-4 w-4 text-cyan-300" /></div><p className="mt-2 text-xs leading-5 text-slate-400">Subfinder + Amass passive discovery. No direct probing of discovered hosts.</p></button>
            <button type="button" onClick={() => setMode("active")} className={`recon-mode-card rounded-xl border p-4 text-left transition ${mode === "active" ? "active border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white">Active Enrichment</span><Wifi className="h-4 w-4 text-amber-300" /></div><p className="mt-2 text-xs leading-5 text-slate-400">Adds scoped DNS and HTTP metadata probes with conservative rate limits.</p></button>
          </div>

          <div className="mt-5 space-y-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.04] p-4"><label className="flex items-start gap-3 text-sm text-slate-200"><input type="checkbox" checked={authorizationConfirmed} onChange={event => setAuthorizationConfirmed(event.target.checked)} className="mt-0.5 accent-cyan-300" /><span><strong className="font-semibold text-white">I confirm this target is owned by me or explicitly authorized for assessment.</strong><span className="mt-1 block text-xs leading-5 text-slate-400">Recon is limited to the submitted hostname/IP and subdomains returned within that scope.</span></span></label>{mode === "active" && <div className="flex items-start gap-2 text-xs leading-5 text-amber-200/80"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Active mode sends DNS queries and HTTP requests. Use it only within the approved engagement window.</div>}<label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={allowPrivate} onChange={event => setAllowPrivate(event.target.checked)} className="accent-amber-300" /> Allow private/loopback targets for an internal authorized scope</label></div>
          {startRecon.error && <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">{startRecon.error.message}</div>}
        </section>

        <section className="recon-panel rounded-2xl border border-white/10 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70"><Terminal className="h-4 w-4" /> Toolchain</div><h2 className="text-xl font-semibold text-white">Recon providers</h2></div><button type="button" onClick={() => toolsQuery.refetch()} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-cyan-300/40 hover:text-cyan-200" aria-label="Refresh tool status"><RefreshCw className={`h-4 w-4 ${toolsQuery.isFetching ? "animate-spin" : ""}`} /></button></div><div className="space-y-3">{toolsQuery.data?.map(tool => <div key={tool.name} className={`rounded-xl border p-3 ${toolAccent[tool.name] ?? "border-white/10"}`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{tool.label}</p><p className="mt-1 text-[11px] text-slate-400">{tool.purpose}</p></div><span className={`flex items-center gap-1.5 text-[11px] font-semibold ${tool.installed ? "text-emerald-300" : "text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${tool.installed ? "bg-emerald-300" : "bg-slate-600"}`} />{tool.installed ? "Ready" : "Unavailable"}</span></div>{tool.version && <p className="mt-2 truncate font-mono text-[10px] text-slate-500">{tool.version}</p>}</div>)}</div><p className="mt-4 text-[11px] leading-5 text-slate-500">The runtime only invokes an explicit tool allowlist with shell execution disabled, capped output, timeouts, and rate limits.</p></section>
      </div>

      <section className="recon-panel rounded-2xl border border-white/10 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><Clock3 className="h-4 w-4" /> Run history</div><h2 className="text-xl font-semibold text-white">Recent operations</h2></div><span className="text-xs text-slate-500">{historyQuery.data?.length ?? 0} stored runs</span></div>{historyQuery.data?.length ? <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{historyQuery.data.map(scan => <button type="button" key={scan.id} onClick={() => { setSelectedScanId(scan.id); setResultData(undefined); }} className={`group rounded-xl border p-4 text-left transition ${selectedScanId === scan.id ? "border-cyan-300/50 bg-cyan-300/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm text-white">{scan.target}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">{scan.mode} · {formatDate(scan.createdAt)}</p></div><ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-200" /></div><div className="mt-3 flex items-center justify-between text-xs"><span className={`rounded-full border px-2 py-1 ${scan.status === "completed" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : scan.status === "failed" ? "border-rose-300/20 bg-rose-300/10 text-rose-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{scan.status}</span><span className="text-slate-500">{scan.findingsCount} findings</span></div></button>)}</div> : <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">No Recon runs yet. Start with a public, authorized domain.</div>}</section>

      {activeTarget && <section className="recon-panel rounded-2xl border border-white/10 p-5 sm:p-6"><div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70"><Server className="h-4 w-4" /> Operation output</div><h2 className="font-mono text-xl font-semibold text-white">{activeTarget}</h2><p className="mt-1 text-xs text-slate-500">{resultData?.mode ?? selectedDetails?.scan.mode} · {activeStatus} · {formatDate(activeTimestamp)}</p></div><div className="flex items-center gap-2"><select value={findingFilter} onChange={event => setFindingFilter(event.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200 outline-none"><option value="all">All findings</option><option value="subdomain">Subdomains</option><option value="dns">DNS</option><option value="http">HTTP services</option></select>{activeReport && <button type="button" onClick={() => downloadReport(activeReport, activeTarget)} className="recon-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-100"><Download className="h-4 w-4" /> Export report</button>}</div></div><div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="recon-stat"><span>Findings</span><strong>{activeFindings.length}</strong></div><div className="recon-stat"><span>Subdomains</span><strong>{activeFindings.filter(finding => finding.type === "subdomain").length}</strong></div><div className="recon-stat"><span>DNS assets</span><strong>{activeFindings.filter(finding => finding.type === "dns").length}</strong></div><div className="recon-stat"><span>HTTP assets</span><strong>{activeFindings.filter(finding => finding.type === "http").length}</strong></div></div><div className="mt-5 overflow-x-auto rounded-xl border border-white/10"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Asset</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Details</th></tr></thead><tbody>{filteredFindings.map((finding, index) => <tr key={`${finding.type}-${finding.asset}-${index}`} className="border-t border-white/5 text-slate-300"><td className="px-4 py-3 font-mono text-xs text-cyan-200">{finding.type}</td><td className="px-4 py-3 font-mono text-xs text-white">{finding.asset}</td><td className="px-4 py-3 text-xs text-slate-400">{finding.source}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[10px] uppercase ${severityClass[finding.severity]}`}>{finding.severity}</span></td><td className="max-w-[360px] px-4 py-3 text-xs text-slate-400">{[finding.url, finding.ip, finding.statusCode && `HTTP ${finding.statusCode}`, finding.title, (Array.isArray(finding.technologies) ? finding.technologies.join(", ") : finding.technologies), (Array.isArray(finding.records) ? finding.records.join(", ") : finding.records)].filter(Boolean).join(" · ") || "—"}</td></tr>)}</tbody></table>{!filteredFindings.length && <div className="px-5 py-10 text-center text-sm text-slate-500">No findings in this filter.</div>}</div>{activeReport && <details className="mt-5 rounded-xl border border-white/10 bg-black/20"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-300">View generated Markdown report</summary><pre className="max-h-96 overflow-auto border-t border-white/10 p-4 text-xs leading-5 text-slate-400">{activeReport}</pre></details>}</section>}
    </div>
  );
}
