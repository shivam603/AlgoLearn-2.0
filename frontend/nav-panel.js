/**
 * AlgoLearn — Unified Slide Panel & Dynamic Interaction System
 * - Global Slide-out Drawer with 12 algorithm guides, visualizers & tools.
 * - Dynamic Click Wave & Ripple Micro-Interaction Engine across all elements.
 */

(function () {
    const algorithmsList = [
        { key: 'bubble', name: 'Bubble Sort', category: 'Sorting', time: 'O(n²)', space: 'O(1)', icon: 'bi-filter' },
        { key: 'selection', name: 'Selection Sort', category: 'Sorting', time: 'O(n²)', space: 'O(1)', icon: 'bi-check2-square' },
        { key: 'insertion', name: 'Insertion Sort', category: 'Sorting', time: 'O(n²)', space: 'O(1)', icon: 'bi-box-arrow-in-right' },
        { key: 'quick', name: 'Quick Sort', category: 'Sorting', time: 'O(n log n)', space: 'O(log n)', icon: 'bi-lightning-charge-fill' },
        { key: 'merge', name: 'Merge Sort', category: 'Sorting', time: 'O(n log n)', space: 'O(n)', icon: 'bi-bezier2' },
        { key: 'heap', name: 'Heap Sort', category: 'Sorting', time: 'O(n log n)', space: 'O(1)', icon: 'bi-diagram-3-fill' },
        { key: 'linear', name: 'Linear Search', category: 'Searching', time: 'O(n)', space: 'O(1)', icon: 'bi-search' },
        { key: 'binary', name: 'Binary Search', category: 'Searching', time: 'O(log n)', space: 'O(1)', icon: 'bi-bullseye' },
        { key: 'bfs', name: 'Breadth-First Search (BFS)', category: 'Graphs', time: 'O(V+E)', space: 'O(V)', icon: 'bi-water' },
        { key: 'dfs', name: 'Depth-First Search (DFS)', category: 'Graphs', time: 'O(V+E)', space: 'O(V)', icon: 'bi-signpost-split-fill' },
        { key: 'kruskal', name: "Kruskal's MST", category: 'Graphs', time: 'O(E log E)', space: 'O(E)', icon: 'bi-share-fill' },
        { key: 'dijkstra', name: "Dijkstra's Shortest Path", category: 'Graphs', time: 'O(E+V log V)', space: 'O(V)', icon: 'bi-geo-alt-fill' }
    ];

    // ==========================================
    // Dynamic Click Ripple & Feedback Engine
    // ==========================================
    function initDynamicClickEffects() {
        document.addEventListener('pointerdown', function (e) {
            const target = e.target.closest('button, .btn, a, .category-card, .team-card, .card-custom, .badge-sky, .drawer-feature-btn, .drawer-list-item, .floating-panel-toggle, .bar-wrapper');
            if (!target) return;

            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'click-ripple';

            const size = Math.max(rect.width, rect.height, 60);
            ripple.style.width = ripple.style.height = `${size}px`;

            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            if (getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            target.classList.add('has-ripple');
            target.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // ==========================================
    // Slide Panel Component
    // ==========================================
    function createSlidePanel() {
        // Create Overlay
        const overlay = document.createElement('div');
        overlay.id = 'algolearn-drawer-overlay';
        overlay.className = 'algolearn-drawer-overlay';

        // Create Panel
        const panel = document.createElement('aside');
        panel.id = 'algolearn-slide-panel';
        panel.className = 'algolearn-slide-panel';
        panel.setAttribute('aria-label', 'AlgoLearn Functions Drawer');

        panel.innerHTML = `
            <div class="drawer-header">
                <a href="index.html" class="d-flex align-items-center gap-2 text-decoration-none">
                    <span class="navbar-brand-icon" style="width:32px; height:32px; font-size:1rem;">
                        <i class="bi bi-cpu-fill"></i>
                    </span>
                    <span class="fw-bold text-sky-900" style="font-size:1.15rem;">AlgoLearn</span>
                </a>
                <button type="button" class="drawer-close-btn" id="drawer-close-btn" aria-label="Close Left Panel">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="drawer-search-bar">
                <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white border-end-0 text-muted">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" id="drawer-filter-input" class="form-control border-start-0" placeholder="Filter pages, functions & algorithms..." />
                </div>
            </div>

            <div class="drawer-body" id="drawer-body">
                <!-- 1. Quick Navigation Suite -->
                <div class="drawer-section" data-section="navigation">
                    <div class="drawer-section-title">
                        <i class="bi bi-compass-fill text-sky-600"></i> Main Navigation
                    </div>
                    <div class="drawer-list">
                        <a href="index.html" class="drawer-list-item" data-search="home landing page">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-house-door-fill"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Home</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted-custom small"></i>
                        </a>
                        <a href="welcome.html" class="drawer-list-item" data-search="welcome onboarding guide about tour">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-stars text-info"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Welcome Guide</span>
                            </div>
                            <span class="badge bg-info text-dark fw-bold">Studio</span>
                        </a>
                        <a href="codelab.html" class="drawer-list-item" data-search="codelab live code editor debugger studio monaco execution tracing ide">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-code-slash text-sky-600"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">CodeLab (Live IDE & Debugger)</span>
                            </div>
                            <span class="badge bg-success text-white fw-bold">NEW</span>
                        </a>
                        <a href="duel.html" class="drawer-list-item" data-search="duel race head to head arena multi algorithm comparison">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-fire text-warning"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Algorithm Duel / Race</span>
                            </div>
                            <span class="badge bg-warning text-dark fw-bold">Multi-Race</span>
                        </a>
                        <a href="challenge.html" class="drawer-list-item" data-search="challenge guess next step gamified dsa quiz test">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-controller text-primary"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Guess Step Challenge</span>
                            </div>
                            <span class="badge bg-primary">Interactive</span>
                        </a>
                        <a href="visualize.html" class="drawer-list-item" data-search="visualizers engines interactive">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-play-circle-fill"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">All Visualizers</span>
                            </div>
                            <span class="badge-sky">5 Engines</span>
                        </a>
                        <a href="search.html" class="drawer-list-item" data-search="search algorithms lookup finder">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-search"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Search Algorithms</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted-custom small"></i>
                        </a>
                        <a href="practice.html" class="drawer-list-item" data-search="practice arena quiz problems questions">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-mortarboard-fill"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Practice Arena</span>
                            </div>
                            <span class="badge-sky">12 Quizzes</span>
                        </a>
                        <a href="index.html#concepts" class="drawer-list-item" data-search="all 12 topics curriculum concepts">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-grid-3x3-gap-fill"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">All 12 Topics</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted-custom small"></i>
                        </a>
                        <a href="index.html#complexity-matrix" class="drawer-list-item" data-search="complexity matrix big o time space comparison">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-table"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Complexity Matrix</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted-custom small"></i>
                        </a>
                        <a href="index.html#team" class="drawer-list-item" data-search="our team ant-x shivam siddharth amrit authors creators contributors">
                            <div class="d-flex align-items-center gap-2">
                                <span class="category-icon-box" style="width:28px; height:28px; font-size:0.85rem;"><i class="bi bi-people-fill"></i></span>
                                <span class="fw-bold" style="font-size:0.88rem;">Team ANT-X</span>
                            </div>
                            <span class="badge-sky">Creators</span>
                        </a>
                    </div>
                </div>

                <!-- 2. Interactive Visualizers -->
                <div class="drawer-section" data-section="visualizers">
                    <div class="drawer-section-title">
                        <i class="bi bi-bar-chart-line-fill text-sky-600"></i> Interactive Visualizers
                    </div>
                    <div class="drawer-item-grid">
                        <a href="visualize-sorting.html" class="drawer-feature-btn" data-search="sorting visualizer bubble quick merge heap insertion selection">
                            <span class="drawer-feature-icon"><i class="bi bi-bar-chart-steps"></i></span>
                            <span class="drawer-feature-label">Sorting Engine</span>
                            <span class="drawer-feature-desc">6 sorting algorithms with audio & step tracker</span>
                        </a>
                        <a href="duel.html" class="drawer-feature-btn" data-search="duel race multi sorting comparison">
                            <span class="drawer-feature-icon"><i class="bi bi-fire text-warning"></i></span>
                            <span class="drawer-feature-label">Duel & Race Arena</span>
                            <span class="drawer-feature-desc">4-racer simultaneous live leaderboard</span>
                        </a>
                        <a href="visualize-tree.html" class="drawer-feature-btn" data-search="tree bst avl binary search rotations balancing">
                            <span class="drawer-feature-icon"><i class="bi bi-diagram-3-fill"></i></span>
                            <span class="drawer-feature-label">BST & AVL Tree</span>
                            <span class="drawer-feature-desc">Dynamic vector SVG tree & auto-rotations</span>
                        </a>
                        <a href="visualize-dp.html" class="drawer-feature-btn" data-search="dynamic programming dp knapsack lcs fibonacci matrix grid">
                            <span class="drawer-feature-icon"><i class="bi bi-grid-3x3"></i></span>
                            <span class="drawer-feature-label">DP Grid Engine</span>
                            <span class="drawer-feature-desc">Knapsack, LCS & Fibonacci 2D tables</span>
                        </a>
                        <a href="visualize-pathfinding.html" class="drawer-feature-btn" data-search="pathfinding astar dijkstra bfs dfs maze grid 2d">
                            <span class="drawer-feature-icon"><i class="bi bi-compass-fill text-success"></i></span>
                            <span class="drawer-feature-label">Pathfinding & Mazes</span>
                            <span class="drawer-feature-desc">A*, Dijkstra, BFS with recursive division maze</span>
                        </a>
                        <a href="visualize-backtracking.html" class="drawer-feature-btn" data-search="backtracking nqueens queens hanoi tower recursion">
                            <span class="drawer-feature-icon"><i class="bi bi-arrow-return-left text-danger"></i></span>
                            <span class="drawer-feature-label">Backtracking Suite</span>
                            <span class="drawer-feature-desc">N-Queens chessboard & Tower of Hanoi pegs</span>
                        </a>
                        <a href="visualize-ds.html" class="drawer-feature-btn" data-search="data structures linked list stack queue hash table chaining memory">
                            <span class="drawer-feature-icon"><i class="bi bi-layers-fill text-primary"></i></span>
                            <span class="drawer-feature-label">Data Structures</span>
                            <span class="drawer-feature-desc">Linked lists, stack, queue & hash tables</span>
                        </a>
                        <a href="visualize-search.html" class="drawer-feature-btn" data-search="search visualizer linear binary target">
                            <span class="drawer-feature-icon"><i class="bi bi-search"></i></span>
                            <span class="drawer-feature-label">Search Engine</span>
                            <span class="drawer-feature-desc">Linear & Binary Search with target locator</span>
                        </a>
                        <a href="visualize-graph.html" class="drawer-feature-btn" data-search="graph visualizer bfs dfs breadth depth">
                            <span class="drawer-feature-icon"><i class="bi bi-share-fill"></i></span>
                            <span class="drawer-feature-label">Graph Engine</span>
                            <span class="drawer-feature-desc">BFS & DFS animated tree traversal</span>
                        </a>
                    </div>
                </div>

                <!-- 3. All 12 Algorithm Guides -->
                <div class="drawer-section" data-section="algorithms">
                    <div class="drawer-section-title">
                        <i class="bi bi-book-half text-sky-600"></i> 12 Algorithm Guides
                    </div>
                    <div class="drawer-list" id="drawer-algo-list">
                        ${algorithmsList.map(algo => `
                            <a href="algorithm-details.html?algo=${algo.key}" class="drawer-list-item" data-search="${algo.name.toLowerCase()} ${algo.category.toLowerCase()} ${algo.time.toLowerCase()}">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="category-icon-box" style="width:30px; height:30px; font-size:0.9rem;">
                                        <i class="bi ${algo.icon}"></i>
                                    </span>
                                    <div>
                                        <div class="fw-bold" style="font-size:0.88rem;">${algo.name}</div>
                                        <div class="text-muted-custom" style="font-size:0.75rem;">${algo.category}</div>
                                    </div>
                                </div>
                                <span class="badge-sky">${algo.time}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="drawer-footer">
                <a href="index.html" class="btn btn-sky-subtle btn-sm">
                    <i class="bi bi-house-door-fill"></i> Home
                </a>
                <span class="text-muted-custom small">Press <kbd class="bg-white border text-dark px-1 rounded">[</kbd> to toggle</span>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        // Add Floating Toggle Button on bottom right (skip on pages with dedicated toolbars like codelab)
        const isCodeLab = window.location.pathname.includes('codelab') || document.querySelector('.codelab-workspace');
        if (!document.getElementById('floating-panel-toggle') && !isCodeLab) {
            const floatBtn = document.createElement('button');
            floatBtn.id = 'floating-panel-toggle';
            floatBtn.className = 'floating-panel-toggle';
            floatBtn.innerHTML = `<i class="bi bi-layout-sidebar-inset"></i> <span>All Functions</span>`;
            floatBtn.title = 'Open Left Navigation Panel (Press [)';
            document.body.appendChild(floatBtn);
            floatBtn.addEventListener('click', openDrawer);
        }

        // Attach Event Listeners
        overlay.addEventListener('click', closeDrawer);
        const closeBtn = panel.querySelector('#drawer-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        // Auto close drawer when navigating to internal links
        panel.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeDrawer();
            });
        });

        // Search Filter inside Drawer
        const filterInput = panel.querySelector('#drawer-filter-input');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const items = panel.querySelectorAll('.drawer-list-item, .drawer-feature-btn');
                items.forEach(item => {
                    const text = (item.textContent || '').toLowerCase();
                    const searchAttr = (item.getAttribute('data-search') || '').toLowerCase();
                    if (!query || text.includes(query) || searchAttr.includes(query)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }

        // Global delegated click listener for any open button
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.btn-panel-trigger, .nav-sidebar-toggle-btn, .open-slide-panel-btn, #floating-panel-toggle, #open-panel-nav-btn');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                toggleDrawer();
            }
        });

        // Keyboard Shortcuts: '[' to toggle Left Panel, 'Ctrl+K' to focus search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const topSearch = document.querySelector('.top-nav-search-input');
                if (topSearch) {
                    topSearch.focus();
                    topSearch.select();
                } else {
                    openDrawer();
                }
            } else if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                toggleDrawer();
            } else if (e.key === 'Escape') {
                closeDrawer();
            }
        });
    }

    function openDrawer() {
        let overlay = document.getElementById('algolearn-drawer-overlay');
        let panel = document.getElementById('algolearn-slide-panel');
        if (!panel) {
            createSlidePanel();
            overlay = document.getElementById('algolearn-drawer-overlay');
            panel = document.getElementById('algolearn-slide-panel');
        }
        if (overlay && panel) {
            overlay.classList.add('active');
            panel.classList.add('open');
            document.body.style.overflow = 'hidden';
            const input = document.getElementById('drawer-filter-input');
            if (input) setTimeout(() => input.focus(), 200);
        }
    }

    function closeDrawer() {
        const overlay = document.getElementById('algolearn-drawer-overlay');
        const panel = document.getElementById('algolearn-slide-panel');
        if (overlay && panel) {
            overlay.classList.remove('active');
            panel.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function toggleDrawer() {
        const panel = document.getElementById('algolearn-slide-panel');
        if (panel && panel.classList.contains('open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    // ==========================================
    // Live Visitor Counter System
    // ==========================================
    async function initVisitorCounter() {
        let count = 1428;
        try {
            const res = await fetch('/api/visitors');
            if (res.ok) {
                const data = await res.json();
                if (data && typeof data.visitors === 'number') {
                    count = data.visitors;
                }
            } else {
                throw new Error('API offline');
            }
        } catch (e) {
            // Local fallback if accessed directly via file:// or without backend
            const stored = localStorage.getItem('algolearn_visitor_count');
            count = stored ? parseInt(stored, 10) + 1 : 1428;
            localStorage.setItem('algolearn_visitor_count', count);
        }

        // Animate counter
        const elements = document.querySelectorAll('.visitor-count-value');
        if (elements.length > 0) {
            const start = Math.max(0, count - 30);
            const duration = 1200;
            const startTime = performance.now();

            function updateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (count - start) * ease);
                const formatted = Number(current).toLocaleString('en-US');

                elements.forEach(el => {
                    el.textContent = formatted;
                });

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    const finalFormatted = Number(count).toLocaleString('en-US');
                    elements.forEach(el => {
                        el.textContent = finalFormatted;
                    });
                }
            }

            requestAnimationFrame(updateNumber);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createSlidePanel();
            initDynamicClickEffects();
            initVisitorCounter();
        });
    } else {
        createSlidePanel();
        initDynamicClickEffects();
        initVisitorCounter();
    }

    // Expose globally
    window.AlgoLearnDrawer = {
        open: openDrawer,
        close: closeDrawer,
        toggle: toggleDrawer,
        refreshVisitors: initVisitorCounter
    };
})();
