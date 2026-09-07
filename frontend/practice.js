const practiceSets = {
    bubble: {
        title: 'Bubble Sort Practice',
        summary: 'Work through questions that reinforce how repeated passes and swaps order a list.',
        questions: [
            {
                q: 'Explain why Bubble Sort is useful for nearly sorted arrays. What happens to the list if the first pass makes no swaps?',
                hint: 'If a pass completes with 0 swaps, the array is already sorted. With an early-exit flag, Bubble Sort finishes in O(n) linear time.'
            },
            {
                q: 'Describe a case where Bubble Sort performs best and one where it performs worst. What changes in the number of comparisons and swaps?',
                hint: 'Best case: already sorted array (O(n) comparisons, 0 swaps). Worst case: reverse-sorted array (O(n²) comparisons and O(n²) swaps).'
            },
            {
                q: 'Given the array [5, 1, 4, 2, 8], what will the list look like after the first full pass?',
                hint: 'Pass 1 swaps: (5,1)->[1,5,4,2,8], (5,4)->[1,4,5,2,8], (5,2)->[1,4,2,5,8], (5,8)->no swap. Result: [1, 4, 2, 5, 8]. The largest element (8) is in its final position.'
            }
        ]
    },
    selection: {
        title: 'Selection Sort Practice',
        summary: 'Practice identifying minimum values and moving them to build the sorted section of the array.',
        questions: [
            {
                q: 'Why does Selection Sort perform the same number of comparisons no matter the input order?',
                hint: 'It always scans the entire remaining unsorted prefix from i+1 to n-1 to be certain it found the global minimum.'
            },
            {
                q: 'If the input is [29, 10, 14, 37, 13], what element is selected in the second pass and where does it move?',
                hint: 'After pass 1: [10, 29, 14, 37, 13]. In pass 2, the minimum of [29, 14, 37, 13] is 13. 13 is swapped with 29 at index 1 -> [10, 13, 14, 37, 29].'
            },
            {
                q: 'Explain one situation where Selection Sort can be preferred over Bubble Sort.',
                hint: 'When memory write operations are extremely expensive compared to reads, because Selection Sort guarantees at most O(n) swaps.'
            }
        ]
    },
    insertion: {
        title: 'Insertion Sort Practice',
        summary: 'Work on questions that highlight shifting values and inserting elements into a sorted prefix.',
        questions: [
            {
                q: 'How does Insertion Sort behave on an already sorted array, and why is that the best case?',
                hint: 'For each element, it only checks the immediate left neighbor once and makes 0 shifts, giving O(n) best-case complexity.'
            },
            {
                q: 'For the array [8, 3, 5, 2, 7], walk through the steps of inserting the number 5 into the sorted prefix.',
                hint: 'Sorted prefix before 5 is [3, 8]. 5 is compared to 8 (8 shifts right -> [3, 8, 8]), then compared to 3 (3 < 5, so 5 is placed at index 1 -> [3, 5, 8]).'
            },
            {
                q: 'Why is Insertion Sort considered stable, and how does that affect equal elements?',
                hint: 'Equal elements are never shifted past each other because elements are only shifted when strictly greater (arr[j] > key).'
            }
        ]
    },
    quick: {
        title: 'Quick Sort Practice',
        summary: 'Answer questions about pivot choice, partitioning, and the recursive nature of Quick Sort.',
        questions: [
            {
                q: 'What makes a good pivot selection strategy, and why does bad pivot choice hurt performance?',
                hint: 'A good pivot divides the array into roughly equal halves (e.g. median-of-three). A poor pivot (like smallest/largest) leads to O(n²) worst-case recursion depth.'
            },
            {
                q: 'Describe the partition result for the array [8, 4, 7, 3, 10, 5] using pivot 5.',
                hint: 'Values < 5 move to the left ([4, 3]), 5 is placed in between, and values > 5 move right ([8, 7, 10]). Partition result: [4, 3, 5, 8, 10, 7].'
            },
            {
                q: 'Why is Quick Sort usually faster than Bubble Sort on large arrays?',
                hint: 'Quick Sort has O(n log n) average time complexity compared to O(n²) for Bubble Sort, meaning drastically fewer total comparisons on large datasets.'
            }
        ]
    },
    merge: {
        title: 'Merge Sort Practice',
        summary: 'Practice splitting and merging arrays and understanding why Merge Sort is stable.',
        questions: [
            {
                q: 'Why does Merge Sort require additional space, and how does merging happen after splitting?',
                hint: 'Merging requires an auxiliary array of size O(n) to store sorted merged halves before copying back to the original array.'
            },
            {
                q: 'What are the sorted subarrays when splitting [6, 2, 9, 1, 3, 8] until individual elements remain?',
                hint: 'Splits down to [6], [2], [9] and [1], [3], [8]. Then merges to [2, 6], [9] -> [2, 6, 9] and [1, 3], [8] -> [1, 3, 8], finally merging to [1, 2, 3, 6, 8, 9].'
            },
            {
                q: 'Explain why Merge Sort guarantees O(n log n) runtime regardless of input order.',
                hint: 'The recursion tree always has log₂(n) levels, and each level performs exactly O(n) work during the merge phase.'
            }
        ]
    },
    heap: {
        title: 'Heap Sort Practice',
        summary: 'Answer questions about heap construction and repeated root extraction to sort the array.',
        questions: [
            {
                q: 'What is the purpose of building a max heap before sorting, and how is the root used?',
                hint: 'A max heap ensures the maximum element is at index 0 (root). Swapping the root with the end places the largest remaining element in its final sorted position.'
            },
            {
                q: 'In Heap Sort, what happens after swapping the root with the last element?',
                hint: 'The heap size is decreased by 1, and heapify/siftDown is called on the new root to restore the max-heap property in O(log n) time.'
            },
            {
                q: 'Why is Heap Sort not stable, even though it sorts in place?',
                hint: 'Parent-child index swaps during heapify can rearrange identical values out of their original relative order.'
            }
        ]
    },
    linear: {
        title: 'Linear Search Practice',
        summary: 'Practice describing sequential search and when it is the right choice.',
        questions: [
            {
                q: 'Why does Linear Search work on unsorted arrays, and how many comparisons are needed in the worst case?',
                hint: 'Because it checks every element sequentially without assuming any prior ordering. In the worst case (target at end or absent), it requires n comparisons.'
            },
            {
                q: 'If the target is the last element in [7, 2, 9, 4, 3], how many steps will Linear Search take?',
                hint: 'It will check indices 0, 1, 2, 3, and 4 — requiring exactly 5 comparisons.'
            },
            {
                q: 'When is Linear Search a better choice than Binary Search?',
                hint: 'When data is unsorted and sorting it first would take O(n log n), or when the dataset is very small.'
            }
        ]
    },
    binary: {
        title: 'Binary Search Practice',
        summary: 'Work through how narrowing the search range finds values in sorted data quickly.',
        questions: [
            {
                q: 'Why does Binary Search require a sorted array before it begins?',
                hint: 'It relies on the property that elements to the left of mid are strictly smaller and elements to the right are strictly larger.'
            },
            {
                q: 'Describe the range of values examined when searching for 7 in [1, 3, 4, 7, 9].',
                hint: 'low=0, high=4 -> mid=2 (val=4). Since 7 > 4, search right half (low=3, high=4). Next mid=3 (val=7). Target found in 2 steps!'
            },
            {
                q: 'How does Binary Search detect that a target is not present in the array?',
                hint: 'When low > high, the search window has collapsed to empty, indicating the target is absent.'
            }
        ]
    },
    bfs: {
        title: 'Breadth-First Search (BFS) Practice',
        summary: 'Practice BFS questions about level order traversal and shortest path behavior in unweighted graphs.',
        questions: [
            {
                q: 'Why does BFS use a queue, and what does it guarantee about the order nodes are visited?',
                hint: 'A FIFO queue ensures nodes are processed in order of increasing distance (depth level) from the start node.'
            },
            {
                q: 'How would BFS explore the neighbors of node A in a graph with edges A-B, A-C, and B-D?',
                hint: 'Starts at A, enqueues B and C. Then visits B and enqueues D, then visits C, and finally visits D. Traversal order: A, B, C, D.'
            },
            {
                q: 'What type of problem is BFS especially good for solving?',
                hint: 'Finding the shortest path in unweighted graphs, finding connected components, and level-order tree traversals.'
            }
        ]
    },
    dfs: {
        title: 'Depth-First Search (DFS) Practice',
        summary: 'Answer questions on depth-first paths, recursion, and backtracking.',
        questions: [
            {
                q: 'Why can DFS be implemented with either recursion or a stack?',
                hint: 'Recursion naturally utilizes the program call stack (LIFO), which behaves identically to an explicit stack data structure.'
            },
            {
                q: 'If DFS starts at A in a graph with neighbors A-B, A-C, and B-D, which branch does it explore first?',
                hint: 'It explores A -> B -> D to the end of the branch before backtracking to explore neighbor C.'
            },
            {
                q: 'What is the main difference between DFS and BFS in terms of discovery order?',
                hint: 'BFS explores layer by layer (shallowest first), while DFS dives deep along one path until reaching a dead end.'
            }
        ]
    },
    kruskal: {
        title: "Kruskal's Algorithm Practice",
        summary: 'Practice describing edge selection, cycle avoidance, and building a minimum spanning tree.',
        questions: [
            {
                q: 'Why does Kruskal sort edges by weight before selecting them?',
                hint: 'It is a greedy algorithm: picking the smallest available edge weights first guarantees a minimum total spanning tree weight.'
            },
            {
                q: 'What is the role of the Disjoint Set (Union-Find) data structure in Kruskal’s algorithm?',
                hint: 'It efficiently tests if two vertices belong to the same connected component in nearly O(1) time to prevent forming cycles.'
            },
            {
                q: 'How does Kruskal avoid creating cycles while building the MST?',
                hint: 'Before adding edge (u, v), it checks if Find(u) === Find(v). If equal, adding the edge would close a cycle, so it is skipped.'
            }
        ]
    },
    dijkstra: {
        title: "Dijkstra's Algorithm Practice",
        summary: 'Work through questions on shortest path updating and non-negative weighted graphs.',
        questions: [
            {
                q: 'Why does Dijkstra require non-negative edge weights?',
                hint: 'Negative weights can reduce the shortest path after a node has already been marked finalized, invalidating the greedy choice.'
            },
            {
                q: 'What happens when a shorter path to a neighbor is found during Dijkstra relaxation?',
                hint: 'The distance to that neighbor is updated: dist[v] = dist[u] + weight(u, v), and the updated distance is pushed into the priority queue.'
            },
            {
                q: 'For a graph with source node 0, how are initial distances set before the algorithm begins?',
                hint: 'dist[0] = 0, and dist[all other nodes] = Infinity.'
            }
        ]
    }
};

function renderPracticeQuestions(key) {
    const set = practiceSets[key] || practiceSets.bubble;
    const titleEl = document.getElementById('practice-title');
    const summaryEl = document.getElementById('practice-summary');
    const questionsEl = document.getElementById('practice-questions');
    const openButton = document.getElementById('open-tutorial');

    if (titleEl) titleEl.textContent = set.title;
    if (summaryEl) summaryEl.textContent = set.summary;
    if (!questionsEl) return;
    questionsEl.innerHTML = '';

    set.questions.forEach((item, index) => {
        const questionText = typeof item === 'string' ? item : item.q;
        const hintText = typeof item === 'object' ? item.hint : 'Review the algorithm tutorial page for detailed step-by-step logic.';
        
        const card = document.createElement('div');
        card.className = 'card card-custom p-3 mb-3 bg-white';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge-sky">Question ${index + 1}</span>
            </div>
            <p class="fw-semibold text-sky-900 mb-2">${questionText}</p>
            <div class="mt-2">
                <button type="button" class="btn btn-sky-subtle btn-sm toggle-hint-btn">
                    <i class="bi bi-lightbulb-fill"></i> Show Solution Hint
                </button>
                <div class="hint-box p-3 mt-2 bg-sky-50 border-sky rounded-3 d-none text-muted-custom small">
                    <strong class="text-sky-900 d-block mb-1">Key Concept / Answer:</strong>
                    ${hintText}
                </div>
            </div>
        `;

        const toggleBtn = card.querySelector('.toggle-hint-btn');
        const hintBox = card.querySelector('.hint-box');
        toggleBtn.addEventListener('click', () => {
            const isHidden = hintBox.classList.contains('d-none');
            if (isHidden) {
                hintBox.classList.remove('d-none');
                toggleBtn.innerHTML = '<i class="bi bi-eye-slash-fill"></i> Hide Solution Hint';
            } else {
                hintBox.classList.add('d-none');
                toggleBtn.innerHTML = '<i class="bi bi-lightbulb-fill"></i> Show Solution Hint';
            }
        });

        questionsEl.appendChild(card);
    });

    if (openButton) {
        openButton.onclick = () => {
            window.location.href = `algorithm-details.html?algo=${key}`;
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('practice_algo');
    if (!select) return;

    const urlParams = new URLSearchParams(window.location.search);
    const initialAlgo = urlParams.get('algo');
    if (initialAlgo && practiceSets[initialAlgo]) {
        select.value = initialAlgo;
    }

    renderPracticeQuestions(select.value);
    select.addEventListener('change', () => renderPracticeQuestions(select.value));
});
