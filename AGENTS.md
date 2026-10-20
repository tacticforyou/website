# Agent instructions

## Command transparency

- Recap only commands or tool actions that write, delete, or change files, data, configuration, application settings, or external state.
- Do not recap read-only commands such as searches, file reads, inspections, or status checks. If no modifying actions ran, omit the command recap entirely.
- Use one short bullet per meaningful change: `command or tool` — what changed; result. Include the actual command when short; for long scripts or patches, name the tool and affected files instead of reproducing the script or patch. Redact secrets.
- Do not include exhaustive command logs or expandable command-recap sections.
- Apply this preference across projects and future chats.

## Documentation and project conventions

- Inspect `package.json`, framework configuration, and existing components before making changes. This project uses the Next.js App Router, TypeScript, and Tailwind CSS v4.
- Read the relevant installed Next.js guides in `node_modules/next/dist/docs/` before writing code. These version-matched docs take precedence when online documentation differs.
- Use official [Next.js documentation](https://nextjs.org/docs/app) and [Tailwind documentation](https://tailwindcss.com/docs) for additional guidance. Check that APIs and syntax apply to the installed versions; do not upgrade dependencies just to match a guide.
- Follow the `tailwind-v4` skill when available for styling work. The rules below apply even when the skill is unavailable.

## Tailwind CSS rules

- Use utilities for ordinary layout, spacing, typography, colors, and interaction states. Reuse existing design tokens and components before adding new abstractions.
- Keep the v4 `@import "tailwindcss"` entrypoint and existing Turbopack integration. Avoid introducing v3 `@tailwind` directives or JavaScript configuration recipes without a demonstrated need.
- Define utility-generating tokens in top-level `@theme`; use `@theme inline` for references to other variables, including `next/font` variables. Use ordinary CSS variables for values that do not need utilities. See [theme variables](https://tailwindcss.com/docs/theme).
- Write complete, statically detectable class names. Map variants to literal class strings rather than constructing names such as `bg-${color}-500`. See [source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).
- Use base styles for element defaults and the components layer for reusable patterns that utilities can override. Use `@utility` for custom utilities; reserve `@apply` for cases where composing utilities in CSS improves clarity. Separately processed stylesheets using Tailwind-aware directives should use `@reference` rather than duplicate the Tailwind import. See [custom styles](https://tailwindcss.com/docs/adding-custom-styles) and [directives](https://tailwindcss.com/docs/functions-and-directives).
- Keep the theme/base/components/utilities layer order. Avoid conflicting utilities, broad `!important`, and unlayered rules that unexpectedly override utilities.
- Build responsive layouts mobile-first and preserve established breakpoints, dark-mode behavior, focus visibility, and reduced-motion support. See [responsive design](https://tailwindcss.com/docs/responsive-design).
- Extract shared React components when markup and behavior recur; do not create abstractions solely to shorten class lists. Plain CSS is appropriate for complex selectors and bespoke visual effects.

## Next.js best practices

- Keep pages and layouts as Server Components by default. Add `"use client"` at the smallest practical boundary for state, event handlers, effects, or browser APIs; pass serializable props across that boundary. See [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).
- Fetch server-owned data close to its source in Server Components or server modules. Keep secrets and privileged logic on the server, and mark server-only modules with `import 'server-only'` where appropriate.
- Follow App Router file conventions for layouts, pages, loading, error, and not-found UI. Provide useful loading and failure states for asynchronous routes.
- Check the installed API signatures for request APIs and route props; await asynchronous APIs such as `cookies()`, `headers()`, `params`, and `searchParams` where required.
- This project enables `cacheComponents` and `partialPrefetching`. Read the installed caching and rendering guides before changing data access or route behavior. Choose caching and invalidation deliberately; do not assume legacy fetch defaults or apply unsupported route-segment settings.
- Validate input and enforce authentication and authorization inside Server Actions and Route Handlers. Treat them as externally callable endpoints, and never place request-specific or private data in a shared cache without checking the documented isolation rules.
- Prefer `next/link` for internal navigation, `next/image` for suitable images, `next/font` for fonts, and the Metadata API for page metadata. Supply meaningful image alt text and correct sizing.
- Preserve semantic HTML, accessible form labels, keyboard interaction, and stable server/client rendering. Avoid suppressing hydration errors instead of fixing their cause.
- Use the official [production checklist](https://nextjs.org/docs/app/guides/production-checklist) when reviewing performance, accessibility, and deployment readiness.

## React Three Fiber best practices

### Documentation and compatibility

- Before adding or changing 3D code, read the official [React Three Fiber documentation](https://r3f.docs.pmnd.rs/getting-started/introduction), [installation guide](https://r3f.docs.pmnd.rs/getting-started/installation), and relevant API pages. Check installed versions and peer dependencies for React, `three`, `@react-three/fiber`, and optional `@react-three/drei`; Fiber v9 pairs with React 19. These packages are installed for the hero scene; use the existing versions and helpers before adding alternatives.
- Consult the [Three.js documentation](https://threejs.org/docs/) for underlying objects, materials, lights, cameras, and renderer APIs. Verify optional Drei helpers against their own documentation and installed version.

### Components and Next.js integration

- Isolate `Canvas`, scene hooks, and browser interactions in a focused Client Component; keep surrounding layouts and content server-rendered. If a dependency requires disabling SSR, use `next/dynamic` with `ssr: false` from a Client Component and check the installed Next.js lazy-loading guide first.
- Give the canvas container explicit dimensions. Provide loading, asset-error, and unsupported-renderer fallbacks, plus accessible DOM content and controls for essential information. See the [Canvas API](https://r3f.docs.pmnd.rs/api/canvas).
- Call `useFrame`, `useThree`, and other Fiber context hooks only in components rendered inside `Canvas`. Use `useThree` selectors for the state actually needed; nested Three.js object mutations are not reactive. See [hooks](https://r3f.docs.pmnd.rs/api/hooks).
- Describe scene structure declaratively with meshes, geometry/material children, tuple props, and constructor `args`. Avoid creating new Three.js objects in JSX on each render. Use typed refs and the installed Fiber TypeScript types instead of `any`. See [objects and properties](https://r3f.docs.pmnd.rs/api/objects).

### Animation, assets, and performance

- Use `useFrame` and refs for transient animation; scale movement by `delta` and use frame-rate-independent damping. Keep React state for discrete UI changes; avoid `setState` or reactive store updates every frame or pointer move. Reuse scratch vectors and other objects instead of allocating in the frame loop. See [performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls).
- Load reusable assets with `useLoader` or compatible Drei helpers such as `useGLTF`, with appropriate Suspense boundaries. Loaded assets are cached by URL: avoid mutating or disposing shared resources while consumers still use them, and clone object hierarchies when separate instances are required.
- Understand resource ownership and cleanup. Fiber normally disposes declaratively managed objects on unmount; objects passed through `primitive` need explicit ownership handling. Clean up manually owned GPU resources, listeners, and timers; use `dispose={null}` only when shared-resource lifetime is deliberately managed. See [objects and disposal](https://r3f.docs.pmnd.rs/api/objects).
- Reuse geometries/materials and instance repeated meshes where useful. Avoid unnecessary remounts, and measure draw calls, resolution, shadows, and postprocessing costs on target devices. See [scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
- For scenes that become idle, consider `frameloop="demand"`; call `invalidate()` after imperative changes and while animations need frames. Use continuous rendering when the scene requires it, and respect reduced-motion preferences.
- Validate 3D changes in the browser: check sizing, camera controls, pointer/keyboard interactions, loading and failure states, console errors, and performance on mobile and desktop. Lint/build success alone does not verify a scene.

## Validation

- For application code changes, run the repository's `npm run lint` and `npm run build` scripts, plus focused checks appropriate to the change. Report failures and any checks you could not run.
- For styling changes, inspect affected pages at mobile and desktop sizes and relevant interaction states; a passing build does not verify visual correctness.
- For documentation-only changes, review the diff and run `git diff --check`; a full application build is unnecessary.
- Preserve unrelated local changes and keep the generated Next.js notice below intact.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
