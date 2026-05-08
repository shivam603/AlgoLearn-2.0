const practiceSets = {
    bubble: {
        title: 'Bubble Sort Practice',
        summary: 'Work through questions that reinforce how repeated passes and swaps order a list.',
        questions: [
            'Explain why Bubble Sort is useful for nearly sorted arrays. What happens to the list if the first pass makes no swaps?',
            'Describe a case where Bubble Sort performs best and one where it performs worst. What changes in the number of comparisons?',
            'Given the array [5, 1, 4, 2, 8], what will the list look like after the first full pass?'
        ]
    },
    selection: {
        title: 'Selection Sort Practice',
        summary: 'Practice identifying minimum values and moving them to build the sorted section of the array.',
        questions: [
            'Why does Selection Sort perform the same number of comparisons no matter the input order?',
            'If the input is [29, 10, 14, 37, 13], what element is selected in the second pass and where does it move?',
            'Explain one situation where Selection Sort can be preferred over Bubble Sort.'
        ]
    },
    insertion: {
        title: 'Insertion Sort Practice',
        summary: 'Work on questions that highlight shifting values and inserting elements into a sorted prefix.',
        questions: [
            'How does Insertion Sort behave on an already sorted array, and why is that the best case?',
            'For the array [8, 3, 5, 2, 7], walk through the steps of inserting the number 5 into the sorted prefix.',
            'Why is Insertion Sort considered stable, and how does that affect equal elements?'
        ]
    },
    quick: {
        title: 'Quick Sort Practice',
        summary: 'Answer questions about pivot choice, partitioning, and the recursive nature of Quick Sort.',
        questions: [
            'What makes a good pivot selection strategy, and why does bad pivot choice hurt performance?',
            'Describe the partition result for the array [8, 4, 7, 3, 10, 5] using pivot 5.',
            'Why is Quick Sort usually faster than Bubble Sort on large arrays?'
        ]
    },
    merge: {
        title: 'Merge Sort Practice',
        summary: 'Practice splitting and merging arrays and understanding why Merge Sort is stable.',
        questions: [
            'Why does Merge Sort require additional space, and how does merging happen after splitting?',
            'What are the sorted subarrays when splitting [6, 2, 9, 1, 3, 8] until individual elements remain?',
            'Explain why Merge Sort guarantees O(n log n) runtime regardless of input order.'
        ]
    },
    heap: {
        title: 'Heap Sort Practice',
        summary: 'Answer questions about heap construction and repeated root extraction to sort the array.',
        questions: [
            'What is the purpose of building a max heap before sorting, and how is the root used?',
            'In Heap Sort, what happens after swapping the root with the last element?',
            'Why is Heap Sort not stable, even though it sorts in place?'
        ]
    },
    linear: {
        title: 'Linear Search Practice',
        summary: 'Practice describing sequential search and when it is the right choice.',
        questions: [
            'Why does Linear Search work on unsorted arrays, and how many comparisons are needed in the worst case?',
            'If the target is the last element in [7, 2, 9, 4, 3], how many steps will Linear Search take?',
            'When is Linear Search a better choice than Binary Search?'
        ]
    },
    binary: {
        title: 'Binary Search Practice',
        summary: 'Work through how narrowing the search range finds values in sorted data quickly.',
        questions: [
            'Why does Binary Search require a sorted array before it begins?',
            'Describe the range of values examined when searching for 7 in [1, 3, 4, 7, 9].',
            'How does Binary Search change when the target is not present in the array?'
        ]
    },
    bfs: {
        title: 'Breadth-First Search Practice',
        summary: 'Practice BFS questions about level order traversal and shortest path behavior in unweighted graphs.',
        questions: [
            'Why does BFS use a queue, and what does it guarantee about the order nodes are visited?',
            'How would BFS explore the neighbors of node A in a graph with edges A-B, A-C, and B-D?',
            'What type of problem is BFS especially good for solving?'
        ]
    },
    dfs: {
        title: 'Depth-First Search Practice',
        summary: 'Answer questions on depth-first paths, recursion, and backtracking.',
        questions: [
            'Why can DFS be implemented with either recursion or a stack?',
            'If DFS starts at A in a graph with neighbors A-B, A-C, and B-D, which branch does it explore first?',
            'What is the main difference between DFS and BFS in terms of discovery order?'
        ]
    },
    kruskal: {
        title: 'Kruskal Practice',
        summary: 'Practice describing edge selection, cycle avoidance, and building a minimum spanning tree.',
        questions: [
            'Why does Kruskal sort edges by weight before selecting them?',
            'What is the role of the disjoint set or union-find structure in Kruskal’s algorithm?',
            'How does Kruskal avoid creating cycles while building the MST?'
        ]
    },
    dijkstra: {
        title: 'Dijkstra Practice',
        summary: 'Work through questions on shortest path updating and non-negative weighted graphs.',
        questions: [
            'Why does Dijkstra require non-negative edge weights?',
            'What happens when a shorter path to a node is found during the algorithm?',
            'For a graph with source node 0, how are initial distances set before the algorithm begins?'
        ]
    }
};

function renderPracticeQuestions(key) {
    const set = practiceSets[key] || practiceSets.bubble;
    const titleEl = document.getElementById('practice-title');
    const summaryEl = document.getElementById('practice-summary');
    const questionsEl = document.getElementById('practice-questions');
    const openButton = document.getElementById('open-tutorial');

    titleEl.textContent = set.title;
    summaryEl.textContent = set.summary;
    questionsEl.innerHTML = '';

    set.questions.forEach((question, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item bg-dark border-secondary rounded-3 mb-3';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h3 class="h6 text-white mb-2">Question ${index + 1}</h3>
                    <p class="text-secondary mb-0">${question}</p>
                </div>
            </div>
        `;
        questionsEl.appendChild(item);
    });

    openButton.onclick = () => {
        window.location.href = `algorithm-details.html?algo=${key}`;
    };
}

window.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('practice_algo');
    if (!select) return;

    renderPracticeQuestions(select.value);
    select.addEventListener('change', () => renderPracticeQuestions(select.value));
});
