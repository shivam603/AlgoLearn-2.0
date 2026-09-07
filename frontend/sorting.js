let currentViewMode = localStorage.getItem('algolearn_view_mode') || 'bars';

function getSpectrumHue(val, maxVal = 250) {
    const ratio = Math.min(Math.max(val / maxVal, 0), 1);
    return Math.round(240 - ratio * 240);
}

function getElementIndex(bar) {
    if (!bar) return 0;
    const match = (bar.className || '').match(/barNo(\d+)/);
    if (match) return parseInt(match[1], 10);
    const bars = Array.from(document.querySelectorAll('.bar'));
    const idx = bars.indexOf(bar);
    return idx >= 0 ? idx : 0;
}

const StepTracker = {
    steps: [],
    comparisons: 0,
    swaps: 0,
    totalOperations: 0,
    startTime: 0,
    phase: 'Ready',

    reset() {
        this.steps = [];
        this.comparisons = 0;
        this.swaps = 0;
        this.totalOperations = 0;
        this.startTime = Date.now();
        this.phase = 'Initializing';
        this.renderMetrics();
        const feed = document.getElementById('step-feed-container');
        if (feed) {
            feed.innerHTML = '<div class="text-center text-muted-custom small py-2" id="step-feed-empty">Live operations trace initialized. Executing algorithm...</div>';
        }
    },

    updateLiveBanner(stepNum, desc, badgeClass = 'bg-sky-600', badgeText = 'STEP') {
        const badge = document.getElementById('step-badge');
        const descEl = document.getElementById('step-active-desc');
        if (badge) {
            badge.className = `badge ${badgeClass} text-white`;
            badge.textContent = `${badgeText} #${stepNum}`;
        }
        if (descEl) {
            descEl.textContent = desc;
        }
    },

    pushFeedItem(step) {
        const feed = document.getElementById('step-feed-container');
        if (!feed) return;
        const empty = document.getElementById('step-feed-empty');
        if (empty) empty.remove();

        const card = document.createElement('div');
        card.className = `step-pill-card type-${step.type}`;

        let badgeClass = 'badge-compare';
        let icon = 'bi-arrow-left-right';
        if (step.type === 'SWAP') { badgeClass = 'badge-swap'; icon = 'bi-shuffle'; }
        else if (step.type === 'OVERWRITE') { badgeClass = 'badge-overwrite'; icon = 'bi-box-arrow-in-down'; }
        else if (step.type === 'SORTED') { badgeClass = 'badge-sorted'; icon = 'bi-check-circle-fill'; }
        else if (step.type === 'PIVOT') { badgeClass = 'badge-pivot'; icon = 'bi-bullseye'; }

        const elapsed = this.startTime ? `${Date.now() - this.startTime}ms` : '';

        card.innerHTML = `
            <span class="step-pill-badge ${badgeClass}">
                <i class="bi ${icon}"></i> ${step.type}
            </span>
            <span class="fw-bold text-sky-900" style="min-width: 44px;">#${step.id}</span>
            <span class="text-dark flex-grow-1">${step.desc}</span>
            <span class="text-muted-custom small" style="font-size: 0.68rem;">${elapsed}</span>
        `;

        feed.insertBefore(card, feed.firstChild);

        // Cap to latest 40 items in DOM for speed
        if (feed.children.length > 40) {
            feed.lastElementChild.remove();
        }

        const countBadge = document.getElementById('step-count-badge');
        if (countBadge) countBadge.textContent = `${this.totalOperations} operations`;
    },

    renderMetrics() {
        const totalEl = document.getElementById('step-total-ops');
        const compEl = document.getElementById('step-comparisons');
        const swapEl = document.getElementById('step-swaps');
        const phaseEl = document.getElementById('step-phase');
        const compBar = document.getElementById('step-comp-bar');
        const swapBar = document.getElementById('step-swap-bar');
        const ratioLabel = document.getElementById('step-ratio-label');
        const rateEl = document.getElementById('step-ops-rate');

        if (totalEl) totalEl.textContent = this.totalOperations.toLocaleString();
        if (compEl) compEl.textContent = this.comparisons.toLocaleString();
        if (swapEl) swapEl.textContent = this.swaps.toLocaleString();
        if (phaseEl) phaseEl.textContent = this.phase;

        const totalActions = this.comparisons + this.swaps;
        if (totalActions > 0 && compBar && swapBar) {
            const compPct = Math.round((this.comparisons / totalActions) * 100);
            const swapPct = 100 - compPct;
            compBar.style.width = `${compPct}%`;
            swapBar.style.width = `${swapPct}%`;
            if (ratioLabel) {
                ratioLabel.textContent = `${compPct}% Comparisons (${this.comparisons}) / ${swapPct}% Swaps (${this.swaps})`;
            }
        }

        if (rateEl && this.startTime) {
            const elapsedSec = Math.max((Date.now() - this.startTime) / 1000, 0.1);
            const opsSec = (this.totalOperations / elapsedSec).toFixed(1);
            rateEl.innerHTML = `<i class="bi bi-speedometer2"></i> ${opsSec} ops/sec`;
        }
    },

    logComparison(indexA, indexB, valA, valB, outcome = '') {
        this.totalOperations++;
        this.comparisons++;
        const desc = `Compare array[${indexA}] (${valA}) vs array[${indexB}] (${valB}) ${outcome ? '→ ' + outcome : ''}`;
        const step = { id: this.totalOperations, type: 'COMPARE', desc };
        this.updateLiveBanner(this.totalOperations, desc, 'bg-warning text-dark', 'COMPARE');
        this.pushFeedItem(step);
        this.renderMetrics();

        if (window.AlgoAudio) {
            window.AlgoAudio.playCompare(valA, valB);
        }
        if (window.CodeSync) {
            window.CodeSync.highlightLine('compare');
        }
        if (window.TimeTravel) {
            window.TimeTravel.captureFrame({
                array: getCurrentArrayValues(),
                activeIndices: [{ index: indexA, color: 'blue' }, { index: indexB, color: 'blue' }],
                desc,
                type: 'COMPARE',
                lineKey: 'compare',
                phase: this.phase
            });
        }
    },

    logSwap(indexA, indexB, valA, valB) {
        this.totalOperations++;
        this.swaps++;
        const desc = `Swap array[${indexA}] (${valA}) ↔ array[${indexB}] (${valB})`;
        const step = { id: this.totalOperations, type: 'SWAP', desc };
        this.updateLiveBanner(this.totalOperations, desc, 'bg-primary', 'SWAP');
        this.pushFeedItem(step);
        this.renderMetrics();

        if (window.AlgoAudio) {
            window.AlgoAudio.playSwap(valA, valB);
        }
        if (window.CodeSync) {
            window.CodeSync.highlightLine('swap');
        }
        if (window.TimeTravel) {
            window.TimeTravel.captureFrame({
                array: getCurrentArrayValues(),
                activeIndices: [{ index: indexA, color: 'orange' }, { index: indexB, color: 'orange' }],
                desc,
                type: 'SWAP',
                lineKey: 'swap',
                phase: this.phase
            });
        }
    },

    logWrite(index, val, reason = '') {
        this.totalOperations++;
        this.swaps++;
        const desc = `Set array[${index}] = ${val} ${reason ? '(' + reason + ')' : ''}`;
        const step = { id: this.totalOperations, type: 'OVERWRITE', desc };
        this.updateLiveBanner(this.totalOperations, desc, 'bg-info text-dark', 'WRITE');
        this.pushFeedItem(step);
        this.renderMetrics();

        if (window.AlgoAudio) {
            window.AlgoAudio.playWrite(val);
        }
        if (window.CodeSync) {
            window.CodeSync.highlightLine('shift');
        }
        if (window.TimeTravel) {
            window.TimeTravel.captureFrame({
                array: getCurrentArrayValues(),
                activeIndices: [{ index, color: 'yellow' }],
                desc,
                type: 'WRITE',
                lineKey: 'shift',
                phase: this.phase
            });
        }
    },

    logSorted(index, val) {
        this.totalOperations++;
        const desc = `Locked array[${index}] (${val}) in sorted position`;
        const step = { id: this.totalOperations, type: 'SORTED', desc };
        this.updateLiveBanner(this.totalOperations, desc, 'bg-success', 'SORTED');
        this.pushFeedItem(step);
        this.renderMetrics();

        if (window.AlgoAudio) {
            window.AlgoAudio.playTone(550 + (index * 8), 0.03, 'sine');
        }
        if (window.CodeSync) {
            window.CodeSync.highlightLine('sorted');
        }
    },

    logPhase(phaseName) {
        this.phase = phaseName;
        this.renderMetrics();
    }
};

window.renderArrayBarsFromSnapshot = function (frame) {
    if (!frame || !frame.array) return;
    const barsContainer = document.querySelector('#bars');
    if (!barsContainer) return;

    const existingBars = barsContainer.querySelectorAll('.bar');
    if (existingBars.length !== frame.array.length) {
        renderArrayBars(frame.array);
    } else {
        frame.array.forEach((val, idx) => {
            const bar = existingBars[idx];
            if (bar) {
                bar.style.height = `${val * 2}px`;
                bar.style.setProperty('--spectrum-hue', `${getSpectrumHue(val)}deg`);
                const label = getBarLabel(bar);
                if (label) label.textContent = val;
                bar.style.background = 'cyan';
            }
        });
    }

    if (frame.activeIndices && frame.activeIndices.length) {
        frame.activeIndices.forEach(item => {
            const bar = barsContainer.querySelectorAll('.bar')[item.index];
            if (bar) bar.style.background = item.color || 'yellow';
        });
    }

    if (currentViewMode === 'line') {
        updateLineGraph();
    }
};

function generatePresetArray(type, count = 35) {
    let arr = [];
    if (type === 'nearly_sorted') {
        for (let i = 1; i <= count; i++) {
            arr.push(Math.round((i / count) * 230) + 15);
        }
        for (let k = 0; k < Math.max(2, Math.floor(count / 10)); k++) {
            const idx1 = Math.floor(Math.random() * count);
            const idx2 = Math.floor(Math.random() * count);
            const tmp = arr[idx1];
            arr[idx1] = arr[idx2];
            arr[idx2] = tmp;
        }
    } else if (type === 'reversed') {
        for (let i = count; i >= 1; i--) {
            arr.push(Math.round((i / count) * 230) + 15);
        }
    } else if (type === 'few_unique') {
        const pool = [35, 85, 140, 190, 240];
        for (let i = 0; i < count; i++) {
            arr.push(pool[Math.floor(Math.random() * pool.length)]);
        }
    } else if (type === 'sawtooth') {
        const perPeriod = Math.max(5, Math.ceil(count / 3));
        for (let i = 0; i < count; i++) {
            const phase = i % perPeriod;
            arr.push(Math.round((phase / perPeriod) * 220) + 20);
        }
    } else {
        for (let i = 0; i < count; i++) {
            arr.push(Math.floor(Math.random() * 250) + 1);
        }
    }
    setCustomArray(arr);
}

// swap function util for sorting algorithms takes input of 2 DOM elements with .style.height feature
function swap(el1, el2) {
    let temp = el1.style.height;
    const val1 = getValueFromHeight(el1.style.height);
    const val2 = getValueFromHeight(el2.style.height);
    const idx1 = getElementIndex(el1);
    const idx2 = getElementIndex(el2);
    setBarHeight(el1, el2.style.height, false);
    setBarHeight(el2, temp, false);
    StepTracker.logSwap(idx1, idx2, val1, val2);
    if (currentViewMode === 'line') {
        updateLineGraph();
    }
}

function getBarLabel(bar) {
    return bar.parentElement ? bar.parentElement.querySelector('.bar-label') : null;
}

function getValueFromHeight(height) {
    return Math.round(parseFloat(height) / 2);
}

function setBarHeight(bar, height, shouldLog = true) {
    bar.style.height = height;
    const val = getValueFromHeight(height);
    const label = getBarLabel(bar);
    if (label) label.textContent = val;
    bar.style.setProperty('--spectrum-hue', `${getSpectrumHue(val)}deg`);
    if (shouldLog) {
        const idx = getElementIndex(bar);
        StepTracker.logWrite(idx, val);
    }
    if (currentViewMode === 'line') {
        updateLineGraph();
    }
}

function getCurrentArrayValues() {
    return Array.from(document.querySelectorAll('.bar'))
        .map(bar => getValueFromHeight(bar.style.height));
}

// Disables sorting buttons used in conjunction with enable, so that we can disable during sorting and enable buttons after it
function disableSortingBtn() {
    document.querySelector(".bubbleSort").disabled = true;
    document.querySelector(".insertionSort").disabled = true;
    document.querySelector(".mergeSort").disabled = true;
    document.querySelector(".quickSort").disabled = true;
    document.querySelector(".selectionSort").disabled = true;
    document.querySelector(".heapSort").disabled = true;
}

// Enables sorting buttons used in conjunction with disable
function enableSortingBtn() {
    document.querySelector(".bubbleSort").disabled = false;
    document.querySelector(".insertionSort").disabled = false;
    document.querySelector(".mergeSort").disabled = false;
    document.querySelector(".quickSort").disabled = false;
    document.querySelector(".selectionSort").disabled = false;
    document.querySelector(".heapSort").disabled = false;
}

// Disables size slider used in conjunction with enable, so that we can disable during sorting and enable buttons after it
function disableSizeSlider() {
    document.querySelector("#arr_sz").disabled = true;
}

// Enables size slider used in conjunction with disable
function enableSizeSlider() {
    document.querySelector("#arr_sz").disabled = false;
}

// Disables newArray buttons used in conjunction with enable, so that we can disable during sorting and enable buttons after it
function disableNewArrayBtn() {
    document.querySelector(".newArray").disabled = true;
}

// Enables newArray buttons used in conjunction with disable
function enableNewArrayBtn() {
    document.querySelector(".newArray").disabled = false;
}

// Used in async function so that we can so animations of sorting, takes input time in ms (1000 = 1s)
function waitforme(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}

const HISTORY_STORAGE_KEY = 'algoLearnHistory';

const complexities = {
    'Bubble Sort': { time: 'O(n²)', space: 'O(1)' },
    'Selection Sort': { time: 'O(n²)', space: 'O(1)' },
    'Insertion Sort': { time: 'O(n²)', space: 'O(1)' },
    'Quick Sort': { time: 'O(n log n)', space: 'O(log n)' },
    'Merge Sort': { time: 'O(n log n)', space: 'O(n)' },
    'Heap Sort': { time: 'O(n log n)', space: 'O(1)' }
};

const sortingExplanations = {
    'Bubble Sort': 'Bubble Sort repeatedly compares adjacent items and swaps them if they are in the wrong order. It works from left to right, bubbling the largest unsorted element toward the end on each pass.',
    'Selection Sort': 'Selection Sort finds the smallest remaining element and swaps it into the next sorted position. It scans the unsorted portion and builds the sorted array one element at a time.',
    'Insertion Sort': 'Insertion Sort builds a sorted array by taking each new item and inserting it into the correct position among the already-sorted elements.',
    'Quick Sort': 'Quick Sort chooses a pivot, partitions the array into smaller and larger values, and recursively sorts each partition. It is fast on average but can degrade if the pivot is poorly chosen.',
    'Merge Sort': 'Merge Sort divides the array into halves, sorts each half recursively, and then merges the sorted halves together. It guarantees O(n log n) time and uses extra space for merging.',
    'Heap Sort': 'Heap Sort builds a max heap from the array, then repeatedly removes the top element and rebuilds the heap. It sorts in place and keeps O(n log n) time complexity.'
};

function setSortingExplanation(algorithm) {
    const explanationEl = document.getElementById('algorithm-explanation');
    if (!explanationEl) return;
    const explanation = sortingExplanations[algorithm] || 'Choose an algorithm to see a description of how it works and its complexity.';
    explanationEl.textContent = explanation;
}

function getLocalHistory() {
    try {

        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (err) {
        console.warn('Unable to load local history:', err);
        return [];
    }
}

function setLocalHistory(history) {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
        console.warn('Unable to save local history:', err);
    }
}

function appendLocalHistory(entry) {
    const history = getLocalHistory();
    history.unshift(entry);
    setLocalHistory(history.slice(0, 20));
}

const algorithmLearning = {
    kruskal: {
        name: "Kruskal's Algorithm",
        summary: "Kruskal's algorithm finds the Minimum Spanning Tree (MST) of a graph by selecting the smallest edges without creating a cycle.",
        time: "O(E log E)",
        space: "O(E)",
        example: "Graph with edges: A-B (4), A-C (2), B-C (3), B-D (5), C-D (4)",
        steps: [
            "Sort all graph edges by weight.",
            "Add the smallest edge if it does not form a cycle.",
            "Repeat until the MST includes all vertices."
        ],
        details: "Kruskal uses a union-find data structure to efficiently detect cycles. It is ideal for sparse graphs and returns an MST by edge weight order."
    },
    dijkstra: {
        name: "Dijkstra's Algorithm",
        summary: "Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a graph with non-negative edge weights.",
        time: "O(E + V log V)",
        space: "O(V)",
        example: "Graph with source node 0 and weighted edges: 0-1 (4), 0-2 (1), 2-1 (2), 1-3 (1), 2-3 (5)",
        steps: [
            "Initialize distances: source = 0, other nodes = infinity.",
            "Select the unvisited vertex with the smallest distance.",
            "Update neighbor distances using the selected vertex.",
            "Repeat until all vertices are visited."
        ],
        details: "Dijkstra maintains a priority queue of candidate nodes and updates the shortest path estimate for each neighbor. It only works with non-negative edge weights."
    }
};

function setComplexityInfo(algorithm) {
    const info = complexities[algorithm] || { time: 'N/A', space: 'N/A' };
    const timeLabel = document.querySelector('#complexity-time');
    const spaceLabel = document.querySelector('#complexity-space');
    if (timeLabel) timeLabel.textContent = info.time;
    if (spaceLabel) spaceLabel.textContent = info.space;
    setSortingExplanation(algorithm);
    return info;
}

async function saveHistory(algorithm, arrayValues, durationMs) {
    const complexity = setComplexityInfo(algorithm);
    const currentArrayValues = getCurrentArrayValues();
    const savedArray = currentArrayValues.length ? currentArrayValues : arrayValues;
    array = savedArray;
    const entry = {
        algorithm,
        array_data: savedArray,
        size: savedArray.length,
        speed: parseInt(delayElement.value, 10),
        duration_ms: Number(durationMs),
        time_complexity: complexity.time,
        space_complexity: complexity.space,
        created_at: new Date().toISOString()
    };

    appendLocalHistory(entry);
    try {
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                algorithm,
                array: savedArray,
                size: savedArray.length,
                speed: parseInt(delayElement.value, 10),
                duration: Number(durationMs),
                time_complexity: complexity.time,
                space_complexity: complexity.space
            })
        });
        if (!response.ok) {
            throw new Error(`History API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('Could not save history to backend, using local storage instead:', error);
    }

    fetchHistory();
}

function renderHistory(history) {
    const historyBody = document.querySelector('#history-body');
    if (!historyBody) return;
    historyBody.innerHTML = '';
    history.forEach(item => {
        const fallback = complexities[item.algorithm] || { time: 'N/A', space: 'N/A' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.created_at).toLocaleString()}</td>
            <td>${item.algorithm}</td>
            <td>${item.size}</td>
            <td>${item.time_complexity || fallback.time}</td>
            <td>${item.space_complexity || fallback.space}</td>
            <td>${item.duration_ms} ms</td>
        `;
        row.addEventListener('click', () => restoreSessionArray(item));
        historyBody.appendChild(row);
    });
}

let cachedHistory = [];

async function fetchHistory() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error('Failed to load history');
        const data = await response.json();
        cachedHistory = data;
        renderHistory(data);
        return;
    } catch (error) {
        console.warn('Could not fetch history from backend, falling back to local storage:', error);
    }
    const localHistory = getLocalHistory();
    cachedHistory = localHistory;
    renderHistory(localHistory);
}

async function clearHistory() {
    try {
        const response = await fetch('/api/history', {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Unable to clear history');
    } catch (error) {
        console.warn('Could not clear backend history:', error);
    }
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    cachedHistory = [];
    renderHistory([]);
}

function downloadHistory() {
    if (!cachedHistory.length) return;
    const fileData = JSON.stringify(cachedHistory, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sorting-history.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function restoreSessionArray(historyItem) {
    const values = historyItem.array_data || historyItem.array || [];
    if (!Array.isArray(values) || !values.length) return;
    setCustomArray(values.map(value => Number(value)));
}

let arraySize;
let arrayInput;
let loadArrayButton;
let arrayError;
let clearHistoryBtn;
let downloadHistoryBtn;
let delayElement;
let newArray;

function initializeSortingPage() {
    arraySize = document.querySelector('#arr_sz');
    arrayInput = document.querySelector('#array_input');
    loadArrayButton = document.querySelector('.loadArrayButton');
    arrayError = document.querySelector('#array-error');
    clearHistoryBtn = document.querySelector('.clearHistoryBtn');
    downloadHistoryBtn = document.querySelector('.downloadHistoryBtn');
    delayElement = document.querySelector('#speed_input');
    newArray = document.querySelector('.newArray');

    if (arraySize) {
        arraySize.addEventListener('input', function () {
            createNewArray(parseInt(arraySize.value));
            if (arrayInput) arrayInput.value = '';
            if (arrayError) arrayError.classList.add('d-none');
        });
    }

    if (loadArrayButton) {
        loadArrayButton.addEventListener('click', function () {
            const parsed = parseUserArray(arrayInput.value);
            if (!parsed) {
                arrayError.textContent = 'Please enter a valid list of positive numbers separated by commas or spaces.';
                arrayError.classList.remove('d-none');
                return;
            }
            setCustomArray(parsed);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            await clearHistory();
            fetchHistory();
        });
    }

    if (downloadHistoryBtn) {
        downloadHistoryBtn.addEventListener('click', downloadHistory);
    }

    if (delayElement) {
        delayElement.addEventListener('input', function () {
            delay = 320 - parseInt(delayElement.value);
        });
    }

    if (newArray) {
        newArray.addEventListener('click', function () {
            if (arrayInput) arrayInput.value = '';
            if (arrayError) arrayError.classList.add('d-none');
            enableSortingBtn();
            enableSizeSlider();
            createNewArray(arraySize.value);
        });
    }

    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const mode = this.getAttribute('data-mode') || 'bars';
            setVisualizerViewMode(mode);
        });
    });

    window.addEventListener('resize', () => {
        if (currentViewMode === 'line') {
            updateLineGraph();
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        
        if (e.code === 'KeyR') {
            e.preventDefault();
            if (newArray) newArray.click();
        } else if (e.code === 'KeyM') {
            e.preventDefault();
            const modes = ['bars', 'line', 'scatter', 'spectrum', 'lollipop'];
            const nextIdx = (modes.indexOf(currentViewMode) + 1) % modes.length;
            setVisualizerViewMode(modes[nextIdx]);
        } else if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const modes = ['bars', 'line', 'scatter', 'spectrum', 'lollipop'];
            setVisualizerViewMode(modes[parseInt(e.key, 10) - 1]);
        } else if (e.code === 'Space') {
            e.preventDefault();
            const bubbleBtn = document.querySelector('.bubbleSort');
            if (bubbleBtn && !bubbleBtn.disabled) {
                bubbleBtn.click();
            }
        }
    });
}

function setVisualizerViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('algolearn_view_mode', mode);
    const bars = document.querySelector('#bars');
    if (bars) {
        bars.className = `flex-container mode-${mode}`;
    }
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    if (mode === 'line') {
        updateLineGraph();
    } else {
        const svg = document.querySelector('.line-graph-svg');
        if (svg) svg.style.display = 'none';
    }
}

function updateLineGraph() {
    const barsContainer = document.querySelector('#bars');
    if (!barsContainer) return;
    let svg = barsContainer.querySelector('.line-graph-svg');
    if (currentViewMode !== 'line') {
        if (svg) svg.style.display = 'none';
        return;
    }
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'line-graph-svg');
        barsContainer.insertBefore(svg, barsContainer.firstChild);
    }
    svg.style.display = 'block';

    const barNodes = barsContainer.querySelectorAll('.bar');
    if (!barNodes.length) return;

    const containerRect = barsContainer.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;

    const points = [];
    barNodes.forEach((bar) => {
        const rect = bar.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top - containerRect.top;
        points.push({ x, y, bar });
    });

    if (points.length < 2) return;

    let dLine = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
        dLine += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
    }

    const bottomY = containerRect.height;
    const dArea = `${dLine} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;

    svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    svg.innerHTML = `
        <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="50%" stop-color="#0ea5e9" />
                <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.30" />
                <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.02" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <path d="${dArea}" fill="url(#areaGrad)" />
        <path d="${dLine}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />
        ${points.map(p => {
            const bg = p.bar.style.background || '';
            let dotColor = '#0284c7';
            let dotRadius = 4;
            if (bg.includes('blue') || bg.includes('rgb(0, 0, 255)')) { dotColor = '#3b82f6'; dotRadius = 6; }
            else if (bg.includes('yellow') || bg.includes('orange')) { dotColor = '#f59e0b'; dotRadius = 6; }
            else if (bg.includes('red') || bg.includes('pink')) { dotColor = '#ef4444'; dotRadius = 6; }
            else if (bg.includes('green')) { dotColor = '#10b981'; dotRadius = 5; }
            return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotRadius}" fill="${dotColor}" stroke="#ffffff" stroke-width="2" />`;
        }).join('')}
    `;
}

function renderArrayBars(values) {
    deleteChild();
    const bars = document.querySelector('#bars');
    if (bars) {
        bars.className = `flex-container mode-${currentViewMode}`;
    }
    values.forEach((value, i) => {
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('bar-wrapper');

        const bar = document.createElement('div');
        bar.style.height = `${value * 2}px`;
        bar.style.setProperty('--spectrum-hue', `${getSpectrumHue(value)}deg`);
        bar.classList.add('bar');
        bar.classList.add('flex-item');
        bar.classList.add(`barNo${i}`);

        const label = document.createElement('span');
        label.classList.add('bar-label');
        label.textContent = value;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        bars.appendChild(barWrapper);
    });

    setVisualizerViewMode(currentViewMode);
}

function parseUserArray(input) {
    const tokens = input
        .trim()
        .split(/[,\s]+/)
        .filter(token => token.length > 0);

    if (tokens.length === 0 || tokens.length > 100) return null;

    const values = tokens.map(token => Number(token));
    if (values.some(value => Number.isNaN(value) || value <= 0)) return null;
    return values;
}

function setCustomArray(values) {
    array = values;
    renderArrayBars(array);
    arraySize.value = Math.min(Math.max(array.length, parseInt(arraySize.min)), parseInt(arraySize.max));
    arrayError.classList.add('d-none');
}

let delay = 260;
let array = [];

window.addEventListener('DOMContentLoaded', () => {
    initializeSortingPage();
    const count = arraySize ? parseInt(arraySize.value) : 35;
    createNewArray(isNaN(count) ? 35 : count);
    fetchHistory();
});

function createNewArray(noOfBars = 35) {
    if (arrayInput) arrayInput.value = '';
    if (arrayError) arrayError.classList.add('d-none');
    deleteChild();

    array = [];
    for (let i = 0; i < noOfBars; i++) {
        array.push(Math.floor(Math.random() * 250) + 1);
    }
    renderArrayBars(array);
}

function deleteChild() {
    const bar = document.querySelector("#bars");
    if (bar) bar.innerHTML = '';
}
