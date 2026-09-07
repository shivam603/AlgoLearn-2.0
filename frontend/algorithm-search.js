const algorithmLibrary = [
    {
        key: 'bubble',
        title: 'Bubble Sort',
        category: 'Sorting',
        summary: 'A simple comparison-based sort that repeatedly swaps adjacent elements until the array is ordered.',
        time: 'O(n²)',
        space: 'O(1)',
        usecase: 'Great for learning how sorting works and for very small or nearly sorted arrays.',
        keywords: 'swap adjacent simple learning'
    },
    {
        key: 'selection',
        title: 'Selection Sort',
        category: 'Sorting',
        summary: 'Finds the minimum element in the unsorted portion and moves it into sorted order repeatedly.',
        time: 'O(n²)',
        space: 'O(1)',
        usecase: 'Useful when a small number of writes are preferred over speed.',
        keywords: 'minimum element scan simple'
    },
    {
        key: 'insertion',
        title: 'Insertion Sort',
        category: 'Sorting',
        summary: 'Builds a sorted subarray one element at a time by shifting values into place.',
        time: 'O(n²)',
        space: 'O(1)',
        usecase: 'Best for small arrays and partially sorted data.',
        keywords: 'insert shift stable adaptive'
    },
    {
        key: 'quick',
        title: 'Quick Sort',
        category: 'Sorting',
        summary: 'A divide-and-conquer sort that partitions elements around a pivot and sorts each side recursively.',
        time: 'O(n log n) avg',
        space: 'O(log n)',
        usecase: 'Excellent for general-purpose sorting with good pivot selection.',
        keywords: 'partition pivot recursive'
    },
    {
        key: 'merge',
        title: 'Merge Sort',
        category: 'Sorting',
        summary: 'A stable divide-and-conquer sort that splits the array and merges sorted halves.',
        time: 'O(n log n)',
        space: 'O(n)',
        usecase: 'Strong choice when stable sort and predictable performance are required.',
        keywords: 'merge stable divide and conquer'
    },
    {
        key: 'heap',
        title: 'Heap Sort',
        category: 'Sorting',
        summary: 'Uses a heap data structure to repeatedly extract the largest value and build the sorted list.',
        time: 'O(n log n)',
        space: 'O(1)',
        usecase: 'Good for in-place sorting when stability is not required.',
        keywords: 'heap tree priority queue'
    },
    {
        key: 'linear',
        title: 'Linear Search',
        category: 'Search',
        summary: 'Checks each element in sequence until the target is found or the list ends.',
        time: 'O(n)',
        space: 'O(1)',
        usecase: 'Useful for unsorted collections or one-time searches.',
        keywords: 'scan sequential simple'
    },
    {
        key: 'binary',
        title: 'Binary Search',
        category: 'Search',
        summary: 'Efficient search for sorted arrays that halves the search range each step.',
        time: 'O(log n)',
        space: 'O(1)',
        usecase: 'Perfect for quickly locating items in sorted data.',
        keywords: 'halving sorted divide'
    },
    {
        key: 'bfs',
        title: 'Breadth-First Search',
        category: 'Graph',
        summary: 'Traverses a graph level by level using a queue to explore nodes in order of distance.',
        time: 'O(V + E)',
        space: 'O(V)',
        usecase: 'Great for shortest path search in unweighted graphs.',
        keywords: 'queue levels traversal'
    },
    {
        key: 'dfs',
        title: 'Depth-First Search',
        category: 'Graph',
        summary: 'Explores as far as possible along each path before backtracking.',
        time: 'O(V + E)',
        space: 'O(V)',
        usecase: 'Useful for exploring paths, cycle detection, and backtracking problems.',
        keywords: 'stack recursion explore'
    },
    {
        key: 'kruskal',
        title: "Kruskal's Algorithm",
        category: 'Graph',
        summary: 'Builds a minimum spanning tree by selecting the smallest edges while avoiding cycles.',
        time: 'O(E log E)',
        space: 'O(E)',
        usecase: 'Ideal for computing MSTs in weighted undirected graphs.',
        keywords: 'mst minimum spanning tree'
    },
    {
        key: 'dijkstra',
        title: "Dijkstra's Algorithm",
        category: 'Graph',
        summary: 'Finds shortest paths from a source node to all others in a weighted graph with non-negative edges.',
        time: 'O(E + V log V)',
        space: 'O(V)',
        usecase: 'Used for pathfinding and routing in weighted graphs.',
        keywords: 'shortest path weights priority'
    }
];

function normalizeQuery(query) {
    return query.trim().toLowerCase();
}

function buildResultCard(algo) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'btn text-start p-3 bg-white border rounded-3 w-100 mb-2 shadow-sm transition-fast';
    item.style.borderColor = 'var(--border-subtle)';
    item.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h3 class="h6 fw-bold mb-1 text-sky-900">${algo.title}</h3>
                <p class="mb-1 text-muted-custom small">${algo.summary}</p>
                <span class="badge-tag">${algo.category}</span>
            </div>
            <span class="badge-sky">${algo.time}</span>
        </div>
    `;
    item.addEventListener('mouseenter', () => {
        item.style.borderColor = 'var(--sky-400)';
        item.style.backgroundColor = 'var(--sky-50)';
    });
    item.addEventListener('mouseleave', () => {
        item.style.borderColor = 'var(--border-subtle)';
        item.style.backgroundColor = '#ffffff';
    });
    item.addEventListener('click', () => {
        showAlgorithmPreview(algo);
    });
    return item;
}

function renderSearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const countLabel = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';
    if (!results.length) {
        if (countLabel) countLabel.textContent = '0 algorithms found';
        if (noResults) noResults.classList.remove('d-none');
        return;
    }

    if (countLabel) countLabel.textContent = `${results.length} algorithm${results.length === 1 ? '' : 's'} found`;
    if (noResults) noResults.classList.add('d-none');

    results.forEach(algo => {
        resultsContainer.appendChild(buildResultCard(algo));
    });
}

function showAlgorithmPreview(algo) {
    const preview = document.getElementById('algo-preview');
    const previewTitle = document.getElementById('preview-title');
    const previewSummary = document.getElementById('preview-summary');
    const previewCategory = document.getElementById('preview-category');
    const previewKeywords = document.getElementById('preview-keywords');
    const previewTime = document.getElementById('preview-time');
    const previewSpace = document.getElementById('preview-space');
    const previewUsecase = document.getElementById('preview-usecase');
    const openButton = document.getElementById('open-details-btn');
    const previewTarget = document.getElementById('preview-target');

    if (!preview || !previewTitle) return;

    previewTitle.textContent = algo.title;
    previewSummary.textContent = algo.summary;
    previewCategory.textContent = algo.category;
    previewKeywords.textContent = `Keywords: ${algo.keywords}`;
    previewTime.textContent = algo.time;
    previewSpace.textContent = algo.space;
    previewUsecase.textContent = algo.usecase;
    openButton.onclick = () => window.location.href = `algorithm-details.html?algo=${algo.key}`;
    if (previewTarget) previewTarget.classList.add('d-none');
    preview.classList.remove('d-none');
}

function filterAlgorithms(query) {
    if (!query) return algorithmLibrary;
    const normalized = normalizeQuery(query);
    return algorithmLibrary.filter(algo => {
        const combined = `${algo.title} ${algo.category} ${algo.summary} ${algo.keywords}`.toLowerCase();
        return combined.includes(normalized);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search_query');
    const headerSearchInput = document.getElementById('header_search_input');
    
    // Check if query param exists
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    if (initialQuery) {
        if (input) input.value = initialQuery;
        if (headerSearchInput) headerSearchInput.value = initialQuery;
        const initialResults = filterAlgorithms(initialQuery);
        renderSearchResults(initialResults);
        if (initialResults.length > 0) {
            showAlgorithmPreview(initialResults[0]);
        }
    } else {
        renderSearchResults(algorithmLibrary);
        if (algorithmLibrary.length > 0) {
            showAlgorithmPreview(algorithmLibrary[0]);
        }
    }

    if (input) {
        input.addEventListener('input', () => {
            const results = filterAlgorithms(input.value);
            renderSearchResults(results);
            if (headerSearchInput) headerSearchInput.value = input.value;
        });
    }

    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', () => {
            const value = headerSearchInput.value;
            if (input) input.value = value;
            const results = filterAlgorithms(value);
            renderSearchResults(results);
        });
    }
});