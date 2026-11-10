/**
 * AlgoMuse AI — Conversational Senior Programming & DSA Mentor Brain
 * Provides rich, human-like dialogue, deep DSA intuitions, code diagnostics,
 * Socratic hints, and technical interview roadmaps.
 */

const ALGORITHM_KNOWLEDGE = {
    'bubble_sort': {
        name: 'Bubble Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1) auxiliary',
        stable: true,
        inPlace: true,
        visualizerUrl: 'visualize-sorting.html?algo=bubble',
        summary: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        javaTemplate: [
            'public void bubbleSort(int[] arr) {',
            '    int n = arr.length;',
            '    boolean swapped;',
            '    for (int i = 0; i < n - 1; i++) {',
            '        swapped = false;',
            '        for (int j = 0; j < n - i - 1; j++) {',
            '            if (arr[j] > arr[j + 1]) {',
            '                int temp = arr[j];',
            '                arr[j] = arr[j + 1];',
            '                arr[j + 1] = temp;',
            '                swapped = true;',
            '            }',
            '        }',
            '        if (!swapped) break; // Optimized early exit',
            '    }',
            '}'
        ].join('\n')
    },
    'quick_sort': {
        name: 'Quick Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
        spaceComplexity: 'O(log n) call stack',
        stable: false,
        inPlace: true,
        visualizerUrl: 'visualize-sorting.html?algo=quick',
        summary: 'Picks an element as pivot and partitions the array around the picked pivot, placing smaller elements to the left and larger to the right.',
        javaTemplate: [
            'public void quickSort(int[] arr, int low, int high) {',
            '    if (low < high) {',
            '        int pi = partition(arr, low, high);',
            '        quickSort(arr, low, pi - 1);',
            '        quickSort(arr, pi + 1, high);',
            '    }',
            '}',
            'private int partition(int[] arr, int low, int high) {',
            '    int pivot = arr[high];',
            '    int i = low - 1;',
            '    for (int j = low; j < high; j++) {',
            '        if (arr[j] < pivot) {',
            '            i++;',
            '            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;',
            '        }',
            '    }',
            '    int t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t;',
            '    return i + 1;',
            '}'
        ].join('\n')
    },
    'merge_sort': {
        name: 'Merge Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(n) auxiliary',
        stable: true,
        inPlace: false,
        visualizerUrl: 'visualize-sorting.html?algo=merge',
        summary: 'Divide and conquer algorithm that splits array into two halves, recursively sorts them, and merges the two sorted halves.',
        javaTemplate: [
            'public void mergeSort(int[] arr, int l, int r) {',
            '    if (l < r) {',
            '        int m = l + (r - l) / 2;',
            '        mergeSort(arr, l, m);',
            '        mergeSort(arr, m + 1, r);',
            '        merge(arr, l, m, r);',
            '    }',
            '}'
        ].join('\n')
    },
    'insertion_sort': {
        name: 'Insertion Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1) auxiliary',
        stable: true,
        inPlace: true,
        visualizerUrl: 'visualize-sorting.html?algo=insertion',
        summary: 'Builds sorted array one element at a time by repeatedly taking the next element and inserting it into its correct position.',
        javaTemplate: [
            'public void insertionSort(int[] arr) {',
            '    for (int i = 1; i < arr.length; i++) {',
            '        int key = arr[i];',
            '        int j = i - 1;',
            '        while (j >= 0 && arr[j] > key) {',
            '            arr[j + 1] = arr[j];',
            '            j--;',
            '        }',
            '        arr[j + 1] = key;',
            '    }',
            '}'
        ].join('\n')
    },
    'selection_sort': {
        name: 'Selection Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1) auxiliary',
        stable: false,
        inPlace: true,
        visualizerUrl: 'visualize-sorting.html?algo=selection',
        summary: 'Repeatedly finds minimum element from unsorted part and puts it at the beginning.',
        javaTemplate: [
            'public void selectionSort(int[] arr) {',
            '    int n = arr.length;',
            '    for (int i = 0; i < n - 1; i++) {',
            '        int minIdx = i;',
            '        for (int j = i + 1; j < n; j++) {',
            '            if (arr[j] < arr[minIdx]) minIdx = j;',
            '        }',
            '        int temp = arr[minIdx];',
            '        arr[minIdx] = arr[i];',
            '        arr[i] = temp;',
            '    }',
            '}'
        ].join('\n')
    },
    'heap_sort': {
        name: 'Heap Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(1) auxiliary',
        stable: false,
        inPlace: true,
        visualizerUrl: 'visualize-sorting.html?algo=heap',
        summary: 'Comparison-based sorting algorithm based on Binary Heap data structure.',
        javaTemplate: [
            'public void heapSort(int[] arr) {',
            '    int n = arr.length;',
            '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);',
            '    for (int i = n - 1; i > 0; i--) {',
            '        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;',
            '        heapify(arr, i, 0);',
            '    }',
            '}'
        ].join('\n')
    },
    'binary_search': {
        name: 'Binary Search',
        category: 'Searching',
        timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
        spaceComplexity: 'O(1) iterative',
        visualizerUrl: 'visualize-search.html?algo=binary',
        summary: 'Search algorithm that finds the position of a target value within a sorted array by halving the search space each step.',
        javaTemplate: [
            'public int binarySearch(int[] arr, int target) {',
            '    int left = 0, right = arr.length - 1;',
            '    while (left <= right) {',
            '        int mid = left + (right - left) / 2;',
            '        if (arr[mid] == target) return mid;',
            '        if (arr[mid] < target) left = mid + 1;',
            '        else right = mid - 1;',
            '    }',
            '    return -1;',
            '}'
        ].join('\n')
    },
    'dijkstra': {
        name: "Dijkstra's Shortest Path",
        category: 'Graph Algorithms',
        timeComplexity: { best: 'O(E + V log V)', average: 'O((V + E) log V)', worst: 'O(V²)' },
        spaceComplexity: 'O(V) auxiliary',
        visualizerUrl: 'visualize-graph.html?algo=dijkstra',
        summary: 'Finds the shortest paths from a single source node to all other nodes in a weighted graph with non-negative edge weights.',
        javaTemplate: [
            'public int[] dijkstra(int V, List<List<int[]>> adj, int src) {',
            '    int[] dist = new int[V];',
            '    Arrays.fill(dist, Integer.MAX_VALUE);',
            '    dist[src] = 0;',
            '    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));',
            '    pq.offer(new int[]{src, 0});',
            '    while (!pq.isEmpty()) {',
            '        int[] curr = pq.poll();',
            '        int u = curr[0], d = curr[1];',
            '        if (d > dist[u]) continue;',
            '        for (int[] edge : adj.get(u)) {',
            '            int v = edge[0], weight = edge[1];',
            '            if (dist[u] + weight < dist[v]) {',
            '                dist[v] = dist[u] + weight;',
            '                pq.offer(new int[]{v, dist[v]});',
            '            }',
            '        }',
            '    }',
            '    return dist;',
            '}'
        ].join('\n')
    },
    'bfs': {
        name: 'Breadth-First Search (BFS)',
        category: 'Graph & Tree Traversals',
        timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
        spaceComplexity: 'O(V) for queue and visited set',
        visualizerUrl: 'visualize-graph.html?algo=bfs',
        summary: 'Traverses or searches tree or graph data structures level by level using a Queue (FIFO). Guaranteed to find shortest unweighted path.',
        javaTemplate: [
            'public void bfs(int startNode, List<List<Integer>> adj, int V) {',
            '    boolean[] visited = new boolean[V];',
            '    Queue<Integer> queue = new LinkedList<>();',
            '    visited[startNode] = true;',
            '    queue.offer(startNode);',
            '    while (!queue.isEmpty()) {',
            '        int u = queue.poll();',
            '        System.out.print(u + " ");',
            '        for (int neighbor : adj.get(u)) {',
            '            if (!visited[neighbor]) {',
            '                visited[neighbor] = true;',
            '                queue.offer(neighbor);',
            '            }',
            '        }',
            '    }',
            '}'
        ].join('\n')
    },
    'dfs': {
        name: 'Depth-First Search (DFS)',
        category: 'Graph & Tree Traversals',
        timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
        spaceComplexity: 'O(V) recursion stack',
        visualizerUrl: 'visualize-graph.html?algo=dfs',
        summary: 'Explores as far as possible along each branch before backtracking using a Stack or recursion.',
        javaTemplate: [
            'public void dfs(int u, List<List<Integer>> adj, boolean[] visited) {',
            '    visited[u] = true;',
            '    System.out.print(u + " ");',
            '    for (int v : adj.get(u)) {',
            '        if (!visited[v]) dfs(v, adj, visited);',
            '    }',
            '}'
        ].join('\n')
    },
    'fibonacci_dp': {
        name: 'Fibonacci Dynamic Programming',
        category: 'Dynamic Programming',
        timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
        spaceComplexity: 'O(1) space-optimized',
        visualizerUrl: 'visualize-dp.html?algo=fib',
        summary: 'Solves Fibonacci sequence in linear time using bottom-up tabulation, avoiding redundant recursive calls.',
        javaTemplate: [
            'public int fib(int n) {',
            '    if (n <= 1) return n;',
            '    int prev2 = 0, prev1 = 1;',
            '    for (int i = 2; i <= n; i++) {',
            '        int curr = prev1 + prev2;',
            '        prev2 = prev1;',
            '        prev1 = curr;',
            '    }',
            '    return prev1;',
            '}'
        ].join('\n')
    },
    'n_queens': {
        name: 'N-Queens Backtracking',
        category: 'Backtracking',
        timeComplexity: { best: 'O(N!)', average: 'O(N!)', worst: 'O(N!)' },
        spaceComplexity: 'O(N) board state',
        visualizerUrl: 'visualize-backtracking.html?algo=nqueens',
        summary: 'Places N non-attacking queens on an N×N chessboard using recursive depth-first backtracking.',
        javaTemplate: [
            'public List<List<String>> solveNQueens(int n) {',
            '    List<List<String>> solutions = new ArrayList<>();',
            '    char[][] board = new char[n][n];',
            '    for (char[] row : board) Arrays.fill(row, \'.\');',
            '    backtrack(0, board, solutions, n);',
            '    return solutions;',
            '}'
        ].join('\n')
    }
};

/**
 * Generates an empathetic, human-like mentor response.
 */
async function generateConversationalResponse(messages, context = {}, toolResults = [], executeToolRunCode, executeToolGetHint) {
    const lastMessage = messages[messages.length - 1];
    const userText = (lastMessage ? lastMessage.content : '').trim();
    const lower = userText.toLowerCase();

    // 0. Agentic Visualizer Action Detection (e.g. "visualize quick sort on [42, 7, 19, 3, 28]")
    if (lower.includes('visualize') || lower.includes('animate') || lower.includes('launch') || lower.includes('watch')) {
        const sortMap = {
            'bubble': 'bubble',
            'selection': 'selection',
            'insertion': 'insertion',
            'quick': 'quick',
            'merge': 'merge',
            'heap': 'heap'
        };
        const matchedSort = Object.keys(sortMap).find(k => lower.includes(k));
        if (matchedSort) {
            const arrMatch = userText.match(/\[([\d,\s]+)\]/);
            const nums = arrMatch
                ? arrMatch[1].split(/[,\s]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0)
                : [42, 12, 85, 23, 64, 9, 51, 30];
            const actionJson = JSON.stringify({
                type: 'visualize',
                category: 'sorting',
                algo: sortMap[matchedSort],
                array: nums,
                label: `Launch ${matchedSort.charAt(0).toUpperCase() + matchedSort.slice(1)} Sort on [${nums.join(', ')}]`
            });
            return `Let's watch **${matchedSort.toUpperCase()} Sort** execute live step-by-step on \`[${nums.join(', ')}]\`!\n\nClick the button below to load these exact values into the Sorting Visualizer and start the animation:\n\n[[ALGOAI_ACTION:${actionJson}]]`;
        }
    }

    // 1. Live Code Execution & Debugging
    const codeMatch = userText.match(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/) || (context.activeCode ? [null, context.activeLanguage || 'java', context.activeCode] : null);
    if (codeMatch && (lower.includes('debug') || lower.includes('run') || lower.includes('error') || lower.includes('why') || lower.includes('fix') || lower.includes('test') || lower.includes('check'))) {
        const detectedLang = codeMatch[1] || context.activeLanguage || 'java';
        const detectedCode = codeMatch[2] || context.activeCode;
        if (detectedCode && detectedCode.length > 5) {
            const exec = await executeToolRunCode(detectedCode, detectedLang);
            toolResults.push(exec);
            let executionOutput = '';
            if (exec.hasError) {
                executionOutput = `\n\n> 🔍 **Live Sandbox Diagnostic**:\n> Compiler/Runtime Output:\n\`\`\`\n${exec.stderr || 'Execution failed'}\n\`\`\``;
            } else if (exec.stdout) {
                executionOutput = `\n\n> 🚀 **Live Sandbox Output** (${exec.language}):\n\`\`\`\n${exec.stdout}\n\`\`\``;
            }
            return `### 🛠️ Let's Debug This Together! (${detectedLang.toUpperCase()})${executionOutput}

Looking closely at your snippet:
1. **Edge Cases & Bounds**: Double-check zero-length arrays, null pointers, and fencepost conditions (\`i < length\` vs \`i <= length\`).
2. **State Mutation**: Verify variables update in the expected loop phase.
3. **Complexity**: Check whether inner iterations cause unintended \`O(n²)\` overhead.

💡 **Try this in CodeLab**: Switch to [**CodeLab Studio**](codelab.html) to step through variables live with breakpoints!`;
        }
    }

    // 2. Greetings & Warm Chit-chat
    if (/^(hi|hello|hey|yo|greetings|good (morning|afternoon|evening)|sup)\b/i.test(lower) || lower === 'hi' || lower === 'hello') {
        return `Hey there! Great to chat with you! 👋 I'm **AlgoAI**, your personal Data Structures & Algorithms mentor here at AlgoLearn.

Think of me as your pair programmer and senior mentor sitting right beside you. Whether you want to:
- Break down a tricky concept (like Recursion, Dynamic Programming, or Graphs)
- Step through an algorithm line-by-line
- Analyze Time & Space Complexity ($O(n)$ vs $O(n \\log n)$)
- Or debug code you're writing in [**CodeLab Studio**](codelab.html)

I'm ready whenever you are! What problem or concept are you tackling today?`;
    }

    if (lower.includes('how are you') || lower.includes("how're you") || lower.includes('how you doing')) {
        return `I'm doing fantastic, feeling energized and ready to write some clean code with you! 🚀

How is your study or coding session going today? Stuck on any tricky bugs or algorithmic challenges?`;
    }

    if (lower.includes('who are you') || lower.includes('your name') || lower.includes('what are you') || lower.includes('tell me about yourself')) {
        return `I am **AlgoAI**, your personal Data Structures & Algorithms mentor and interactive pair programmer at AlgoLearn.

Unlike static textbooks, I explain concepts with real-world analogies, simulate code traces, compute Big-O complexity, offer progressive hints (so you can solve problems on your own without spoilers), and integrate directly with AlgoLearn's live 2D visualizers and CodeLab sandbox.

What would you like to explore together right now?`;
    }

    if (lower.includes('joke') || lower.includes('funny') || lower.includes('make me laugh')) {
        const jokes = [
            "Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛😄",
            "There are 10 types of people in the world:\nThose who understand binary, and those who don't! 💻",
            "Why did the JavaScript developer wear glasses?\n\nBecause they couldn't C#! 👓",
            "A SQL query walks into a bar, walks up to two tables and asks...\n\n*\"Can I join you?\"* 🍻",
            "Why was the developer unhappy with their new job?\n\nThey wanted arrays, but they only got strings attached! 🎸"
        ];
        return `Haha, here's one for you:\n\n${jokes[Math.floor(Math.random() * jokes.length)]}\n\nNow, ready to squash some real bugs or learn an algorithm?`;
    }

    if (/^(thanks|thank you|thx|appreciate it|awesome|great job|kudos)\b/i.test(lower)) {
        return `You're very welcome! 🙌 Keep up the fantastic momentum. Solving problems and mastering algorithms is all about steady, consistent practice.

Whenever you hit the next hurdle, I'm right here. What shall we tackle next?`;
    }

    if (/^(bye|goodbye|see ya|cya|good night)\b/i.test(lower)) {
        return `Happy coding and have a great rest! 🌟 Don't forget to commit your code. Whenever you're ready to learn again, just click my Muse orb!`;
    }

    // 3. CORE DSA CONCEPT: "What is DSA?" & Foundations
    if (lower.includes('what is dsa') || lower.includes('what is data structure') || lower.includes('why dsa') || lower.includes('learn dsa') || lower.includes('explain dsa')) {
        return `Hey, that is the most important starting question in Computer Science! Let's break it down simply.

### 🧠 What is DSA?
**DSA** stands for **Data Structures and Algorithms**. It is the combination of **how you organize data in memory** and **the step-by-step logic you use to solve problems with that data**.

Think of it like cooking in a professional kitchen:
- **Data Structures** are your kitchen tools and containers (spice racks, refrigerator shelves, cutting boards, bowls). They determine *how easy and fast* it is to store, retrieve, or update ingredients.
- **Algorithms** are your recipes and knife skills. They are the exact step-by-step instructions that take raw ingredients and turn them into a finished dish efficiently.

---

### 📦 1. Data Structures (Where Data Lives)
| Structure | Real-World Analogy | Primary Superpower |
| :--- | :--- | :--- |
| **Array** | A row of numbered lockers | Instant $O(1)$ lookup if you know the index. |
| **Linked List** | A treasure hunt with clues | Dynamic sizing; fast insertions anywhere without shifting. |
| **Stack** | A stack of cafeteria plates | **LIFO** (Last In, First Out). Perfect for Back buttons & Undo. |
| **Queue** | A line at a ticket counter | **FIFO** (First In, First Out). Perfect for task scheduling & BFS. |
| **Hash Map** | A dictionary / phone directory | Lightning fast $O(1)$ search by key. |
| **Tree / BST** | A family tree or file hierarchy | Hierarchical data and fast $O(\\log n)$ search. |
| **Graph** | Airline routes & social networks | Connects arbitrary nodes with complex relationships. |

---

### ⚡ 2. Algorithms (How We Solve Problems)
Algorithms are the techniques we apply:
- **Searching**: Finding target items (Linear vs Binary Search).
- **Sorting**: Putting items in order (Quick Sort, Merge Sort, Heap Sort).
- **Recursion & Backtracking**: Solving problems by breaking them into smaller self-similar copies (N-Queens, Permutations).
- **Dynamic Programming**: Storing answers to overlapping subproblems so you never calculate the same thing twice.

---

### 🎯 Why Top Tech Companies (Google, Meta, Amazon) Care:
A poorly designed algorithm might take **2 hours** to process 1,000,000 users. A well-designed algorithm using the right data structure does it in **0.02 seconds**!

Where would you like to begin?
1. **Arrays vs Linked Lists**
2. **Stack vs Queue**
3. **Time & Space Complexity ($O(1)$ to $O(n^2)$)**
4. Or try our [**Sorting Visualizer**](visualize-sorting.html) to see algorithms in action!`;
    }

    // 4. Stacks vs Queues (Comparison)
    if (lower.includes('stack vs queue') || lower.includes('queue vs stack') || (lower.includes('stack') && lower.includes('queue')) || lower.includes('lifo vs fifo')) {
        return `### 🥞 Stacks vs Queues: The Fundamental Difference

Both Stacks and Queues are linear data structures, but they operate on opposite retrieval rules:

#### 1. The Stack (LIFO: Last-In, First-Out)
- **Mental Model**: A stack of dinner plates. You place a new plate on top, and you remove the top plate first.
- **Core Operations**: \`push(x)\` (add to top), \`pop()\` (remove from top), \`peek()\` (look at top). All $O(1)$!
- **Real-World Uses**:
  - Browser Back button history.
  - Text editor **Undo / Redo** operations.
  - Call stack in recursion & syntax bracket matching (\`()[]{}\`).

#### 2. The Queue (FIFO: First-In, First-Out)
- **Mental Model**: A line of people waiting for coffee. The first person to join the line is the first person served!
- **Core Operations**: \`enqueue(x)\` (add to back), \`dequeue()\` (remove from front), \`peek()\` (look at front). All $O(1)$!
- **Real-World Uses**:
  - Printer print queues and web server request handling.
  - **Breadth-First Search (BFS)** graph traversals.
  - Asynchronous message brokers (Kafka, RabbitMQ).

\`\`\`java
// Quick Java comparison
Stack<Integer> stack = new Stack<>();
stack.push(10); stack.push(20);
System.out.println(stack.pop()); // Prints 20 (Last In, First Out)

Queue<Integer> queue = new LinkedList<>();
queue.offer(10); queue.offer(20);
System.out.println(queue.poll()); // Prints 10 (First In, First Out)
\`\`\`

Would you like to solve a classic stack problem like **Valid Parentheses** together?`;
    }

    // 4a. Stack (Individual Deep Dive)
    if (lower.includes('what is stack') || lower.includes('explain stack') || lower.includes('how does stack work') || lower.includes('how stack works') || lower.includes('stack data structure') || lower.includes('stack operations') || lower.includes('stack in java') || /\bstack(s)?\b/i.test(lower)) {
        return `### 🥞 What is a Stack? Complete Guide & Intuition

A **Stack** is a fundamental linear data structure that operates strictly on the **LIFO (Last-In, First-Out)** principle: the last element added to the stack is always the very first one removed.

Think of it like a **spring-loaded stack of cafeteria dinner plates**:
- You place a new plate on the **top** (\`push\`).
- You take a plate off the **top** (\`pop\`).
- You can inspect the top plate without removing it (\`peek\`).
- You cannot pull a plate from the bottom without removing everything above it!

---

#### ⚡ Core Operations & Time Complexity
Every fundamental stack operation executes in **$O(1)$ constant time**:

| Operation | Method (Java) | Meaning | Time | Space |
| :--- | :--- | :--- | :--- | :--- |
| **Push** | \`stack.push(x)\` | Inserts an item onto the top of the stack | **$O(1)$** | $O(1)$ |
| **Pop** | \`stack.pop()\` | Removes and returns the top item | **$O(1)$** | $O(1)$ |
| **Peek / Top** | \`stack.peek()\` | Views the top item without removing it | **$O(1)$** | $O(1)$ |
| **Is Empty** | \`stack.isEmpty()\` | Returns \`true\` if stack has zero elements | **$O(1)$** | $O(1)$ |
| **Size** | \`stack.size()\` | Returns total count of elements | **$O(1)$** | $O(1)$ |

---

#### 🛠️ Real-World Engineering Uses
Stacks power core software architecture:
1. **Browser History**: Every website you visit is pushed onto a stack. When you click the **Back button**, the browser \`pop()\`s the current page to return to the previous one.
2. **Text Editor Undo (\`Ctrl + Z\`)**: Each keystroke and edit state is pushed to a stack. Undo simply pops the most recent action.
3. **Function Call Stack**: Every time your code calls a function, a new activation frame is pushed. When the function returns, its frame pops off. (Infinite recursion without a base case produces a \`StackOverflowError\`!).
4. **Compiler Syntax Matching**: Verifying matching brackets, braces, and tags in code (\`{ [ ( ) ] }\`).

---

#### ☕ Clean & Idiomatic Java Implementation
> 💡 **Senior Developer Tip**: In modern Java, always prefer \`ArrayDeque<T>\` over the legacy \`java.util.Stack<T>\`. The old \`Stack\` class extends \`Vector\` and incurs synchronized lock overhead on every operation.

\`\`\`java
import java.util.ArrayDeque;
import java.util.Deque;

public class StackDemo {
    public static void main(String[] args) {
        // Modern high-performance LIFO Stack
        Deque<Integer> stack = new ArrayDeque<>();

        // Push elements
        stack.push(10);
        stack.push(20);
        stack.push(30);

        // Peek at top element
        System.out.println("Top element: " + stack.peek()); // 30

        // Pop elements in LIFO order
        while (!stack.isEmpty()) {
            System.out.println("Popped: " + stack.pop()); // 30, then 20, then 10
        }
    }
}
\`\`\`

---

#### 🎯 Top FAANG Interview Patterns Using Stack:
1. **Balanced Parentheses (LeetCode 20)**: Push opening brackets \`( [ {\`; when a closing bracket arrives, pop and verify the match.
2. **Monotonic Stack (Daily Temperatures / Next Greater Element)**: Keep elements in strictly increasing or decreasing order to solve range lookup problems in $O(n)$ time instead of $O(n^2)$.
3. **Min-Stack (LeetCode 155)**: Track the minimum element in $O(1)$ time by maintaining a parallel minimum tracker.

Would you like to step through the **Valid Parentheses** problem together, or test this in [**CodeLab Studio**](codelab.html)?`;
    }

    // 4b. Queue (Individual Deep Dive)
    if (lower.includes('what is queue') || lower.includes('explain queue') || lower.includes('how does queue work') || lower.includes('how queue works') || lower.includes('queue data structure') || lower.includes('queue operations') || lower.includes('queue in java') || /\bqueue(s)?\b/i.test(lower)) {
        return `### 🎟️ What is a Queue? Complete Guide & Intuition

A **Queue** is a linear data structure that operates strictly on the **FIFO (First-In, First-Out)** principle: the first element added to the queue is always the very first one removed.

Think of it like **a line of people waiting for coffee or movie tickets**:
- New arrivals join at the **rear / back** (\`enqueue\` / \`offer\`).
- The person at the **front** gets served and leaves (\`dequeue\` / \`poll\`).
- Fair and orderly: no cutting in line!

---

#### ⚡ Core Operations & Time Complexity
All core queue operations run in **$O(1)$ constant time**:

| Operation | Method (Java) | Meaning | Time | Space |
| :--- | :--- | :--- | :--- | :--- |
| **Enqueue** | \`queue.offer(x)\` | Inserts an item at the rear of the queue | **$O(1)$** | $O(1)$ |
| **Dequeue** | \`queue.poll()\` | Removes and returns the item at the front | **$O(1)$** | $O(1)$ |
| **Peek / Front**| \`queue.peek()\` | Views the front item without removing it | **$O(1)$** | $O(1)$ |
| **Is Empty** | \`queue.isEmpty()\` | Returns \`true\` if the queue has zero items | **$O(1)$** | $O(1)$ |

---

#### 🛠️ Real-World Engineering Uses
1. **Breadth-First Search (BFS)**: Exploring tree/graph levels layer-by-layer (e.g. finding the shortest path on Google Maps).
2. **Printer Spooling**: Documents sent to an office printer are printed in the exact order received.
3. **CPU Task Scheduling**: Operating systems queue processes to ensure fair round-robin CPU slice allocation.
4. **Asynchronous Message Buffers**: Kafka, RabbitMQ, and AWS SQS are built around distributed message queues.

---

#### ☕ Clean Java Implementation
\`\`\`java
import java.util.ArrayDeque;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        // High-performance ArrayDeque-backed Queue
        Queue<String> queue = new ArrayDeque<>();

        // 1. Enqueue (add to rear)
        queue.offer("Order #1");
        queue.offer("Order #2");
        queue.offer("Order #3");

        // 2. Peek at front
        System.out.println("Next up: " + queue.peek()); // Order #1

        // 3. Dequeue (remove from front in FIFO order)
        while (!queue.isEmpty()) {
            System.out.println("Processing: " + queue.poll());
        }
    }
}
\`\`\`

---

#### 🌟 Important Queue Variants:
- **Deque (Double-Ended Queue)**: Insert and delete from *both* ends in $O(1)$.
- **PriorityQueue (Min/Max Heap)**: Retrieves the highest-priority element rather than oldest arrival.
- **Circular Queue**: Avoids pointer drift in fixed-size array buffers by using modulo arithmetic \`(rear + 1) % capacity\`.

Would you like to explore how Queue powers **Breadth-First Search (BFS)** on our [**Graph Visualizer**](visualize-graph.html)?`;
    }

    // 5. Arrays vs Linked Lists (Comparison)
    if (lower.includes('array vs linked list') || lower.includes('linked list vs array') || (lower.includes('array') && lower.includes('linked list'))) {
        return `### 🥊 Arrays vs Linked Lists: In-Memory Showdown

Both store sequences of elements, but their physical memory layout makes them behave completely differently:

| Feature | Array | Linked List |
| :--- | :--- | :--- |
| **Memory Layout** | Contiguous (single contiguous memory block) | Scattered across heap (nodes linked via pointers) |
| **Access by Index** | **$O(1)$ Instant** (\`arr[i]\` via pointer arithmetic) | **$O(n)$ Slow** (must traverse from head node) |
| **Insert / Delete at Head** | **$O(n)$** (requires shifting all elements) | **$O(1)$ Fast** (just update head pointer) |
| **Insert / Delete at Middle** | **$O(n)$** (shifting elements) | **$O(1)$ once pointer is found** |
| **Memory Overhead** | Low (only elements stored) | Higher (each node stores data + next pointer) |
| **Cache Locality** | **Superb** (CPU hardware prefetching) | Poor (pointer hopping causes cache misses) |

> 💡 **Mentor Advice**: In 90% of everyday production scenarios, standard \`ArrayList\` (or dynamic arrays) beats a \`LinkedList\` in speed because modern CPU caches are lightning fast at reading sequential memory blocks!

Would you like to see how to reverse a Singly Linked List in Java?`;
    }

    // 5a. Linked List (Individual Deep Dive)
    if (lower.includes('what is linked list') || lower.includes('explain linked list') || lower.includes('how does linked list work') || lower.includes('linked list data structure') || lower.includes('singly linked list') || lower.includes('doubly linked list') || lower === 'linked list' || lower === 'linkedlist' || /\blinked\s*list(s)?\b/i.test(lower)) {
        return `### 🔗 What is a Linked List? Pointers, Nodes & Trade-offs

A **Linked List** is a fundamental linear data structure where elements (**nodes**) are not stored in contiguous memory locations. Instead, each node contains two components:
1. **Data**: The value stored in the node.
2. **Next Pointer / Reference**: The memory address pointing to the next node in the sequence.

\`\`\`
[Data | Next] ---> [Data | Next] ---> [Data | Next] ---> null
    Head                                  Tail
\`\`\`

---

#### ⚡ Core Operations & Time Complexity
| Operation | Time | Why? |
| :--- | :--- | :--- |
| **Insert at Head** | **$O(1)$** | Point new node's next to head, update head |
| **Delete at Head** | **$O(1)$** | Advance head to \`head.next\` |
| **Insert at Tail (with tail ref)** | **$O(1)$** | Update \`tail.next\` and advance tail |
| **Access by Index (\`get(i)\`)** | **$O(n)$** | Must traverse node-by-node from the head |
| **Search for Value** | **$O(n)$** | Must scan up to $n$ nodes |

---

#### ☕ Classic Node Structure in Java
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) {
        this.val = val;
        this.next = null;
    }
}
\`\`\`

---

#### 🎯 Top FAANG Interview Patterns:
1. **Reverse a Linked List (LeetCode 206)**: Flip pointer directions iteratively or recursively in $O(n)$ time and $O(1)$ space.
2. **Fast & Slow Pointers (Floyd's Cycle Detection)**: Detect loops or find the middle node in a single pass.
3. **Merge Two Sorted Lists (LeetCode 21)**: Splice nodes into a single sorted list using a dummy head.

Would you like to step through reversing a Linked List line-by-line?`;
    }

    // 5b. Array (Individual Deep Dive)
    if (lower.includes('what is array') || lower.includes('explain array') || lower.includes('how does array work') || lower.includes('array data structure') || lower.includes('dynamic array') || lower === 'array' || lower === 'arrays' || /\barray(s)?\b/i.test(lower)) {
        return `### 📦 What is an Array? Memory, Indexing & Trade-offs

An **Array** is the most foundational contiguous data structure in computer science. It stores a collection of elements of the same type in **consecutive physical memory addresses**.

#### ⚡ Why Arrays are so Fast ($O(1)$ Random Access):
Because memory is contiguous, the CPU calculates the exact memory address in a single hardware cycle:
$$\\text{Address of } arr[i] = \\text{Base Address} + (i \\times \\text{Element Size})$$

| Operation | Time Complexity | Notes |
| :--- | :--- | :--- |
| **Read by Index (\`arr[i]\`)** | **$O(1)$** | Instant pointer arithmetic |
| **Update by Index (\`arr[i] = v\`)** | **$O(1)$** | Direct memory overwrite |
| **Insert at End (with capacity)**| **$O(1)$** | Append to next open index |
| **Insert at Start / Middle** | **$O(n)$** | Must shift all subsequent elements right |
| **Delete at Start / Middle** | **$O(n)$** | Must shift all subsequent elements left |
| **Linear Search** | **$O(n)$** | Unsorted elements require scanning |
| **Binary Search (Sorted Array)** | **$O(\\log n)$** | Halves search space each comparison |

---

#### 🚀 Static Array vs Dynamic Array (\`ArrayList\`)
- **Static Array (\`int[] arr = new int[5]\`)**: Fixed size fixed at allocation.
- **Dynamic Array (\`ArrayList<Integer>\`)**: When full, allocates a new array of $1.5\\times$ or $2\\times$ size and copies elements. While resizing costs $O(n)$, it occurs geometrically infrequently, yielding **$O(1)$ amortized insertion**!

#### 🎯 Key Interview Patterns:
- **Two Pointers**: Opposite ends (Two Sum II, Palindrome check) or fast/slow pointers.
- **Sliding Window**: Subarray sums, maximum window values.
- **Prefix Sums**: Compute range sums $O(1)$ after $O(n)$ preprocessing.

Would you like to write an array algorithm in [**CodeLab Studio**](codelab.html)?`;
    }

    // 6. Hash Maps & Hashing
    if (lower.includes('hash map') || lower.includes('hashmap') || lower.includes('hash table') || lower.includes('hashing') || lower.includes('collision')) {
        return `### ⚡ Hash Maps: The King of $O(1)$ Lookups

A **Hash Map** is the most widely used data structure in software engineering because it lets you find, insert, and delete items in **average $O(1)$ constant time**!

#### How does it work under the hood?
1. You pass a **Key** (e.g. \`"shivam"\`).
2. A **Hash Function** converts that key into a large integer: \`hashCode("shivam") = 2083921\`.
3. The map computes the array bucket index: \`index = hash % array.length\`.
4. Your value is stored in that specific bucket.

#### What is a Collision?
When two different keys produce the exact same bucket index!
- **Separate Chaining (Used in Java HashMap)**: Each bucket holds a linked list (or balanced Red-Black tree once size > 8).
- **Open Addressing / Linear Probing**: If bucket $i$ is occupied, probe bucket $i + 1, i + 2...$ until an empty slot is found.

\`\`\`java
// Java HashMap Example
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 98);
scores.put("Bob", 87);

if (scores.containsKey("Alice")) {
    System.out.println("Alice score: " + scores.get("Alice")); // O(1)
}
\`\`\`

Want to see how HashMap solves **Two Sum** in $O(n)$ instead of brute-force $O(n^2)$?`;
    }

    // 7. Trees & Binary Search Trees
    if (lower.includes('binary search tree') || lower.includes('bst') || lower.includes('binary tree') || (lower.includes('tree') && !lower.includes('visualize-tree'))) {
        return `### 🌳 Trees & Binary Search Trees (BST)

A **Tree** is a non-linear, hierarchical data structure composed of nodes connected by edges, starting from a single **Root** node.

#### The Binary Search Tree (BST) Invariant:
For every node $X$:
- All nodes in its **Left Subtree** must be **smaller** than $X$.
- All nodes in its **Right Subtree** must be **larger** than $X$.

\`\`\`
        8
       / \\
      3   10
     / \\    \\
    1   6    14
\`\`\`

#### Why is BST powerful?
Because on every comparison, you discard half of the remaining search space!
- **Search / Insert / Delete**: Average **$O(\\log n)$**.
- **Worst Case**: **$O(n)$** if the tree becomes degenerate (a straight line of nodes). That's why self-balancing trees like **AVL** and **Red-Black Trees** exist!

#### Traversals:
1. **In-Order (Left, Root, Right)**: Visits BST keys in strictly sorted ascending order!
2. **Pre-Order (Root, Left, Right)**: Great for cloning/serializing trees.
3. **Post-Order (Left, Right, Root)**: Ideal for deleting trees and evaluating postfix expressions.
4. **Level-Order (BFS)**: Visits level by level using a Queue.

Check out our [**Tree Visualizer**](visualize-tree.html) to see BST insertions live!`;
    }

    // 7a. Graphs & Graph Traversals
    if (lower.includes('what is graph') || lower.includes('explain graph') || lower.includes('how does graph work') || lower.includes('graph data structure') || lower.includes('adjacency list') || lower.includes('adjacency matrix') || /\bgraph(s)?\b/i.test(lower)) {
        return `### 🕸️ Graphs: Vertices, Edges & Networks

A **Graph** is a non-linear data structure consisting of a finite set of **Vertices (Nodes)** connected by **Edges (Links)**:
$$G = (V, E)$$

Graphs model real-world relationships: social networks (friends), road maps (cities & highways), computer networks, and dependency trees.

---

#### 1. Graph Classifications:
- **Directed (Digraph)**: Edges have direction arrows (e.g. Twitter follow: A follows B).
- **Undirected**: Mutual two-way connections (e.g. LinkedIn connections).
- **Weighted**: Edges carry numerical costs/distances (e.g. flight distances or road tolls).
- **Acyclic (DAG)**: Directed graph with zero cycles (used in build tools like Maven/Gradle, Git commits, task pipelines).

---

#### 2. Representation in Memory:
| Representation | Space | Edge Check \`(u, v)\` | Iterate Neighbors |
| :--- | :--- | :--- | :--- |
| **Adjacency List** | **$O(V + E)$** (Optimal for sparse) | $O(\\text{degree})$ | **Fast** (only real neighbors) |
| **Adjacency Matrix** | $O(V^2)$ (Heavy for sparse) | **$O(1)$** instant | $O(V)$ (must check full row) |

\`\`\`java
// Idiomatic Adjacency List in Java
List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < V; i++) graph.add(new ArrayList<>());
graph.get(0).add(1); // Edge 0 -> 1
graph.get(0).add(2); // Edge 0 -> 2
\`\`\`

---

#### 3. The 2 Essential Traversals:
- **Breadth-First Search (BFS)**: Uses a **Queue**. Traverses layer by layer. Guarantees the **shortest path in unweighted graphs**.
- **Depth-First Search (DFS)**: Uses a **Stack** or recursion. Goes as deep as possible before backtracking. Used for cycle detection and topological sorting.

Would you like to watch BFS and Dijkstra execute on our interactive [**Graph Visualizer**](visualize-graph.html)?`;
    }

    // 7b. Heaps & Priority Queues
    if (lower.includes('what is heap') || lower.includes('explain heap') || lower.includes('how does heap work') || lower.includes('min heap') || lower.includes('max heap') || lower.includes('priority queue') || /\bheap(s)?\b/i.test(lower)) {
        return `### 🏔️ Heaps & Priority Queues: Complete Guide

A **Heap** is a specialized tree-based data structure that satisfies the **Heap Invariant**:
- **Min-Heap**: The value of every parent node is $\\le$ the values of its children. The **minimum element is always at the root** (\`arr[0]\`).
- **Max-Heap**: The value of every parent node is $\\ge$ the values of its children. The **maximum element is always at the root**.

#### ⚡ Array Storage (No Pointers Required!)
Heaps are **Complete Binary Trees** (every level is filled from left to right). This allows them to be packed in a contiguous array without object overhead:
- For a node at index $i$:
  - **Left Child**: $2i + 1$
  - **Right Child**: $2i + 2$
  - **Parent**: $\\lfloor (i - 1) / 2 \\rfloor$

| Operation | Time Complexity | Notes |
| :--- | :--- | :--- |
| **\`peek()\` (Find Min/Max)** | **$O(1)$** | Instant access at root |
| **\`insert()\` / \`offer()\`** | **$O(\\log n)$** | Add to end, sift up (bubble up) |
| **\`extractMin()\` / \`poll()\`** | **$O(\\log n)$** | Swap root with last, sift down |
| **\`heapify\` (Build Heap)** | **$O(n)$** | Linear construction from raw array |

---

#### ☕ Java \`PriorityQueue\` Snippet
\`\`\`java
import java.util.PriorityQueue;
import java.util.Collections;

// Min-Heap (default in Java)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(30); minHeap.offer(10); minHeap.offer(20);
System.out.println(minHeap.poll()); // Prints 10 (smallest first)

// Max-Heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
maxHeap.offer(30); maxHeap.offer(10); maxHeap.offer(20);
System.out.println(maxHeap.poll()); // Prints 30 (largest first)
\`\`\`

#### 🎯 Top Interview Patterns:
1. **Top-K Frequent Elements / Kth Largest**: Using a min-heap of size $K$ in $O(n \\log K)$ time.
2. **Dijkstra's Shortest Path**: Extracting lowest-cost edges in $O((V + E) \\log V)$.
3. **Find Median from Data Stream**: Dual-heap technique balancing lower and upper halves.

Would you like to solve a Top-K problem in [**CodeLab Studio**](codelab.html)?`;
    }

    // 7c. Binary Search
    if (lower.includes('what is binary search') || lower.includes('explain binary search') || lower.includes('how does binary search work') || lower.includes('how binary search works') || lower.includes('binary search algorithm')) {
        return `### 🎯 Binary Search: The Power of $O(\\log n)$

**Binary Search** is the quintessential divide-and-conquer search algorithm. On every comparison, it **eliminates half of the remaining search space**.

> **Precondition**: The input array **MUST be sorted**!

#### ⚡ Why $O(\\log n)$ is so Fast:
- Searching 1,000 items: at most **10 comparisons**.
- Searching 1,000,000 items: at most **20 comparisons**.
- Searching 4,000,000,000 items (the entire 32-bit integer range): at most **32 comparisons**!

---

#### ☕ Canonical Bug-Free Java Implementation
\`\`\`java
public int binarySearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;

    while (low <= high) {
        // Prevents integer overflow that happens with (low + high) / 2
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid; // Target found at index mid!
        } else if (arr[mid] < target) {
            low = mid + 1; // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }
    return -1; // Target not found
}
\`\`\`

#### ⚠️ Critical Pitfalls & Interview Traps:
1. **Integer Overflow**: Always calculate \`mid = low + (high - low) / 2\`. Never do \`(low + high) / 2\` because \`low + high\` can exceed $2^{31} - 1$ in Java and overflow to negative!
2. **Loop Boundary**: Use \`low <= high\` for inclusive range \`[low, high]\`.
3. **Binary Search on Answer Space**: Applied when answers are monotonic (e.g. Koko Eating Bananas, Capacity to Ship Packages).

Would you like to test Binary Search with live step-by-step pointers on our [**Search Visualizer**](visualize-search.html?algo=binary)?`;
    }

    // 8. Recursion & Backtracking
    if (lower.includes('recursion') || lower.includes('recursive') || lower.includes('backtracking')) {
        return `### 🪞 Mastering Recursion & Backtracking

**Recursion** is a programming technique where a function calls itself to solve a smaller subproblem of the original problem.

Think of Russian nesting dolls: you open a doll to find a smaller doll, and keep opening until you reach the smallest, solid doll (the **Base Case**)!

#### The 3 Laws of Recursion:
1. **The Base Case**: When do you stop? (Without this, you get a \`StackOverflowError\`!).
2. **The Recursive Leap of Faith**: Trust that \`solve(n - 1)\` works correctly.
3. **Progress Toward Base Case**: Each recursive call must get closer to terminating.

\`\`\`java
// Classic Factorial: n! = n * (n - 1)!
public int factorial(int n) {
    if (n <= 1) return 1; // 1. Base Case
    return n * factorial(n - 1); // 2. Recursive step
}
\`\`\`

#### What is Backtracking?
Backtracking is **Recursion with an Undo step**! You explore a candidate path:
1. Choose an option.
2. Recurse.
3. If it leads to a dead end, **undo your choice** (backtrack) and try the next option!
*Examples: Sudoku Solver, N-Queens, Maze navigation, Permutations.*

Want me to show you how Backtracking solves the **N-Queens** challenge?`;
    }

    // 9. Dynamic Programming
    if (lower.includes('dynamic programming') || lower.includes('what is dp') || lower.includes('memoization') || lower.includes('tabulation')) {
        return `### 🧩 Dynamic Programming (DP): Remembering Your Past

Dynamic Programming is simply **optimized recursion** for problems that exhibit two properties:
1. **Overlapping Subproblems**: The same sub-calculations are repeated multiple times.
2. **Optimal Substructure**: The optimal solution to the problem can be constructed from optimal solutions to its subproblems.

#### The Classic Example: Fibonacci
In naive recursion, computing \`fib(5)\` computes \`fib(3)\` two times, \`fib(2)\` three times, and takes **$O(2^n)$ exponential time**!

#### The Two Ways to do DP:
1. **Top-Down (Memoization)**:
   Write normal recursion, but check a cache / memo array before calculating:
   \`if (memo[n] != 0) return memo[n];\`
2. **Bottom-Up (Tabulation)**:
   Solve the smallest base problems first in an array iteratively:
   \`dp[i] = dp[i - 1] + dp[i - 2];\`

Both reduce the time complexity from **$O(2^n)$ down to a blazing $O(n)$**!

Want to try our [**Dynamic Programming Visualizer**](visualize-dp.html) to see the lookup tables fill up step-by-step?`;
    }

    // 10. Java for DSA / JVM Memory
    if (lower.includes('why java') || lower.includes('java for dsa') || lower.includes('jvm') || lower.includes('heap vs stack') || lower.includes('string vs stringbuilder')) {
        return `### ☕ Java for Data Structures & Algorithms

Java is one of the premier languages for technical interviews and competitive programming. Here's why:

1. **Strong Typing & Object-Oriented Clarity**: Classes like \`TreeNode\` and \`ListNode\` naturally mirror real data structures.
2. **Rich Collections Framework**:
   - Lists: \`ArrayList<T>\`, \`LinkedList<T>\`
   - Sets: \`HashSet<T>\` ($O(1)$), \`TreeSet<T>\` ($O(\\log n)$ sorted)
   - Maps: \`HashMap<K, V>\`, \`TreeMap<K, V>\`
   - Queues: \`ArrayDeque<T>\`, \`PriorityQueue<T>\` (Min-Heap by default)
3. **Memory Model: Stack vs Heap**:
   - **Stack**: Stores primitive variables (\`int\`, \`boolean\`) and method execution frames. Fast, automatic deallocation.
   - **Heap**: Stores all Objects and Arrays. Managed by the Garbage Collector.
4. **Golden Performance Tip: String vs StringBuilder**:
   In Java, \`String\` is immutable. Doing \`s += char\` inside an $O(n)$ loop creates a new object each time, turning your code into **$O(n^2)$**! Always use \`StringBuilder\` for $O(1)$ amortized appends.

Would you like to write a quick Java method in [**CodeLab Studio**](codelab.html)?`;
    }

    // 11. FAANG & Technical Interview Roadmap
    if (lower.includes('interview') || lower.includes('faang') || lower.includes('leetcode') || lower.includes('roadmap') || lower.includes('how to prepare')) {
        return `### 🗺️ The Ultimate Technical Interview Roadmap (FAANG / Big Tech)

To crack technical interviews, don't memorize 500 random problems. Instead, master the **14 Core Patterns**:

1. **Two Pointers & Sliding Window** (Two Sum, Longest Substring Without Repeating Characters)
2. **Fast & Slow Pointers** (Detect cycle in Linked List)
3. **Prefix Sums & Monotonic Stack** (Daily Temperatures, Next Greater Element)
4. **Binary Search on Answer Space** (Koko Eating Bananas, Search Rotated Array)
5. **Tree Depth-First & Breadth-First Search** (Max Depth, Level Order Traversal)
6. **Heaps & Top-K Elements** (Kth Largest Element, Find Median from Data Stream)
7. **Backtracking** (Subsets, Permutations, Combination Sum)
8. **Graph Traversals & Dijkstra** (Number of Islands, Network Delay Time)
9. **1D & 2D Dynamic Programming** (Climbing Stairs, Coin Change, Longest Common Subsequence)

#### 3 Essential Interview Habits:
- **Think Out Loud**: Clarify inputs, bounds, and edge cases before typing a single line.
- **State Big-O First**: Explain your brute-force $O(n^2)$ idea, then optimize to $O(n \\log n)$ or $O(n)$.
- **Dry-Run with Example**: Trace through your code with a small test input.

Which pattern are you focusing on this week?`;
    }

    // 12. Specific Algorithm Knowledge Deep-Dive
    for (const [key, algo] of Object.entries(ALGORITHM_KNOWLEDGE)) {
        if (lower.includes(algo.name.toLowerCase()) || lower.includes(key.replace('_', ' ')) || lower.includes(key)) {
            return `### 📘 ${algo.name} Deep Dive (${algo.category})

${algo.summary}

#### ⏱️ Complexity Breakdown
- **Time Complexity**:
  - **Best Case**: \`${algo.timeComplexity.best}\`
  - **Average Case**: \`${algo.timeComplexity.average}\`
  - **Worst Case**: \`${algo.timeComplexity.worst}\`
- **Space Complexity**: \`${algo.spaceComplexity}\`
${algo.stable !== undefined ? `- **Stable**: \`${algo.stable ? 'Yes' : 'No'}\`` : ''}
${algo.inPlace !== undefined ? `- **In-Place**: \`${algo.inPlace ? 'Yes' : 'No'}\`` : ''}

${algo.javaTemplate ? `#### 💻 Canonical Java Implementation
\`\`\`java
${algo.javaTemplate}
\`\`\`
` : ''}

💡 **Interactive Tool**: You can watch this algorithm execute step-by-step with real-time audio and bar swaps in our [**${algo.name} Visualizer**](${algo.visualizerUrl}). You can also paste this into [**CodeLab Studio**](codelab.html) to debug line-by-line!`;
        }
    }

    // 13. Progressive Hint Request
    if (lower.includes('hint') || lower.includes('clue') || lower.includes('help me solve')) {
        const problemKey = lower.includes('reverse') ? 'reverse_linked_list' : 'two_sum';
        const hintObj = executeToolGetHint(problemKey, 1);
        return `### 💡 Socratic Hint (Level ${hintObj.currentLevel} of ${hintObj.totalLevels})
**${hintObj.hint.title}**

${hintObj.hint.text}

---
*Need another nudge? Ask "give me hint 2" or toggle Hint mode in the toolbar!*`;
    }

    // 14. Big-O Complexity questions
    if (lower.includes('complexity') || lower.includes('big o') || lower.includes('big-o') || lower.includes('time complexity') || lower.includes('space complexity')) {
        return `### 📊 Understanding Algorithm Complexity (Big-O)

In Computer Science and technical interviews, we measure how an algorithm scales as input size \`n\` approaches infinity:

| Big-O Notation | Name | Practical Meaning | Common Examples |
| :--- | :--- | :--- | :--- |
| **O(1)** | Constant | Exact same operations regardless of size | Hash map lookup, array index \`arr[0]\` |
| **O(log n)** | Logarithmic | Halves the search space each step | Binary Search, Balanced BST lookup |
| **O(n)** | Linear | Touches each element once | Finding max in unsorted array, single loop |
| **O(n log n)** | Linearithmic | Optimal comparison-based sorting | Merge Sort, Quick Sort (average), Heap Sort |
| **O(n²)** | Quadratic | Compares every element to every other element | Nested loops, Bubble Sort, Selection Sort |
| **O(2ⁿ)** | Exponential | Doubles work for each added element | Recursive Fibonacci, generating all subsets |
| **O(n!)** | Factorial | Examines every permutation | Traveling Salesperson (brute-force), N-Queens |

> 💡 **Mentor Tip**: In Java, always beware of inadvertent \`O(n²)\` patterns, such as calling \`list.contains()\` inside an \`O(n)\` loop, or concatenating strings inside a loop instead of using \`StringBuilder\`.`;
    }

    // 15. Intelligent Semantic Catch-All (Conversational Human Mentor)
    const cleanTopic = userText.replace(/[?.,!]/g, '').trim();
    return `### 💡 Mentor Breakdown: ${cleanTopic}

Great question! Let's examine **${cleanTopic}** from an engineering and algorithmic perspective:

#### 1. Problem-Solving Blueprint
When tackling this in programming or technical interviews:
- **Clarify Inputs & Edge Cases**: Are there duplicates? Can inputs be negative or empty (\`null\`, \`len == 0\`)?
- **Choose the Right Memory Model**:
  - **Sequential / Indexed**: Use an **Array** or dynamic list ($O(1)$ read).
  - **LIFO / Undo / History**: Use a **Stack** ($O(1)$ push/pop).
  - **FIFO / BFS / Streams**: Use a **Queue** ($O(1)$ offer/poll).
  - **Instant Search / Frequency**: Use a **HashMap** or **HashSet** ($O(1)$ average).
  - **Priority / Order**: Use a **Heap** or **Binary Search Tree** ($O(\\log n)$).
  - **Networks / Relations**: Model as an **Adjacency List Graph**.

#### 2. Big-O Complexity Target
Always evaluate the trade-offs:
- Can you improve a brute-force $O(n^2)$ approach down to $O(n \\log n)$ with sorting, or $O(n)$ with a hash table?
- Keep memory usage bounded to avoid excessive garbage collection or stack overflows.

${context.page ? `*Since you are currently on \`${context.page}\`, would you like to see how this connects to our live visualizers or write code in [**CodeLab Studio**](codelab.html)?*` : 'Would you like a runnable code snippet in Java, Python, or C++, or should we trace a specific example together?'}`;
}

module.exports = {
    ALGORITHM_KNOWLEDGE,
    generateConversationalResponse
};

