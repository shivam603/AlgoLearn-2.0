/**
 * AlgoLearn Code Synchronizer & Multi-Language Line Highlighter
 * Maps visualizer execution states to line-by-line highlights in Python, C++, Java, and JavaScript.
 */

const CodeSync = {
    currentAlgo: 'bubble',
    currentLang: localStorage.getItem('algolearn_code_lang') || 'python',
    activeLineKey: null,

    codebase: {
        bubble: {
            name: 'Bubble Sort',
            python: [
                { key: 'header', text: 'def bubble_sort(arr):' },
                { key: 'outer_loop', text: '    n = len(arr)' },
                { key: 'pass_loop', text: '    for i in range(n - 1):' },
                { key: 'inner_loop', text: '        for j in range(n - i - 1):' },
                { key: 'compare', text: '            if arr[j] > arr[j + 1]:' },
                { key: 'swap', text: '                arr[j], arr[j + 1] = arr[j + 1], arr[j]' },
                { key: 'sorted', text: '    return arr' }
            ],
            cpp: [
                { key: 'header', text: 'void bubbleSort(vector<int>& arr) {' },
                { key: 'outer_loop', text: '    int n = arr.size();' },
                { key: 'pass_loop', text: '    for (int i = 0; i < n - 1; ++i) {' },
                { key: 'inner_loop', text: '        for (int j = 0; j < n - i - 1; ++j) {' },
                { key: 'compare', text: '            if (arr[j] > arr[j + 1]) {' },
                { key: 'swap', text: '                std::swap(arr[j], arr[j + 1]);' },
                { key: 'inner_close', text: '            }' },
                { key: 'pass_close', text: '        }' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void bubbleSort(int[] arr) {' },
                { key: 'outer_loop', text: '    int n = arr.length;' },
                { key: 'pass_loop', text: '    for (int i = 0; i < n - 1; i++) {' },
                { key: 'inner_loop', text: '        for (int j = 0; j < n - i - 1; j++) {' },
                { key: 'compare', text: '            if (arr[j] > arr[j + 1]) {' },
                { key: 'swap', text: '                int temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;' },
                { key: 'inner_close', text: '            }' },
                { key: 'pass_close', text: '        }' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function bubbleSort(arr) {' },
                { key: 'outer_loop', text: '    const n = arr.length;' },
                { key: 'pass_loop', text: '    for (let i = 0; i < n - 1; i++) {' },
                { key: 'inner_loop', text: '        for (let j = 0; j < n - i - 1; j++) {' },
                { key: 'compare', text: '            if (arr[j] > arr[j + 1]) {' },
                { key: 'swap', text: '                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];' },
                { key: 'inner_close', text: '            }' },
                { key: 'pass_close', text: '        }' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '    return arr;' },
                { key: 'end', text: '}' }
            ]
        },
        selection: {
            name: 'Selection Sort',
            python: [
                { key: 'header', text: 'def selection_sort(arr):' },
                { key: 'outer_loop', text: '    n = len(arr)' },
                { key: 'pass_loop', text: '    for i in range(n):' },
                { key: 'min_init', text: '        min_idx = i' },
                { key: 'inner_loop', text: '        for j in range(i + 1, n):' },
                { key: 'compare', text: '            if arr[j] < arr[min_idx]:' },
                { key: 'min_update', text: '                min_idx = j' },
                { key: 'swap', text: '        arr[i], arr[min_idx] = arr[min_idx], arr[i]' },
                { key: 'sorted', text: '    return arr' }
            ],
            cpp: [
                { key: 'header', text: 'void selectionSort(vector<int>& arr) {' },
                { key: 'outer_loop', text: '    int n = arr.size();' },
                { key: 'pass_loop', text: '    for (int i = 0; i < n - 1; ++i) {' },
                { key: 'min_init', text: '        int min_idx = i;' },
                { key: 'inner_loop', text: '        for (int j = i + 1; j < n; ++j) {' },
                { key: 'compare', text: '            if (arr[j] < arr[min_idx]) min_idx = j;' },
                { key: 'inner_close', text: '        }' },
                { key: 'swap', text: '        std::swap(arr[i], arr[min_idx]);' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void selectionSort(int[] arr) {' },
                { key: 'outer_loop', text: '    int n = arr.length;' },
                { key: 'pass_loop', text: '    for (int i = 0; i < n - 1; i++) {' },
                { key: 'min_init', text: '        int min_idx = i;' },
                { key: 'inner_loop', text: '        for (int j = i + 1; j < n; j++) {' },
                { key: 'compare', text: '            if (arr[j] < arr[min_idx]) min_idx = j;' },
                { key: 'inner_close', text: '        }' },
                { key: 'swap', text: '        int tmp = arr[min_idx]; arr[min_idx] = arr[i]; arr[i] = tmp;' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function selectionSort(arr) {' },
                { key: 'outer_loop', text: '    const n = arr.length;' },
                { key: 'pass_loop', text: '    for (let i = 0; i < n - 1; i++) {' },
                { key: 'min_init', text: '        let minIdx = i;' },
                { key: 'inner_loop', text: '        for (let j = i + 1; j < n; j++) {' },
                { key: 'compare', text: '            if (arr[j] < arr[minIdx]) minIdx = j;' },
                { key: 'inner_close', text: '        }' },
                { key: 'swap', text: '        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '    return arr;' },
                { key: 'end', text: '}' }
            ]
        },
        insertion: {
            name: 'Insertion Sort',
            python: [
                { key: 'header', text: 'def insertion_sort(arr):' },
                { key: 'outer_loop', text: '    for i in range(1, len(arr)):' },
                { key: 'key_select', text: '        key = arr[i]' },
                { key: 'j_init', text: '        j = i - 1' },
                { key: 'compare', text: '        while j >= 0 and key < arr[j]:' },
                { key: 'shift', text: '            arr[j + 1] = arr[j]' },
                { key: 'decrement', text: '            j -= 1' },
                { key: 'insert', text: '        arr[j + 1] = key' },
                { key: 'sorted', text: '    return arr' }
            ],
            cpp: [
                { key: 'header', text: 'void insertionSort(vector<int>& arr) {' },
                { key: 'outer_loop', text: '    for (size_t i = 1; i < arr.size(); ++i) {' },
                { key: 'key_select', text: '        int key = arr[i];' },
                { key: 'j_init', text: '        int j = i - 1;' },
                { key: 'compare', text: '        while (j >= 0 && arr[j] > key) {' },
                { key: 'shift', text: '            arr[j + 1] = arr[j];' },
                { key: 'decrement', text: '            j--;' },
                { key: 'close_while', text: '        }' },
                { key: 'insert', text: '        arr[j + 1] = key;' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void insertionSort(int[] arr) {' },
                { key: 'outer_loop', text: '    for (int i = 1; i < arr.length; i++) {' },
                { key: 'key_select', text: '        int key = arr[i];' },
                { key: 'j_init', text: '        int j = i - 1;' },
                { key: 'compare', text: '        while (j >= 0 && arr[j] > key) {' },
                { key: 'shift', text: '            arr[j + 1] = arr[j];' },
                { key: 'decrement', text: '            j = j - 1;' },
                { key: 'close_while', text: '        }' },
                { key: 'insert', text: '        arr[j + 1] = key;' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function insertionSort(arr) {' },
                { key: 'outer_loop', text: '    for (let i = 1; i < arr.length; i++) {' },
                { key: 'key_select', text: '        let key = arr[i];' },
                { key: 'j_init', text: '        let j = i - 1;' },
                { key: 'compare', text: '        while (j >= 0 && arr[j] > key) {' },
                { key: 'shift', text: '            arr[j + 1] = arr[j];' },
                { key: 'decrement', text: '            j--;' },
                { key: 'close_while', text: '        }' },
                { key: 'insert', text: '        arr[j + 1] = key;' },
                { key: 'sorted', text: '    }' },
                { key: 'close', text: '    return arr;' },
                { key: 'end', text: '}' }
            ]
        },
        quick: {
            name: 'Quick Sort',
            python: [
                { key: 'header', text: 'def quick_sort(arr, low, high):' },
                { key: 'base_case', text: '    if low < high:' },
                { key: 'partition_call', text: '        pi = partition(arr, low, high)' },
                { key: 'recurse_left', text: '        quick_sort(arr, low, pi - 1)' },
                { key: 'recurse_right', text: '        quick_sort(arr, pi + 1, high)' },
                { key: 'part_def', text: 'def partition(arr, low, high):' },
                { key: 'pivot_select', text: '    pivot = arr[high]' },
                { key: 'i_init', text: '    i = low - 1' },
                { key: 'loop', text: '    for j in range(low, high):' },
                { key: 'compare', text: '        if arr[j] < pivot:' },
                { key: 'i_inc', text: '            i += 1' },
                { key: 'swap', text: '            arr[i], arr[j] = arr[j], arr[i]' },
                { key: 'pivot_swap', text: '    arr[i + 1], arr[high] = arr[high], arr[i + 1]' },
                { key: 'return_pi', text: '    return i + 1' }
            ],
            cpp: [
                { key: 'header', text: 'void quickSort(vector<int>& arr, int low, int high) {' },
                { key: 'base_case', text: '    if (low < high) {' },
                { key: 'partition_call', text: '        int pi = partition(arr, low, high);' },
                { key: 'recurse_left', text: '        quickSort(arr, low, pi - 1);' },
                { key: 'recurse_right', text: '        quickSort(arr, pi + 1, high);' },
                { key: 'part_close', text: '    }' },
                { key: 'close', text: '}' },
                { key: 'part_def', text: 'int partition(vector<int>& arr, int low, int high) {' },
                { key: 'pivot_select', text: '    int pivot = arr[high], i = low - 1;' },
                { key: 'loop', text: '    for (int j = low; j < high; ++j) {' },
                { key: 'compare', text: '        if (arr[j] < pivot) {' },
                { key: 'swap', text: '            i++; std::swap(arr[i], arr[j]);' },
                { key: 'loop_close', text: '        }' },
                { key: 'end_loop', text: '    }' },
                { key: 'pivot_swap', text: '    std::swap(arr[i + 1], arr[high]);' },
                { key: 'return_pi', text: '    return i + 1;' },
                { key: 'func_close', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void quickSort(int[] arr, int low, int high) {' },
                { key: 'base_case', text: '    if (low < high) {' },
                { key: 'partition_call', text: '        int pi = partition(arr, low, high);' },
                { key: 'recurse_left', text: '        quickSort(arr, low, pi - 1);' },
                { key: 'recurse_right', text: '        quickSort(arr, pi + 1, high);' },
                { key: 'part_close', text: '    }' },
                { key: 'close', text: '}' },
                { key: 'part_def', text: 'private static int partition(int[] arr, int low, int high) {' },
                { key: 'pivot_select', text: '    int pivot = arr[high], i = low - 1;' },
                { key: 'loop', text: '    for (int j = low; j < high; j++) {' },
                { key: 'compare', text: '        if (arr[j] < pivot) {' },
                { key: 'swap', text: '            i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t;' },
                { key: 'loop_close', text: '        }' },
                { key: 'end_loop', text: '    }' },
                { key: 'pivot_swap', text: '    int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;' },
                { key: 'return_pi', text: '    return i + 1;' },
                { key: 'func_close', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function quickSort(arr, low = 0, high = arr.length - 1) {' },
                { key: 'base_case', text: '    if (low < high) {' },
                { key: 'partition_call', text: '        const pi = partition(arr, low, high);' },
                { key: 'recurse_left', text: '        quickSort(arr, low, pi - 1);' },
                { key: 'recurse_right', text: '        quickSort(arr, pi + 1, high);' },
                { key: 'part_close', text: '    }' },
                { key: 'close', text: '    return arr;' },
                { key: 'end', text: '}' }
            ]
        },
        merge: {
            name: 'Merge Sort',
            python: [
                { key: 'header', text: 'def merge_sort(arr, l, r):' },
                { key: 'base_case', text: '    if l < r:' },
                { key: 'mid_calc', text: '        m = l + (r - l) // 2' },
                { key: 'recurse_left', text: '        merge_sort(arr, l, m)' },
                { key: 'recurse_right', text: '        merge_sort(arr, m + 1, r)' },
                { key: 'merge_call', text: '        merge(arr, l, m, r)' },
                { key: 'merge_def', text: 'def merge(arr, l, m, r):' },
                { key: 'temp_create', text: '    L, R = arr[l:m+1], arr[m+1:r+1]' },
                { key: 'compare', text: '    while i < len(L) and j < len(R):' },
                { key: 'write', text: '        if L[i] <= R[j]: arr[k] = L[i]; i += 1' },
                { key: 'write_alt', text: '        else: arr[k] = R[j]; j += 1' }
            ],
            cpp: [
                { key: 'header', text: 'void mergeSort(vector<int>& arr, int l, int r) {' },
                { key: 'base_case', text: '    if (l < r) {' },
                { key: 'mid_calc', text: '        int m = l + (r - l) / 2;' },
                { key: 'recurse_left', text: '        mergeSort(arr, l, m);' },
                { key: 'recurse_right', text: '        mergeSort(arr, m + 1, r);' },
                { key: 'merge_call', text: '        merge(arr, l, m, r);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void mergeSort(int[] arr, int l, int r) {' },
                { key: 'base_case', text: '    if (l < r) {' },
                { key: 'mid_calc', text: '        int m = l + (r - l) / 2;' },
                { key: 'recurse_left', text: '        mergeSort(arr, l, m);' },
                { key: 'recurse_right', text: '        mergeSort(arr, m + 1, r);' },
                { key: 'merge_call', text: '        merge(arr, l, m, r);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function mergeSort(arr, l = 0, r = arr.length - 1) {' },
                { key: 'base_case', text: '    if (l < r) {' },
                { key: 'mid_calc', text: '        const m = Math.floor((l + r) / 2);' },
                { key: 'recurse_left', text: '        mergeSort(arr, l, m);' },
                { key: 'recurse_right', text: '        mergeSort(arr, m + 1, r);' },
                { key: 'merge_call', text: '        merge(arr, l, m, r);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ]
        },
        heap: {
            name: 'Heap Sort',
            python: [
                { key: 'header', text: 'def heap_sort(arr):' },
                { key: 'build_heap', text: '    for i in range(len(arr) // 2 - 1, -1, -1):' },
                { key: 'heapify_init', text: '        heapify(arr, len(arr), i)' },
                { key: 'extract_loop', text: '    for i in range(len(arr) - 1, 0, -1):' },
                { key: 'swap_root', text: '        arr[i], arr[0] = arr[0], arr[i]' },
                { key: 'heapify_call', text: '        heapify(arr, i, 0)' },
                { key: 'heapify_def', text: 'def heapify(arr, n, i):' },
                { key: 'largest_init', text: '    largest = i; l = 2*i + 1; r = 2*i + 2' },
                { key: 'compare', text: '    if l < n and arr[l] > arr[largest]: largest = l' },
                { key: 'compare_r', text: '    if r < n and arr[r] > arr[largest]: largest = r' },
                { key: 'swap', text: '    if largest != i: arr[i], arr[largest] = arr[largest], arr[i]; heapify(arr, n, largest)' }
            ],
            cpp: [
                { key: 'header', text: 'void heapSort(vector<int>& arr) {' },
                { key: 'build_heap', text: '    int n = arr.size();' },
                { key: 'heapify_init', text: '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);' },
                { key: 'extract_loop', text: '    for (int i = n - 1; i > 0; i--) {' },
                { key: 'swap_root', text: '        std::swap(arr[0], arr[i]);' },
                { key: 'heapify_call', text: '        heapify(arr, i, 0);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ],
            java: [
                { key: 'header', text: 'public static void heapSort(int[] arr) {' },
                { key: 'build_heap', text: '    int n = arr.length;' },
                { key: 'heapify_init', text: '    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);' },
                { key: 'extract_loop', text: '    for (int i = n - 1; i > 0; i--) {' },
                { key: 'swap_root', text: '        int t = arr[0]; arr[0] = arr[i]; arr[i] = t;' },
                { key: 'heapify_call', text: '        heapify(arr, i, 0);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ],
            javascript: [
                { key: 'header', text: 'function heapSort(arr) {' },
                { key: 'build_heap', text: '    const n = arr.length;' },
                { key: 'heapify_init', text: '    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);' },
                { key: 'extract_loop', text: '    for (let i = n - 1; i > 0; i--) {' },
                { key: 'swap_root', text: '        [arr[0], arr[i]] = [arr[i], arr[0]];' },
                { key: 'heapify_call', text: '        heapify(arr, i, 0);' },
                { key: 'close', text: '    }' },
                { key: 'end', text: '}' }
            ]
        }
    },

    setAlgo(algoKey) {
        if (this.codebase[algoKey]) {
            this.currentAlgo = algoKey;
            this.render();
        }
    },

    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('algolearn_code_lang', lang);
        this.render();
    },

    highlightLine(lineKey) {
        this.activeLineKey = lineKey;
        const container = document.getElementById('code-sync-lines');
        if (!container) return;

        const lines = container.querySelectorAll('.code-line');
        lines.forEach(line => {
            const isMatch = line.getAttribute('data-key') === lineKey;
            line.classList.toggle('active-code-line', isMatch);
            if (isMatch) {
                // Scroll ONLY inside the code snippet container without affecting window / page scroll
                const lineTop = line.offsetTop - container.offsetTop;
                const lineHeight = line.offsetHeight || 24;
                if (lineTop < container.scrollTop) {
                    container.scrollTop = lineTop;
                } else if (lineTop + lineHeight > container.scrollTop + container.clientHeight) {
                    container.scrollTop = lineTop + lineHeight - container.clientHeight;
                }
            }
        });
    },

    render() {
        const titleEl = document.getElementById('code-sync-algo-title');
        const container = document.getElementById('code-sync-lines');
        const langBtns = document.querySelectorAll('.code-lang-tab');

        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
        });

        const algoData = this.codebase[this.currentAlgo] || this.codebase.bubble;
        if (titleEl) titleEl.textContent = `${algoData.name} — ${this.currentLang.toUpperCase()} Implementation`;

        if (!container) return;
        container.innerHTML = '';

        const lines = algoData[this.currentLang] || algoData.python;
        lines.forEach((line, idx) => {
            const row = document.createElement('div');
            row.className = `code-line ${line.key === this.activeLineKey ? 'active-code-line' : ''}`;
            row.setAttribute('data-key', line.key);
            row.innerHTML = `
                <span class="code-line-no">${idx + 1}</span>
                <span class="code-line-text">${this.escapeHtml(line.text)}</span>
            `;
            container.appendChild(row);
        });
    },

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CodeSync.render();
    document.querySelectorAll('.code-lang-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            CodeSync.setLang(this.getAttribute('data-lang'));
        });
    });
});

if (typeof window !== 'undefined') {
    window.CodeSync = CodeSync;
}
