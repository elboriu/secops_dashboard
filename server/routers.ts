import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createReconFindings, createReconScan, getReconScanById, listReconFindings, listReconScans, serializeReconFinding, updateReconScan } from "./db";
import { getReconToolStatus, runReconPipeline } from "./reconRunner";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  recon: router({
    tools: protectedProcedure.query(() => getReconToolStatus()),
    history: protectedProcedure.query(({ ctx }) => listReconScans(ctx.user.id)),
    details: protectedProcedure
      .input(z.object({ scanId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const scan = await getReconScanById(input.scanId, ctx.user.id);
        if (!scan) return null;
        const findings = await listReconFindings(scan.id);
        return { scan, findings };
      }),
    start: protectedProcedure
      .input(z.object({
        target: z.string().min(1).max(253),
        mode: z.enum(["passive", "active"]),
        confirmAuthorization: z.literal(true),
        allowPrivate: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const scanId = await createReconScan({
          ownerId: ctx.user.id,
          target: input.target.trim().toLowerCase(),
          mode: input.mode,
          status: "queued",
          findingsCount: 0,
        });
        await updateReconScan(scanId, { status: "running", startedAt: new Date() });

        try {
          const result = await runReconPipeline(input.target, input.mode, input.allowPrivate);
          await createReconFindings(result.findings.map(finding => serializeReconFinding(finding, scanId)));
          await updateReconScan(scanId, {
            status: "completed",
            target: result.target,
            findingsCount: result.findings.length,
            reportMarkdown: result.reportMarkdown,
            warnings: JSON.stringify(result.warnings),
            completedAt: new Date(),
          });
          return { scanId, ...result };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Recon failed unexpectedly.";
          await updateReconScan(scanId, { status: "failed", errorMessage: message, completedAt: new Date() });
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
