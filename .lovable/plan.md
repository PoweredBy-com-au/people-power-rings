The current source files are correct: `src/routes/` only contains `__root.tsx` and `index.tsx`, and `src/routeTree.gen.ts` only imports those two routes. The remaining `/src/routes/dashboard.tsx` error is coming from the dev server’s stale module/HMR cache, not from an existing source import.

Plan:

1. Restart the Vite dev server again to force it to drop the stale route module graph.
2. If the preview still serves the old graph, clear Vite/TanStack generated caches that can retain deleted route modules, then restart the dev server.
3. Re-check the latest dev-server logs for any remaining `dashboard.tsx`, `person.$studentId.tsx`, or `risks.$tier.tsx` references.
4. Validate `/` loads without a blank screen and without the stale missing-route error.

Technical details:

- I will not edit `src/routeTree.gen.ts`; it is generated and already has the correct contents.
- The likely stale state is in Vite’s module runner cache after route files were deleted during HMR.
- If needed, the safe cache cleanup targets are local/generated dev caches such as `node_modules/.vite` and TanStack router/start caches, not app source files.