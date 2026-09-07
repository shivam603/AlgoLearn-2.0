/**
 * AlgoLearn Pathfinding & Maze Generator Engine
 * A*, Dijkstra, BFS, DFS with interactive grid, wall drawing, and recursive division mazes.
 */

const PathfindingVisualizer = {
    rows: 20,
    cols: 45,
    grid: [],
    startNode: { r: 9, c: 8 },
    targetNode: { r: 9, c: 36 },
    isMouseDown: false,
    draggedNode: null, // 'start' | 'target' | null
    isAnimating: false,

    init() {
        this.buildGrid();
        this.bindEvents();
    },

    bindEvents() {
        const runBtn = document.getElementById('btn-pf-run');
        const clearPathBtn = document.getElementById('btn-pf-clear-path');
        const clearAllBtn = document.getElementById('btn-pf-clear-all');

        if (runBtn) {
            runBtn.addEventListener('click', () => {
                if (this.isAnimating) return;
                this.visualizeAlgorithm();
            });
        }

        if (clearPathBtn) {
            clearPathBtn.addEventListener('click', () => {
                this.clearPath();
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearBoard();
            });
        }

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.draggedNode = null;
        });
    },

    buildGrid() {
        const container = document.getElementById('pf-grid-container');
        if (!container) return;

        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        container.innerHTML = '';
        this.grid = [];

        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                const node = {
                    r,
                    c,
                    isStart: r === this.startNode.r && c === this.startNode.c,
                    isTarget: r === this.targetNode.r && c === this.targetNode.c,
                    isWall: false,
                    distance: Infinity,
                    totalDistance: Infinity, // f = g + h
                    heuristicDistance: Infinity,
                    isVisited: false,
                    previousNode: null
                };

                const cell = document.createElement('div');
                cell.className = 'pf-node';
                cell.id = `node-${r}-${c}`;

                if (node.isStart) cell.classList.add('node-start');
                else if (node.isTarget) cell.classList.add('node-target');

                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (this.isAnimating) return;
                    this.isMouseDown = true;
                    if (node.isStart) {
                        this.draggedNode = 'start';
                    } else if (node.isTarget) {
                        this.draggedNode = 'target';
                    } else {
                        node.isWall = !node.isWall;
                        cell.classList.toggle('node-wall', node.isWall);
                        if (window.AlgoAudio && node.isWall) window.AlgoAudio.playTone(200, 0.03, 'square');
                    }
                });

                cell.addEventListener('mouseenter', () => {
                    if (!this.isMouseDown || this.isAnimating) return;
                    if (this.draggedNode === 'start') {
                        if (!node.isTarget && !node.isWall) {
                            this.setStartNode(r, c);
                        }
                    } else if (this.draggedNode === 'target') {
                        if (!node.isStart && !node.isWall) {
                            this.setTargetNode(r, c);
                        }
                    } else if (!node.isStart && !node.isTarget) {
                        node.isWall = true;
                        cell.classList.add('node-wall');
                        if (window.AlgoAudio) window.AlgoAudio.playTone(220, 0.02, 'square');
                    }
                });

                container.appendChild(cell);
                row.push(node);
            }
            this.grid.push(row);
        }
    },

    setStartNode(r, c) {
        const prevCell = document.getElementById(`node-${this.startNode.r}-${this.startNode.c}`);
        if (prevCell) {
            prevCell.classList.remove('node-start');
            this.grid[this.startNode.r][this.startNode.c].isStart = false;
        }

        this.startNode = { r, c };
        this.grid[r][c].isStart = true;
        const newCell = document.getElementById(`node-${r}-${c}`);
        if (newCell) newCell.classList.add('node-start');
    },

    setTargetNode(r, c) {
        const prevCell = document.getElementById(`node-${this.targetNode.r}-${this.targetNode.c}`);
        if (prevCell) {
            prevCell.classList.remove('node-target');
            this.grid[this.targetNode.r][this.targetNode.c].isTarget = false;
        }

        this.targetNode = { r, c };
        this.grid[r][c].isTarget = true;
        const newCell = document.getElementById(`node-${r}-${c}`);
        if (newCell) newCell.classList.add('node-target');
    },

    clearPath() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const node = this.grid[r][c];
                node.distance = Infinity;
                node.totalDistance = Infinity;
                node.isVisited = false;
                node.previousNode = null;

                const cell = document.getElementById(`node-${r}-${c}`);
                if (cell && !node.isStart && !node.isTarget && !node.isWall) {
                    cell.className = 'pf-node';
                }
            }
        }
        document.getElementById('pf-visited-count').textContent = 'Visited: 0 cells';
        document.getElementById('pf-path-length').textContent = 'Path Length: 0';
        document.getElementById('pf-exec-time').textContent = 'Time: 0ms';
    },

    clearBoard() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const node = this.grid[r][c];
                node.isWall = false;
            }
        }
        this.clearPath();
        document.querySelectorAll('.node-wall').forEach(el => el.classList.remove('node-wall'));
    },

    getNeighbors(node) {
        const neighbors = [];
        const { r, c } = node;
        if (r > 0) neighbors.push(this.grid[r - 1][c]);
        if (r < this.rows - 1) neighbors.push(this.grid[r + 1][c]);
        if (c > 0) neighbors.push(this.grid[r][c - 1]);
        if (c < this.cols - 1) neighbors.push(this.grid[r][c + 1]);
        return neighbors.filter(n => !n.isWall);
    },

    manhattanDistance(nodeA, nodeB) {
        return Math.abs(nodeA.r - nodeB.r) + Math.abs(nodeA.c - nodeB.c);
    },

    async visualizeAlgorithm() {
        this.clearPath();
        const algo = document.getElementById('pf-algo-select')?.value || 'astar';
        const speed = parseInt(document.getElementById('pf-speed-select')?.value || '30', 10);
        this.isAnimating = true;

        if (window.VoiceNarrator) {
            window.VoiceNarrator.speak(`Executing ${algo.toUpperCase()} pathfinding algorithm.`);
        }

        const start = this.grid[this.startNode.r][this.startNode.c];
        const target = this.grid[this.targetNode.r][this.targetNode.c];
        const startTime = Date.now();

        let visitedNodesInOrder = [];
        if (algo === 'astar') visitedNodesInOrder = this.runAStar(start, target);
        else if (algo === 'dijkstra') visitedNodesInOrder = this.runDijkstra(start, target);
        else if (algo === 'bfs') visitedNodesInOrder = this.runBFS(start, target);
        else visitedNodesInOrder = this.runDFS(start, target);

        const duration = Date.now() - startTime;
        document.getElementById('pf-exec-time').textContent = `Time: ${duration}ms`;

        // Animate visited nodes
        for (let i = 0; i < visitedNodesInOrder.length; i++) {
            const node = visitedNodesInOrder[i];
            if (!node.isStart && !node.isTarget) {
                const cell = document.getElementById(`node-${node.r}-${node.c}`);
                if (cell) cell.classList.add('node-visited');
                if (window.AlgoAudio && i % 3 === 0) {
                    window.AlgoAudio.playTone(280 + (i % 300), 0.02, 'sine');
                }
            }
            document.getElementById('pf-visited-count').textContent = `Visited: ${i + 1} cells`;
            await new Promise(r => setTimeout(r, speed));
        }

        // Animate shortest path
        const shortestPath = this.getNodesInShortestPath(target);
        if (shortestPath.length > 1 && shortestPath[0].isStart) {
            document.getElementById('pf-path-length').textContent = `Path Length: ${shortestPath.length}`;
            for (let i = 0; i < shortestPath.length; i++) {
                const node = shortestPath[i];
                if (!node.isStart && !node.isTarget) {
                    const cell = document.getElementById(`node-${node.r}-${node.c}`);
                    if (cell) cell.classList.add('node-path');
                    if (window.AlgoAudio) {
                        window.AlgoAudio.playTone(440 + (i * 20), 0.04, 'triangle');
                    }
                }
                await new Promise(r => setTimeout(r, Math.max(15, speed * 1.2)));
            }
            if (window.VoiceNarrator) {
                window.VoiceNarrator.speak(`Shortest path found! Path length is ${shortestPath.length} steps.`, true);
            }
        } else {
            document.getElementById('pf-path-length').textContent = 'No Path Found (Blocked)';
            if (window.VoiceNarrator) {
                window.VoiceNarrator.speak('Target is unreachable. All paths are blocked by obstacles.');
            }
        }

        this.isAnimating = false;
    },

    runAStar(startNode, targetNode) {
        const visitedInOrder = [];
        startNode.distance = 0;
        startNode.heuristicDistance = this.manhattanDistance(startNode, targetNode);
        startNode.totalDistance = startNode.heuristicDistance;

        const openSet = [startNode];

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.totalDistance - b.totalDistance);
            const current = openSet.shift();

            if (current.isWall) continue;
            current.isVisited = true;
            visitedInOrder.push(current);

            if (current === targetNode) return visitedInOrder;

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (neighbor.isVisited) continue;
                const tentativeG = current.distance + 1;
                if (tentativeG < neighbor.distance) {
                    neighbor.previousNode = current;
                    neighbor.distance = tentativeG;
                    neighbor.heuristicDistance = this.manhattanDistance(neighbor, targetNode);
                    neighbor.totalDistance = neighbor.distance + neighbor.heuristicDistance;
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return visitedInOrder;
    },

    runDijkstra(startNode, targetNode) {
        const visitedInOrder = [];
        startNode.distance = 0;
        const unvisitedNodes = [];

        for (const row of this.grid) {
            for (const node of row) unvisitedNodes.push(node);
        }

        while (unvisitedNodes.length) {
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const closest = unvisitedNodes.shift();

            if (closest.isWall) continue;
            if (closest.distance === Infinity) return visitedInOrder;

            closest.isVisited = true;
            visitedInOrder.push(closest);

            if (closest === targetNode) return visitedInOrder;

            const neighbors = this.getNeighbors(closest);
            for (const neighbor of neighbors) {
                if (neighbor.isVisited) continue;
                neighbor.distance = closest.distance + 1;
                neighbor.previousNode = closest;
            }
        }
        return visitedInOrder;
    },

    runBFS(startNode, targetNode) {
        const visitedInOrder = [];
        const queue = [startNode];
        startNode.isVisited = true;

        while (queue.length > 0) {
            const current = queue.shift();
            visitedInOrder.push(current);

            if (current === targetNode) return visitedInOrder;

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.previousNode = current;
                    queue.push(neighbor);
                }
            }
        }
        return visitedInOrder;
    },

    runDFS(startNode, targetNode) {
        const visitedInOrder = [];
        const stack = [startNode];
        startNode.isVisited = true;

        while (stack.length > 0) {
            const current = stack.pop();
            visitedInOrder.push(current);

            if (current === targetNode) return visitedInOrder;

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.previousNode = current;
                    stack.push(neighbor);
                }
            }
        }
        return visitedInOrder;
    },

    getNodesInShortestPath(targetNode) {
        const nodesInShortestPath = [];
        let currentNode = targetNode;
        while (currentNode !== null) {
            nodesInShortestPath.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        return nodesInShortestPath;
    },

    generateMaze(type) {
        if (this.isAnimating) return;
        this.clearBoard();

        if (type === 'random_scatter') {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const node = this.grid[r][c];
                    if (!node.isStart && !node.isTarget && Math.random() < 0.28) {
                        node.isWall = true;
                        document.getElementById(`node-${r}-${c}`)?.classList.add('node-wall');
                    }
                }
            }
        } else if (type === 'staircase') {
            let r = this.rows - 1;
            let c = 0;
            while (r > 0 && c < this.cols) {
                const node = this.grid[r][c];
                if (!node.isStart && !node.isTarget) {
                    node.isWall = true;
                    document.getElementById(`node-${r}-${c}`)?.classList.add('node-wall');
                }
                r--;
                c++;
            }
        } else if (type === 'recursive_division') {
            // Recursive Division algorithm
            const addWall = (r, c) => {
                const node = this.grid[r][c];
                if (!node.isStart && !node.isTarget) {
                    node.isWall = true;
                    document.getElementById(`node-${r}-${c}`)?.classList.add('node-wall');
                }
            };

            const divide = (rowStart, rowEnd, colStart, colEnd, orientation) => {
                if (rowEnd < rowStart || colEnd < colStart) return;

                const isHorizontal = orientation === 'H';
                if (isHorizontal) {
                    const possibleRows = [];
                    for (let i = rowStart; i <= rowEnd; i += 2) possibleRows.push(i);
                    const possibleCols = [];
                    for (let i = colStart - 1; i <= colEnd + 1; i += 2) possibleCols.push(i);

                    const randomRowIndex = Math.floor(Math.random() * possibleRows.length);
                    const randomColIndex = Math.floor(Math.random() * possibleCols.length);
                    const currentRow = possibleRows[randomRowIndex];
                    const colPassage = possibleCols[randomColIndex];

                    for (let c = colStart - 1; c <= colEnd + 1; c++) {
                        if (c !== colPassage && currentRow !== undefined) {
                            addWall(currentRow, c);
                        }
                    }

                    if (currentRow - 2 - rowStart > colEnd - colStart) {
                        divide(rowStart, currentRow - 2, colStart, colEnd, 'H');
                    } else {
                        divide(rowStart, currentRow - 2, colStart, colEnd, 'V');
                    }
                    if (rowEnd - (currentRow + 2) > colEnd - colStart) {
                        divide(currentRow + 2, rowEnd, colStart, colEnd, 'H');
                    } else {
                        divide(currentRow + 2, rowEnd, colStart, colEnd, 'V');
                    }
                } else {
                    const possibleCols = [];
                    for (let i = colStart; i <= colEnd; i += 2) possibleCols.push(i);
                    const possibleRows = [];
                    for (let i = rowStart - 1; i <= rowEnd + 1; i += 2) possibleRows.push(i);

                    const randomColIndex = Math.floor(Math.random() * possibleCols.length);
                    const randomRowIndex = Math.floor(Math.random() * possibleRows.length);
                    const currentCol = possibleCols[randomColIndex];
                    const rowPassage = possibleRows[randomRowIndex];

                    for (let r = rowStart - 1; r <= rowEnd + 1; r++) {
                        if (r !== rowPassage && currentCol !== undefined) {
                            addWall(r, currentCol);
                        }
                    }

                    if (rowEnd - rowStart > currentCol - 2 - colStart) {
                        divide(rowStart, rowEnd, colStart, currentCol - 2, 'H');
                    } else {
                        divide(rowStart, rowEnd, colStart, currentCol - 2, 'V');
                    }
                    if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
                        divide(rowStart, rowEnd, currentCol + 2, colEnd, 'H');
                    } else {
                        divide(rowStart, rowEnd, currentCol + 2, colEnd, 'V');
                    }
                }
            };

            divide(1, this.rows - 2, 1, this.cols - 2, 'H');
        }

        if (window.VoiceNarrator) {
            window.VoiceNarrator.speak('Generated maze obstacles.');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PathfindingVisualizer.init();
});

if (typeof window !== 'undefined') {
    window.PathfindingVisualizer = PathfindingVisualizer;
}
