/**
 * CodeLab Algorithm Templates
 * Ready-to-use, fully debuggable templates across JavaScript, Python, C++, and Java.
 */

const CodeLabTemplates = {
    custom: {
        id: 'custom',
        name: 'Custom Code Studio',
        category: 'Custom Workspace',
        dsType: 'custom',
        description: 'Universal live debugging workspace. Write, paste, or modify arbitrary programs in Python, JavaScript, C, C++, or Java.',
        code: {
            javascript: `// AlgoLearn Universal Debugger (JavaScript)
// Write or paste any custom code here to debug!

function findPrimes(limit) {
    let primes = [];
    for (let num = 2; num <= limit; num++) {
        let isPrime = true;
        for (let i = 2; i * i <= num; i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) primes.push(num);
    }
    return primes;
}

let result = findPrimes(20);
console.log("Found primes:", result);`,
            python: `# AlgoLearn Universal Debugger (Python)
# Write or paste any custom code here to debug!

def calculate_stats(numbers):
    total = 0
    squares = []
    for num in numbers:
        total += num
        squares.append(num * num)
    average = total / len(numbers)
    return total, average, squares

data = [12, 5, 8, 19, 3]
total, avg, sq = calculate_stats(data)
print(f"Total: {total}, Average: {avg}")
print("Squared items:", sq)`,
            c: `// AlgoLearn Universal Debugger (C)
// Write or paste any custom code here to debug!
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 42;
    int y = 99;
    printf("Before swap: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After swap:  x=%d, y=%d\\n", x, y);
    return 0;
}`,
            cpp: `// AlgoLearn Universal Debugger (C++)
// Write or paste any custom code here to debug!
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {4, 7, 2, 9, 5};
    int sum = 0;
    for (int val : nums) {
        sum += val;
        std::cout << "Added " << val << ", sum = " << sum << std::endl;
    }
    std::cout << "Final sum: " << sum << std::endl;
    return 0;
}`,
            java: `// AlgoLearn Universal Debugger (Java)
// Write or paste any custom code here to debug!
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {8, 3, 12, 1, 6};
        int maxVal = numbers[0];
        
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > maxVal) {
                maxVal = numbers[i];
            }
        }
        
        System.out.println("Numbers: " + Arrays.toString(numbers));
        System.out.println("Max value: " + maxVal);
    }
}`
        }
    },
    bubble: {
        id: 'bubble',
        name: 'Bubble Sort',
        category: 'Sorting',
        dsType: 'array',
        description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        code: {
            javascript: `// CodeLab: Bubble Sort with Visual Tracing
function bubbleSort(arr) {
    let n = arr.length;
    console.log("Starting Bubble Sort on array:", arr);
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap arr[j] and arr[j+1]
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                console.log(\`Swapped \${arr[j]} and \${arr[j+1]}\`);
            }
        }
    }
    return arr;
}

let numbers = [45, 12, 85, 32, 89, 39, 69, 22];
bubbleSort(numbers);
console.log("Sorted array:", numbers);`,
            python: `# CodeLab: Bubble Sort (Python)
def bubble_sort(arr):
    n = len(arr)
    print("Starting Bubble Sort on:", arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                print(f"Swapped {arr[j]} and {arr[j+1]}")
    return arr

numbers = [45, 12, 85, 32, 89, 39, 69, 22]
bubble_sort(numbers)
print("Sorted array:", numbers)`,
            c: `// CodeLab: Bubble Sort (C)
#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int numbers[] = {45, 12, 85, 32, 89, 39, 69, 22};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    bubbleSort(numbers, n);
    printf("Bubble Sort Complete\\n");
    return 0;
}`,
            cpp: `// CodeLab: Bubble Sort (C++)
#include <iostream>
#include <vector>

void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}

int main() {
    std::vector<int> numbers = {45, 12, 85, 32, 89, 39, 69, 22};
    bubbleSort(numbers);
    std::cout << "Sorted array complete\\n";
    return 0;
}`,
            java: `// CodeLab: Bubble Sort (Java)
import java.util.Arrays;

public class Main {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] numbers = {45, 12, 85, 32, 89, 39, 69, 22};
        bubbleSort(numbers);
        System.out.println("Sorted: " + Arrays.toString(numbers));
    }
}`
        }
    },

    selection: {
        id: 'selection',
        name: 'Selection Sort',
        category: 'Sorting',
        dsType: 'array',
        description: 'Finds the minimum element from the unsorted part and places it at the beginning.',
        code: {
            javascript: `// CodeLab: Selection Sort
function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            let temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            console.log(\`Moved \${arr[i]} to index \${i}\`);
        }
    }
    return arr;
}

let numbers = [64, 25, 12, 22, 11, 90, 48];
selectionSort(numbers);
console.log("Sorted:", numbers);`,
            python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

numbers = [64, 25, 12, 22, 11, 90, 48]
selection_sort(numbers)
print("Sorted:", numbers)`,
            c: `// Selection Sort (C)
#include <stdio.h>

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}

int main() {
    int numbers[] = {64, 25, 12, 22, 11, 90, 48};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    selectionSort(numbers, n);
    printf("Selection Sort complete\\n");
    return 0;
}`,
            cpp: `// Selection Sort C++
#include <vector>
#include <algorithm>
#include <iostream>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) std::swap(arr[i], arr[minIdx]);
    }
}

int main() {
    std::vector<int> numbers = {64, 25, 12, 22, 11, 90, 48};
    selectionSort(numbers);
    return 0;
}`,
            java: `public class Main {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }

    public static void main(String[] args) {
        int[] numbers = {64, 25, 12, 22, 11, 90, 48};
        selectionSort(numbers);
        System.out.println("Sorted: " + java.util.Arrays.toString(numbers));
    }
}`
        }
    },

    insertion: {
        id: 'insertion',
        name: 'Insertion Sort',
        category: 'Sorting',
        dsType: 'array',
        description: 'Builds the sorted array one item at a time by repeatedly picking the next element and inserting it into its correct position.',
        code: {
            javascript: `// CodeLab: Insertion Sort
function insertionSort(arr) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
        console.log(\`Inserted key \${key} at index \${j + 1}\`);
    }
    return arr;
}

let numbers = [50, 20, 60, 10, 30, 40];
insertionSort(numbers);
console.log("Sorted:", numbers);`,
            python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

numbers = [50, 20, 60, 10, 30, 40]
insertion_sort(numbers)
print("Sorted:", numbers)`,
            c: `// Insertion Sort (C)
#include <stdio.h>

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int numbers[] = {50, 20, 60, 10, 30, 40};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    insertionSort(numbers, n);
    printf("Insertion Sort complete\\n");
    return 0;
}`,
            cpp: `// Insertion Sort C++
#include <vector>
#include <iostream>

void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    std::vector<int> numbers = {50, 20, 60, 10, 30, 40};
    insertionSort(numbers);
    return 0;
}`,
            java: `public class Main {
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] numbers = {50, 20, 60, 10, 30, 40};
        insertionSort(numbers);
        System.out.println("Sorted: " + java.util.Arrays.toString(numbers));
    }
}`
        }
    },

    binary_search: {
        id: 'binary_search',
        name: 'Binary Search',
        category: 'Searching',
        dsType: 'array',
        description: 'Search a sorted array by repeatedly dividing the search interval in half.',
        code: {
            javascript: `// CodeLab: Binary Search (Divide & Conquer)
function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    console.log(\`Searching for target: \${target} in sorted array\`);

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        console.log(\`Window: [\${low}..\${high}], mid: \${mid}, value: \${arr[mid]}\`);

        if (arr[mid] === target) {
            console.log(\`Target \${target} found at index \${mid}!\`);
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log("Target not found in array.");
    return -1;
}

let sortedNumbers = [11, 22, 33, 44, 55, 66, 77, 88, 99];
let result = binarySearch(sortedNumbers, 55);`,
            python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

sorted_nums = [11, 22, 33, 44, 55, 66, 77, 88, 99]
res = binary_search(sorted_nums, 55)
print("Found at:", res)`,
            c: `// Binary Search (C)
#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int sortedNumbers[] = {11, 22, 33, 44, 55, 66, 77, 88, 99};
    int n = sizeof(sortedNumbers) / sizeof(sortedNumbers[0]);
    int result = binarySearch(sortedNumbers, n, 55);
    printf("Result index: %d\\n", result);
    return 0;
}`,
            cpp: `// Binary Search C++
#include <vector>
#include <iostream>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> sortedNumbers = {11, 22, 33, 44, 55, 66, 77, 88, 99};
    int result = binarySearch(sortedNumbers, 55);
    return 0;
}`,
            java: `public class Main {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] sortedNumbers = {11, 22, 33, 44, 55, 66, 77, 88, 99};
        int result = binarySearch(sortedNumbers, 55);
        System.out.println("Result: " + result);
    }
}`
        }
    },

    linear_search: {
        id: 'linear_search',
        name: 'Linear Search',
        category: 'Searching',
        dsType: 'array',
        description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
        code: {
            javascript: `// CodeLab: Linear Search
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        console.log(\`Checking index \${i}: \${arr[i]}\`);
        if (arr[i] === target) {
            console.log(\`Found \${target} at index \${i}\`);
            return i;
        }
    }
    console.log("Element not found.");
    return -1;
}

let list = [23, 45, 12, 78, 90, 56, 34];
linearSearch(list, 78);`,
            python: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1

lst = [23, 45, 12, 78, 90, 56, 34]
print("Index:", linear_search(lst, 78))`,
            c: `// Linear Search (C)
#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    int list[] = {23, 45, 12, 78, 90, 56, 34};
    int n = sizeof(list) / sizeof(list[0]);
    int result = linearSearch(list, n, 78);
    printf("Found at index: %d\\n", result);
    return 0;
}`,
            cpp: `// Linear Search C++
#include <vector>
#include <iostream>

int linearSearch(const std::vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main() {
    std::vector<int> list = {23, 45, 12, 78, 90, 56, 34};
    int result = linearSearch(list, 78);
    return 0;
}`,
            java: `public class Main {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] list = {23, 45, 12, 78, 90, 56, 34};
        int result = linearSearch(list, 78);
        System.out.println("Result: " + result);
    }
}`
        }
    },

    quick: {
        id: 'quick',
        name: 'Quick Sort (Recursive)',
        category: 'Sorting',
        dsType: 'array',
        description: 'Picks an element as pivot and partitions the given array around the picked pivot recursively.',
        code: {
            javascript: `// CodeLab: Quick Sort with Recursive Call Stack
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = partition(arr, low, high);
        console.log(\`Pivot \${arr[pi]} fixed at position \${pi}\`);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}

let numbers = [35, 10, 80, 45, 20, 90, 55];
quickSort(numbers);
console.log("Quick Sorted:", numbers);`,
            python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

nums = [35, 10, 80, 45, 20, 90, 55]
quick_sort(nums, 0, len(nums) - 1)
print("Sorted:", nums)`,
            cpp: `// Quick Sort C++
#include <vector>
#include <algorithm>
#include <iostream>

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; ++j) {
            if (arr[j] < pivot) std::swap(arr[++i], arr[j]);
        }
        std::swap(arr[i + 1], arr[high]);
        int pi = i + 1;
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> numbers = {35, 10, 80, 45, 20, 90, 55};
    quickSort(numbers, 0, numbers.size() - 1);
    return 0;
}`,
            java: `public class Main {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivot = arr[high];
            int i = low - 1;
            for (int j = low; j < high; j++) {
                if (arr[j] < pivot) {
                    i++;
                    int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                }
            }
            int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
            int pi = i + 1;
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    public static void main(String[] args) {
        int[] numbers = {35, 10, 80, 45, 20, 90, 55};
        quickSort(numbers, 0, numbers.length - 1);
        System.out.println("Sorted: " + java.util.Arrays.toString(numbers));
    }
}`
        }
    },

    merge: {
        id: 'merge',
        name: 'Merge Sort',
        category: 'Sorting',
        dsType: 'array',
        description: 'Divides the array into two halves, recursively sorts them, and merges the sorted halves.',
        code: {
            javascript: `// CodeLab: Merge Sort
function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

let numbers = [38, 27, 43, 3, 9, 82, 10];
let sorted = mergeSort(numbers);
console.log("Merge Sorted:", sorted);`,
            python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    return res + left[i:] + right[j:]

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))`,
            cpp: `// Merge Sort C++
#include <vector>
#include <iostream>

std::vector<int> mergeSort(std::vector<int> arr) {
    if (arr.size() <= 1) return arr;
    int mid = arr.size() / 2;
    std::vector<int> left(arr.begin(), arr.begin() + mid);
    std::vector<int> right(arr.begin() + mid, arr.end());
    left = mergeSort(left);
    right = mergeSort(right);
    std::vector<int> res;
    int i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) res.push_back(left[i++]);
        else res.push_back(right[j++]);
    }
    while (i < left.size()) res.push_back(left[i++]);
    while (j < right.size()) res.push_back(right[j++]);
    return res;
}

int main() {
    std::vector<int> numbers = {38, 27, 43, 3, 9, 82, 10};
    std::vector<int> sorted = mergeSort(numbers);
    return 0;
}`,
            java: `// Java Merge Sort template
import java.util.Arrays;
public class Main {
    public static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) return arr;
        int mid = arr.length / 2;
        int[] left = Arrays.copyOfRange(arr, 0, mid);
        int[] right = Arrays.copyOfRange(arr, mid, arr.length);
        left = mergeSort(left);
        right = mergeSort(right);
        int[] res = new int[arr.length];
        int i = 0, j = 0, k = 0;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) res[k++] = left[i++];
            else res[k++] = right[j++];
        }
        while (i < left.length) res[k++] = left[i++];
        while (j < right.length) res[k++] = right[j++];
        return res;
    }

    public static void main(String[] args) {
        int[] numbers = {38, 27, 43, 3, 9, 82, 10};
        int[] sorted = mergeSort(numbers);
        System.out.println("Sorted: " + Arrays.toString(sorted));
    }
}`
        }
    },

    stack: {
        id: 'stack',
        name: 'Stack (LIFO)',
        category: 'Data Structures',
        dsType: 'stack',
        description: 'Last-In, First-Out collection supporting push, pop, and peek operations.',
        code: {
            javascript: `// CodeLab: Stack (LIFO) Demonstration
class Stack {
    constructor() {
        this.items = [];
    }
    push(element) {
        this.items.push(element);
        console.log(\`Pushed: \${element} | Stack: \`, this.items);
    }
    pop() {
        if (this.isEmpty()) return null;
        let popped = this.items.pop();
        console.log(\`Popped: \${popped} | Remaining: \`, this.items);
        return popped;
    }
    peek() {
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

let stack = new Stack();
stack.push(10);
stack.push(25);
stack.push(42);
stack.push(88);
let top = stack.peek();
stack.pop();
stack.push(99);
stack.pop();`,
            python: `# Stack in Python (using list)
stack = []
def push(val):
    stack.append(val)
    print("Pushed:", val, stack)

def pop():
    val = stack.pop()
    print("Popped:", val, stack)
    return val

push(10)
push(25)
push(42)
pop()`,
            cpp: `#include <iostream>
#include <stack>

int main() {
    std::stack<int> s;
    s.push(10);
    s.push(20);
    s.pop();
    return 0;
}`,
            java: `import java.util.Stack;
public class Main {
    public static void main(String[] args) {
        Stack<Integer> s = new Stack<>();
        s.push(10);
        s.push(20);
        s.pop();
    }
}`
        }
    },

    queue: {
        id: 'queue',
        name: 'Queue (FIFO)',
        category: 'Data Structures',
        dsType: 'queue',
        description: 'First-In, First-Out collection supporting enqueue and dequeue operations.',
        code: {
            javascript: `// CodeLab: Queue (FIFO) Demonstration
class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(element) {
        this.items.push(element);
        console.log(\`Enqueued: \${element} | Queue:\`, this.items);
    }
    dequeue() {
        if (this.isEmpty()) return null;
        let removed = this.items.shift();
        console.log(\`Dequeued: \${removed} | Remaining:\`, this.items);
        return removed;
    }
    front() {
        return this.items[0];
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

let queue = new Queue();
queue.enqueue(15);
queue.enqueue(30);
queue.enqueue(45);
queue.enqueue(60);
queue.dequeue();
queue.enqueue(75);
queue.dequeue();`,
            python: `queue = []
def enqueue(val):
    queue.append(val)
    print("Enqueued:", val, queue)

def dequeue():
    val = queue.pop(0)
    print("Dequeued:", val, queue)
    return val

enqueue(15)
enqueue(30)
dequeue()`,
            cpp: `#include <queue>
int main() {
    std::queue<int> q;
    q.push(15);
    q.push(30);
    q.pop();
    return 0;
}`,
            java: `import java.util.LinkedList;
import java.util.Queue;
public class Main {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        q.add(15);
        q.add(30);
        q.poll();
    }
}`
        }
    },

    linkedlist: {
        id: 'linkedlist',
        name: 'Linked List (Singly)',
        category: 'Data Structures',
        dsType: 'linkedlist',
        description: 'Linear data structure where elements are stored in nodes connected by pointers.',
        code: {
            javascript: `// CodeLab: Singly Linked List Reversal
class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
    }
}

function reverseList(head) {
    let prev = null;
    let curr = head;

    while (curr !== null) {
        let nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
        console.log(\`Reversed pointer for node \${prev.val}\`);
    }
    return prev;
}

// Build list: 10 -> 20 -> 30 -> 40
let head = new ListNode(10, new ListNode(20, new ListNode(30, new ListNode(40))));
console.log("Initial list created:", head);
let reversedHead = reverseList(head);
console.log("Reversed list complete:", reversedHead);`,
            python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev

head = ListNode(10, ListNode(20, ListNode(30, ListNode(40))))
rev = reverse_list(head)`,
            cpp: `// Linked List C++
#include <iostream>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x, ListNode* n = nullptr) : val(x), next(n) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}

int main() {
    ListNode* head = new ListNode(10, new ListNode(20, new ListNode(30, new ListNode(40))));
    ListNode* reversed = reverseList(head);
    return 0;
}`,
            java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; this.next = null; }
}
public class Main {
    public static ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }

    public static void main(String[] args) {
        ListNode head = new ListNode(10);
        head.next = new ListNode(20);
        head.next.next = new ListNode(30);
        head.next.next.next = new ListNode(40);
        ListNode reversed = reverseList(head);
    }
}`
        }
    },

    binary_tree: {
        id: 'binary_tree',
        name: 'Binary Tree Traversal',
        category: 'Trees',
        dsType: 'tree',
        description: 'Hierarchical tree structure with nodes having at most two children (left and right).',
        code: {
            javascript: `// CodeLab: Binary Tree In-Order Traversal (Recursion)
class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

let visited = [];

function inorderTraversal(root) {
    if (!root) return;
    
    inorderTraversal(root.left);
    visited.push(root.val);
    console.log(\`Visited node: \${root.val} | Traversal so far: \`, visited);
    inorderTraversal(root.right);
}

// Build sample tree:
//        50
//       /  \\
//     30    70
//    /  \\   /  \\
//   20  40 60  80
let root = new TreeNode(50,
    new TreeNode(30, new TreeNode(20), new TreeNode(40)),
    new TreeNode(70, new TreeNode(60), new TreeNode(80))
);

console.log("Tree created, starting in-order traversal...");
inorderTraversal(root);
console.log("Final visited order:", visited);`,
            python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

visited = []
def inorder(root):
    if not root:
        return
    inorder(root.left)
    visited.append(root.val)
    inorder(root.right)

root = TreeNode(50, TreeNode(30, TreeNode(20), TreeNode(40)), TreeNode(70, TreeNode(60), TreeNode(80)))
inorder(root)
print("Visited:", visited)`,
            cpp: `// Binary Tree C++
#include <vector>
#include <iostream>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v, TreeNode* l = nullptr, TreeNode* r = nullptr) : val(v), left(l), right(r) {}
};

void inorder(TreeNode* root, std::vector<int>& out) {
    if (!root) return;
    inorder(root->left, out);
    out.push_back(root->val);
    inorder(root->right, out);
}

int main() {
    TreeNode* root = new TreeNode(50,
        new TreeNode(30, new TreeNode(20), new TreeNode(40)),
        new TreeNode(70, new TreeNode(60), new TreeNode(80))
    );
    std::vector<int> visited;
    inorder(root, visited);
    return 0;
}`,
            java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}
public class Main {
    public static void inorder(TreeNode root) {
        if (root == null) return;
        inorder(root.left);
        System.out.print(root.val + " ");
        inorder(root.right);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(50);
        root.left = new TreeNode(30);
        root.right = new TreeNode(70);
        root.left.left = new TreeNode(20);
        root.left.right = new TreeNode(40);
        inorder(root);
    }
}`
        }
    },

    bfs: {
        id: 'bfs',
        name: 'Breadth-First Search (BFS)',
        category: 'Graphs',
        dsType: 'graph',
        description: 'Level-order traversal of a graph using a queue.',
        code: {
            javascript: `// CodeLab: Graph Breadth-First Search (BFS)
function bfs(graph, startNode) {
    let visited = new Set();
    let queue = [startNode];
    let traversalOrder = [];
    visited.add(startNode);

    console.log(\`Starting BFS from node: \${startNode}\`);

    while (queue.length > 0) {
        let current = queue.shift();
        traversalOrder.push(current);
        console.log(\`Processing node \${current}. Queue: \${queue}\`);

        let neighbors = graph[current] || [];
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                console.log(\`Discovered unvisited neighbor: \${neighbor}\`);
            }
        }
    }
    return traversalOrder;
}

const graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1, 5],
    5: [2, 4]
};

let result = bfs(graph, 0);
console.log("BFS Complete traversal:", result);`,
            python: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

graph = {0: [1, 2], 1: [0, 3, 4], 2: [0, 5], 3: [1], 4: [1, 5], 5: [2, 4]}
print("BFS:", bfs(graph, 0))`,
            cpp: `// Graph BFS C++
#include <vector>
#include <queue>
#include <iostream>

std::vector<int> bfs(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<int> order;
    std::vector<bool> visited(adj.size(), false);
    std::queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return order;
}

int main() {
    std::vector<std::vector<int>> adj = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1, 5}, {2, 4}};
    std::vector<int> result = bfs(adj, 0);
    return 0;
}`,
            java: `// Graph BFS Java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] graph = {
            {1, 2},
            {0, 3, 4},
            {0, 5},
            {1},
            {1, 5},
            {2, 4}
        };
        boolean[] visited = new boolean[graph.length];
        Queue<Integer> q = new LinkedList<>();
        List<Integer> order = new ArrayList<>();
        visited[0] = true;
        q.add(0);
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : graph[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    q.add(v);
                }
            }
        }
        System.out.println("BFS: " + order);
    }
}`
        }
    },

    dfs: {
        id: 'dfs',
        name: 'Depth-First Search (DFS)',
        category: 'Graphs',
        dsType: 'graph',
        description: 'Explores as far as possible along each branch before backtracking.',
        code: {
            javascript: `// CodeLab: Graph Depth-First Search (DFS)
function dfs(graph, startNode) {
    let visited = new Set();
    let order = [];

    function explore(node) {
        visited.add(node);
        order.push(node);
        console.log(\`Visiting node: \${node} | Depth stack: \${order.length}\`);

        let neighbors = graph[node] || [];
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                explore(neighbor);
            }
        }
    }

    explore(startNode);
    return order;
}

const graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5],
    3: [1],
    4: [1, 5],
    5: [2, 4]
};

let result = dfs(graph, 0);
console.log("DFS Complete traversal:", result);`,
            python: `def dfs(graph, start):
    visited = set()
    order = []
    def explore(node):
        visited.add(node)
        order.append(node)
        for nbr in graph.get(node, []):
            if nbr not in visited:
                explore(nbr)
    explore(start)
    return order

graph = {0: [1, 2], 1: [0, 3, 4], 2: [0, 5], 3: [1], 4: [1, 5], 5: [2, 4]}
print("DFS:", dfs(graph, 0))`,
            cpp: `// Graph DFS C++
#include <vector>
#include <iostream>

void dfsHelper(int u, const std::vector<std::vector<int>>& adj, std::vector<bool>& vis, std::vector<int>& out) {
    vis[u] = true;
    out.push_back(u);
    for (int v : adj[u]) {
        if (!vis[v]) dfsHelper(v, adj, vis, out);
    }
}

int main() {
    std::vector<std::vector<int>> adj = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1, 5}, {2, 4}};
    std::vector<bool> vis(adj.size(), false);
    std::vector<int> out;
    dfsHelper(0, adj, vis, out);
    return 0;
}`,
            java: `// Graph DFS Java
import java.util.*;

public class Main {
    static void dfs(int u, int[][] graph, boolean[] visited, List<Integer> order) {
        visited[u] = true;
        order.add(u);
        for (int v : graph[u]) {
            if (!visited[v]) dfs(v, graph, visited, order);
        }
    }

    public static void main(String[] args) {
        int[][] graph = {
            {1, 2},
            {0, 3, 4},
            {0, 5},
            {1},
            {1, 5},
            {2, 4}
        };
        boolean[] visited = new boolean[graph.length];
        List<Integer> order = new ArrayList<>();
        dfs(0, graph, visited, order);
        System.out.println("DFS: " + order);
    }
}`
        }
    },

    dijkstra: {
        id: 'dijkstra',
        name: "Dijkstra's Shortest Path",
        category: 'Graphs',
        dsType: 'graph',
        description: 'Finds the shortest paths between nodes in a graph with non-negative edge weights.',
        code: {
            javascript: `// CodeLab: Dijkstra's Algorithm
function dijkstra(graph, startNode) {
    const distances = {};
    const visited = new Set();
    const nodes = Object.keys(graph);

    nodes.forEach(node => distances[node] = Infinity);
    distances[startNode] = 0;

    console.log(\`Finding shortest paths from source node \${startNode}\`);

    while (visited.size < nodes.length) {
        // Pick unvisited node with smallest distance
        let closestNode = null;
        let minDistance = Infinity;

        for (let node of nodes) {
            if (!visited.has(node) && distances[node] < minDistance) {
                minDistance = distances[node];
                closestNode = node;
            }
        }

        if (closestNode === null || minDistance === Infinity) break;
        visited.add(closestNode);
        console.log(\`Relaxing node \${closestNode} with shortest distance \${minDistance}\`);

        let neighbors = graph[closestNode] || {};
        for (let neighbor in neighbors) {
            let weight = neighbors[neighbor];
            let newDist = distances[closestNode] + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                console.log(\`Updated shortest dist to \${neighbor}: \${newDist}\`);
            }
        }
    }
    return distances;
}

const weightedGraph = {
    'A': { 'B': 4, 'C': 2 },
    'B': { 'A': 4, 'C': 1, 'D': 5 },
    'C': { 'A': 2, 'B': 1, 'D': 8, 'E': 10 },
    'D': { 'B': 5, 'C': 8, 'E': 2 },
    'E': { 'C': 10, 'D': 2 }
};

let shortestPaths = dijkstra(weightedGraph, 'A');
console.log("Shortest distances from A:", shortestPaths);`,
            python: `import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if curr_dist > distances[u]:
            continue
        for v, weight in graph[u].items():
            dist = curr_dist + weight
            if dist < distances[v]:
                distances[v] = dist
                heapq.heappush(pq, (dist, v))
    return distances

graph = {
    'A': {'B': 4, 'C': 2},
    'B': {'A': 4, 'C': 1, 'D': 5},
    'C': {'A': 2, 'B': 1, 'D': 8},
    'D': {'B': 5, 'C': 8}
}
print(dijkstra(graph, 'A'))`,
            cpp: `// Dijkstra Shortest Path C++
#include <vector>
#include <iostream>

int main() {
    std::vector<std::vector<int>> graph = {
        {0, 4, 2, 0},
        {4, 0, 1, 5},
        {2, 1, 0, 8},
        {0, 5, 8, 0}
    };
    int n = graph.size();
    std::vector<int> dist(n, 9999);
    std::vector<bool> visited(n, false);
    dist[0] = 0;
    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int j = 0; j < n; j++) {
            if (!visited[j] && (u == -1 || dist[j] < dist[u])) u = j;
        }
        if (u == -1 || dist[u] == 9999) break;
        visited[u] = true;
        for (int v = 0; v < n; v++) {
            if (graph[u][v] > 0 && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }
    std::cout << "Shortest distances computed" << std::endl;
    return 0;
}`,
            java: `// Dijkstra Shortest Path Java
public class Main {
    public static void main(String[] args) {
        int[][] graph = {
            {0, 4, 2, 0},
            {4, 0, 1, 5},
            {2, 1, 0, 8},
            {0, 5, 8, 0}
        };
        int n = graph.length;
        int[] dist = new int[n];
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++) dist[i] = 9999;
        dist[0] = 0;
        for (int i = 0; i < n; i++) {
            int u = -1;
            for (int j = 0; j < n; j++) {
                if (!visited[j] && (u == -1 || dist[j] < dist[u])) u = j;
            }
            if (u == -1 || dist[u] == 9999) break;
            visited[u] = true;
            for (int v = 0; v < n; v++) {
                if (graph[u][v] > 0 && dist[u] + graph[u][v] < dist[v]) {
                    dist[v] = dist[u] + graph[u][v];
                }
            }
        }
        System.out.println("Distances: " + java.util.Arrays.toString(dist));
    }
}`
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeLabTemplates;
}
