// swap function util for sorting algorithms takes input of 2 DOM elements with .style.height feature
function swap(el1, el2) {
    console.log('In swap()');

    let temp = el1.style.height;
    el1.style.height = el2.style.height;
    el2.style.height = temp;

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
    const entry = {
        algorithm,
        array_data: arrayValues,
        size: arrayValues.length,
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
                array: arrayValues,
                size: arrayValues.length,
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

// DOM references will be initialized when the page is ready
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
}

function renderArrayBars(values) {
    deleteChild();
    const bars = document.querySelector('#bars');
    values.forEach((value, i) => {
        const barWrapper = document.createElement('div');
        barWrapper.classList.add('bar-wrapper');

        const bar = document.createElement('div');
        bar.style.height = `${value * 2}px`;
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

// Default input for waitforme function (260ms)
let delay = 260;

// Creating array to store randomly generated numbers
let array = [];

window.addEventListener('DOMContentLoaded', () => {
    initializeSortingPage();
    createNewArray();
    fetchHistory();
});

// To create new array input size of array
function createNewArray(noOfBars = 60) {
    // calling helper function to delete old bars from dom
    arrayInput.value = '';
    arrayError.classList.add('d-none');
    deleteChild();

    // creating an array of random numbers 
    array = [];
    for (let i = 0; i < noOfBars; i++) {
        array.push(Math.floor(Math.random() * 250) + 1);
    }
    console.log(array);
    renderArrayBars(array);
}

// Helper function to delete all the previous bars so that new can be added
function deleteChild() {
    const bar = document.querySelector("#bars");
    bar.innerHTML = '';
}
