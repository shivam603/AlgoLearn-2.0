const SEARCH_COMPLEXITIES = {
    'Linear Search': { time: 'O(n)', space: 'O(1)' },
    'Binary Search': { time: 'O(log n)', space: 'O(1)' }
};

function parseUserArray(input) {
    const tokens = input
        .trim()
        .split(/[\s,]+/)
        .filter(token => token.length > 0);

    if (tokens.length === 0 || tokens.length > 100) return null;

    const values = tokens.map(token => Number(token));
    if (values.some(value => Number.isNaN(value))) return null;
    return values;
}

const SEARCH_EXPLANATIONS = {
    'Linear Search': 'Linear Search examines each item in the array sequentially until it finds the target value or reaches the end. It is simple and works on any array, but it can be slow for large collections.',
    'Binary Search': 'Binary Search requires a sorted array. It repeatedly compares the target to the middle element, then discards the half where the target cannot be, narrowing the search range quickly.'
};

function setSearchExplanation(algorithm) {
    const explanationEl = document.getElementById('search-algorithm-explanation');
    if (!explanationEl) return;
    explanationEl.textContent = SEARCH_EXPLANATIONS[algorithm] || 'Choose an algorithm to see a detailed explanation of how it works and its complexity.';
}

function setComplexityInfo(algorithm) {
    const info = SEARCH_COMPLEXITIES[algorithm] || { time: 'N/A', space: 'N/A' };
    const algoNameEl = document.getElementById('algorithm-name');
    const timeEl = document.getElementById('complexity-time');
    const spaceEl = document.getElementById('complexity-space');
    const timeBar = document.getElementById('complexity-time-bar');
    const spaceBar = document.getElementById('complexity-space-bar');

    const widthMap = {
        'O(1)': 25,
        'O(log n)': 55,
        'O(n)': 100,
        'O(n log n)': 130,
        'O(n^2)': 170,
        'N/A': 10
    };

    if (algoNameEl) algoNameEl.textContent = algorithm || 'Unknown';
    if (timeEl) timeEl.textContent = info.time;
    if (spaceEl) spaceEl.textContent = info.space;
    if (timeBar) timeBar.style.width = `${widthMap[info.time] || 10}%`;
    if (spaceBar) spaceBar.style.width = `${widthMap[info.space] || 10}%`;
    setSearchExplanation(algorithm);
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
            feed.innerHTML = '<div class="text-center text-muted-custom small py-2" id="step-feed-empty">Live search trace initialized...</div>';
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
        let icon = 'bi-search';
        if (step.type === 'FOUND') { badgeClass = 'badge-found'; icon = 'bi-check2-circle'; }
        else if (step.type === 'SPLIT') { badgeClass = 'badge-swap'; icon = 'bi-layout-split'; }

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
                ratioLabel.textContent = `${compPct}% Checks (${this.comparisons}) / ${swapPct}% Narrowing (${this.swaps})`;
            }
        }

        if (rateEl && this.startTime) {
            const elapsedSec = Math.max((Date.now() - this.startTime) / 1000, 0.1);
            const opsSec = (this.totalOperations / elapsedSec).toFixed(1);
            rateEl.innerHTML = `<i class="bi bi-speedometer2"></i> ${opsSec} ops/sec`;
        }
    },

    logInspect(index, val, target, isMatch) {
        this.totalOperations++;
        this.comparisons++;
        const desc = `Inspect array[${index}] (${val}) vs Target (${target}) → ${isMatch ? 'MATCH FOUND!' : 'Mismatch'}`;
        const step = { id: this.totalOperations, type: isMatch ? 'FOUND' : 'COMPARE', desc };
        this.updateLiveBanner(this.totalOperations, desc, isMatch ? 'bg-success' : 'bg-warning text-dark', isMatch ? 'FOUND' : 'CHECK');
        this.pushFeedItem(step);
        this.renderMetrics();
    },

    logSplit(low, mid, high, midVal, target) {
        this.totalOperations++;
        this.swaps++;
        const desc = `Window [${low}..${high}], Mid: array[${mid}] (${midVal}) → Discarding ${midVal < target ? 'left half [0..' + mid + ']' : 'right half [' + mid + '..' + high + ']'}`;
        const step = { id: this.totalOperations, type: 'SPLIT', desc };
        this.updateLiveBanner(this.totalOperations, desc, 'bg-info text-dark', 'SPLIT');
        this.pushFeedItem(step);
        this.renderMetrics();
    },

    logPhase(phaseName) {
        this.phase = phaseName;
        this.renderMetrics();
    }
};

let currentViewMode = localStorage.getItem('algolearn_search_view_mode') || 'bars';

function getSpectrumHue(val, maxVal = 100) {
    const ratio = Math.min(Math.max(val / maxVal, 0), 1);
    return Math.round(240 - ratio * 240);
}

function setVisualizerViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('algolearn_search_view_mode', mode);
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
            <linearGradient id="searchLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="50%" stop-color="#0ea5e9" />
                <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>
            <linearGradient id="searchAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.30" />
                <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.02" />
            </linearGradient>
            <filter id="searchGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <path d="${dArea}" fill="url(#searchAreaGrad)" />
        <path d="${dLine}" fill="none" stroke="url(#searchLineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#searchGlow)" />
        ${points.map(p => {
            const bg = p.bar.style.background || '';
            let dotColor = '#0284c7';
            let dotRadius = 4;
            if (bg.includes('4ade80') || bg.includes('green') || bg.includes('rgb(74, 222, 128)')) {
                dotColor = '#10b981';
                dotRadius = 7;
            } else if (bg.includes('38bdf8') || bg.includes('blue') || bg.includes('rgb(56, 189, 248)')) {
                dotColor = '#f59e0b';
                dotRadius = 6;
            }
            return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotRadius}" fill="${dotColor}" stroke="#ffffff" stroke-width="2" />`;
        }).join('')}
    `;
}

function renderArrayBars(values, highlight = [], foundIndex = -1) {
    const container = document.getElementById('bars');
    if (!container) return;
    container.innerHTML = '';
    container.className = `flex-container mode-${currentViewMode}`;

    const maxVal = Math.max(...values, 100);

    values.forEach((value, index) => {
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('bar-wrapper');

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(value, 1) * 2}px`;
        bar.style.setProperty('--spectrum-hue', `${getSpectrumHue(value, maxVal)}deg`);
        bar.textContent = value;
        bar.style.background = '#22d3ee';

        if (highlight.includes(index)) {
            bar.style.background = '#38bdf8';
        }
        if (index === foundIndex) {
            bar.style.background = '#4ade80';
        }

        const label = document.createElement('span');
        label.classList.add('bar-label');
        label.textContent = value;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        container.appendChild(barWrapper);
    });

    setVisualizerViewMode(currentViewMode);
}

function displaySearchResult(message) {
    const resultEl = document.getElementById('search-result');
    resultEl.textContent = message;
}

const HISTORY_STORAGE_KEY = 'algoLearnSearchHistory';

function getLocalHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (err) {
        console.warn('Unable to load search history:', err);
        return [];
    }
}

function setLocalHistory(history) {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
        console.warn('Unable to save search history:', err);
    }
}

function appendLocalHistory(entry) {
    const history = getLocalHistory();
    history.unshift(entry);
    setLocalHistory(history.slice(0, 20));
}

function renderHistory(history) {
    const historyBody = document.querySelector('#history-body');
    if (!historyBody) return;
    historyBody.innerHTML = '';
    history.forEach(item => {
        const timeComplexity = item.time_complexity || 'N/A';
        const spaceComplexity = item.space_complexity || 'N/A';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.created_at).toLocaleString()}</td>
            <td>${item.algorithm}</td>
            <td>${item.size}</td>
            <td>${timeComplexity}</td>
            <td>${spaceComplexity}</td>
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
        const response = await fetch('/api/history', { method: 'DELETE' });
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
    link.download = 'search-history.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function restoreSessionArray(historyItem) {
    const values = historyItem.array_data || historyItem.array || [];
    if (!Array.isArray(values) || !values.length) return;
    array = values.map(value => Number(value));
    renderArrayBars(array);
    arrayInput.value = array.join(', ');
    displaySearchResult(`Restored array from history. Select an algorithm to search.`);
}

function updateInputErrors(arrayValid, targetValid) {
    const arrayErrorEl = document.getElementById('array-error');
    const targetErrorEl = document.getElementById('target-error');
    arrayErrorEl.classList.toggle('d-none', arrayValid);
    targetErrorEl.classList.toggle('d-none', targetValid);
}

let array = [];
let delay = 240;
let arrayInput;
let searchInput;
let loadArrayButton;
let generateArrayButton;
let linearSearchBtn;
let binarySearchBtn;
let speedInput;
let clearHistoryBtn;
let downloadHistoryBtn;

function getSearchTarget() {
    const targetValue = searchInput.value.trim();
    if (targetValue === '') return null;
    const parsed = Number(targetValue);
    return Number.isNaN(parsed) ? null : parsed;
}

function createRandomArray(length = 20) {
    const values = [];
    for (let i = 0; i < length; i++) {
        values.push(Math.floor(Math.random() * 90) + 1);
    }
    return values;
}

function loadArrayFromInput() {
    const values = parseUserArray(arrayInput.value);
    updateInputErrors(values !== null, true);
    if (!values) return false;
    array = values;
    renderArrayBars(array);
    displaySearchResult('Array loaded. Enter a target and choose an algorithm.');
    return true;
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveHistory(algorithm, arrayValues, durationMs) {
    const info = SEARCH_COMPLEXITIES[algorithm] || { time: 'N/A', space: 'N/A' };
    const entry = {
        algorithm,
        array_data: arrayValues,
        size: arrayValues.length,
        duration_ms: Number(durationMs),
        time_complexity: info.time,
        space_complexity: info.space,
        created_at: new Date().toISOString()
    };

    appendLocalHistory(entry);
    try {
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                algorithm,
                array: arrayValues,
                size: arrayValues.length,
                duration: Number(durationMs),
                time_complexity: info.time,
                space_complexity: info.space
            })
        });
        if (!response.ok) throw new Error(`History API returned ${response.status}`);
    } catch (error) {
        console.warn('Could not save history to backend, using local storage instead:', error);
    }

    fetchHistory();
}

async function runLinearSearch() {
    if (arrayInput.value.trim().length > 0 && !loadArrayFromInput()) return;
    const target = getSearchTarget();
    if (target === null) {
        updateInputErrors(true, false);
        displaySearchResult('Please enter a valid target number before searching.');
        return;
    }
    setComplexityInfo('Linear Search');
    displaySearchResult('Searching for target using Linear Search...');
    setSearchExplanation('Linear Search');
    linearSearchBtn.disabled = true;
    binarySearchBtn.disabled = true;
    StepTracker.reset();
    StepTracker.logPhase(`Linear Search for Target ${target}`);
    const startTime = Date.now();
    let foundIndex = -1;
    for (let i = 0; i < array.length; i++) {
        renderArrayBars(array, [i]);
        const isMatch = array[i] === target;
        StepTracker.logInspect(i, array[i], target, isMatch);
        await wait(delay);
        if (isMatch) {
            foundIndex = i;
            renderArrayBars(array, [i], i);
            displaySearchResult(`Target found at index ${i}.`);
            break;
        }
    }
    if (foundIndex === -1) {
        renderArrayBars(array);
        displaySearchResult('Target not found.');
    }
    StepTracker.logPhase(foundIndex >= 0 ? `Target Found at Index ${foundIndex}` : 'Target Not Found');
    const duration = Date.now() - startTime;
    await saveHistory('Linear Search', array, duration);
    linearSearchBtn.disabled = false;
    binarySearchBtn.disabled = false;
}

async function runBinarySearch() {
    if (arrayInput.value.trim().length > 0 && !loadArrayFromInput()) return;
    const target = getSearchTarget();
    if (target === null) {
        updateInputErrors(true, false);
        displaySearchResult('Please enter a valid target number before searching.');
        return;
    }
    setComplexityInfo('Binary Search');
    displaySearchResult('Searching for target using Binary Search...');
    setSearchExplanation('Binary Search');
    linearSearchBtn.disabled = true;
    binarySearchBtn.disabled = true;
    StepTracker.reset();

    const sortedArray = [...array].sort((a, b) => a - b);
    array = sortedArray;
    renderArrayBars(array);
    StepTracker.logPhase(`Binary Search for Target ${target}`);
    const startTime = Date.now();
    await wait(delay);

    let low = 0;
    let high = array.length - 1;
    let foundIndex = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        renderArrayBars(array, [mid]);
        const isMatch = array[mid] === target;
        StepTracker.logInspect(mid, array[mid], target, isMatch);
        await wait(delay);
        if (isMatch) {
            foundIndex = mid;
            break;
        }
        StepTracker.logSplit(low, mid, high, array[mid], target);
        if (array[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (foundIndex >= 0) {
        renderArrayBars(array, [foundIndex], foundIndex);
        displaySearchResult(`Target found at index ${foundIndex} in the sorted array.`);
        StepTracker.logPhase(`Target Found at Index ${foundIndex}`);
    } else {
        renderArrayBars(array);
        displaySearchResult('Target not found in the sorted array.');
        StepTracker.logPhase('Target Not Found');
    }
    const duration = Date.now() - startTime;
    await saveHistory('Binary Search', array, duration);
    linearSearchBtn.disabled = false;
    binarySearchBtn.disabled = false;
}

window.addEventListener('DOMContentLoaded', () => {
    arrayInput = document.getElementById('array_input');
    searchInput = document.getElementById('search_value');
    loadArrayButton = document.querySelector('.loadArrayButton');
    generateArrayButton = document.querySelector('.generateArray');
    linearSearchBtn = document.querySelector('.linearSearch');
    binarySearchBtn = document.querySelector('.binarySearch');
    speedInput = document.getElementById('speed_input');
    clearHistoryBtn = document.querySelector('.clearHistoryBtn');
    downloadHistoryBtn = document.querySelector('.downloadHistoryBtn');

    if (generateArrayButton) {
        generateArrayButton.addEventListener('click', () => {
            array = createRandomArray(20);
            arrayInput.value = array.join(', ');
            searchInput.value = '';
            renderArrayBars(array);
            displaySearchResult('Random array generated. Enter a target and choose an algorithm.');
            updateInputErrors(true, true);
        });
    }

    if (loadArrayButton) {
        loadArrayButton.addEventListener('click', () => {
            if (loadArrayFromInput()) {
                updateInputErrors(true, true);
            }
        });
    }

    if (speedInput) {
        speedInput.addEventListener('input', () => {
            delay = 320 - Number(speedInput.value);
        });
    }

    if (linearSearchBtn) linearSearchBtn.addEventListener('click', runLinearSearch);
    if (binarySearchBtn) binarySearchBtn.addEventListener('click', runBinarySearch);

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            await clearHistory();
            fetchHistory();
        });
    }

    if (downloadHistoryBtn) {
        downloadHistoryBtn.addEventListener('click', downloadHistory);
    }

    // View Mode Switcher buttons
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
            if (generateArrayButton) generateArrayButton.click();
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
            if (linearSearchBtn && !linearSearchBtn.disabled) {
                linearSearchBtn.click();
            }
        }
    });

    array = createRandomArray(20);
    if (arrayInput) arrayInput.value = array.join(', ');
    renderArrayBars(array);
    displaySearchResult('Load an array or use a random one. Enter a target and select a search method.');
    fetchHistory();
});
