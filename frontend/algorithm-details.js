const algorithmData = {
    bubble: {
        title: 'Bubble Sort',
        summary: 'Bubble Sort repeatedly compares adjacent elements and swaps them when they are out of order. It is easy to understand and ideal for learning sorting behavior.',
        description: '<p><strong>What it is:</strong> Bubble Sort is a simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent pairs, and swaps them if they are in the wrong order.</p>',
        details: '<p><strong>How it works:</strong> The algorithm makes multiple passes through the array. During each pass, it compares neighboring values and swaps when needed. Larger elements move toward the end of the list with each pass, and the process continues until the array is sorted.</p>',
        pseudocode: 'for i from 0 to n-2:\n  for j from 0 to n-i-2:\n    if arr[j] > arr[j+1] then\n      swap(arr[j], arr[j+1])',
        time: 'O(n²)',
        space: 'O(1)',
        example: '[5, 2, 9, 1, 5, 6]',
        usecase: 'Good for educational purposes, nearly sorted arrays, and when memory usage must stay minimal.',
        dryRun: [
            { label: 'Start', values: [5, 2, 9, 1, 5, 6], highlight: [0, 1], note: 'Compare 5 and 2, swap because 5 > 2.' },
            { label: 'After swap', values: [2, 5, 9, 1, 5, 6], highlight: [1, 2], note: 'Compare 5 and 9, no swap.' },
            { label: 'Mid pass', values: [2, 5, 1, 9, 5, 6], highlight: [2, 3], note: 'Swap 9 and 1 so the larger element moves right.' },
            { label: 'Pass end', values: [2, 5, 1, 5, 6, 9], highlight: [4, 5], note: 'Largest value 9 is now in its final position at the end.' }
        ]
    },
    selection: {
        title: 'Selection Sort',
        summary: 'Selection Sort builds the sorted subarray by repeatedly selecting the minimum element from the unsorted portion.',
        description: '<p><strong>What it is:</strong> Selection Sort is a sorting algorithm that divides the array into a sorted and unsorted region. It repeatedly selects the smallest element from the unsorted part and moves it to the sorted portion.</p>',
        details: '<p><strong>How it works:</strong> On each iteration, the algorithm scans the remaining unsorted values to find the smallest element. It then swaps that smallest value with the element at the current boundary between the sorted and unsorted sections.</p>',
        pseudocode: 'for i from 0 to n-2:\n  minIndex = i\n  for j from i+1 to n-1:\n    if arr[j] < arr[minIndex] then\n      minIndex = j\n  swap(arr[i], arr[minIndex])',
        time: 'O(n²)',
        space: 'O(1)',
        example: '[29, 10, 14, 37, 13]',
        usecase: 'Useful when memory writes are expensive and simple code is preferred over maximum speed.',
        dryRun: [
            { label: 'Start', values: [29, 10, 14, 37, 13], highlight: [0, 1], note: 'Find minimum in the unsorted section starting at index 0.' },
            { label: 'Select min', values: [10, 29, 14, 37, 13], highlight: [0, 1], note: 'Swap 10 into the first sorted position.' },
            { label: 'Next pass', values: [10, 29, 14, 37, 13], highlight: [1, 2], note: 'Find minimum in the remaining unsorted section.' },
            { label: 'After swap', values: [10, 13, 14, 37, 29], highlight: [1, 4], note: 'Place the smallest remaining value at index 1.' }
        ]
    },
    insertion: {
        title: 'Insertion Sort',
        summary: 'Insertion Sort builds a sorted list one element at a time by inserting each new element into the correct place.',
        description: '<p><strong>What it is:</strong> Insertion Sort is a sorting algorithm that takes one element at a time and inserts it into the correct position inside a growing sorted section.</p>',
        details: '<p><strong>How it works:</strong> Starting from the second element, the algorithm compares it with elements in the sorted left portion. If it is smaller, the algorithm shifts larger elements to the right until it finds the right place to insert the current element.</p>',
        pseudocode: 'for i from 1 to n-1:\n  key = arr[i]\n  j = i - 1\n  while j >= 0 and arr[j] > key:\n    arr[j+1] = arr[j]\n    j = j - 1\n  arr[j+1] = key',
        time: 'O(n²)',
        space: 'O(1)',
        example: '[8, 3, 5, 2, 7]',
        usecase: 'Great for small inputs and partially sorted arrays. It is stable and straightforward to implement.',
        dryRun: [
            { label: 'Start', values: [8, 3, 5, 2, 7], highlight: [1], note: 'Insert 3 into the sorted prefix [8].' },
            { label: 'Shift', values: [8, 8, 5, 2, 7], highlight: [0, 1], note: 'Shift 8 right to make room for 3.' },
            { label: 'Insert', values: [3, 8, 5, 2, 7], highlight: [0], note: 'Place 3 in the correct position.' },
            { label: 'Sorted prefix', values: [3, 5, 8, 2, 7], highlight: [2], note: 'Next, insert 5 into the sorted prefix [3, 8].' }
        ]
    },
    quick: {
        title: 'Quick Sort',
        summary: 'Quick Sort is a divide-and-conquer algorithm that partitions the array around a pivot and sorts the halves recursively.',
        description: '<p><strong>What it is:</strong> Quick Sort is a fast comparison-based sorting algorithm that picks a pivot element and partitions the array around it.</p>',
        details: '<p><strong>How it works:</strong> The algorithm chooses a pivot, then moves all smaller elements to one side and larger elements to the other. After partitioning, it recursively sorts the left and right halves until the entire array is sorted.</p>',
        pseudocode: 'function quickSort(arr, low, high):\n  if low < high:\n    pivotIndex = partition(arr, low, high)\n    quickSort(arr, low, pivotIndex-1)\n    quickSort(arr, pivotIndex+1, high)',
        time: 'O(n log n) average',
        space: 'O(log n)',
        example: '[8, 4, 7, 3, 10, 5]',
        usecase: 'Excellent for large datasets and general-purpose sorting when implemented with good pivot selection.',
        dryRun: [
            { label: 'Start', values: [8, 4, 7, 3, 10, 5], highlight: [5], note: 'Choose pivot 5 at the end of the array.' },
            { label: 'Partition', values: [4, 3, 5, 8, 10, 7], highlight: [0, 2], note: 'Move values smaller than pivot to the left.' },
            { label: 'Partition result', values: [4, 3, 5, 8, 10, 7], highlight: [2], note: 'Pivot is now in its final position.' }
        ]
    },
    merge: {
        title: 'Merge Sort',
        summary: 'Merge Sort divides the array into halves, sorts each half, and then merges them back together.',
        description: '<p><strong>What it is:</strong> Merge Sort is a divide-and-conquer sorting algorithm that breaks the list into smaller pieces and merges them in order.</p>',
        details: '<p><strong>How it works:</strong> The array is split into two halves repeatedly until each segment contains a single element. Then these segments are merged back together in sorted order until the entire array is rebuilt as a sorted list.</p>',
        pseudocode: 'function mergeSort(arr):\n  if length(arr) <= 1: return arr\n  mid = length(arr) / 2\n  left = mergeSort(arr[0:mid])\n  right = mergeSort(arr[mid:])\n  return merge(left, right)',
        time: 'O(n log n)',
        space: 'O(n)',
        example: '[6, 2, 9, 1, 3, 8]',
        usecase: 'Use when stable sorting and predictable performance are needed, such as sorting linked lists or large datasets.',
        dryRun: [
            { label: 'Split', values: [6, 2, 9, 1, 3, 8], note: 'Divide the array into smaller subarrays recursively.' },
            { label: 'Sort halves', values: [2, 6, 1, 9, 3, 8], note: 'Sort left and right halves independently.' },
            { label: 'Merge', values: [1, 2, 3, 6, 8, 9], note: 'Merge sorted halves into a fully sorted array.' }
        ]
    },
    heap: {
        title: 'Heap Sort',
        summary: 'Heap Sort builds a heap and repeatedly extracts the top element to sort the array in place.',
        description: '<p><strong>What it is:</strong> Heap Sort is an in-place algorithm that uses a binary heap data structure to order elements.</p>',
        details: '<p><strong>How it works:</strong> The algorithm first arranges the array into a max heap, then repeatedly swaps the heap root with the last element and reduces the heap size. It restores the heap after each swap until the array is sorted.</p>',
        pseudocode: 'buildMaxHeap(arr)\nfor end from n-1 down to 1:\n  swap(arr[0], arr[end])\n  siftDown(arr, 0, end-1)',
        time: 'O(n log n)',
        space: 'O(1)',
        example: '[4, 10, 3, 5, 1]',
        usecase: 'Useful for in-place sorting of large arrays when stability is not a priority.',
        dryRun: [
            { label: 'Heapify', values: [10, 5, 3, 4, 1], note: 'Transform the array into a max heap.' },
            { label: 'Extract max', values: [4, 5, 3, 1, 10], note: 'Swap the largest value to the end.' },
            { label: 'Final sorted', values: [1, 3, 4, 5, 10], note: 'Repeat heapify and extraction until sorted.' }
        ]
    },
    linear: {
        title: 'Linear Search',
        summary: 'Linear Search scans each element in the list until it finds the target or reaches the end.',
        description: '<p><strong>What it is:</strong> Linear Search is a simple search algorithm that checks each item one by one until it finds the target.</p>',
        details: '<p><strong>How it works:</strong> Starting at the beginning of the array, it compares each value to the target. If a match is found, it stops; if not, it moves to the next item and keeps checking until the end.</p>',
        pseudocode: 'for i from 0 to n-1:\n  if arr[i] == target then\n    return i\nreturn -1',
        time: 'O(n)',
        space: 'O(1)',
        example: '[7, 2, 9, 4, 3] target = 4',
        usecase: 'Best for small arrays, unsorted datasets, or one-off searches when building a faster index is not worth the cost.',
        dryRun: [
            { label: 'Start', values: [7, 2, 9, 4, 3], highlight: [0], note: 'Check the first element 7 against target 4.' },
            { label: 'Continue', values: [7, 2, 9, 4, 3], highlight: [1], note: 'Check the second element 2, still not a match.' },
            { label: 'Match found', values: [7, 2, 9, 4, 3], highlight: [3], note: 'Found target value 4 at index 3.' }
        ]
    },
    binary: {
        title: 'Binary Search',
        summary: 'Binary Search finds a target in a sorted list by cutting the search range in half repeatedly.',
        description: '<p><strong>What it is:</strong> Binary Search is an efficient search algorithm for sorted data that repeatedly halves the search range.</p>',
        details: '<p><strong>How it works:</strong> The algorithm compares the target with the middle element of the current range. If the target is smaller, it searches the left half; if larger, it searches the right half. This process repeats until the target is found or the range is empty.</p>',
        pseudocode: 'low = 0\nhigh = n-1\nwhile low <= high:\n  mid = floor((low + high) / 2)\n  if arr[mid] == target then\n    return mid\n  else if arr[mid] < target then\n    low = mid + 1\n  else\n    high = mid - 1\nreturn -1',
        time: 'O(log n)',
        space: 'O(1)',
        example: '[1, 3, 4, 7, 9] target = 7',
        usecase: 'Ideal for searching sorted data quickly, such as looking up values in a database or array where order is already guaranteed.',
        dryRun: [
            { label: 'Initial range', values: [1, 3, 4, 7, 9], highlight: [2], note: 'Check the middle value 4 against target 7.' },
            { label: 'Right half', values: [1, 3, 4, 7, 9], highlight: [3], note: 'Target is larger, so search the right half.' },
            { label: 'Found', values: [1, 3, 4, 7, 9], highlight: [3], note: 'Middle value 7 matches the target; return index 3.' }
        ]
    },
    bfs: {
        title: 'Breadth-First Search (BFS)',
        summary: 'Breadth-First Search traverses a graph level by level, exploring all neighbors before moving deeper.',
        description: '<p><strong>What it is:</strong> Breadth-First Search (BFS) is a graph traversal algorithm that visits nodes in order of their distance from the start node.</p>',
        details: '<p><strong>How it works:</strong> BFS uses a queue to explore the graph. It starts at the source node, enqueues its neighbors, and processes nodes in the order they were discovered. This guarantees that nodes are visited in increasing distance from the start.</p>',
        pseudocode: 'queue = [start]\nvisited[start] = true\nwhile queue is not empty:\n  node = dequeue(queue)\n  for each neighbor in node.neighbors:\n    if not visited[neighbor] then\n      visited[neighbor] = true\n      enqueue(queue, neighbor)',
        time: 'O(V + E)',
        space: 'O(V)',
        example: 'Graph edges: A-B, A-C, B-D, C-E, D-F',
        usecase: 'Great for finding the shortest path in unweighted graphs and for level-order traversal of tree-like structures.',
        dryRun: [
            { label: 'Start', values: ['A'], highlight: [0], note: 'Begin from source node A and enqueue its neighbors.' },
            { label: 'Visit B', values: ['B', 'C'], highlight: [0], note: 'Process A then visit neighbor B first.' },
            { label: 'Visit C', values: ['C', 'D'], highlight: [0], note: 'Then visit neighbor C and enqueue its unvisited neighbors.' }
        ]
    },
    dfs: {
        title: 'Depth-First Search (DFS)',
        summary: 'Depth-First Search explores as far as possible along each branch before backtracking.',
        description: '<p><strong>What it is:</strong> Depth-First Search (DFS) is a graph traversal algorithm that follows one path to its end before exploring alternate branches.</p>',
        details: '<p><strong>How it works:</strong> DFS uses a stack or recursion to dive deep into the graph. Starting from the source, it visits a neighbor, then continues from that neighbor until it reaches a dead end, then backtracks and explores remaining neighbors.</p>',
        pseudocode: 'stack = [start]\nvisited[start] = true\nwhile stack is not empty:\n  node = pop(stack)\n  for each neighbor in node.neighbors:\n    if not visited[neighbor] then\n      visited[neighbor] = true\n      push(stack, neighbor)',
        time: 'O(V + E)',
        space: 'O(V)',
        example: 'Graph edges: A-B, A-C, B-D, C-E, D-F',
        usecase: 'Ideal for pathfinding, cycle detection, and exploring all possible paths in graphs or mazes.',
        dryRun: [
            { label: 'Start', values: ['A'], highlight: [0], note: 'Begin at node A and push it onto the stack.' },
            { label: 'Go deep', values: ['B', 'D'], highlight: [1], note: 'Visit a neighbor and continue deeper before exploring other branches.' },
            { label: 'Backtrack', values: ['C'], highlight: [0], note: 'When a dead end is found, backtrack to explore remaining neighbors.' }
        ]
    },
    kruskal: {
        title: "Kruskal's Algorithm",
        summary: 'Kruskal builds a minimum spanning tree by selecting the smallest edges while avoiding cycles.',
        description: '<p><strong>What it is:</strong> Kruskal’s Algorithm finds a minimum spanning tree for a weighted undirected graph by picking the lowest-weight edges first.</p>',
        details: '<p><strong>How it works:</strong> It sorts all graph edges by weight, then adds edges one by one. Each edge is included only if it connects two previously disconnected components, which avoids cycles and preserves the minimum total weight.</p>',
        pseudocode: 'sort edges by weight\nfor each edge in sorted edges:\n  if find(edge.u) != find(edge.v):\n    union(edge.u, edge.v)\n    add edge to MST',
        time: 'O(E log E)',
        space: 'O(E)',
        example: 'Graph edges: A-B(4), A-C(2), B-C(3), B-D(5), C-D(4)',
        usecase: 'Ideal for building minimum spanning trees in networks where edges can be processed in weight order.',
        dryRun: [
            { label: 'Start', values: ['A-B(4)', 'A-C(2)', 'B-C(3)', 'B-D(5)', 'C-D(4)'], note: 'Sort edges by weight before selecting them.' },
            { label: 'Pick smallest', values: ['A-C(2)', 'B-C(3)', 'A-B(4)', 'C-D(4)'], note: 'Add edges while avoiding cycles.' },
            { label: 'Final MST', values: ['A-C(2)', 'B-C(3)', 'C-D(4)'], note: 'Selected edges connect all nodes with minimum total weight.' }
        ]
    },
    dijkstra: {
        title: "Dijkstra's Algorithm",
        summary: 'Dijkstra finds the shortest path from a source node to every other node in a graph with non-negative weights.',
        description: '<p><strong>What it is:</strong> Dijkstra’s Algorithm is a graph search method that computes the shortest path from a starting node to all other reachable nodes in a weighted graph with non-negative edge costs.</p>',
        details: '<p><strong>How it works:</strong> It begins with the source node at distance 0 and all other nodes at infinity. The algorithm repeatedly visits the unvisited node with the smallest known distance, then updates the distances of its neighbors if a shorter path is found.</p>',
        pseudocode: 'initialize distances to infinity except source = 0\nwhile unvisited nodes remain:\n  u = node with smallest distance\n  for each neighbor v of u:\n    if distance[u] + weight(u,v) < distance[v]:\n      distance[v] = distance[u] + weight(u,v)',
        time: 'O(E + V log V)',
        space: 'O(V)',
        example: 'Graph with nodes 0-3 and edges: 0-1(4), 0-2(1), 2-1(2), 1-3(1), 2-3(5)',
        usecase: 'Use for shortest-path problems on weighted graphs with non-negative edge costs, such as routing and pathfinding.',
        dryRun: [
            { label: 'Initial distances', values: ['0:0', '1:∞', '2:∞', '3:∞'], note: 'Only source node has a known distance at first.' },
            { label: 'Update neighbors', values: ['0:0', '1:4', '2:1', '3:∞'], note: 'Relax edges from source node 0.' },
            { label: 'Next step', values: ['0:0', '1:3', '2:1', '3:4'], note: 'Relaxes neighbors through node 2 and then node 1.' }
        ]
    }
};

function getQueryParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

const algorithmInfo = {
    bubble: { category: 'Sorting', stable: 'Yes', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    selection: { category: 'Sorting', stable: 'No', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    insertion: { category: 'Sorting', stable: 'Yes', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    quick: { category: 'Sorting', stable: 'No', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    merge: { category: 'Sorting', stable: 'Yes', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    heap: { category: 'Sorting', stable: 'No', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    linear: { category: 'Search', stable: 'N/A', best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    binary: { category: 'Search', stable: 'N/A', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    bfs: { category: 'Graph', stable: 'N/A', best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    dfs: { category: 'Graph', stable: 'N/A', best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    kruskal: { category: 'Graph', stable: 'N/A', best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
    dijkstra: { category: 'Graph', stable: 'N/A', best: 'O(E + V log V)', average: 'O(E + V log V)', worst: 'O(E + V log V)' }
};

const algorithmCodeSnippets = {
    bubble: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let swapped = false;
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Optimization
  }
  return arr;
}`,
    selection: `function selectionSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;
    }
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
}`,
    insertion: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    quick: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
    merge: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  while (left.length && right.length) {
    result.push(left[0] < right[0] ? left.shift() : right.shift());
  }
  return [...result, ...left, ...right];
}`,
    heap: `function heapSort(arr) {
  buildMaxHeap(arr);
  for (let end = arr.length - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, 0, end - 1);
  }
  return arr;
}`,
    linear: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i; // Target index
  }
  return -1; // Not found
}`,
    binary: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    bfs: `function breadthFirstSearch(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of (graph[node] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
    dfs: `function depthFirstSearch(graph, start, visited = new Set()) {
  visited.add(start);
  for (const neighbor of (graph[start] || [])) {
    if (!visited.has(neighbor)) {
      depthFirstSearch(graph, neighbor, visited);
    }
  }
  return Array.from(visited);
}`,
    kruskal: `function kruskal(edges, nodes) {
  edges.sort((a, b) => a.weight - b.weight);
  const forest = new DisjointSet(nodes);
  const mst = [];
  for (const edge of edges) {
    if (forest.find(edge.u) !== forest.find(edge.v)) {
      forest.union(edge.u, edge.v);
      mst.push(edge);
    }
  }
  return mst;
}`,
    dijkstra: `function dijkstra(graph, source) {
  const dist = {};
  const visited = new Set();
  for (const node in graph) dist[node] = Infinity;
  dist[source] = 0;

  while (Object.keys(graph).length !== visited.size) {
    const unvisited = Object.keys(dist).filter(n => !visited.has(n));
    if (!unvisited.length) break;
    const current = unvisited.reduce((a, b) => (dist[a] < dist[b] ? a : b));
    visited.add(current);
    for (const neighbor of graph[current]) {
      const next = dist[current] + neighbor.weight;
      if (next < dist[neighbor.node]) dist[neighbor.node] = next;
    }
  }
  return dist;
}`
};

function renderArrayBars(values, highlight = []) {
    const container = document.createElement('div');
    container.className = 'diagram-array my-2';

    values.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'diagram-bar';
        if (highlight.includes(index)) {
            bar.classList.add('diagram-highlight');
        }
        bar.textContent = value;
        container.appendChild(bar);
    });

    return container;
}

function renderDryRun(dryRunSteps) {
    const container = document.createElement('div');
    container.className = 'diagram-panel';

    dryRunSteps.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = 'diagram-step mb-3';
        
        const header = document.createElement('div');
        header.className = 'd-flex align-items-center gap-2 mb-1';
        header.innerHTML = `<span class="badge-sky" style="font-size:0.75rem;">Step ${index + 1}</span> <strong class="text-sky-900">${step.label}</strong>`;
        item.appendChild(header);

        item.appendChild(renderArrayBars(step.values, step.highlight || []));
        
        const note = document.createElement('p');
        note.className = 'text-muted-custom small mb-0 mt-1';
        note.textContent = step.note;
        item.appendChild(note);
        
        container.appendChild(item);
    });

    return container;
}

function renderAlgorithm() {
    const key = getQueryParameter('algo') || 'bubble';
    const algo = algorithmData[key];
    const titleEl = document.getElementById('algo-title');
    const summaryEl = document.getElementById('algo-summary');
    const descEl = document.getElementById('algo-description');
    const detailsEl = document.getElementById('algo-details');
    const pseudocodeEl = document.getElementById('algo-pseudocode');
    const dryrunEl = document.getElementById('algo-dryrun');
    const timeEl = document.getElementById('algo-time');
    const spaceEl = document.getElementById('algo-space');
    const exampleEl = document.getElementById('algo-example');
    const usecaseEl = document.getElementById('algo-usecase');
    const infoEl = document.getElementById('algo-info');
    const codeEl = document.getElementById('algo-code');
    const practiceLink = document.getElementById('algo-practice-link');
    const visualizerLink = document.getElementById('algo-visualizer-link');

    if (!algo) {
        if (titleEl) titleEl.textContent = 'Algorithm not found';
        if (summaryEl) summaryEl.textContent = 'Please choose a valid topic from the home page.';
        if (descEl) descEl.textContent = 'The selected algorithm does not exist. Use the navigation panel to open a supported algorithm tutorial.';
        return;
    }

    if (titleEl) titleEl.textContent = algo.title;
    if (summaryEl) summaryEl.textContent = algo.summary;
    if (descEl) descEl.innerHTML = algo.description;
    if (detailsEl) detailsEl.innerHTML = algo.details;
    if (pseudocodeEl) pseudocodeEl.textContent = algo.pseudocode;
    if (dryrunEl) {
        dryrunEl.innerHTML = '';
        dryrunEl.appendChild(renderDryRun(algo.dryRun));
    }
    if (timeEl) timeEl.textContent = algo.time;
    if (spaceEl) spaceEl.textContent = algo.space;
    if (exampleEl) exampleEl.textContent = algo.example;
    if (usecaseEl) usecaseEl.textContent = algo.usecase;
    if (codeEl) codeEl.textContent = algorithmCodeSnippets[key] || 'Example code is available in the documentation.';
    
    // Set dynamic visualizer target
    if (visualizerLink) {
        if (['bubble', 'selection', 'insertion', 'quick', 'merge', 'heap'].includes(key)) {
            visualizerLink.href = 'visualize-sorting.html';
            visualizerLink.innerHTML = '<i class="bi bi-play-circle-fill"></i> <span>Launch Sorting Visualizer</span>';
        } else if (['linear', 'binary'].includes(key)) {
            visualizerLink.href = 'visualize-search.html';
            visualizerLink.innerHTML = '<i class="bi bi-search"></i> <span>Launch Search Visualizer</span>';
        } else {
            visualizerLink.href = 'visualize-graph.html';
            visualizerLink.innerHTML = '<i class="bi bi-diagram-3-fill"></i> <span>Launch Graph Visualizer</span>';
        }
    }

    if (practiceLink) {
        practiceLink.href = `practice.html?algo=${key}`;
    }

    if (infoEl) {
        const info = algorithmInfo[key] || {};
        infoEl.innerHTML = `
            <table class="table-custom">
                <tbody>
                    <tr><td class="text-muted-custom">Category</td><td><strong>${info.category || 'N/A'}</strong></td></tr>
                    <tr><td class="text-muted-custom">Stability</td><td><strong>${info.stable || 'N/A'}</strong></td></tr>
                    <tr><td class="text-muted-custom">Best Case</td><td><span class="badge-sky">${info.best || '—'}</span></td></tr>
                    <tr><td class="text-muted-custom">Average Case</td><td><span class="badge-sky">${info.average || '—'}</span></td></tr>
                    <tr><td class="text-muted-custom">Worst Case</td><td><span class="badge-sky">${info.worst || '—'}</span></td></tr>
                </tbody>
            </table>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderAlgorithm();

    const copyBtn = document.getElementById('copy-code-btn');
    const codeEl = document.getElementById('algo-code');
    if (copyBtn && codeEl) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeEl.textContent).then(() => {
                copyBtn.innerHTML = '<i class="bi bi-check2"></i> <span>Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> <span>Copy Code</span>';
                }, 2000);
            });
        });
    }
});
