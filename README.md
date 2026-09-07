# ⚡ AlgoLearn — Interactive Algorithm Learning & Visualizer Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-algolearn--q73y.onrender.com-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://algolearn-q73y.onrender.com/)
[![GitHub stars](https://img.shields.io/github/stars/shivam603/AlgoLearn?style=for-the-badge&color=gold)](https://github.com/shivam603/AlgoLearn)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 🌐 **Experience the Live App Now**: **[https://algolearn-q73y.onrender.com/](https://algolearn-q73y.onrender.com/)**

A comprehensive, modern full-stack web application designed for mastering Data Structures and Algorithms through multi-sensory interactive visualizations, audio synthesis, AI voice narration, step-by-step dry-run animations, Big-O complexity analysis, and competitive duel benchmarking.

---

## 🎨 Design & Multi-Theme Engine
- **Themes Supported**:
  - ☀️ **Sky Light**: Clean white card surfaces (`#ffffff`), subtle sky background canvases (`#f0f9ff`), vibrant blue accents (`#0ea5e9`, `#0284c7`), and slate typography.
  - 🌙 **Midnight Dark (OLED)**: Deep space navy background (`#0b1120`), card surfaces (`#131d31`), and cyan accents.
  - 💻 **Cyberpunk Neon**: High-contrast matrix dark theme (`#05080c`) with glowing neon green and cyan accents.
- **Typography**: Clean hierarchy with *Plus Jakarta Sans* and *JetBrains Mono* for code blocks.
- **Glassmorphic Navigation**: Sticky blur navbar with instant search, live visitor counter, theme switcher, and slide panel trigger.

---

## 🚀 Key Visualizer Engines & Features

### 1. 📊 Sorting Visualizer (with Audio & Stepper)
- **Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort, Heap Sort.
- **5 Visualization Modes**: Vertical Bars (`📊`), Continuous Line Graph (`📈`), Scatter Coordinates (`✨`), Color Spectrum Heatmap (`🌈`), and Pins / Lollipop (`📍`).
- **🎵 Sound of Sorting**: Web Audio API tone synthesis mapped to element heights (120Hz – 900Hz).
- **⏪ Time-Travel Stepper**: Frame recorder with Play/Pause, Step Forward/Backward, and Timeline Scrubber slider.
- **💻 Live Code Synchronizer**: Real-time line highlighting across **Python**, **C++**, **Java**, and **JavaScript**.
- **🎛️ Distribution Presets**: Uniform Random, Nearly Sorted (90%), Reversed, Few Unique, and Sawtooth.

### 2. ⚔️ Algorithm Duel & Multi-Race Arena (`duel.html`)
- Split-screen race mode running 2 to 4 sorting algorithms concurrently on identical datasets.
- Real-time leaderboard tracking finish rank (🥇 🥈 🥉), duration (ms), comparisons, swaps/writes, and efficiency ratings.

### 3. 🗺️ Pathfinding & Maze Generator (`visualize-pathfinding.html`)
- Interactive 2D grid canvas with draggable **Start 🟢** and **Target 🎯** markers.
- Draw custom walls and obstacle maps with click & drag.
- **Algorithms**: **A\* Search** (with Manhattan heuristic), **Dijkstra's Shortest Path**, **Breadth-First Search (BFS)**, and **Depth-First Search (DFS)**.
- **Automated Maze Generators**: **Recursive Division Maze** and **Randomized Scatter Walls**.

### 4. 🌳 BST & AVL Tree Visualizer (`visualize-tree.html`)
- Dynamic vector SVG tree layout with automatic branch positioning.
- Node Insertion, Deletion, and Searching with traversal highlights.
- **Balanced AVL Mode**: Automatic animated balancing rotations (**LL**, **RR**, **LR**, **RL**).
- Animated Traversals: **In-Order**, **Pre-Order**, **Post-Order**, and **Level-Order (BFS)**.

### 5. 📊 Dynamic Programming Grid (`visualize-dp.html`)
- 2D memoization grids for **0/1 Knapsack** (with optimal items backtrack path), **Longest Common Subsequence (LCS)**, and **Fibonacci recursion trees**.

### 6. 👑 Backtracking & Recursion Suite (`visualize-backtracking.html`)
- **N-Queens Problem**: Interactive $N \times N$ chessboard ($N=4$ to $N=8$) with threat rays and recursive backtracking.
- **Tower of Hanoi**: Animated disk transfers between pegs A, B, and C with live recursion call stack depth tracker.

### 7. 🔗 Linear Data Structures Sandbox (`visualize-ds.html`)
- **Singly & Doubly Linked Lists**: Node insertion (Head, Tail, Position), deletion, search, and pointer re-linking animations.
- **Stack (LIFO) & Queue (FIFO)**: Interactive Push/Pop and Enqueue/Dequeue with visual boundary animations.
- **Hash Table with Chaining**: $H(key) = key \pmod 7$ bucket mapping with linked collision resolution.

### 8. 🧠 Gamified "Guess the Next Step" Challenge (`challenge.html`)
- Algorithms pause at checkpoints and quiz you on the next operation with score tracking, streak multipliers (`🔥 x3 Streak!`), and detailed explanations.

### 9. 🗣️ AI Voiceover Narrator (`voice-narrator.js`)
- Real-time spoken commentary as algorithms execute using the browser Web Speech API.

### 10. 🎛️ Unified Slide Panel Drawer
- Accessible from every page via the **"⚡ All Functions"** button or `[` keyboard shortcut with quick search and filter.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism), Vanilla JavaScript (ES6+), Bootstrap 5.3, Web Audio API, Web Speech API, SVG Graphics.
- **Backend**: Node.js & Express.js
- **Database / Storage**: MongoDB with automatic graceful in-memory fallback for local development.

---

## 🧩 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivam603/AlgoLearn.git
   cd AlgoLearn
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the application**
   ```bash
   node server.js
   ```

4. **Open in Browser**
   Visit `http://localhost:3000` or open `frontend/index.html` directly in any web browser.

---

## 👥 Team ANT-X (Authors & Contributors)

- **Shivam** (Full-Stack Development & Architecture) — [GitHub](https://github.com/shivam603) | [LinkedIn](https://www.linkedin.com/in/shivam-ray-a38b73326/)
- **Siddharth** (Algorithm Visualizers & Frontend Design) — [GitHub](https://github.com/siddharth0348-gif) | [LinkedIn](https://www.linkedin.com/in/siddharth-pandey-b64721306/)
- **Amrit** (Database Integration & Logic Verification) — [GitHub](https://github.com/AmritRai07) | [LinkedIn](https://www.linkedin.com/in/amrit-kumar-rai-048120325/)

---

## 📄 License
MIT License. Built for interactive algorithm learning and visualization.
