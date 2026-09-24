# Algorithm Lab

An interactive, local-first learning tool for understanding algorithms through visual execution. Version 1 focuses on sorting: watch operations, inspect pseudocode and variables, and replay execution step by step.

## Getting started

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL after the development server starts. To check the production build and lint the project:

```sh
npm run build
npm run lint
npm run check:domain
```

To serve the production build locally, run `npm run build` followed by `npm run preview`.

## Using the app

- Choose one of the ten sorting algorithms from the left sidebar. The top navigation shows the future algorithm categories; Sorting is the V1 category.
- Generate random, nearly sorted, reversed, or few-unique data, or enter comma-separated values.
- Play, pause, step backward or forward, seek through the timeline, adjust playback speed, reset, or jump to the end.
- Follow the current operation, algorithm variables, pseudocode, operation metrics, and complexity details in the learning inspector.
- Switch between dark and light themes. Theme, speed, array size, and the selected algorithm are saved in browser local storage.

Counting Sort accepts safe integers with a bounded distinct-value range. Radix Sort accepts safe integers, including negative values. Input validation displays algorithm-specific constraints before execution.

## Architecture

The app keeps algorithm execution independent from React presentation:

```text
Algorithm definitions and registry
              ↓
       Semantic events
              ↓
 Reducer and execution history
              ↓
 Playback controller and React views
```

- `src/domain/algorithms/` contains shared contracts, the sorting registry, algorithm definitions, input creation, and input validation.
- `src/domain/simulation/` contains the pure event reducer, execution sessions, snapshots, and derived metrics.
- `src/domain/preferences/` defines preference validation and a persistence interface; `src/infrastructure/` implements browser storage.
- `src/features/sorting/` composes input controls, a simulation-state-only visualizer, and synchronized learning panels.
- `src/domain/playback/` defines pure playback transitions and the generic timeline interface; `src/features/playback/` owns the timer and keyboard adapter.
- `src/styles/` separates shell, controls, visualization, learning, recovery, and responsive styles. Theme and algorithm colors use shared tokens in `src/styles/theme.css`.
- `src/components/` contains shared UI and workspace recovery components.

Algorithm definitions emit semantic events into a deterministic execution history. The playback hook derives any timeline position from that history, so stepping backward and seeking do not rerun the algorithm. UI components render simulation state without owning algorithm logic or timers.

## V1 scope

Included: Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix, and Cocktail Shaker Sort; generated and manual inputs; deterministic timeline playback; dark/light themes; responsive layout; local preferences; and workspace error recovery.

Searching, graphs, trees, pathfinding, recursion, dynamic programming, accounts, cloud sync, and algorithm races are future scope. V1 does not require a comprehensive test suite. The targeted `check:domain` regression script checks 80 sorting runs, deterministic histories, validation failures, playback transitions and elapsed time, and preference validation. Build and lint are separate checks. Browser interaction and visual verification remain pending.

## Extension boundaries

Add a sorting definition with its executor, short description, display order, and educational metadata, then register it in `domain/algorithms/sorting/index.ts`. Sidebar and learning views consume metadata without importing individual algorithms.

A future category supplies a `Timeline<TState>` (`totalSteps`, `getState`) and its own renderer. The generic playback controller does not import sorting state or snapshot storage. Key each workspace by execution identity to start a fresh playback session when input or algorithm changes.

Playback time measures elapsed wall-clock time while playing. Pause, seek, and manual stepping do not add idle time; restarting or replaying clears it. It is distinct from execution step and operation counts.

## Changing the primary color

Edit `--brand-color` in `src/styles/theme.css` (currently `#684fff`). Button gradients, links, logo, selection backgrounds, navigation highlights, timeline accents, focus rings, and glow effects derive from this one value in both themes. Light-mode overrides adjust contrast rather than defining a separate brand color.

The `--primary-*` and `--accent-*` variables can be adjusted for finer control. Neutral surfaces and semantic algorithm/status colors are independent. Check text contrast when choosing a substantially lighter brand color.
