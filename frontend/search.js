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

function renderArrayBars(values, highlight = [], foundIndex = -1) {
    const container = document.getElementById('bars');
    container.innerHTML = '';

    values.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(value, 1) * 2}px`;
        bar.textContent = value;
        bar.style.background = '#22d3ee';

        if (highlight.includes(index)) {
            bar.style.background = '#38bdf8';
        }
        if (index === foundIndex) {
            bar.style.background = '#4ade80';
        }

        container.appendChild(bar);
    });
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
    const startTime = Date.now();
    let foundIndex = -1;
    for (let i = 0; i < array.length; i++) {
        renderArrayBars(array, [i]);
        await wait(delay);
        if (array[i] === target) {
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
    const startTime = Date.now();

    const sortedArray = [...array].sort((a, b) => a - b);
    array = sortedArray;
    renderArrayBars(array);
    await wait(delay);

    let low = 0;
    let high = array.length - 1;
    let foundIndex = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        renderArrayBars(array, [mid]);
        await wait(delay);
        if (array[mid] === target) {
            foundIndex = mid;
            break;
        }
        if (array[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (foundIndex >= 0) {
        renderArrayBars(array, [foundIndex], foundIndex);
        displaySearchResult(`Target found at index ${foundIndex} in the sorted array.`);
    } else {
        renderArrayBars(array);
        displaySearchResult('Target not found in the sorted array.');
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

    array = createRandomArray(20);
    if (arrayInput) arrayInput.value = array.join(', ');
    renderArrayBars(array);
    displaySearchResult('Load an array or use a random one. Enter a target and select a search method.');
    fetchHistory();
});
