const GRAPH_COMPLEXITIES = {
    time: 'O(V+E)',
    space: 'O(V)'
};

const GRAPH_ALGORITHM_DETAILS = {
    'Breadth First Search': {
        time: 'O(V+E)',
        space: 'O(V)',
        explanation: 'BFS starts at a chosen node and visits all neighbors before moving to the next level. It uses a queue to track nodes to visit and is ideal for finding the shortest path in an unweighted graph.'
    },
    'Depth First Search': {
        time: 'O(V+E)',
        space: 'O(V)',
        explanation: 'DFS explores one branch as far as possible before backtracking. It uses a stack or recursion to visit nodes deeply, making it useful for path finding and cycle detection.'
    }
};

let graph = { nodes: [], edges: [] };
let nodePositions = {};
let delay = 240;
let arrayInput = null;
let graphInput = null;
let loadGraphButton = null;
let generateGraphButton = null;
let bfsBtn = null;
let dfsBtn = null;
let speedInput = null;
let nodeCountInput = null;
let graphResult = null;
let graphStructure = null;
let graphCanvas = null;

function parseGraphInput(input) {
    const tokens = input
        .trim()
        .split(/[\n,;]+/)
        .map(part => part.trim())
        .filter(Boolean);

    const edges = [];
    const nodes = new Set();

    for (const token of tokens) {
        const parts = token.split(/[->\s]+/).map(p => p.trim()).filter(Boolean);
        if (parts.length !== 2) continue;
        const [a, b] = parts;
        if (!a || !b) continue;
        edges.push([a, b]);
        nodes.add(a);
        nodes.add(b);
    }

    if (!edges.length) return null;

    return {
        nodes: Array.from(nodes),
        edges
    };
}

function generateRandomGraph(nodeCount = 6) {
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, nodeCount);
    const edges = [];
    const nodeSet = new Set(labels);

    // Create a connected base graph
    for (let i = 1; i < labels.length; i++) {
        const source = labels[Math.floor(Math.random() * i)];
        edges.push([source, labels[i]]);
    }

    // Add some extra edges for complexity
    const extraEdges = Math.max(1, Math.floor(nodeCount * 1.2));
    for (let i = 0; i < extraEdges; i++) {
        const a = labels[Math.floor(Math.random() * nodeCount)];
        const b = labels[Math.floor(Math.random() * nodeCount)];
        if (a !== b && !edges.some(edge => (edge[0] === a && edge[1] === b) || (edge[0] === b && edge[1] === a))) {
            edges.push([a, b]);
        }
    }

    return { nodes: Array.from(nodeSet), edges };
}

function buildAdjacency(graphData) {
    const adjacency = {};
    graphData.nodes.forEach(node => adjacency[node] = new Set());
    graphData.edges.forEach(([a, b]) => {
        adjacency[a].add(b);
        adjacency[b].add(a);
    });
    return Object.fromEntries(Object.entries(adjacency).map(([node, neighbors]) => [node, Array.from(neighbors).sort()]));
}

function updateGraphStructure(graphData) {
    const adjacency = buildAdjacency(graphData);
    if (!graphStructure) return;
    graphStructure.innerHTML = `<strong class="text-white">Adjacency:</strong> ${Object.entries(adjacency)
        .map(([node, neighbors]) => `${node}: ${neighbors.join(', ')}`)
        .join(' | ')}`;
}

function setGraphComplexity(algorithm) {
    const details = GRAPH_ALGORITHM_DETAILS[algorithm] || GRAPH_COMPLEXITIES;
    const timeEl = document.getElementById('graph-time');
    const spaceEl = document.getElementById('graph-space');
    if (timeEl) timeEl.textContent = details.time;
    if (spaceEl) spaceEl.textContent = details.space;
}

function setGraphExplanation(algorithm) {
    const explanationEl = document.getElementById('graph-algorithm-explanation');
    if (!explanationEl) return;
    const details = GRAPH_ALGORITHM_DETAILS[algorithm];
    explanationEl.textContent = details ? details.explanation : 'Choose BFS or DFS to see a description of the selected graph traversal algorithm.';
}

function clearGraphCanvas() {
    if (!graphCanvas) return;
    graphCanvas.innerHTML = '';
}

function renderGraph(graphData, highlight = [], current = null, visited = []) {
    if (!graphCanvas) return;
    clearGraphCanvas();

    const width = graphCanvas.clientWidth;
    const height = graphCanvas.clientHeight;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const radius = Math.min(width, height) * 0.32;
    const centerX = width / 2;
    const centerY = height / 2;

    graphData.nodes.forEach((node, index) => {
        const angle = (index / graphData.nodes.length) * Math.PI * 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions[node] = { x, y };
    });

    graphData.edges.forEach(([a, b]) => {
        const posA = nodePositions[a];
        const posB = nodePositions[b];
        const edge = document.createElementNS(svgNS, 'line');
        edge.setAttribute('x1', posA.x);
        edge.setAttribute('y1', posA.y);
        edge.setAttribute('x2', posB.x);
        edge.setAttribute('y2', posB.y);
        edge.setAttribute('stroke', '#64748b');
        edge.setAttribute('stroke-width', '3');
        edge.setAttribute('class', 'graph-edge');
        svg.appendChild(edge);
    });

    graphData.nodes.forEach(node => {
        const pos = nodePositions[node];
        const circle = document.createElementNS(svgNS, 'circle');
        const isCurrent = node === current;
        const isVisited = visited.includes(node);
        const isHighlight = highlight.includes(node);
        const fillColor = isCurrent ? '#facc15' : isVisited ? '#22c55e' : isHighlight ? '#38bdf8' : '#0f172a';
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', '26');
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('opacity', '0.95');
        svg.appendChild(circle);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 5);
        text.setAttribute('fill', '#f8fafc');
        text.setAttribute('font-family', 'Inter, Arial, sans-serif');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', '700');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = node;
        svg.appendChild(text);
    });

    graphCanvas.appendChild(svg);
}

function parseUserGraph() {
    const raw = graphInput.value.trim();
    if (!raw) return null;
    return parseGraphInput(raw);
}

function showGraphError(message) {
    const errorEl = document.getElementById('graph-error');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
}

function hideGraphError() {
    const errorEl = document.getElementById('graph-error');
    if (!errorEl) return;
    errorEl.classList.add('d-none');
}

function setGraphResult(text) {
    if (graphResult) graphResult.textContent = text;
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBFS() {
    setGraphComplexity('Breadth First Search');
    setGraphExplanation('Breadth First Search');
    const startNode = graph.nodes[0];
    if (!startNode) return;
    const adjacency = buildAdjacency(graph);
    const visited = new Set();
    const queue = [startNode];
    const order = [];

    setGraphResult('Running BFS...');
    bfsBtn.disabled = true;
    dfsBtn.disabled = true;

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        order.push(current);
        renderGraph(graph, queue, current, Array.from(visited));
        setGraphResult(`BFS visiting ${current}. Queue: ${queue.join(', ')}`);
        await wait(delay);

        adjacency[current].forEach(neighbor => {
            if (!visited.has(neighbor) && !queue.includes(neighbor)) {
                queue.push(neighbor);
            }
        });
    }

    setGraphResult(`BFS complete: ${order.join(' → ')}`);
    bfsBtn.disabled = false;
    dfsBtn.disabled = false;
}

async function runDFS() {
    setGraphComplexity('Depth First Search');
    setGraphExplanation('Depth First Search');
    const startNode = graph.nodes[0];
    if (!startNode) return;
    const adjacency = buildAdjacency(graph);
    const visited = new Set();
    const stack = [startNode];
    const order = [];

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;
        visited.add(current);
        order.push(current);
        renderGraph(graph, stack, current, Array.from(visited));
        setGraphResult(`DFS visiting ${current}. Stack: ${stack.join(', ')}`);
        await wait(delay);

        const neighbors = adjacency[current] || [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            if (!visited.has(neighbor) && !stack.includes(neighbor)) {
                stack.push(neighbor);
            }
        }
    }

    setGraphResult(`DFS complete: ${order.join(' → ')}`);
    bfsBtn.disabled = false;
    dfsBtn.disabled = false;
}

window.addEventListener('DOMContentLoaded', () => {
    graphInput = document.getElementById('graph_input');
    loadGraphButton = document.querySelector('.loadGraphBtn');
    generateGraphButton = document.querySelector('.generateGraph');
    bfsBtn = document.querySelector('.bfsBtn');
    dfsBtn = document.querySelector('.dfsBtn');
    speedInput = document.getElementById('speed_input');
    nodeCountInput = document.getElementById('node_count');
    graphResult = document.getElementById('graph-result');
    graphStructure = document.getElementById('graph-structure');
    graphCanvas = document.getElementById('graph-canvas');

    if (loadGraphButton) {
        loadGraphButton.addEventListener('click', () => {
            const parsed = parseUserGraph();
            if (!parsed) {
                showGraphError('Enter edges in the format A-B, B-C, C-D.');
                return;
            }
            hideGraphError();
            graph = parsed;
            updateGraphStructure(graph);
            renderGraph(graph);
            setGraphResult('Graph loaded. Select BFS or DFS to visualize traversal.');
        });
    }

    if (generateGraphButton) {
        generateGraphButton.addEventListener('click', () => {
            hideGraphError();
            const count = Number(nodeCountInput.value) || 6;
            graph = generateRandomGraph(count);
            graphInput.value = graph.edges.map(edge => `${edge[0]}-${edge[1]}`).join(', ');
            updateGraphStructure(graph);
            renderGraph(graph);
            setGraphResult('Random graph generated. Choose BFS or DFS to begin.');
        });
    }

    if (speedInput) {
        speedInput.addEventListener('input', () => {
            delay = 320 - Number(speedInput.value);
        });
    }

    if (bfsBtn) bfsBtn.addEventListener('click', runBFS);
    if (dfsBtn) dfsBtn.addEventListener('click', runDFS);

    graph = generateRandomGraph(6);
    graphInput.value = graph.edges.map(edge => `${edge[0]}-${edge[1]}`).join(', ');
    updateGraphStructure(graph);
    renderGraph(graph);
    setGraphComplexity('Breadth First Search');
    setGraphExplanation('Breadth First Search');
    setGraphResult('Random graph ready. Choose BFS or DFS to start.');
});
