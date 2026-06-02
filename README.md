# Peta Keluarga Politik Indonesia

An interactive visualization tool mapping the intricate network of political families and dynasties in Indonesia.

---

## 🏛️ For Political Researchers & Enthusiasts (Non-Tech)

**What is this?**
In Indonesia, political influence often flows through family lineages. This project provides a visual map of those connections—showing how power is distributed through marriages, parent-child relationships, and familial clusters.

**Key Features:**
- **Dynamic Family Clusters:** See prominent families (e.g., Keluarga Hatta, Keluarga Prayitno) as distinct, color-coded groups.
- **Interactive Exploration:** Double-click on a family "bubble" to expand and see every individual member and their specific connections.
- **Searchable Database:** Quickly find specific political figures and see their position within the broader network.
- **Visual Statistics:** Real-time data on the total number of individuals, connections, and the breakdown of relationship types (Father, Mother, Spouse, Child).

**Why it matters:**
This tool aims to provide transparency and a better understanding of political sociology in Indonesia by making complex relational data easy to see and navigate.

---

## 💻 For Developers & Data Scientists (Tech)

**The Stack:**
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) with React 19.
- **Visualization:** [vis-network](https://github.com/visjs/vis-network) for canvas-based graph rendering.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with a Radix UI primitive foundation.
- **Language:** TypeScript for strict data modeling of family relations.
- **Deployment:** Static Site Generation (SSG) hosted on GitHub Pages.

**Architecture Highlights:**
- **Custom Clustering:** Uses a connected-components algorithm in `lib/network-utils.ts` to automatically group nodes into families based on their relationships.
- **Performance Optimized:** Uses a "Physics-Free" grid layout for clusters to handle high node density without the layout "exploding" or lagging.
- **Defensive Rendering:** Implements guarded canvas interactions (documented in ADR 0008) to ensure stability during rapid re-initialization and React state updates.

### Getting Started

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run Development Server:**
   ```bash
   pnpm dev
   ```

3. **Build Static Export:**
   ```bash
   pnpm build
   ```
   *Note: Output will be in the `/out` directory.*

---

## 📜 Architectural Decisions (ADRs)
This project maintains a detailed history of "Why" decisions were made. Refer to the `docs/adr/` folder for records on:
- Data modeling strategies.
- Runtime stability fixes.
- Project restructuring pivots.

---

## ⚖️ License & Data
The data used in this project is based on public records and open-source genealogical research.
