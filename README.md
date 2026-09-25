# Algorithm Lab

An interactive, local-first learning tool for understanding algorithms through visual execution. Explore sorting and array searching with pseudocode, state, metrics, and replayable step-by-step execution.

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
```

To serve the production build locally, run `npm run build` followed by `npm run preview`.

## Using the app

- Choose Sorting or Searching in the top navigation, then select an algorithm in the sidebar. The remaining categories are marked Soon.
- Generate random, nearly sorted, reversed, or few-unique data. Sorting accepts comma-separated values; Searching also accepts a finite numeric target and explicit values. Sorted-only search algorithms offer a **Sort a copy** action.
- Play, pause, step backward or forward, seek through the timeline, adjust playback speed, reset, or jump to the end.
- Follow the current operation, algorithm variables, pseudocode, operation metrics, and complexity details in the learning inspector.
- Switch between dark and light themes. Theme, speed, array size, category, and each category's selected algorithm are saved in browser local storage.

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
- `src/features/sorting/` composes sorting input controls, a simulation-state-only visualizer, and synchronized learning panels. `src/features/searching/` owns the distinct search input and workspace.
- `src/domain/playback/` defines pure playback transitions and the generic timeline interface; `src/features/playback/` owns the timer and keyboard adapter.
- `src/styles/` separates shell, controls, visualization, learning, recovery, and responsive styles. Theme and algorithm colors use shared tokens in `src/styles/theme.css`.
- `src/components/` contains shared UI and workspace recovery components.

Algorithm definitions emit semantic events into a deterministic execution history. The playback hook derives any timeline position from that history, so stepping backward and seeking do not rerun the algorithm. UI components render simulation state without owning algorithm logic or timers.

## Current sorting catalog

The app includes Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix, Cocktail Shaker, Comb, Gnome, Odd–Even, Cycle, Pancake, Binary Insertion, Bottom-up Merge, Bucket, TimSort, and Introsort.

Bucket Sort accepts finite numeric values and uses a bounded set of buckets. Counting Sort requires safe integers with a bounded distinct-value range. Radix Sort requires safe integers, including negative values. Each definition provides its own validation and learning metadata.

The Searching category includes Linear, Binary, Jump, Exponential, Interpolation, and Fibonacci Search. Linear Search accepts unsorted data; the other five require ascending input. Searches use zero-based indices, accept a finite numeric target, and return any matching index when duplicates exist. Production build and lint pass; manual browser checks have been completed by the user.

## Extension boundaries

Add a sorting definition with its executor, short description, display order, and educational metadata, then register it in `domain/algorithms/sorting/index.ts`. Sidebar and learning views consume metadata without importing individual algorithms.

Each category supplies a `Timeline<TState>` (`totalSteps`, `getState`) and its own renderer. The generic playback controller does not import category state or snapshot storage. Key each workspace by execution identity to start a fresh playback session when input or algorithm changes.

Playback time measures elapsed wall-clock time while playing. Pause, seek, and manual stepping do not add idle time; restarting or replaying clears it. It is distinct from execution step and operation counts.

## Changing the primary color

Edit `--brand-color` in `src/styles/theme.css` (currently `#684fff`). Button gradients, links, logo, selection backgrounds, navigation highlights, timeline accents, focus rings, and glow effects derive from this one value in both themes. Light-mode overrides adjust contrast rather than defining a separate brand color.

The `--primary-*` and `--accent-*` variables can be adjusted for finer control. Neutral surfaces and semantic algorithm/status colors are independent. Check text contrast when choosing a substantially lighter brand color.
