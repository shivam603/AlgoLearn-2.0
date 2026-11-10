/**
 * AlgoLearn Curated LeetCode Problem Bank — MEDIUM (40 Problems)
 */

const MEDIUM_PROBLEMS = [
    // 31. Maximum Subarray (#53)
    {
        id: 'max_subarray',
        leetcodeId: 53,
        title: "Maximum Subarray (Kadane's)",
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        examples: [
            { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.' },
            { input: 'nums = [5, 4, -1, 7, 8]', output: '23' }
        ],
        constraints: ['1 <= nums.length <= 10^4', '-10^4 <= nums[i] <= 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: "Kadane's 1D DP" },
        io: {
            pyFn: 'max_subarray', jsFn: 'maxSubArray', javaMethod: 'maxSubArray', cppMethod: 'maxSubArray', cFn: 'maxSubArray',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic Mixed Array', hidden: false, input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
            { id: 2, name: 'Single Element', hidden: false, input: { nums: [1] }, expected: 1 },
            { id: 3, name: 'Mostly Positive', hidden: false, input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
            { id: 4, name: 'All Negative', hidden: true, input: { nums: [-5, -2, -9, -1] }, expected: -1 },
            { id: 5, name: 'Recovery Peak', hidden: true, input: { nums: [10, -3, 4, -1, 2, 1, -8, 12] }, expected: 17 }
        ],
        starterCode: {
            python: `def max_subarray(nums):\n    best = curr = nums[0]\n    for x in nums[1:]:\n        curr = max(x, curr + x)\n        best = max(best, curr)\n    return best`,
            javascript: `function maxSubArray(nums) {\n    let best = nums[0], curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        best = Math.max(best, curr);\n    }\n    return best;\n}`,
            java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int best = nums[0], curr = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            curr = Math.max(nums[i], curr + nums[i]);\n            best = Math.max(best, curr);\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int best = nums[0], curr = nums[0];\n        for (int i = 1; i < (int)nums.size(); i++) {\n            curr = max(nums[i], curr + nums[i]);\n            best = max(best, curr);\n        }\n        return best;\n    }\n};`,
            c: `int maxSubArray(const int* nums, int n) {\n    int best = nums[0], curr = nums[0];\n    for (int i = 1; i < n; i++) {\n        curr = (nums[i] > curr + nums[i]) ? nums[i] : (curr + nums[i]);\n        if (curr > best) best = curr;\n    }\n    return best;\n}`
        }
    },

    // 32. Merge Intervals (#56)
    {
        id: 'merge_intervals',
        leetcodeId: 56,
        title: 'Merge Intervals',
        difficulty: 'Medium',
        topic: 'Sorting & Intervals',
        xpReward: 90,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of the non-overlapping intervals covering all input intervals.',
        examples: [
            { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
            { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }
        ],
        constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2'],
        profileSizes: [15, 45, 100, 200, 400],
        vis: { type: 'intervals', studio: 'visualize-sorting.html', studioLabel: 'Interval Sweep Visualizer' },
        io: {
            pyFn: 'merge_intervals', jsFn: 'mergeIntervals', javaMethod: 'merge', cppMethod: 'mergeIntervals', cFn: 'mergeIntervals',
            cLegacy: true,
            cSkeleton: `int mergeIntervals(int intervals[][2], int n, int out[][2]) {\n    return 0;\n}`,
            params: [{ name: 'intervals', type: 'int[][]' }],
            returnType: 'int[][]'
        },
        tests: [
            { id: 1, name: 'Partial Overlaps', hidden: false, input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expected: [[1, 6], [8, 10], [15, 18]] },
            { id: 2, name: 'Touching Boundaries', hidden: false, input: { intervals: [[1, 4], [4, 5]] }, expected: [[1, 5]] },
            { id: 3, name: 'Unsorted Input', hidden: false, input: { intervals: [[1, 4], [0, 4]] }, expected: [[0, 4]] },
            { id: 4, name: 'Contained Interval', hidden: true, input: { intervals: [[1, 4], [2, 3]] }, expected: [[1, 4]] },
            { id: 5, name: 'Chain Collapse', hidden: true, input: { intervals: [[6, 8], [1, 9], [2, 4], [4, 7]] }, expected: [[1, 9]] }
        ],
        starterCode: {
            python: `def merge_intervals(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0][:]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged`,
            javascript: `function mergeIntervals(intervals) {\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [[...intervals[0]]];\n    for (let i = 1; i < intervals.length; i++) {\n        const [s, e] = intervals[i];\n        if (s <= merged[merged.length - 1][1]) {\n            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);\n        } else {\n            merged.push([s, e]);\n        }\n    }\n    return merged;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> res = new ArrayList<>();\n        res.add(new int[]{intervals[0][0], intervals[0][1]});\n        for (int i = 1; i < intervals.length; i++) {\n            int[] last = res.get(res.size() - 1);\n            if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n            else res.add(new int[]{intervals[i][0], intervals[i][1]});\n        }\n        return res.toArray(new int[res.size()][]);\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> merged;\n        merged.push_back(intervals[0]);\n        for (int i = 1; i < (int)intervals.size(); i++) {\n            if (intervals[i][0] <= merged.back()[1]) merged.back()[1] = max(merged.back()[1], intervals[i][1]);\n            else merged.push_back(intervals[i]);\n        }\n        return merged;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int cmpInterval(const void* a, const void* b) {\n    const int* x = (const int*)a;\n    const int* y = (const int*)b;\n    return (x[0] != y[0]) ? (x[0] - y[0]) : (x[1] - y[1]);\n}\n\nint mergeIntervals(int intervals[][2], int n, int out[][2]) {\n    qsort(intervals, n, sizeof(intervals[0]), cmpInterval);\n    out[0][0] = intervals[0][0]; out[0][1] = intervals[0][1];\n    int count = 1;\n    for (int i = 1; i < n; i++) {\n        if (intervals[i][0] <= out[count - 1][1]) {\n            if (intervals[i][1] > out[count - 1][1]) out[count - 1][1] = intervals[i][1];\n        } else {\n            out[count][0] = intervals[i][0]; out[count][1] = intervals[i][1]; count++;\n        }\n    }\n    return count;\n}`
        }
    },

    // 33. 3Sum (#15)
    {
        id: 'three_sum',
        leetcodeId: 15,
        title: '3Sum',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        xpReward: 80,
        optimalTime: 'O(n^2)',
        optimalSpace: 'O(1)',
        description: 'Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`.',
        examples: [
            { input: 'nums = [-1, 0, 1, 2, -1, -4]', output: '[[-1, -1, 2], [-1, 0, 1]]' },
            { input: 'nums = [0, 1, 1]', output: '[]' }
        ],
        constraints: ['3 <= nums.length <= 3000'],
        profileSizes: [10, 20, 40, 80, 120],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Sorted Two Pointers' },
        io: {
            pyFn: 'three_sum', jsFn: 'threeSum', javaMethod: 'threeSum', cppMethod: 'threeSum', cFn: 'threeSum',
            javaReturn: 'List<List<Integer>>',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int[][]',
            compareMode: 'unordered_nested'
        },
        tests: [
            { id: 1, name: 'Classic Triplets', hidden: false, input: { nums: [-1, 0, 1, 2, -1, -4] }, expected: [[-1, -1, 2], [-1, 0, 1]] },
            { id: 2, name: 'No Zero Triplet', hidden: false, input: { nums: [0, 1, 1] }, expected: [] },
            { id: 3, name: 'All Zeros', hidden: false, input: { nums: [0, 0, 0, 0] }, expected: [[0, 0, 0]] },
            { id: 4, name: 'Mixed Neg Pos', hidden: true, input: { nums: [-2, 0, 0, 2, 2] }, expected: [[-2, 0, 2]] }
        ],
        starterCode: {
            python: `def three_sum(nums):\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1; r -= 1\n                while l < r and nums[l] == nums[l - 1]: l += 1\n                while l < r and nums[r] == nums[r + 1]: r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res`,
            javascript: `function threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            const s = nums[i] + nums[l] + nums[r];\n            if (s === 0) {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l + 1]) l++;\n                while (l < r && nums[r] === nums[r - 1]) r--;\n                l++; r--;\n            } else if (s < 0) l++;\n            else r--;\n        }\n    }\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s == 0) {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (s < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        int n = nums.size();\n        for (int i = 0; i < n - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = n - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s == 0) {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (s < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpInt3(const void* a, const void* b) { return (*(const int*)a) - (*(const int*)b); }\n\nint** threeSum(const int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    int* a = (int*)malloc(sizeof(int) * numsSize);\n    for (int i = 0; i < numsSize; i++) a[i] = nums[i];\n    qsort(a, numsSize, sizeof(int), _cmpInt3);\n    int cap = 64, cnt = 0;\n    int** res = (int**)malloc(sizeof(int*) * cap);\n    for (int i = 0; i < numsSize - 2; i++) {\n        if (i > 0 && a[i] == a[i - 1]) continue;\n        int l = i + 1, r = numsSize - 1;\n        while (l < r) {\n            int s = a[i] + a[l] + a[r];\n            if (s == 0) {\n                if (cnt == cap) { cap *= 2; res = (int**)realloc(res, sizeof(int*) * cap); }\n                res[cnt] = (int*)malloc(sizeof(int) * 3);\n                res[cnt][0] = a[i]; res[cnt][1] = a[l]; res[cnt][2] = a[r]; cnt++;\n                while (l < r && a[l] == a[l + 1]) l++;\n                while (l < r && a[r] == a[r - 1]) r--;\n                l++; r--;\n            } else if (s < 0) l++;\n            else r--;\n        }\n    }\n    free(a);\n    *returnSize = cnt;\n    *returnColumnSizes = (int*)malloc(sizeof(int) * (cnt ? cnt : 1));\n    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = 3;\n    return res;\n}`
        }
    },

    // 34. Container With Most Water (#11)
    {
        id: 'container_with_most_water',
        leetcodeId: 11,
        title: 'Container With Most Water',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given integer array `height`, find two vertical lines forming a container with the x-axis that holds the maximum amount of water.',
        examples: [
            { input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', output: '49' },
            { input: 'height = [1, 1]', output: '1' }
        ],
        constraints: ['2 <= height.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Two Pointer Bar Heights' },
        io: {
            pyFn: 'max_area', jsFn: 'maxArea', javaMethod: 'maxArea', cppMethod: 'maxArea', cFn: 'maxArea',
            params: [{ name: 'height', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Standard Peaks', hidden: false, input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
            { id: 2, name: 'Two Ones', hidden: false, input: { height: [1, 1] }, expected: 1 },
            { id: 3, name: 'Wide Low', hidden: false, input: { height: [4, 3, 2, 1, 4] }, expected: 16 },
            { id: 4, name: 'Increasing', hidden: true, input: { height: [1, 2, 3, 4, 5, 6] }, expected: 9 }
        ],
        starterCode: {
            python: `def max_area(height):\n    l, r, best = 0, len(height) - 1, 0\n    while l < r:\n        best = max(best, (r - l) * min(height[l], height[r]))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return best`,
            javascript: `function maxArea(height) {\n    let l = 0, r = height.length - 1, best = 0;\n    while (l < r) {\n        best = Math.max(best, (r - l) * Math.min(height[l], height[r]));\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return best;\n}`,
            java: `class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, best = 0;\n        while (l < r) {\n            best = Math.max(best, (r - l) * Math.min(height[l], height[r]));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = (int)height.size() - 1, best = 0;\n        while (l < r) {\n            best = max(best, (r - l) * min(height[l], height[r]));\n            if (height[l] < height[r]) l++; else r--;\n        }\n        return best;\n    }\n};`,
            c: `int maxArea(const int* height, int n) {\n    int l = 0, r = n - 1, best = 0;\n    while (l < r) {\n        int h = height[l] < height[r] ? height[l] : height[r];\n        int area = (r - l) * h;\n        if (area > best) best = area;\n        if (height[l] < height[r]) l++; else r--;\n    }\n    return best;\n}`
        }
    },

    // 35. Two Sum II (#167)
    {
        id: 'two_sum_ii',
        leetcodeId: 167,
        title: 'Two Sum II - Input Array Is Sorted',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given a 1-indexed sorted array `numbers`, find two numbers adding up to `target` and return their 1-based indices `[index1, index2]`.',
        examples: [
            { input: 'numbers = [2, 7, 11, 15], target = 9', output: '[1, 2]' },
            { input: 'numbers = [2, 3, 4], target = 6', output: '[1, 3]' }
        ],
        constraints: ['2 <= numbers.length <= 3 * 10^4', 'Sorted non-decreasingly.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Opposite-End Two Pointers' },
        io: {
            pyFn: 'two_sum_ii', jsFn: 'twoSum', javaMethod: 'twoSum', cppMethod: 'twoSum', cFn: 'twoSum',
            params: [{ name: 'numbers', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: 'First Pair', hidden: false, input: { numbers: [2, 7, 11, 15], target: 9 }, expected: [1, 2] },
            { id: 2, name: 'Ends', hidden: false, input: { numbers: [2, 3, 4], target: 6 }, expected: [1, 3] },
            { id: 3, name: 'Negatives', hidden: false, input: { numbers: [-1, 0], target: -1 }, expected: [1, 2] },
            { id: 4, name: 'Middle Pair', hidden: true, input: { numbers: [2, 4, 5, 8, 13, 20], target: 13 }, expected: [3, 4] }
        ],
        starterCode: {
            python: `def two_sum_ii(numbers, target):\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target: return [l + 1, r + 1]\n        elif s < target: l += 1\n        else: r -= 1\n    return []`,
            javascript: `function twoSum(numbers, target) {\n    let l = 0, r = numbers.length - 1;\n    while (l < r) {\n        const s = numbers[l] + numbers[r];\n        if (s === target) return [l + 1, r + 1];\n        if (s < target) l++; else r--;\n    }\n    return [];\n}`,
            java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int l = 0, r = numbers.length - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return new int[]{l + 1, r + 1};\n            if (s < target) l++; else r--;\n        }\n        return new int[]{};\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        int l = 0, r = (int)numbers.size() - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return {l + 1, r + 1};\n            if (s < target) l++; else r--;\n        }\n        return {};\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* twoSum(const int* numbers, int n, int target, int* returnSize) {\n    int l = 0, r = n - 1;\n    int* res = (int*)malloc(sizeof(int) * 2);\n    while (l < r) {\n        int s = numbers[l] + numbers[r];\n        if (s == target) { res[0] = l + 1; res[1] = r + 1; *returnSize = 2; return res; }\n        if (s < target) l++; else r--;\n    }\n    *returnSize = 0;\n    return res;\n}`
        }
    },

    // 36. Sort Colors (#75)
    {
        id: 'sort_colors',
        leetcodeId: 75,
        title: 'Sort Colors (Dutch National Flag)',
        difficulty: 'Medium',
        topic: 'Sorting & Intervals',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an array `nums` with objects colored red (`0`), white (`1`), or blue (`2`), sort them in-place in a single pass using Dutch National Flag 3-way partitioning.',
        examples: [
            { input: 'nums = [2, 0, 2, 1, 1, 0]', output: '[0, 0, 1, 1, 2, 2]' },
            { input: 'nums = [2, 0, 1]', output: '[0, 1, 2]' }
        ],
        constraints: ['1 <= nums.length <= 300', 'nums[i] is 0, 1, or 2.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: '3-Way Partition Visualizer' },
        io: {
            pyFn: 'sort_colors', jsFn: 'sortColors', javaMethod: 'sortColors', cppMethod: 'sortColors', cFn: 'sortColors',
            params: [{ name: 'nums', type: 'int[]', mut: true }],
            returnType: 'void_arr0'
        },
        tests: [
            { id: 1, name: 'Mixed Colors', hidden: false, input: { nums: [2, 0, 2, 1, 1, 0] }, expected: [0, 0, 1, 1, 2, 2] },
            { id: 2, name: 'Reverse 3', hidden: false, input: { nums: [2, 0, 1] }, expected: [0, 1, 2] },
            { id: 3, name: 'Single Color', hidden: false, input: { nums: [1] }, expected: [1] },
            { id: 4, name: 'Already Sorted', hidden: true, input: { nums: [0, 0, 1, 2, 2] }, expected: [0, 0, 1, 2, 2] }
        ],
        starterCode: {
            python: `def sort_colors(nums):\n    low, mid, high = 0, 0, len(nums) - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1; mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1`,
            javascript: `function sortColors(nums) {\n    let low = 0, mid = 0, high = nums.length - 1;\n    while (mid <= high) {\n        if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }\n        else if (nums[mid] === 1) mid++;\n        else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }\n    }\n}`,
            java: `class Solution {\n    public void sortColors(int[] nums) {\n        int low = 0, mid = 0, high = nums.length - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) { int t = nums[low]; nums[low++] = nums[mid]; nums[mid++] = t; }\n            else if (nums[mid] == 1) mid++;\n            else { int t = nums[mid]; nums[mid] = nums[high]; nums[high--] = t; }\n        }\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        int low = 0, mid = 0, high = (int)nums.size() - 1;\n        while (mid <= high) {\n            if (nums[mid] == 0) swap(nums[low++], nums[mid++]);\n            else if (nums[mid] == 1) mid++;\n            else swap(nums[mid], nums[high--]);\n        }\n    }\n};`,
            c: `void sortColors(int* nums, int n) {\n    int low = 0, mid = 0, high = n - 1;\n    while (mid <= high) {\n        if (nums[mid] == 0) { int t = nums[low]; nums[low++] = nums[mid]; nums[mid++] = t; }\n        else if (nums[mid] == 1) mid++;\n        else { int t = nums[mid]; nums[mid] = nums[high]; nums[high--] = t; }\n    }\n}`
        }
    },

    // 37. Longest Substring Without Repeating Characters (#3)
    {
        id: 'longest_substring_no_repeat',
        leetcodeId: 3,
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(min(m, n))',
        description: 'Given a string `s`, find the length of the longest substring without duplicate characters.',
        examples: [
            { input: 's = "abcabcbb"', output: '3', explanation: '"abc" has length 3.' },
            { input: 's = "bbbbb"', output: '1' }
        ],
        constraints: ['0 <= s.length <= 5 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Sliding Window Set' },
        io: {
            pyFn: 'length_of_longest_substring', jsFn: 'lengthOfLongestSubstring', javaMethod: 'lengthOfLongestSubstring', cppMethod: 'lengthOfLongestSubstring', cFn: 'lengthOfLongestSubstring',
            params: [{ name: 's', type: 'string' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'abcabcbb', hidden: false, input: { s: 'abcabcbb' }, expected: 3 },
            { id: 2, name: 'All Same', hidden: false, input: { s: 'bbbbb' }, expected: 1 },
            { id: 3, name: 'pwwkew', hidden: false, input: { s: 'pwwkew' }, expected: 3 },
            { id: 4, name: 'Empty', hidden: true, input: { s: '' }, expected: 0 },
            { id: 5, name: 'Window Jump', hidden: true, input: { s: 'abba' }, expected: 2 }
        ],
        starterCode: {
            python: `def length_of_longest_substring(s):\n    last = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best`,
            javascript: `function lengthOfLongestSubstring(s) {\n    const last = new Map();\n    let left = 0, best = 0;\n    for (let right = 0; right < s.length; right++) {\n        const ch = s[right];\n        if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;\n        last.set(ch, right);\n        best = Math.max(best, right - left + 1);\n    }\n    return best;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int[] last = new int[256];\n        Arrays.fill(last, -1);\n        int left = 0, best = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (last[c] >= left) left = last[c] + 1;\n            last[c] = r;\n            best = Math.max(best, r - left + 1);\n        }\n        return best;\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        vector<int> last(256, -1);\n        int left = 0, best = 0;\n        for (int r = 0; r < (int)s.size(); r++) {\n            unsigned char c = s[r];\n            if (last[c] >= left) left = last[c] + 1;\n            last[c] = r;\n            best = max(best, r - left + 1);\n        }\n        return best;\n    }\n};`,
            c: `int lengthOfLongestSubstring(const char* s) {\n    int last[256];\n    for (int i = 0; i < 256; i++) last[i] = -1;\n    int left = 0, best = 0;\n    for (int r = 0; s[r]; r++) {\n        unsigned char c = (unsigned char)s[r];\n        if (last[c] >= left) left = last[c] + 1;\n        last[c] = r;\n        int len = r - left + 1;\n        if (len > best) best = len;\n    }\n    return best;\n}`
        }
    },

    // 38. Longest Repeating Character Replacement (#424)
    {
        id: 'longest_repeating_char_replacement',
        leetcodeId: 424,
        title: 'Longest Repeating Character Replacement',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given string `s` of uppercase English letters and integer `k`, you may replace up to `k` characters. Return the length of the longest substring containing the same letter.',
        examples: [
            { input: 's = "ABAB", k = 2', output: '4' },
            { input: 's = "AABABBA", k = 1', output: '4' }
        ],
        constraints: ['1 <= s.length <= 10^5', '0 <= k <= s.length'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Sliding Window Frequency' },
        io: {
            pyFn: 'character_replacement', jsFn: 'characterReplacement', javaMethod: 'characterReplacement', cppMethod: 'characterReplacement', cFn: 'characterReplacement',
            params: [{ name: 's', type: 'string' }, { name: 'k', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'ABAB k=2', hidden: false, input: { s: 'ABAB', k: 2 }, expected: 4 },
            { id: 2, name: 'AABABBA k=1', hidden: false, input: { s: 'AABABBA', k: 1 }, expected: 4 },
            { id: 3, name: 'Zero Replace', hidden: false, input: { s: 'AAABBC', k: 0 }, expected: 3 },
            { id: 4, name: 'Single Char', hidden: true, input: { s: 'Z', k: 1 }, expected: 1 }
        ],
        starterCode: {
            python: `def character_replacement(s, k):\n    counts = [0] * 128\n    left = max_freq = best = 0\n    for right, ch in enumerate(s):\n        idx = ord(ch)\n        counts[idx] += 1\n        max_freq = max(max_freq, counts[idx])\n        while (right - left + 1) - max_freq > k:\n            counts[ord(s[left])] -= 1\n            left += 1\n        best = max(best, right - left + 1)\n    return best`,
            javascript: `function characterReplacement(s, k) {\n    const counts = new Array(128).fill(0);\n    let left = 0, maxFreq = 0, best = 0;\n    for (let r = 0; r < s.length; r++) {\n        const code = s.charCodeAt(r);\n        maxFreq = Math.max(maxFreq, ++counts[code]);\n        while ((r - left + 1) - maxFreq > k) {\n            counts[s.charCodeAt(left)]--;\n            left++;\n        }\n        best = Math.max(best, r - left + 1);\n    }\n    return best;\n}`,
            java: `class Solution {\n    public int characterReplacement(String s, int k) {\n        int[] counts = new int[128];\n        int left = 0, maxFreq = 0, best = 0;\n        for (int r = 0; r < s.length(); r++) {\n            maxFreq = Math.max(maxFreq, ++counts[s.charAt(r)]);\n            while ((r - left + 1) - maxFreq > k) counts[s.charAt(left++)]--;\n            best = Math.max(best, r - left + 1);\n        }\n        return best;\n    }\n}`,
            cpp: `#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int characterReplacement(string s, int k) {\n        int counts[128] = {0}, left = 0, maxFreq = 0, best = 0;\n        for (int r = 0; r < (int)s.size(); r++) {\n            maxFreq = max(maxFreq, ++counts[(unsigned char)s[r]]);\n            while ((r - left + 1) - maxFreq > k) counts[(unsigned char)s[left++]]--;\n            best = max(best, r - left + 1);\n        }\n        return best;\n    }\n};`,
            c: `int characterReplacement(const char* s, int k) {\n    int counts[128] = {0}, left = 0, maxFreq = 0, best = 0;\n    for (int r = 0; s[r]; r++) {\n        int c = (unsigned char)s[r];\n        counts[c]++;\n        if (counts[c] > maxFreq) maxFreq = counts[c];\n        while ((r - left + 1) - maxFreq > k) counts[(unsigned char)s[left++]]--;\n        int len = r - left + 1;\n        if (len > best) best = len;\n    }\n    return best;\n}`
        }
    },

    // 39. Minimum Size Subarray Sum (#209)
    {
        id: 'min_size_subarray_sum',
        leetcodeId: 209,
        title: 'Minimum Size Subarray Sum',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a subarray whose sum is greater than or equal to `target`, or `0` if none exists.',
        examples: [
            { input: 'target = 7, nums = [2, 3, 1, 2, 4, 3]', output: '2', explanation: 'Subarray [4, 3] has minimal length 2.' },
            { input: 'target = 11, nums = [1, 1, 1, 1, 1]', output: '0' }
        ],
        constraints: ['1 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Shrinkable Sliding Window' },
        io: {
            pyFn: 'min_subarray_len', jsFn: 'minSubArrayLen', javaMethod: 'minSubArrayLen', cppMethod: 'minSubArrayLen', cFn: 'minSubArrayLen',
            params: [{ name: 'target', type: 'int' }, { name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Minimal Pair', hidden: false, input: { target: 7, nums: [2, 3, 1, 2, 4, 3] }, expected: 2 },
            { id: 2, name: 'Single Exact', hidden: false, input: { target: 4, nums: [1, 4, 4] }, expected: 1 },
            { id: 3, name: 'Impossible Sum', hidden: false, input: { target: 11, nums: [1, 1, 1, 1, 1] }, expected: 0 },
            { id: 4, name: 'Full Array Needed', hidden: true, input: { target: 15, nums: [1, 2, 3, 4, 5] }, expected: 5 }
        ],
        starterCode: {
            python: `def min_subarray_len(target, nums):\n    left = curr = 0\n    best = len(nums) + 1\n    for right, x in enumerate(nums):\n        curr += x\n        while curr >= target:\n            best = min(best, right - left + 1)\n            curr -= nums[left]\n            left += 1\n    return 0 if best > len(nums) else best`,
            javascript: `function minSubArrayLen(target, nums) {\n    let left = 0, curr = 0, best = Infinity;\n    for (let r = 0; r < nums.length; r++) {\n        curr += nums[r];\n        while (curr >= target) {\n            best = Math.min(best, r - left + 1);\n            curr -= nums[left++];\n        }\n    }\n    return best === Infinity ? 0 : best;\n}`,
            java: `class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        int left = 0, curr = 0, best = Integer.MAX_VALUE;\n        for (int r = 0; r < nums.length; r++) {\n            curr += nums[r];\n            while (curr >= target) {\n                best = Math.min(best, r - left + 1);\n                curr -= nums[left++];\n            }\n        }\n        return best == Integer.MAX_VALUE ? 0 : best;\n    }\n}`,
            cpp: `#include <vector>\n#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minSubArrayLen(int target, vector<int>& nums) {\n        int left = 0, curr = 0, best = INT_MAX;\n        for (int r = 0; r < (int)nums.size(); r++) {\n            curr += nums[r];\n            while (curr >= target) {\n                best = min(best, r - left + 1);\n                curr -= nums[left++];\n            }\n        }\n        return best == INT_MAX ? 0 : best;\n    }\n};`,
            c: `#include <limits.h>\n\nint minSubArrayLen(int target, const int* nums, int n) {\n    int left = 0, curr = 0, best = INT_MAX;\n    for (int r = 0; r < n; r++) {\n        curr += nums[r];\n        while (curr >= target) {\n            int len = r - left + 1;\n            if (len < best) best = len;\n            curr -= nums[left++];\n        }\n    }\n    return best == INT_MAX ? 0 : best;\n}`
        }
    },

    // 40. Group Anagrams (#49)
    {
        id: 'group_anagrams',
        leetcodeId: 49,
        title: 'Group Anagrams',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        xpReward: 80,
        optimalTime: 'O(n * k log k)',
        optimalSpace: 'O(n * k)',
        description: 'Given an array of strings `strs`, group all anagrams together into sublists in any order.',
        examples: [
            { input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]' },
            { input: 'strs = [""]', output: '[[""]]' }
        ],
        constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
        profileSizes: [10, 25, 50, 100, 200],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Hash Table Grouping' },
        io: {
            pyFn: 'group_anagrams', jsFn: 'groupAnagrams', javaMethod: 'groupAnagrams', cppMethod: 'groupAnagrams', cFn: 'groupAnagrams',
            javaReturn: 'List<List<String>>',
            params: [{ name: 'strs', type: 'string[]' }],
            returnType: 'string[][]',
            compareMode: 'unordered_nested'
        },
        tests: [
            { id: 1, name: 'Standard Words', hidden: false, input: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }, expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
            { id: 2, name: 'Empty String', hidden: false, input: { strs: [''] }, expected: [['']] },
            { id: 3, name: 'Single Char', hidden: false, input: { strs: ['a'] }, expected: [['a']] },
            { id: 4, name: 'Duplicates', hidden: true, input: { strs: ['ab', 'ba', 'ab'] }, expected: [['ab', 'ab', 'ba']] }
        ],
        starterCode: {
            python: `from collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        groups[''.join(sorted(s))].append(s)\n    return list(groups.values())`,
            javascript: `function groupAnagrams(strs) {\n    const groups = new Map();\n    for (const s of strs) {\n        const key = s.split('').sort().join('');\n        if (!groups.has(key)) groups.set(key, []);\n        groups.get(key).push(s);\n    }\n    return Array.from(groups.values());\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> groups = new HashMap<>();\n        for (String s : strs) {\n            char[] arr = s.toCharArray();\n            Arrays.sort(arr);\n            String key = new String(arr);\n            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(groups.values());\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        unordered_map<string, vector<string>> mp;\n        for (const string& s : strs) {\n            string key = s;\n            sort(key.begin(), key.end());\n            mp[key].push_back(s);\n        }\n        vector<vector<string>> res;\n        for (auto& kv : mp) res.push_back(kv.second);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\ntypedef struct { char* key; char* orig; } _GAEntry;\nstatic int _cmpCh(const void* a, const void* b) { return (*(const char*)a) - (*(const char*)b); }\nstatic int _cmpEntry(const void* a, const void* b) { return strcmp(((_GAEntry*)a)->key, ((_GAEntry*)b)->key); }\n\nchar*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {\n    if (strsSize <= 0) { *returnSize = 0; *returnColumnSizes = NULL; return NULL; }\n    _GAEntry* entries = (_GAEntry*)malloc(sizeof(_GAEntry) * strsSize);\n    for (int i = 0; i < strsSize; i++) {\n        int len = (int)strlen(strs[i]);\n        char* k = (char*)malloc(len + 1);\n        memcpy(k, strs[i], len + 1);\n        qsort(k, len, 1, _cmpCh);\n        entries[i].key = k; entries[i].orig = strs[i];\n    }\n    qsort(entries, strsSize, sizeof(_GAEntry), _cmpEntry);\n    char*** res = (char***)malloc(sizeof(char**) * strsSize);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * strsSize);\n    int g = 0, i = 0;\n    while (i < strsSize) {\n        int j = i + 1;\n        while (j < strsSize && strcmp(entries[i].key, entries[j].key) == 0) j++;\n        int cnt = j - i;\n        res[g] = (char**)malloc(sizeof(char*) * cnt);\n        (*returnColumnSizes)[g] = cnt;\n        for (int t = 0; t < cnt; t++) res[g][t] = entries[i + t].orig;\n        g++; i = j;\n    }\n    for (int p = 0; p < strsSize; p++) free(entries[p].key);\n    free(entries);\n    *returnSize = g;\n    return res;\n}`
        }
    },

    // 41. Product of Array Except Self (#238)
    {
        id: 'product_of_array_except_self',
        leetcodeId: 238,
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given integer array `nums`, return an array `answer` where `answer[i]` equals the product of all elements except `nums[i]` in $O(n)$ without using division.',
        examples: [
            { input: 'nums = [1, 2, 3, 4]', output: '[24, 12, 8, 6]' },
            { input: 'nums = [-1, 1, 0, -3, 3]', output: '[0, 0, 9, 0, 0]' }
        ],
        constraints: ['2 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Prefix & Suffix Product' },
        io: {
            pyFn: 'product_except_self', jsFn: 'productExceptSelf', javaMethod: 'productExceptSelf', cppMethod: 'productExceptSelf', cFn: 'productExceptSelf',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: '1 2 3 4', hidden: false, input: { nums: [1, 2, 3, 4] }, expected: [24, 12, 8, 6] },
            { id: 2, name: 'Contains Zero', hidden: false, input: { nums: [-1, 1, 0, -3, 3] }, expected: [0, 0, 9, 0, 0] },
            { id: 3, name: 'Two Zeros', hidden: true, input: { nums: [0, 4, 0, 2] }, expected: [0, 0, 0, 0] },
            { id: 4, name: 'Two Elements', hidden: true, input: { nums: [5, -2] }, expected: [-2, 5] }
        ],
        starterCode: {
            python: `def product_except_self(nums):\n    n = len(nums)\n    res = [1] * n\n    pref = 1\n    for i in range(n):\n        res[i] = pref\n        pref *= nums[i]\n    suff = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= suff\n        suff *= nums[i]\n    return res`,
            javascript: `function productExceptSelf(nums) {\n    const n = nums.length, res = new Array(n).fill(1);\n    let pref = 1;\n    for (let i = 0; i < n; i++) { res[i] = pref; pref *= nums[i]; }\n    let suff = 1;\n    for (let i = n - 1; i >= 0; i--) { res[i] *= suff; suff *= nums[i]; }\n    return res;\n}`,
            java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        int pref = 1;\n        for (int i = 0; i < n; i++) { res[i] = pref; pref *= nums[i]; }\n        int suff = 1;\n        for (int i = n - 1; i >= 0; i--) { res[i] *= suff; suff *= nums[i]; }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> res(n, 1);\n        int pref = 1;\n        for (int i = 0; i < n; i++) { res[i] = pref; pref *= nums[i]; }\n        int suff = 1;\n        for (int i = n - 1; i >= 0; i--) { res[i] *= suff; suff *= nums[i]; }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* productExceptSelf(const int* nums, int n, int* returnSize) {\n    int* res = (int*)malloc(sizeof(int) * n);\n    int pref = 1;\n    for (int i = 0; i < n; i++) { res[i] = pref; pref *= nums[i]; }\n    int suff = 1;\n    for (int i = n - 1; i >= 0; i--) { res[i] *= suff; suff *= nums[i]; }\n    *returnSize = n;\n    return res;\n}`
        }
    },

    // 42. Top K Frequent Elements (#347)
    {
        id: 'top_k_frequent_elements',
        leetcodeId: 347,
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        topic: 'Heaps & Bucket Sort',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given integer array `nums` and integer `k`, return the `k` most frequent elements in any order.',
        examples: [
            { input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' },
            { input: 'nums = [1], k = 1', output: '[1]' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '1 <= k <= unique elements'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Bucket Frequency Visualizer' },
        io: {
            pyFn: 'top_k_frequent', jsFn: 'topKFrequent', javaMethod: 'topKFrequent', cppMethod: 'topKFrequent', cFn: 'topKFrequent',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }],
            returnType: 'int[]',
            compareMode: 'unordered_arr'
        },
        tests: [
            { id: 1, name: 'Top 2 Frequent', hidden: false, input: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, expected: [1, 2] },
            { id: 2, name: 'Single Element', hidden: false, input: { nums: [1], k: 1 }, expected: [1] },
            { id: 3, name: 'Negative Values', hidden: true, input: { nums: [-1, -1, 4, 4, 4, 9], k: 2 }, expected: [-1, 4] }
        ],
        starterCode: {
            python: `from collections import Counter\n\ndef top_k_frequent(nums, k):\n    cnt = Counter(nums)\n    return [item for item, _ in cnt.most_common(k)]`,
            javascript: `function topKFrequent(nums, k) {\n    const freq = new Map();\n    for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);\n    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0]);\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> freq = new HashMap<>();\n        for (int x : nums) freq.put(x, freq.getOrDefault(x, 0) + 1);\n        List<Integer> keys = new ArrayList<>(freq.keySet());\n        keys.sort((a, b) -> freq.get(b) - freq.get(a));\n        int[] res = new int[k];\n        for (int i = 0; i < k; i++) res[i] = keys.get(i);\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        unordered_map<int, int> freq;\n        for (int x : nums) freq[x]++;\n        vector<pair<int, int>> items;\n        for (auto& kv : freq) items.push_back({kv.second, kv.first});\n        sort(items.rbegin(), items.rend());\n        vector<int> res;\n        for (int i = 0; i < k; i++) res.push_back(items[i].second);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\ntypedef struct { int val; int cnt; } _TKPair;\nstatic int _cmpIntAsc(const void* a, const void* b) { return (*(const int*)a) - (*(const int*)b); }\nstatic int _cmpPairDesc(const void* a, const void* b) { return ((const _TKPair*)b)->cnt - ((const _TKPair*)a)->cnt; }\n\nint* topKFrequent(const int* nums, int n, int k, int* returnSize) {\n    int* sorted = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) sorted[i] = nums[i];\n    qsort(sorted, n, sizeof(int), _cmpIntAsc);\n    _TKPair* pairs = (_TKPair*)malloc(sizeof(_TKPair) * n);\n    int u = 0, i = 0;\n    while (i < n) {\n        int j = i + 1;\n        while (j < n && sorted[j] == sorted[i]) j++;\n        pairs[u].val = sorted[i]; pairs[u].cnt = j - i; u++; i = j;\n    }\n    qsort(pairs, u, sizeof(_TKPair), _cmpPairDesc);\n    int* res = (int*)malloc(sizeof(int) * k);\n    for (int t = 0; t < k; t++) res[t] = pairs[t].val;\n    free(sorted); free(pairs);\n    *returnSize = k;\n    return res;\n}`
        }
    },

    // 43. Longest Consecutive Sequence (#128)
    {
        id: 'longest_consecutive_sequence',
        leetcodeId: 128,
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence in $O(n)$ time.',
        examples: [
            { input: 'nums = [100, 4, 200, 1, 3, 2]', output: '4', explanation: 'Sequence [1, 2, 3, 4] has length 4.' },
            { input: 'nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', output: '9' }
        ],
        constraints: ['0 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'HashSet Sequence Heads' },
        io: {
            pyFn: 'longest_consecutive', jsFn: 'longestConsecutive', javaMethod: 'longestConsecutive', cppMethod: 'longestConsecutive', cFn: 'longestConsecutive',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Sequence of 4', hidden: false, input: { nums: [100, 4, 200, 1, 3, 2] }, expected: 4 },
            { id: 2, name: 'Sequence of 9', hidden: false, input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] }, expected: 9 },
            { id: 3, name: 'Empty', hidden: false, input: { nums: [] }, expected: 0 },
            { id: 4, name: 'Negatives', hidden: true, input: { nums: [-3, -2, -1, 0, 5] }, expected: 4 }
        ],
        starterCode: {
            python: `def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for x in s:\n        if x - 1 not in s:\n            y = x + 1\n            while y in s: y += 1\n            best = max(best, y - x)\n    return best`,
            javascript: `function longestConsecutive(nums) {\n    const s = new Set(nums);\n    let best = 0;\n    for (const x of s) {\n        if (!s.has(x - 1)) {\n            let y = x + 1;\n            while (s.has(y)) y++;\n            best = Math.max(best, y - x);\n        }\n    }\n    return best;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int longestConsecutive(int[] nums) {\n        Set<Integer> s = new HashSet<>();\n        for (int x : nums) s.add(x);\n        int best = 0;\n        for (int x : s) {\n            if (!s.contains(x - 1)) {\n                int y = x + 1;\n                while (s.contains(y)) y++;\n                best = Math.max(best, y - x);\n            }\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_set>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        unordered_set<int> s(nums.begin(), nums.end());\n        int best = 0;\n        for (int x : s) {\n            if (!s.count(x - 1)) {\n                int y = x + 1;\n                while (s.count(y)) y++;\n                best = max(best, y - x);\n            }\n        }\n        return best;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpLC(const void* a, const void* b) { int x = *(const int*)a, y = *(const int*)b; return (x > y) - (x < y); }\n\nint longestConsecutive(const int* nums, int n) {\n    if (n == 0) return 0;\n    int* a = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) a[i] = nums[i];\n    qsort(a, n, sizeof(int), _cmpLC);\n    int best = 1, cur = 1;\n    for (int i = 1; i < n; i++) {\n        if (a[i] == a[i - 1]) continue;\n        if (a[i] == a[i - 1] + 1) cur++;\n        else cur = 1;\n        if (cur > best) best = cur;\n    }\n    free(a);\n    return best;\n}`
        }
    },

    // 44. Subarray Sum Equals K (#560)
    {
        id: 'subarray_sum_equals_k',
        leetcodeId: 560,
        title: 'Subarray Sum Equals K',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an integer array `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals `k`.',
        examples: [
            { input: 'nums = [1, 1, 1], k = 2', output: '2' },
            { input: 'nums = [1, 2, 3], k = 3', output: '2' }
        ],
        constraints: ['1 <= nums.length <= 2 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Prefix Sum Map' },
        io: {
            pyFn: 'subarray_sum', jsFn: 'subarraySum', javaMethod: 'subarraySum', cppMethod: 'subarraySum', cFn: 'subarraySum',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Ones Sum 2', hidden: false, input: { nums: [1, 1, 1], k: 2 }, expected: 2 },
            { id: 2, name: '1 2 3 Sum 3', hidden: false, input: { nums: [1, 2, 3], k: 3 }, expected: 2 },
            { id: 3, name: 'With Negatives', hidden: true, input: { nums: [1, -1, 0], k: 0 }, expected: 3 },
            { id: 4, name: 'Zero Elements', hidden: true, input: { nums: [0, 0, 0], k: 0 }, expected: 6 }
        ],
        starterCode: {
            python: `from collections import defaultdict\n\ndef subarray_sum(nums, k):\n    cnt = defaultdict(int)\n    cnt[0] = 1\n    cur = ans = 0\n    for x in nums:\n        cur += x\n        ans += cnt[cur - k]\n        cnt[cur] += 1\n    return ans`,
            javascript: `function subarraySum(nums, k) {\n    const cnt = new Map([[0, 1]]);\n    let cur = 0, ans = 0;\n    for (const x of nums) {\n        cur += x;\n        ans += cnt.get(cur - k) || 0;\n        cnt.set(cur, (cnt.get(cur) || 0) + 1);\n    }\n    return ans;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int subarraySum(int[] nums, int k) {\n        Map<Integer, Integer> cnt = new HashMap<>();\n        cnt.put(0, 1);\n        int cur = 0, ans = 0;\n        for (int x : nums) {\n            cur += x;\n            ans += cnt.getOrDefault(cur - k, 0);\n            cnt.put(cur, cnt.getOrDefault(cur, 0) + 1);\n        }\n        return ans;\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        unordered_map<int, int> cnt;\n        cnt[0] = 1;\n        int cur = 0, ans = 0;\n        for (int x : nums) {\n            cur += x;\n            if (cnt.count(cur - k)) ans += cnt[cur - k];\n            cnt[cur]++;\n        }\n        return ans;\n    }\n};`,
            c: `int subarraySum(const int* nums, int n, int k) {\n    int ans = 0;\n    for (int i = 0; i < n; i++) {\n        int sum = 0;\n        for (int j = i; j < n; j++) {\n            sum += nums[j];\n            if (sum == k) ans++;\n        }\n    }\n    return ans;\n}`
        }
    },

    // 45. Rotate Array (#189)
    {
        id: 'rotate_array',
        leetcodeId: 189,
        title: 'Rotate Array',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an integer array `nums`, rotate the array to the right by `k` steps in-place using array reversal.',
        examples: [
            { input: 'nums = [1, 2, 3, 4, 5, 6, 7], k = 3', output: '[5, 6, 7, 1, 2, 3, 4]' },
            { input: 'nums = [-1, -100, 3, 99], k = 2', output: '[3, 99, -1, -100]' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: '3-Reversal In-Place Shift' },
        io: {
            pyFn: 'rotate', jsFn: 'rotate', javaMethod: 'rotate', cppMethod: 'rotate', cFn: 'rotate',
            params: [{ name: 'nums', type: 'int[]', mut: true }, { name: 'k', type: 'int' }],
            returnType: 'void_arr0'
        },
        tests: [
            { id: 1, name: 'Rotate by 3', hidden: false, input: { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 }, expected: [5, 6, 7, 1, 2, 3, 4] },
            { id: 2, name: 'Rotate by 2', hidden: false, input: { nums: [-1, -100, 3, 99], k: 2 }, expected: [3, 99, -1, -100] },
            { id: 3, name: 'k > length', hidden: true, input: { nums: [1, 2], k: 5 }, expected: [2, 1] },
            { id: 4, name: 'k = 0', hidden: true, input: { nums: [1, 2, 3], k: 0 }, expected: [1, 2, 3] }
        ],
        starterCode: {
            python: `def rotate(nums, k):\n    n = len(nums)\n    k %= n\n    def rev(l, r):\n        while l < r:\n            nums[l], nums[r] = nums[r], nums[l]\n            l += 1; r -= 1\n    rev(0, n - 1); rev(0, k - 1); rev(k, n - 1)`,
            javascript: `function rotate(nums, k) {\n    const n = nums.length;\n    k %= n;\n    const rev = (l, r) => { while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; } };\n    rev(0, n - 1); rev(0, k - 1); rev(k, n - 1);\n}`,
            java: `class Solution {\n    private void rev(int[] a, int l, int r) {\n        while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; }\n    }\n    public void rotate(int[] nums, int k) {\n        int n = nums.length; k %= n;\n        rev(nums, 0, n - 1); rev(nums, 0, k - 1); rev(nums, k, n - 1);\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        int n = nums.size(); k %= n;\n        reverse(nums.begin(), nums.end());\n        reverse(nums.begin(), nums.begin() + k);\n        reverse(nums.begin() + k, nums.end());\n    }\n};`,
            c: `static void _rev(int* a, int l, int r) { while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; } }\n\nvoid rotate(int* nums, int n, int k) {\n    if (n <= 0) return;\n    k %= n;\n    _rev(nums, 0, n - 1); _rev(nums, 0, k - 1); _rev(nums, k, n - 1);\n}`
        }
    },

    // 46. Search in Rotated Sorted Array (#33)
    {
        id: 'search_rotated_sorted_array',
        leetcodeId: 33,
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        topic: 'Binary Search',
        xpReward: 80,
        optimalTime: 'O(log n)',
        optimalSpace: 'O(1)',
        description: 'Given a rotated sorted array of distinct integers `nums` and an integer `target`, return the index of `target` in $O(\\log n)$ time, or `-1` if absent.',
        examples: [
            { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' },
            { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1' }
        ],
        constraints: ['1 <= nums.length <= 5000', 'All elements unique.'],
        profileSizes: [16, 64, 256, 1024, 4096],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Pivot Binary Search' },
        io: {
            pyFn: 'search', jsFn: 'search', javaMethod: 'search', cppMethod: 'search', cFn: 'search',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Right Half Hit', hidden: false, input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expected: 4 },
            { id: 2, name: 'Missing', hidden: false, input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expected: -1 },
            { id: 3, name: 'Left Half Hit', hidden: true, input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 5 }, expected: 1 },
            { id: 4, name: 'Single Miss', hidden: true, input: { nums: [1], target: 0 }, expected: -1 }
        ],
        starterCode: {
            python: `def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1`,
            javascript: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = (l + r) >> 1;\n        if (nums[m] === target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n        }\n    }\n    return -1;\n}`,
            java: `class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = (l + r) >>> 1;\n            if (nums[m] == target) return m;\n            if (nums[l] <= nums[m]) {\n                if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n            } else {\n                if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n            }\n        }\n        return -1;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = (int)nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[l] <= nums[m]) {\n                if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n            } else {\n                if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n            }\n        }\n        return -1;\n    }\n};`,
            c: `int search(const int* nums, int n, int target) {\n    int l = 0, r = n - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n        }\n    }\n    return -1;\n}`
        }
    },

    // 47. Find Minimum in Rotated Sorted Array (#153)
    {
        id: 'find_min_rotated_sorted_array',
        leetcodeId: 153,
        title: 'Find Minimum in Rotated Sorted Array',
        difficulty: 'Medium',
        topic: 'Binary Search',
        xpReward: 80,
        optimalTime: 'O(log n)',
        optimalSpace: 'O(1)',
        description: 'Given a sorted rotated array of unique elements `nums`, return the minimum element in $O(\\log n)$ time.',
        examples: [
            { input: 'nums = [3, 4, 5, 1, 2]', output: '1' },
            { input: 'nums = [11, 13, 15, 17]', output: '11' }
        ],
        constraints: ['1 <= nums.length <= 5000'],
        profileSizes: [16, 64, 256, 1024, 4096],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Rotated Inflection Search' },
        io: {
            pyFn: 'find_min', jsFn: 'findMin', javaMethod: 'findMin', cppMethod: 'findMin', cFn: 'findMin',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '5-Element Rotated', hidden: false, input: { nums: [3, 4, 5, 1, 2] }, expected: 1 },
            { id: 2, name: 'Not Rotated', hidden: false, input: { nums: [11, 13, 15, 17] }, expected: 11 },
            { id: 3, name: 'Rotated 4', hidden: false, input: { nums: [4, 5, 6, 7, 0, 1, 2] }, expected: 0 },
            { id: 4, name: 'Single Element', hidden: true, input: { nums: [9] }, expected: 9 }
        ],
        starterCode: {
            python: `def find_min(nums):\n    l, r = 0, len(nums) - 1\n    while l < r:\n        m = (l + r) // 2\n        if nums[m] > nums[r]: l = m + 1\n        else: r = m\n    return nums[l]`,
            javascript: `function findMin(nums) {\n    let l = 0, r = nums.length - 1;\n    while (l < r) {\n        const m = (l + r) >> 1;\n        if (nums[m] > nums[r]) l = m + 1; else r = m;\n    }\n    return nums[l];\n}`,
            java: `class Solution {\n    public int findMin(int[] nums) {\n        int l = 0, r = nums.length - 1;\n        while (l < r) {\n            int m = (l + r) >>> 1;\n            if (nums[m] > nums[r]) l = m + 1; else r = m;\n        }\n        return nums[l];\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        int l = 0, r = (int)nums.size() - 1;\n        while (l < r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] > nums[r]) l = m + 1; else r = m;\n        }\n        return nums[l];\n    }\n};`,
            c: `int findMin(const int* nums, int n) {\n    int l = 0, r = n - 1;\n    while (l < r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] > nums[r]) l = m + 1; else r = m;\n    }\n    return nums[l];\n}`
        }
    },

    // 48. Koko Eating Bananas (#875)
    {
        id: 'koko_eating_bananas',
        leetcodeId: 875,
        title: 'Koko Eating Bananas',
        difficulty: 'Medium',
        topic: 'Binary Search',
        xpReward: 80,
        optimalTime: 'O(n log m)',
        optimalSpace: 'O(1)',
        description: 'Koko has `piles` of bananas and `h` hours before guards return. Return the minimum integer eating speed `k` so she finishes all bananas within `h` hours.',
        examples: [
            { input: 'piles = [3, 6, 7, 11], h = 8', output: '4' },
            { input: 'piles = [30, 11, 23, 4, 20], h = 5', output: '30' }
        ],
        constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9'],
        profileSizes: [16, 48, 128, 256, 512],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Binary Search on Answer' },
        io: {
            pyFn: 'min_eating_speed', jsFn: 'minEatingSpeed', javaMethod: 'minEatingSpeed', cppMethod: 'minEatingSpeed', cFn: 'minEatingSpeed',
            params: [{ name: 'piles', type: 'int[]' }, { name: 'h', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic Speed 4', hidden: false, input: { piles: [3, 6, 7, 11], h: 8 }, expected: 4 },
            { id: 2, name: 'Exact Max Pile', hidden: false, input: { piles: [30, 11, 23, 4, 20], h: 5 }, expected: 30 },
            { id: 3, name: 'Relaxed Hours', hidden: true, input: { piles: [30, 11, 23, 4, 20], h: 6 }, expected: 23 }
        ],
        starterCode: {
            python: `def min_eating_speed(piles, h):\n    l, r = 1, max(piles)\n    while l < r:\n        m = (l + r) // 2\n        hours = sum((p + m - 1) // m for p in piles)\n        if hours <= h: r = m\n        else: l = m + 1\n    return l`,
            javascript: `function minEatingSpeed(piles, h) {\n    let l = 1, r = Math.max(...piles);\n    while (l < r) {\n        const m = Math.floor((l + r) / 2);\n        let hours = 0;\n        for (const p of piles) hours += Math.ceil(p / m);\n        if (hours <= h) r = m; else l = m + 1;\n    }\n    return l;\n}`,
            java: `class Solution {\n    public int minEatingSpeed(int[] piles, int h) {\n        int l = 1, r = 1;\n        for (int p : piles) r = Math.max(r, p);\n        while (l < r) {\n            int m = l + (r - l) / 2;\n            long hours = 0;\n            for (int p : piles) hours += (p + m - 1L) / m;\n            if (hours <= h) r = m; else l = m + 1;\n        }\n        return l;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minEatingSpeed(vector<int>& piles, int h) {\n        int l = 1, r = *max_element(piles.begin(), piles.end());\n        while (l < r) {\n            int m = l + (r - l) / 2;\n            long long hours = 0;\n            for (int p : piles) hours += (p + m - 1LL) / m;\n            if (hours <= h) r = m; else l = m + 1;\n        }\n        return l;\n    }\n};`,
            c: `int minEatingSpeed(const int* piles, int n, int h) {\n    int l = 1, r = 1;\n    for (int i = 0; i < n; i++) if (piles[i] > r) r = piles[i];\n    while (l < r) {\n        int m = l + (r - l) / 2;\n        long long hours = 0;\n        for (int i = 0; i < n; i++) hours += (piles[i] + m - 1LL) / m;\n        if (hours <= h) r = m; else l = m + 1;\n    }\n    return l;\n}`
        }
    },

    // 49. Evaluate Reverse Polish Notation (#150)
    {
        id: 'evaluate_rpn',
        leetcodeId: 150,
        title: 'Evaluate Reverse Polish Notation',
        difficulty: 'Medium',
        topic: 'Stack & Queue',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation (`+`, `-`, `*`, `/`, truncating division toward zero).',
        examples: [
            { input: 'tokens = ["2", "1", "+", "3", "*"]', output: '9', explanation: '((2 + 1) * 3) = 9.' },
            { input: 'tokens = ["4", "13", "5", "/", "+"]', output: '6' }
        ],
        constraints: ['1 <= tokens.length <= 10^4'],
        profileSizes: [15, 45, 95, 195, 395],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Expression Evaluation Stack' },
        io: {
            pyFn: 'eval_rpn', jsFn: 'evalRPN', javaMethod: 'evalRPN', cppMethod: 'evalRPN', cFn: 'evalRPN',
            params: [{ name: 'tokens', type: 'string[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '(2+1)*3', hidden: false, input: { tokens: ['2', '1', '+', '3', '*'] }, expected: 9 },
            { id: 2, name: '4+(13/5)', hidden: false, input: { tokens: ['4', '13', '5', '/', '+'] }, expected: 6 },
            { id: 3, name: 'Truncate Negative Div', hidden: true, input: { tokens: ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'] }, expected: 22 }
        ],
        starterCode: {
            python: `def eval_rpn(tokens):\n    st = []\n    for t in tokens:\n        if t in ('+', '-', '*', '/'):\n            b, a = st.pop(), st.pop()\n            if t == '+': st.append(a + b)\n            elif t == '-': st.append(a - b)\n            elif t == '*': st.append(a * b)\n            else: st.append(int(a / b))\n        else:\n            st.append(int(t))\n    return st[-1]`,
            javascript: `function evalRPN(tokens) {\n    const st = [];\n    for (const t of tokens) {\n        if (t === '+' || t === '-' || t === '*' || t === '/') {\n            const b = st.pop(), a = st.pop();\n            if (t === '+') st.push(a + b);\n            else if (t === '-') st.push(a - b);\n            else if (t === '*') st.push(a * b);\n            else st.push(Math.trunc(a / b));\n        } else st.push(Number(t));\n    }\n    return st[0];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int evalRPN(String[] tokens) {\n        Deque<Integer> st = new ArrayDeque<>();\n        for (String t : tokens) {\n            if (t.equals("+") || t.equals("-") || t.equals("*") || t.equals("/")) {\n                int b = st.pop(), a = st.pop();\n                if (t.equals("+")) st.push(a + b);\n                else if (t.equals("-")) st.push(a - b);\n                else if (t.equals("*")) st.push(a * b);\n                else st.push(a / b);\n            } else st.push(Integer.parseInt(t));\n        }\n        return st.pop();\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        stack<int> st;\n        for (const string& t : tokens) {\n            if (t == "+" || t == "-" || t == "*" || t == "/") {\n                int b = st.top(); st.pop();\n                int a = st.top(); st.pop();\n                if (t == "+") st.push(a + b);\n                else if (t == "-") st.push(a - b);\n                else if (t == "*") st.push(a * b);\n                else st.push(a / b);\n            } else st.push(stoi(t));\n        }\n        return st.top();\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nint evalRPN(char** tokens, int n) {\n    int* st = (int*)malloc(sizeof(int) * (n + 1));\n    int top = -1;\n    for (int i = 0; i < n; i++) {\n        char* t = tokens[i];\n        if (strlen(t) == 1 && (t[0] == '+' || t[0] == '-' || t[0] == '*' || t[0] == '/')) {\n            int b = st[top--], a = st[top--];\n            if (t[0] == '+') st[++top] = a + b;\n            else if (t[0] == '-') st[++top] = a - b;\n            else if (t[0] == '*') st[++top] = a * b;\n            else st[++top] = a / b;\n        } else st[++top] = atoi(t);\n    }\n    int ans = st[0];\n    free(st);\n    return ans;\n}`
        }
    },

    // 50. Daily Temperatures (#739)
    {
        id: 'daily_temperatures',
        leetcodeId: 739,
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        topic: 'Stack & Queue',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given daily integer `temperatures`, return an array `answer` where `answer[i]` is the number of days until a warmer temperature, or `0` if none.',
        examples: [
            { input: 'temperatures = [73, 74, 75, 71, 69, 72, 76, 73]', output: '[1, 1, 4, 2, 1, 1, 0, 0]' },
            { input: 'temperatures = [30, 40, 50, 60]', output: '[1, 1, 1, 0]' }
        ],
        constraints: ['1 <= temperatures.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Monotonic Decreasing Stack' },
        io: {
            pyFn: 'daily_temperatures', jsFn: 'dailyTemperatures', javaMethod: 'dailyTemperatures', cppMethod: 'dailyTemperatures', cFn: 'dailyTemperatures',
            params: [{ name: 'temperatures', type: 'int[]' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: '8-Day Forecast', hidden: false, input: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] }, expected: [1, 1, 4, 2, 1, 1, 0, 0] },
            { id: 2, name: 'Strictly Rising', hidden: false, input: { temperatures: [30, 40, 50, 60] }, expected: [1, 1, 1, 0] },
            { id: 3, name: 'Strictly Falling', hidden: true, input: { temperatures: [80, 70, 60] }, expected: [0, 0, 0] }
        ],
        starterCode: {
            python: `def daily_temperatures(temperatures):\n    res = [0] * len(temperatures)\n    st = []\n    for i, t in enumerate(temperatures):\n        while st and temperatures[st[-1]] < t:\n            idx = st.pop()\n            res[idx] = i - idx\n        st.append(i)\n    return res`,
            javascript: `function dailyTemperatures(temperatures) {\n    const res = new Array(temperatures.length).fill(0), st = [];\n    for (let i = 0; i < temperatures.length; i++) {\n        while (st.length && temperatures[st[st.length - 1]] < temperatures[i]) {\n            const idx = st.pop();\n            res[idx] = i - idx;\n        }\n        st.push(i);\n    }\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int[] res = new int[temperatures.length];\n        Deque<Integer> st = new ArrayDeque<>();\n        for (int i = 0; i < temperatures.length; i++) {\n            while (!st.isEmpty() && temperatures[st.peek()] < temperatures[i]) {\n                int idx = st.pop();\n                res[idx] = i - idx;\n            }\n            st.push(i);\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        vector<int> res(temperatures.size(), 0);\n        stack<int> st;\n        for (int i = 0; i < (int)temperatures.size(); i++) {\n            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {\n                int idx = st.top(); st.pop();\n                res[idx] = i - idx;\n            }\n            st.push(i);\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* dailyTemperatures(const int* temperatures, int n, int* returnSize) {\n    int* res = (int*)calloc(n ? n : 1, sizeof(int));\n    int* st = (int*)malloc(sizeof(int) * (n + 1));\n    int top = -1;\n    for (int i = 0; i < n; i++) {\n        while (top >= 0 && temperatures[st[top]] < temperatures[i]) {\n            int idx = st[top--];\n            res[idx] = i - idx;\n        }\n        st[++top] = i;\n    }\n    free(st);\n    *returnSize = n;\n    return res;\n}`
        }
    }
,
    // 51. Generate Parentheses (#22)
    {
        id: 'generate_parentheses',
        leetcodeId: 22,
        title: 'Generate Parentheses',
        difficulty: 'Medium',
        topic: 'Backtracking',
        xpReward: 80,
        optimalTime: 'O(4^n / sqrt(n))',
        optimalSpace: 'O(n)',
        description: 'Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
        examples: [
            { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' },
            { input: 'n = 1', output: '["()"]' }
        ],
        constraints: ['1 <= n <= 8'],
        profileSizes: [1, 2, 3, 4],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'Balanced Paren Recursion Tree' },
        io: {
            pyFn: 'generate_parenthesis', jsFn: 'generateParenthesis', javaMethod: 'generateParenthesis', cppMethod: 'generateParenthesis', cFn: 'generateParenthesis',
            javaReturn: 'List<String>',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'string[]',
            compareMode: 'unordered_strings'
        },
        tests: [
            { id: 1, name: 'n = 3', hidden: false, input: { n: 3 }, expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
            { id: 2, name: 'n = 1', hidden: false, input: { n: 1 }, expected: ['()'] },
            { id: 3, name: 'n = 2', hidden: true, input: { n: 2 }, expected: ['(())', '()()'] }
        ],
        starterCode: {
            python: `def generate_parenthesis(n):\n    res = []\n    def bt(cur, op, cl):\n        if len(cur) == 2 * n:\n            res.append(cur)\n            return\n        if op < n: bt(cur + '(', op + 1, cl)\n        if cl < op: bt(cur + ')', op, cl + 1)\n    bt('', 0, 0)\n    return res`,
            javascript: `function generateParenthesis(n) {\n    const res = [];\n    function bt(cur, op, cl) {\n        if (cur.length === 2 * n) { res.push(cur); return; }\n        if (op < n) bt(cur + '(', op + 1, cl);\n        if (cl < op) bt(cur + ')', op, cl + 1);\n    }\n    bt('', 0, 0);\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<String> generateParenthesis(int n) {\n        List<String> res = new ArrayList<>();\n        bt(res, new StringBuilder(), 0, 0, n);\n        return res;\n    }\n    private void bt(List<String> res, StringBuilder sb, int op, int cl, int n) {\n        if (sb.length() == 2 * n) { res.add(sb.toString()); return; }\n        if (op < n) { sb.append('('); bt(res, sb, op + 1, cl, n); sb.deleteCharAt(sb.length() - 1); }\n        if (cl < op) { sb.append(')'); bt(res, sb, op, cl + 1, n); sb.deleteCharAt(sb.length() - 1); }\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<string> generateParenthesis(int n) {\n        vector<string> res;\n        string cur;\n        function<void(int, int)> bt = [&](int op, int cl) {\n            if ((int)cur.size() == 2 * n) { res.push_back(cur); return; }\n            if (op < n) { cur.push_back('('); bt(op + 1, cl); cur.pop_back(); }\n            if (cl < op) { cur.push_back(')'); bt(op, cl + 1); cur.pop_back(); }\n        };\n        bt(0, 0);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nstatic void _gpBt(int n, int op, int cl, int pos, char* buf, char*** res, int* cnt, int* cap) {\n    if (pos == 2 * n) {\n        if (*cnt == *cap) { *cap *= 2; *res = (char**)realloc(*res, sizeof(char*) * (*cap)); }\n        buf[pos] = '\\0';\n        char* copy = (char*)malloc(pos + 1);\n        memcpy(copy, buf, pos + 1);\n        (*res)[(*cnt)++] = copy;\n        return;\n    }\n    if (op < n) { buf[pos] = '('; _gpBt(n, op + 1, cl, pos + 1, buf, res, cnt, cap); }\n    if (cl < op) { buf[pos] = ')'; _gpBt(n, op, cl + 1, pos + 1, buf, res, cnt, cap); }\n}\n\nchar** generateParenthesis(int n, int* returnSize) {\n    int cap = 32, cnt = 0;\n    char** res = (char**)malloc(sizeof(char*) * cap);\n    char* buf = (char*)malloc(2 * n + 2);\n    _gpBt(n, 0, 0, 0, buf, &res, &cnt, &cap);\n    free(buf);\n    *returnSize = cnt;\n    return res;\n}`
        }
    },

    // 52. Subsets (#78)
    {
        id: 'subsets',
        leetcodeId: 78,
        title: 'Subsets (Power Set)',
        difficulty: 'Medium',
        topic: 'Backtracking',
        xpReward: 80,
        optimalTime: 'O(n * 2^n)',
        optimalSpace: 'O(n)',
        description: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set) without duplicates.',
        examples: [
            { input: 'nums = [1, 2, 3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
            { input: 'nums = [0]', output: '[[],[0]]' }
        ],
        constraints: ['1 <= nums.length <= 10'],
        profileSizes: [2, 4, 6, 8],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'Include/Exclude Choice Tree' },
        io: {
            pyFn: 'subsets', jsFn: 'subsets', javaMethod: 'subsets', cppMethod: 'subsets', cFn: 'subsets',
            javaReturn: 'List<List<Integer>>',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int[][]',
            compareMode: 'unordered_nested'
        },
        tests: [
            { id: 1, name: 'Three Elements', hidden: false, input: { nums: [1, 2, 3] }, expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
            { id: 2, name: 'Single Zero', hidden: false, input: { nums: [0] }, expected: [[], [0]] },
            { id: 3, name: 'Two Elements', hidden: true, input: { nums: [4, 9] }, expected: [[], [4], [9], [4, 9]] }
        ],
        starterCode: {
            python: `def subsets(nums):\n    res = [[]]\n    for x in nums:\n        res += [sub + [x] for sub in res]\n    return res`,
            javascript: `function subsets(nums) {\n    const res = [[]];\n    for (const x of nums) {\n        const len = res.length;\n        for (let i = 0; i < len; i++) res.push([...res[i], x]);\n    }\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        res.add(new ArrayList<>());\n        for (int x : nums) {\n            int sz = res.size();\n            for (int i = 0; i < sz; i++) {\n                List<Integer> copy = new ArrayList<>(res.get(i));\n                copy.add(x);\n                res.add(copy);\n            }\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        vector<vector<int>> res = {{}};\n        for (int x : nums) {\n            int sz = res.size();\n            for (int i = 0; i < sz; i++) {\n                vector<int> copy = res[i];\n                copy.push_back(x);\n                res.push_back(copy);\n            }\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint** subsets(const int* nums, int n, int* returnSize, int** returnColumnSizes) {\n    int total = 1 << n;\n    int** res = (int**)malloc(sizeof(int*) * total);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * total);\n    for (int mask = 0; mask < total; mask++) {\n        int cnt = 0;\n        for (int i = 0; i < n; i++) if (mask & (1 << i)) cnt++;\n        (*returnColumnSizes)[mask] = cnt;\n        res[mask] = cnt ? (int*)malloc(sizeof(int) * cnt) : NULL;\n        int k = 0;\n        for (int i = 0; i < n; i++) if (mask & (1 << i)) res[mask][k++] = nums[i];\n    }\n    *returnSize = total;\n    return res;\n}`
        }
    },

    // 53. Permutations (#46)
    {
        id: 'permutations',
        leetcodeId: 46,
        title: 'Permutations',
        difficulty: 'Medium',
        topic: 'Backtracking',
        xpReward: 80,
        optimalTime: 'O(n * n!)',
        optimalSpace: 'O(n)',
        description: 'Given an array `nums` of distinct integers, return all possible permutations in any order.',
        examples: [
            { input: 'nums = [1, 2, 3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
            { input: 'nums = [0, 1]', output: '[[0,1],[1,0]]' }
        ],
        constraints: ['1 <= nums.length <= 6'],
        profileSizes: [1, 2, 3, 4],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'Swap Backtracking Tree' },
        io: {
            pyFn: 'permute', jsFn: 'permute', javaMethod: 'permute', cppMethod: 'permute', cFn: 'permute',
            javaReturn: 'List<List<Integer>>',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int[][]',
            compareMode: 'unordered_nested'
        },
        tests: [
            { id: 1, name: '3 Elements', hidden: false, input: { nums: [1, 2, 3] }, expected: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]] },
            { id: 2, name: '2 Elements', hidden: false, input: { nums: [0, 1] }, expected: [[0,1],[1,0]] },
            { id: 3, name: 'Single Element', hidden: true, input: { nums: [1] }, expected: [[1]] }
        ],
        starterCode: {
            python: `def permute(nums):\n    res = []\n    def bt(start):\n        if start == len(nums):\n            res.append(nums[:]); return\n        for i in range(start, len(nums)):\n            nums[start], nums[i] = nums[i], nums[start]\n            bt(start + 1)\n            nums[start], nums[i] = nums[i], nums[start]\n    bt(0)\n    return res`,
            javascript: `function permute(nums) {\n    const res = [];\n    function bt(start) {\n        if (start === nums.length) { res.push([...nums]); return; }\n        for (let i = start; i < nums.length; i++) {\n            [nums[start], nums[i]] = [nums[i], nums[start]];\n            bt(start + 1);\n            [nums[start], nums[i]] = [nums[i], nums[start]];\n        }\n    }\n    bt(0);\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        bt(nums, 0, res);\n        return res;\n    }\n    private void bt(int[] nums, int s, List<List<Integer>> res) {\n        if (s == nums.length) {\n            List<Integer> list = new ArrayList<>();\n            for (int x : nums) list.add(x);\n            res.add(list); return;\n        }\n        for (int i = s; i < nums.length; i++) {\n            int t = nums[s]; nums[s] = nums[i]; nums[i] = t;\n            bt(nums, s + 1, res);\n            t = nums[s]; nums[s] = nums[i]; nums[i] = t;\n        }\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> permute(vector<int>& nums) {\n        vector<vector<int>> res;\n        function<void(int)> bt = [&](int s) {\n            if (s == (int)nums.size()) { res.push_back(nums); return; }\n            for (int i = s; i < (int)nums.size(); i++) {\n                swap(nums[s], nums[i]); bt(s + 1); swap(nums[s], nums[i]);\n            }\n        };\n        bt(0);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic void _permBt(int* a, int n, int s, int*** res, int* cnt, int* cap) {\n    if (s == n) {\n        if (*cnt == *cap) { *cap *= 2; *res = (int**)realloc(*res, sizeof(int*) * (*cap)); }\n        (*res)[*cnt] = (int*)malloc(sizeof(int) * n);\n        for (int i = 0; i < n; i++) (*res)[*cnt][i] = a[i];\n        (*cnt)++; return;\n    }\n    for (int i = s; i < n; i++) {\n        int t = a[s]; a[s] = a[i]; a[i] = t;\n        _permBt(a, n, s + 1, res, cnt, cap);\n        t = a[s]; a[s] = a[i]; a[i] = t;\n    }\n}\n\nint** permute(const int* nums, int n, int* returnSize, int** returnColumnSizes) {\n    int cap = 32, cnt = 0;\n    int** res = (int**)malloc(sizeof(int*) * cap);\n    int* a = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) a[i] = nums[i];\n    _permBt(a, n, 0, &res, &cnt, &cap);\n    free(a);\n    *returnSize = cnt;\n    *returnColumnSizes = (int*)malloc(sizeof(int) * cnt);\n    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = n;\n    return res;\n}`
        }
    },

    // 54. Combination Sum (#39)
    {
        id: 'combination_sum',
        leetcodeId: 39,
        title: 'Combination Sum',
        difficulty: 'Medium',
        topic: 'Backtracking',
        xpReward: 80,
        optimalTime: 'O(N^(T/M))',
        optimalSpace: 'O(T/M)',
        description: 'Given distinct positive integers `candidates` and `target`, return all unique combinations of `candidates` where chosen numbers sum to `target` (same number reusable unlimited times).',
        examples: [
            { input: 'candidates = [2, 3, 6, 7], target = 7', output: '[[2,2,3],[7]]' },
            { input: 'candidates = [2, 3, 5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]' }
        ],
        constraints: ['1 <= candidates.length <= 30', '1 <= target <= 40'],
        profileSizes: [3, 5, 7, 9],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'Target Pruning DFS Tree' },
        io: {
            pyFn: 'combination_sum', jsFn: 'combinationSum', javaMethod: 'combinationSum', cppMethod: 'combinationSum', cFn: 'combinationSum',
            javaReturn: 'List<List<Integer>>',
            params: [{ name: 'candidates', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int[][]',
            compareMode: 'unordered_nested'
        },
        tests: [
            { id: 1, name: 'Target 7', hidden: false, input: { candidates: [2, 3, 6, 7], target: 7 }, expected: [[2, 2, 3], [7]] },
            { id: 2, name: 'Target 8', hidden: false, input: { candidates: [2, 3, 5], target: 8 }, expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
            { id: 3, name: 'No Match', hidden: true, input: { candidates: [2], target: 1 }, expected: [] }
        ],
        starterCode: {
            python: `def combination_sum(candidates, target):\n    candidates.sort()\n    res = []\n    def bt(start, rem, path):\n        if rem == 0:\n            res.append(path[:]); return\n        for i in range(start, len(candidates)):\n            if candidates[i] > rem: break\n            path.append(candidates[i])\n            bt(i, rem - candidates[i], path)\n            path.pop()\n    bt(0, target, [])\n    return res`,
            javascript: `function combinationSum(candidates, target) {\n    candidates.sort((a, b) => a - b);\n    const res = [], path = [];\n    function bt(start, rem) {\n        if (rem === 0) { res.push([...path]); return; }\n        for (let i = start; i < candidates.length; i++) {\n            if (candidates[i] > rem) break;\n            path.push(candidates[i]); bt(i, rem - candidates[i]); path.pop();\n        }\n    }\n    bt(0, target);\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> combinationSum(int[] candidates, int target) {\n        Arrays.sort(candidates);\n        List<List<Integer>> res = new ArrayList<>();\n        bt(candidates, 0, target, new ArrayList<>(), res);\n        return res;\n    }\n    private void bt(int[] c, int start, int rem, List<Integer> path, List<List<Integer>> res) {\n        if (rem == 0) { res.add(new ArrayList<>(path)); return; }\n        for (int i = start; i < c.length; i++) {\n            if (c[i] > rem) break;\n            path.add(c[i]); bt(c, i, rem - c[i], path, res); path.remove(path.size() - 1);\n        }\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {\n        sort(candidates.begin(), candidates.end());\n        vector<vector<int>> res;\n        vector<int> path;\n        function<void(int, int)> bt = [&](int start, int rem) {\n            if (rem == 0) { res.push_back(path); return; }\n            for (int i = start; i < (int)candidates.size(); i++) {\n                if (candidates[i] > rem) break;\n                path.push_back(candidates[i]); bt(i, rem - candidates[i]); path.pop_back();\n            }\n        };\n        bt(0, target);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpCS(const void* a, const void* b) { return (*(const int*)a) - (*(const int*)b); }\nstatic void _csBt(const int* a, int n, int start, int rem, int* path, int pLen, int*** res, int** cols, int* cnt, int* cap) {\n    if (rem == 0) {\n        if (*cnt == *cap) { *cap *= 2; *res = (int**)realloc(*res, sizeof(int*) * (*cap)); *cols = (int*)realloc(*cols, sizeof(int) * (*cap)); }\n        (*cols)[*cnt] = pLen;\n        (*res)[*cnt] = pLen ? (int*)malloc(sizeof(int) * pLen) : NULL;\n        for (int i = 0; i < pLen; i++) (*res)[*cnt][i] = path[i];\n        (*cnt)++; return;\n    }\n    for (int i = start; i < n; i++) {\n        if (a[i] > rem) break;\n        path[pLen] = a[i];\n        _csBt(a, n, i, rem - a[i], path, pLen + 1, res, cols, cnt, cap);\n    }\n}\n\nint** combinationSum(const int* candidates, int n, int target, int* returnSize, int** returnColumnSizes) {\n    int* a = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) a[i] = candidates[i];\n    qsort(a, n, sizeof(int), _cmpCS);\n    int cap = 32, cnt = 0;\n    int** res = (int**)malloc(sizeof(int*) * cap);\n    int* cols = (int*)malloc(sizeof(int) * cap);\n    int path[64];\n    _csBt(a, n, 0, target, path, 0, &res, &cols, &cnt, &cap);\n    free(a);\n    *returnSize = cnt; *returnColumnSizes = cols;\n    return res;\n}`
        }
    },

    // 55. Word Search (#79)
    {
        id: 'word_search',
        leetcodeId: 79,
        title: 'Word Search',
        difficulty: 'Medium',
        topic: 'Backtracking',
        xpReward: 80,
        optimalTime: 'O(m * n * 4^L)',
        optimalSpace: 'O(L)',
        description: 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid via horizontally/vertically adjacent cells without cell reuse.',
        examples: [
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
            { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false' }
        ],
        constraints: ['1 <= m, n <= 6', '1 <= word.length <= 15'],
        profileSizes: [4, 9, 16, 25],
        vis: { type: 'grid', studio: 'visualize-backtracking.html', studioLabel: '2D Grid Backtracking Path' },
        io: {
            pyFn: 'exist', jsFn: 'exist', javaMethod: 'exist', cppMethod: 'exist', cFn: 'exist',
            params: [{ name: 'board', type: 'char[][]' }, { name: 'word', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'ABCCED Found', hidden: false, input: { board: ['ABCE', 'SFCS', 'ADEE'], word: 'ABCCED' }, expected: true },
            { id: 2, name: 'No Reuse Allowed', hidden: false, input: { board: ['ABCE', 'SFCS', 'ADEE'], word: 'ABCB' }, expected: false },
            { id: 3, name: 'SEE Found', hidden: true, input: { board: ['ABCE', 'SFCS', 'ADEE'], word: 'SEE' }, expected: true }
        ],
        starterCode: {
            python: `def exist(board, word):\n    R, C = len(board), len(board[0])\n    def dfs(r, c, idx):\n        if idx == len(word): return True\n        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != word[idx]: return False\n        ch = board[r][c]\n        board[r][c] = '#'\n        ok = dfs(r+1, c, idx+1) or dfs(r-1, c, idx+1) or dfs(r, c+1, idx+1) or dfs(r, c-1, idx+1)\n        board[r][c] = ch\n        return ok\n    return any(dfs(r, c, 0) for r in range(R) for c in range(C))`,
            javascript: `function exist(board, word) {\n    const R = board.length, C = board[0].length;\n    function dfs(r, c, idx) {\n        if (idx === word.length) return true;\n        if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== word[idx]) return false;\n        const ch = board[r][c]; board[r][c] = '#';\n        const ok = dfs(r+1, c, idx+1) || dfs(r-1, c, idx+1) || dfs(r, c+1, idx+1) || dfs(r, c-1, idx+1);\n        board[r][c] = ch;\n        return ok;\n    }\n    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true;\n    return false;\n}`,
            java: `class Solution {\n    public boolean exist(char[][] board, String word) {\n        for (int r = 0; r < board.length; r++)\n            for (int c = 0; c < board[0].length; c++)\n                if (dfs(board, word, r, c, 0)) return true;\n        return false;\n    }\n    private boolean dfs(char[][] b, String w, int r, int c, int i) {\n        if (i == w.length()) return true;\n        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length || b[r][c] != w.charAt(i)) return false;\n        char ch = b[r][c]; b[r][c] = '#';\n        boolean ok = dfs(b, w, r+1, c, i+1) || dfs(b, w, r-1, c, i+1) || dfs(b, w, r, c+1, i+1) || dfs(b, w, r, c-1, i+1);\n        b[r][c] = ch;\n        return ok;\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        int R = board.size(), C = board[0].size();\n        function<bool(int, int, int)> dfs = [&](int r, int c, int i) -> bool {\n            if (i == (int)word.size()) return true;\n            if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] != word[i]) return false;\n            char ch = board[r][c]; board[r][c] = '#';\n            bool ok = dfs(r+1, c, i+1) || dfs(r-1, c, i+1) || dfs(r, c+1, i+1) || dfs(r, c-1, i+1);\n            board[r][c] = ch;\n            return ok;\n        };\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (dfs(r, c, 0)) return true;\n        return false;\n    }\n};`,
            c: `#include <stdbool.h>\n\nstatic bool _wsDfs(char** b, int R, int C, int r, int c, const char* w, int idx) {\n    if (w[idx] == '\\0') return true;\n    if (r < 0 || r >= R || c < 0 || c >= C || b[r][c] != w[idx]) return false;\n    char ch = b[r][c]; b[r][c] = '#';\n    bool ok = _wsDfs(b, R, C, r+1, c, w, idx+1) || _wsDfs(b, R, C, r-1, c, w, idx+1) || _wsDfs(b, R, C, r, c+1, w, idx+1) || _wsDfs(b, R, C, r, c-1, w, idx+1);\n    b[r][c] = ch;\n    return ok;\n}\n\nbool exist(char** board, int R, int* boardColSize, char* word) {\n    int C = boardColSize[0];\n    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (_wsDfs(board, R, C, r, c, word, 0)) return true;\n    return false;\n}`
        }
    },

    // 56. House Robber (#198)
    {
        id: 'house_robber',
        leetcodeId: 198,
        title: 'House Robber',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given integer array `nums` representing money in each house along a street, return the maximum amount you can rob without alerting police (no two adjacent houses).',
        examples: [
            { input: 'nums = [1, 2, 3, 1]', output: '4' },
            { input: 'nums = [2, 7, 9, 3, 1]', output: '12' }
        ],
        constraints: ['1 <= nums.length <= 100'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Take-or-Skip 1D DP' },
        io: {
            pyFn: 'rob', jsFn: 'rob', javaMethod: 'rob', cppMethod: 'rob', cFn: 'rob',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '4 Houses', hidden: false, input: { nums: [1, 2, 3, 1] }, expected: 4 },
            { id: 2, name: '5 Houses', hidden: false, input: { nums: [2, 7, 9, 3, 1] }, expected: 12 },
            { id: 3, name: 'Skip Two Adjacent', hidden: true, input: { nums: [2, 1, 1, 2] }, expected: 4 },
            { id: 4, name: 'Single House', hidden: true, input: { nums: [9] }, expected: 9 }
        ],
        starterCode: {
            python: `def rob(nums):\n    prev2 = prev1 = 0\n    for x in nums:\n        prev2, prev1 = prev1, max(prev1, prev2 + x)\n    return prev1`,
            javascript: `function rob(nums) {\n    let prev2 = 0, prev1 = 0;\n    for (const x of nums) { const cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }\n    return prev1;\n}`,
            java: `class Solution {\n    public int rob(int[] nums) {\n        int prev2 = 0, prev1 = 0;\n        for (int x : nums) { int cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }\n        return prev1;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        int prev2 = 0, prev1 = 0;\n        for (int x : nums) { int cur = max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }\n        return prev1;\n    }\n};`,
            c: `int rob(const int* nums, int n) {\n    int prev2 = 0, prev1 = 0;\n    for (int i = 0; i < n; i++) {\n        int take = prev2 + nums[i];\n        int cur = take > prev1 ? take : prev1;\n        prev2 = prev1; prev1 = cur;\n    }\n    return prev1;\n}`
        }
    },

    // 57. House Robber II (#213)
    {
        id: 'house_robber_ii',
        leetcodeId: 213,
        title: 'House Robber II (Circular)',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Same as House Robber, except houses are arranged in a circle (first and last house are adjacent).',
        examples: [
            { input: 'nums = [2, 3, 2]', output: '3' },
            { input: 'nums = [1, 2, 3, 1]', output: '4' }
        ],
        constraints: ['1 <= nums.length <= 100'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Circular Split 1D DP' },
        io: {
            pyFn: 'rob_ii', jsFn: 'rob', javaMethod: 'rob', cppMethod: 'rob', cFn: 'rob',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '3 Circular', hidden: false, input: { nums: [2, 3, 2] }, expected: 3 },
            { id: 2, name: '4 Circular', hidden: false, input: { nums: [1, 2, 3, 1] }, expected: 4 },
            { id: 3, name: 'Single House', hidden: true, input: { nums: [5] }, expected: 5 },
            { id: 4, name: '5 Circular', hidden: true, input: { nums: [1, 2, 3, 4, 5] }, expected: 8 }
        ],
        starterCode: {
            python: `def rob_ii(nums):\n    if len(nums) == 1: return nums[0]\n    def line(arr):\n        a = b = 0\n        for x in arr: a, b = b, max(b, a + x)\n        return b\n    return max(line(nums[:-1]), line(nums[1:]))`,
            javascript: `function rob(nums) {\n    if (nums.length === 1) return nums[0];\n    const line = (l, r) => {\n        let a = 0, b = 0;\n        for (let i = l; i <= r; i++) { const c = Math.max(b, a + nums[i]); a = b; b = c; }\n        return b;\n    };\n    return Math.max(line(0, nums.length - 2), line(1, nums.length - 1));\n}`,
            java: `class Solution {\n    private int line(int[] a, int l, int r) {\n        int p2 = 0, p1 = 0;\n        for (int i = l; i <= r; i++) { int c = Math.max(p1, p2 + a[i]); p2 = p1; p1 = c; }\n        return p1;\n    }\n    public int rob(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        return Math.max(line(nums, 0, nums.length - 2), line(nums, 1, nums.length - 1));\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int line(vector<int>& a, int l, int r) {\n        int p2 = 0, p1 = 0;\n        for (int i = l; i <= r; i++) { int c = max(p1, p2 + a[i]); p2 = p1; p1 = c; }\n        return p1;\n    }\n    int rob(vector<int>& nums) {\n        if (nums.size() == 1) return nums[0];\n        return max(line(nums, 0, (int)nums.size() - 2), line(nums, 1, (int)nums.size() - 1));\n    }\n};`,
            c: `static int _robLine(const int* a, int l, int r) {\n    int p2 = 0, p1 = 0;\n    for (int i = l; i <= r; i++) { int c = (p2 + a[i] > p1) ? (p2 + a[i]) : p1; p2 = p1; p1 = c; }\n    return p1;\n}\n\nint rob(const int* nums, int n) {\n    if (n == 1) return nums[0];\n    int a = _robLine(nums, 0, n - 2), b = _robLine(nums, 1, n - 1);\n    return a > b ? a : b;\n}`
        }
    },

    // 58. Coin Change (#322)
    {
        id: 'coin_change',
        leetcodeId: 322,
        title: 'Coin Change',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(n * amount)',
        optimalSpace: 'O(amount)',
        description: 'Given coin denominations `coins` and integer `amount`, return the fewest number of coins needed to make `amount`, or `-1` if impossible.',
        examples: [
            { input: 'coins = [1, 2, 5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1.' },
            { input: 'coins = [2], amount = 3', output: '-1' }
        ],
        constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
        profileSizes: [10, 30, 60, 120, 240],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Bottom-Up Unbounded Knapsack' },
        io: {
            pyFn: 'coin_change', jsFn: 'coinChange', javaMethod: 'coinChange', cppMethod: 'coinChange', cFn: 'coinChange',
            params: [{ name: 'coins', type: 'int[]' }, { name: 'amount', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Amount 11', hidden: false, input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
            { id: 2, name: 'Impossible', hidden: false, input: { coins: [2], amount: 3 }, expected: -1 },
            { id: 3, name: 'Zero Amount', hidden: false, input: { coins: [1], amount: 0 }, expected: 0 },
            { id: 4, name: 'Greedy Trap', hidden: true, input: { coins: [1, 3, 4], amount: 6 }, expected: 2 }
        ],
        starterCode: {
            python: `def coin_change(coins, amount):\n    dp = [amount + 1] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a and dp[a - c] + 1 < dp[a]:\n                dp[a] = dp[a - c] + 1\n    return -1 if dp[amount] > amount else dp[amount]`,
            javascript: `function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(amount + 1);\n    dp[0] = 0;\n    for (let a = 1; a <= amount; a++) {\n        for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++)\n            for (int c : coins)\n                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++)\n            for (int c : coins)\n                if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};`,
            c: `#include <stdlib.h>\n\nint coinChange(const int* coins, int n, int amount) {\n    int* dp = (int*)malloc(sizeof(int) * (amount + 1));\n    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;\n    dp[0] = 0;\n    for (int a = 1; a <= amount; a++) {\n        for (int i = 0; i < n; i++) {\n            int c = coins[i];\n            if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;\n        }\n    }\n    int ans = dp[amount] > amount ? -1 : dp[amount];\n    free(dp);\n    return ans;\n}`
        }
    },

    // 59. Longest Increasing Subsequence (#300)
    {
        id: 'longest_increasing_subsequence',
        leetcodeId: 300,
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given integer array `nums`, return the length of the longest strictly increasing subsequence.',
        examples: [
            { input: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]', output: '4', explanation: '[2, 3, 7, 101] has length 4.' },
            { input: 'nums = [7, 7, 7, 7]', output: '1' }
        ],
        constraints: ['1 <= nums.length <= 2500'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Patience Tails Binary Search' },
        io: {
            pyFn: 'length_of_lis', jsFn: 'lengthOfLIS', javaMethod: 'lengthOfLIS', cppMethod: 'lengthOfLIS', cFn: 'lengthOfLIS',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic LIS 4', hidden: false, input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, expected: 4 },
            { id: 2, name: 'LIS 4 Mixed', hidden: false, input: { nums: [0, 1, 0, 3, 2, 3] }, expected: 4 },
            { id: 3, name: 'All Equal', hidden: false, input: { nums: [7, 7, 7, 7] }, expected: 1 }
        ],
        starterCode: {
            python: `import bisect\n\ndef length_of_lis(nums):\n    tails = []\n    for x in nums:\n        i = bisect.bisect_left(tails, x)\n        if i == len(tails): tails.append(x)\n        else: tails[i] = x\n    return len(tails)`,
            javascript: `function lengthOfLIS(nums) {\n    const tails = [];\n    for (const x of nums) {\n        let l = 0, r = tails.length;\n        while (l < r) {\n            const m = (l + r) >> 1;\n            if (tails[m] < x) l = m + 1; else r = m;\n        }\n        tails[l] = x;\n    }\n    return tails.length;\n}`,
            java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        int[] tails = new int[nums.length];\n        int size = 0;\n        for (int x : nums) {\n            int l = 0, r = size;\n            while (l < r) {\n                int m = (l + r) >>> 1;\n                if (tails[m] < x) l = m + 1; else r = m;\n            }\n            tails[l] = x;\n            if (l == size) size++;\n        }\n        return size;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        vector<int> tails;\n        for (int x : nums) {\n            auto it = lower_bound(tails.begin(), tails.end(), x);\n            if (it == tails.end()) tails.push_back(x);\n            else *it = x;\n        }\n        return tails.size();\n    }\n};`,
            c: `#include <stdlib.h>\n\nint lengthOfLIS(const int* nums, int n) {\n    int* tails = (int*)malloc(sizeof(int) * (n ? n : 1));\n    int sz = 0;\n    for (int i = 0; i < n; i++) {\n        int l = 0, r = sz, x = nums[i];\n        while (l < r) { int m = l + (r - l) / 2; if (tails[m] < x) l = m + 1; else r = m; }\n        tails[l] = x;\n        if (l == sz) sz++;\n    }\n    free(tails);\n    return sz;\n}`
        }
    },

    // 60. Longest Common Subsequence (#1143)
    {
        id: 'longest_common_subsequence',
        leetcodeId: 1143,
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence.',
        examples: [
            { input: 'text1 = "abcde", text2 = "ace"', output: '3' },
            { input: 'text1 = "abc", text2 = "def"', output: '0' }
        ],
        constraints: ['1 <= text1.length, text2.length <= 1000'],
        profileSizes: [10, 25, 50, 100],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: '2D LCS DP Table' },
        io: {
            pyFn: 'longest_common_subsequence', jsFn: 'longestCommonSubsequence', javaMethod: 'longestCommonSubsequence', cppMethod: 'longestCommonSubsequence', cFn: 'longestCommonSubsequence',
            params: [{ name: 'text1', type: 'string' }, { name: 'text2', type: 'string' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'abcde & ace', hidden: false, input: { text1: 'abcde', text2: 'ace' }, expected: 3 },
            { id: 2, name: 'Identical', hidden: false, input: { text1: 'abc', text2: 'abc' }, expected: 3 },
            { id: 3, name: 'Disjoint', hidden: false, input: { text1: 'abc', text2: 'def' }, expected: 0 },
            { id: 4, name: 'Cross Match', hidden: true, input: { text1: 'oxcpqrsvwf', text2: 'shmtulqrypy' }, expected: 2 }
        ],
        starterCode: {
            python: `def longest_common_subsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i - 1] == text2[j - 1]: dp[i][j] = 1 + dp[i - 1][j - 1]\n            else: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[m][n]`,
            javascript: `function longestCommonSubsequence(text1, text2) {\n    const m = text1.length, n = text2.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            dp[i][j] = text1[i - 1] === text2[j - 1] ? 1 + dp[i - 1][j - 1] : Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[m][n];\n}`,
            java: `class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 1; i <= m; i++)\n            for (int j = 1; j <= n; j++)\n                dp[i][j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? 1 + dp[i - 1][j - 1] : Math.max(dp[i - 1][j], dp[i][j - 1]);\n        return dp[m][n];\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        int m = text1.size(), n = text2.size();\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n        for (int i = 1; i <= m; i++)\n            for (int j = 1; j <= n; j++)\n                dp[i][j] = text1[i - 1] == text2[j - 1] ? 1 + dp[i - 1][j - 1] : max(dp[i - 1][j], dp[i][j - 1]);\n        return dp[m][n];\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nint longestCommonSubsequence(const char* t1, const char* t2) {\n    int m = (int)strlen(t1), n = (int)strlen(t2);\n    int* prev = (int*)calloc(n + 1, sizeof(int));\n    int* curr = (int*)calloc(n + 1, sizeof(int));\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (t1[i - 1] == t2[j - 1]) curr[j] = 1 + prev[j - 1];\n            else curr[j] = prev[j] > curr[j - 1] ? prev[j] : curr[j - 1];\n        }\n        int* tmp = prev; prev = curr; curr = tmp;\n    }\n    int ans = prev[n];\n    free(prev); free(curr);\n    return ans;\n}`
        }
    }
,

    // 61. Unique Paths (#62)
    {
        id: 'unique_paths',
        leetcodeId: 62,
        title: 'Unique Paths',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        xpReward: 80,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(n)',
        description: 'A robot sits at the top-left corner of an `m x n` grid and can only move either down or right. Return the number of unique paths to reach the bottom-right corner.',
        examples: [
            { input: 'm = 3, n = 7', output: '28' },
            { input: 'm = 3, n = 2', output: '3' }
        ],
        constraints: ['1 <= m, n <= 100'],
        profileSizes: [5, 10, 20, 40],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: '2D Grid Path DP' },
        io: {
            pyFn: 'unique_paths', jsFn: 'uniquePaths', javaMethod: 'uniquePaths', cppMethod: 'uniquePaths', cFn: 'uniquePaths',
            params: [{ name: 'm', type: 'int' }, { name: 'n', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '3x7 Grid', hidden: false, input: { m: 3, n: 7 }, expected: 28 },
            { id: 2, name: '3x2 Grid', hidden: false, input: { m: 3, n: 2 }, expected: 3 },
            { id: 3, name: '1x5 Strip', hidden: false, input: { m: 1, n: 5 }, expected: 1 },
            { id: 4, name: '7x3 Grid', hidden: true, input: { m: 7, n: 3 }, expected: 28 }
        ],
        starterCode: {
            python: `def unique_paths(m, n):\n    dp = [1] * n\n    for _ in range(1, m):\n        for j in range(1, n):\n            dp[j] += dp[j - 1]\n    return dp[-1]`,
            javascript: `function uniquePaths(m, n) {\n    const dp = new Array(n).fill(1);\n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) dp[j] += dp[j - 1];\n    }\n    return dp[n - 1];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++)\n            for (int j = 1; j < n; j++)\n                dp[j] += dp[j - 1];\n        return dp[n - 1];\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int uniquePaths(int m, int n) {\n        vector<int> dp(n, 1);\n        for (int i = 1; i < m; i++)\n            for (int j = 1; j < n; j++)\n                dp[j] += dp[j - 1];\n        return dp[n - 1];\n    }\n};`,
            c: `#include <stdlib.h>\n\nint uniquePaths(int m, int n) {\n    int* dp = (int*)malloc(sizeof(int) * n);\n    for (int j = 0; j < n; j++) dp[j] = 1;\n    for (int i = 1; i < m; i++)\n        for (int j = 1; j < n; j++)\n            dp[j] += dp[j - 1];\n    int ans = dp[n - 1];\n    free(dp);\n    return ans;\n}`
        }
    },

    // 62. Jump Game (#55)
    {
        id: 'jump_game',
        leetcodeId: 55,
        title: 'Jump Game',
        difficulty: 'Medium',
        topic: 'Greedy',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given integer array `nums` where `nums[i]` represents your maximum jump length from index `i`, return `true` if you can reach the last index, or `false` otherwise.',
        examples: [
            { input: 'nums = [2, 3, 1, 1, 4]', output: 'true' },
            { input: 'nums = [3, 2, 1, 0, 4]', output: 'false' }
        ],
        constraints: ['1 <= nums.length <= 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-array.html', studioLabel: 'Greedy Max Reach Window' },
        io: {
            pyFn: 'can_jump', jsFn: 'canJump', javaMethod: 'canJump', cppMethod: 'canJump', cFn: 'canJump',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Reachable', hidden: false, input: { nums: [2, 3, 1, 1, 4] }, expected: true },
            { id: 2, name: 'Zero Trap', hidden: false, input: { nums: [3, 2, 1, 0, 4] }, expected: false },
            { id: 3, name: 'Single Element', hidden: false, input: { nums: [0] }, expected: true },
            { id: 4, name: 'Skip Over Zero', hidden: true, input: { nums: [2, 0, 0] }, expected: true }
        ],
        starterCode: {
            python: `def can_jump(nums):\n    reach = 0\n    for i, jump in enumerate(nums):\n        if i > reach: return False\n        reach = max(reach, i + jump)\n    return True`,
            javascript: `function canJump(nums) {\n    let reach = 0;\n    for (let i = 0; i < nums.length; i++) {\n        if (i > reach) return false;\n        reach = Math.max(reach, i + nums[i]);\n    }\n    return true;\n}`,
            java: `class Solution {\n    public boolean canJump(int[] nums) {\n        int reach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > reach) return false;\n            reach = Math.max(reach, i + nums[i]);\n        }\n        return true;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        int reach = 0;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (i > reach) return false;\n            reach = max(reach, i + nums[i]);\n        }\n        return true;\n    }\n};`,
            c: `#include <stdbool.h>\n\nbool canJump(const int* nums, int n) {\n    int reach = 0;\n    for (int i = 0; i < n; i++) {\n        if (i > reach) return false;\n        if (i + nums[i] > reach) reach = i + nums[i];\n    }\n    return true;\n}`
        }
    },

    // 63. Insert Interval (#57)
    {
        id: 'insert_interval',
        leetcodeId: 57,
        title: 'Insert Interval',
        difficulty: 'Medium',
        topic: 'Sorting & Intervals',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given sorted non-overlapping `intervals` and a `newInterval = [start, end]`, insert `newInterval` into `intervals`, merging overlapping intervals if necessary.',
        examples: [
            { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
            { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]' }
        ],
        constraints: ['0 <= intervals.length <= 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'intervals', studio: 'visualize-sorting.html', studioLabel: '3-Phase Interval Insert' },
        io: {
            pyFn: 'insert', jsFn: 'insert', javaMethod: 'insert', cppMethod: 'insert', cFn: 'insert',
            params: [{ name: 'intervals', type: 'int[][]' }, { name: 'newInterval', type: 'int[]' }],
            returnType: 'int[][]'
        },
        tests: [
            { id: 1, name: 'Merge Front', hidden: false, input: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] }, expected: [[1, 5], [6, 9]] },
            { id: 2, name: 'Multi Merge', hidden: false, input: { intervals: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval: [4, 8] }, expected: [[1, 2], [3, 10], [12, 16]] },
            { id: 3, name: 'Empty List', hidden: true, input: { intervals: [], newInterval: [5, 7] }, expected: [[5, 7]] }
        ],
        starterCode: {
            python: `def insert(intervals, newInterval):\n    res, i, n = [], 0, len(intervals)\n    s, e = newInterval\n    while i < n and intervals[i][1] < s:\n        res.append(intervals[i]); i += 1\n    while i < n and intervals[i][0] <= e:\n        s = min(s, intervals[i][0])\n        e = max(e, intervals[i][1])\n        i += 1\n    res.append([s, e])\n    while i < n:\n        res.append(intervals[i]); i += 1\n    return res`,
            javascript: `function insert(intervals, newInterval) {\n    const res = [];\n    let i = 0, s = newInterval[0], e = newInterval[1];\n    while (i < intervals.length && intervals[i][1] < s) res.push(intervals[i++]);\n    while (i < intervals.length && intervals[i][0] <= e) {\n        s = Math.min(s, intervals[i][0]);\n        e = Math.max(e, intervals[i][1]);\n        i++;\n    }\n    res.push([s, e]);\n    while (i < intervals.length) res.push(intervals[i++]);\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[][] insert(int[][] intervals, int[] newInterval) {\n        List<int[]> res = new ArrayList<>();\n        int i = 0, n = intervals.length, s = newInterval[0], e = newInterval[1];\n        while (i < n && intervals[i][1] < s) res.add(intervals[i++]);\n        while (i < n && intervals[i][0] <= e) {\n            s = Math.min(s, intervals[i][0]);\n            e = Math.max(e, intervals[i][1]);\n            i++;\n        }\n        res.add(new int[]{s, e});\n        while (i < n) res.add(intervals[i++]);\n        return res.toArray(new int[res.size()][]);\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {\n        vector<vector<int>> res;\n        int i = 0, n = intervals.size(), s = newInterval[0], e = newInterval[1];\n        while (i < n && intervals[i][1] < s) res.push_back(intervals[i++]);\n        while (i < n && intervals[i][0] <= e) {\n            s = min(s, intervals[i][0]);\n            e = max(e, intervals[i][1]);\n            i++;\n        }\n        res.push_back({s, e});\n        while (i < n) res.push_back(intervals[i++]);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint** insert(int** intervals, int n, int* intervalsColSize, const int* newInterval, int newIntervalSize, int* returnSize, int** returnColumnSizes) {\n    int** res = (int**)malloc(sizeof(int*) * (n + 1));\n    *returnColumnSizes = (int*)malloc(sizeof(int) * (n + 1));\n    int k = 0, i = 0, s = newInterval[0], e = newInterval[1];\n    while (i < n && intervals[i][1] < s) {\n        res[k] = (int*)malloc(sizeof(int) * 2);\n        res[k][0] = intervals[i][0]; res[k][1] = intervals[i][1];\n        (*returnColumnSizes)[k++] = 2; i++;\n    }\n    while (i < n && intervals[i][0] <= e) {\n        if (intervals[i][0] < s) s = intervals[i][0];\n        if (intervals[i][1] > e) e = intervals[i][1];\n        i++;\n    }\n    res[k] = (int*)malloc(sizeof(int) * 2);\n    res[k][0] = s; res[k][1] = e; (*returnColumnSizes)[k++] = 2;\n    while (i < n) {\n        res[k] = (int*)malloc(sizeof(int) * 2);\n        res[k][0] = intervals[i][0]; res[k][1] = intervals[i][1];\n        (*returnColumnSizes)[k++] = 2; i++;\n    }\n    *returnSize = k;\n    return res;\n}`
        }
    },

    // 64. Non-overlapping Intervals (#435)
    {
        id: 'non_overlapping_intervals',
        leetcodeId: 435,
        title: 'Non-overlapping Intervals',
        difficulty: 'Medium',
        topic: 'Sorting & Intervals',
        xpReward: 80,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(1)',
        description: 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of intervals you need to remove to make the rest non-overlapping.',
        examples: [
            { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: 'Removing [1,3] leaves non-overlapping intervals.' },
            { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2' }
        ],
        constraints: ['1 <= intervals.length <= 10^5'],
        profileSizes: [15, 45, 100, 200, 400],
        vis: { type: 'intervals', studio: 'visualize-sorting.html', studioLabel: 'Greedy End-Time Interval Sort' },
        io: {
            pyFn: 'erase_overlap_intervals', jsFn: 'eraseOverlapIntervals', javaMethod: 'eraseOverlapIntervals', cppMethod: 'eraseOverlapIntervals', cFn: 'eraseOverlapIntervals',
            params: [{ name: 'intervals', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Remove One', hidden: false, input: { intervals: [[1, 2], [2, 3], [3, 4], [1, 3]] }, expected: 1 },
            { id: 2, name: 'Duplicates', hidden: false, input: { intervals: [[1, 2], [1, 2], [1, 2]] }, expected: 2 },
            { id: 3, name: 'Already Disjoint', hidden: false, input: { intervals: [[1, 2], [2, 3]] }, expected: 0 },
            { id: 4, name: 'Nested Wrapper', hidden: true, input: { intervals: [[1, 10], [2, 3], [4, 5], [6, 7]] }, expected: 1 }
        ],
        starterCode: {
            python: `def erase_overlap_intervals(intervals):\n    intervals.sort(key=lambda x: x[1])\n    removed = 0\n    end = intervals[0][1]\n    for s, e in intervals[1:]:\n        if s < end: removed += 1\n        else: end = e\n    return removed`,
            javascript: `function eraseOverlapIntervals(intervals) {\n    intervals.sort((a, b) => a[1] - b[1]);\n    let removed = 0, end = intervals[0][1];\n    for (let i = 1; i < intervals.length; i++) {\n        if (intervals[i][0] < end) removed++;\n        else end = intervals[i][1];\n    }\n    return removed;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n        int removed = 0, end = intervals[0][1];\n        for (int i = 1; i < intervals.length; i++) {\n            if (intervals[i][0] < end) removed++;\n            else end = intervals[i][1];\n        }\n        return removed;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {\n            return a[1] < b[1];\n        });\n        int removed = 0, end = intervals[0][1];\n        for (int i = 1; i < (int)intervals.size(); i++) {\n            if (intervals[i][0] < end) removed++;\n            else end = intervals[i][1];\n        }\n        return removed;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpNOI(const void* a, const void* b) {\n    const int* x = *(const int* const*)a;\n    const int* y = *(const int* const*)b;\n    return (x[1] > y[1]) - (x[1] < y[1]);\n}\n\nint eraseOverlapIntervals(int** intervals, int n, int* cols) {\n    if (n == 0) return 0;\n    qsort(intervals, n, sizeof(int*), _cmpNOI);\n    int removed = 0, end = intervals[0][1];\n    for (int i = 1; i < n; i++) {\n        if (intervals[i][0] < end) removed++;\n        else end = intervals[i][1];\n    }\n    return removed;\n}`
        }
    },

    // 65. Number of Islands (#200)
    {
        id: 'number_of_islands',
        leetcodeId: 200,
        title: 'Number of Islands',
        difficulty: 'Medium',
        topic: 'Graphs & BFS/DFS',
        xpReward: 80,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'Given an `m x n` 2D binary grid where `"1"` represents land and `"0"` represents water, return the number of islands (connected horizontally/vertically).',
        examples: [
            { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
            { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
        ],
        constraints: ['1 <= m, n <= 300'],
        profileSizes: [9, 25, 64, 144, 256],
        vis: { type: 'grid', studio: 'visualize-graph.html', studioLabel: 'Island Flood-Fill DFS/BFS' },
        io: {
            pyFn: 'num_islands', jsFn: 'numIslands', javaMethod: 'numIslands', cppMethod: 'numIslands', cFn: 'numIslands',
            params: [{ name: 'grid', type: 'char[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Single Big Island', hidden: false, input: { grid: ['11110', '11010', '11000', '00000'] }, expected: 1 },
            { id: 2, name: 'Three Islands', hidden: false, input: { grid: ['11000', '11000', '00100', '00011'] }, expected: 3 },
            { id: 3, name: 'All Water', hidden: true, input: { grid: ['00', '00'] }, expected: 0 },
            { id: 4, name: 'Checkerboard', hidden: true, input: { grid: ['101', '010', '101'] }, expected: 5 }
        ],
        starterCode: {
            python: `def num_islands(grid):\n    if not grid: return 0\n    R, C = len(grid), len(grid[0])\n    cnt = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == '1':\n                cnt += 1\n                st = [(r, c)]\n                grid[r][c] = '0'\n                while st:\n                    x, y = st.pop()\n                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        nx, ny = x + dx, y + dy\n                        if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == '1':\n                            grid[nx][ny] = '0'\n                            st.append((nx, ny))\n    return cnt`,
            javascript: `function numIslands(grid) {\n    const R = grid.length, C = grid[0].length;\n    let cnt = 0;\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            if (grid[r][c] === '1') {\n                cnt++;\n                const st = [[r, c]]; grid[r][c] = '0';\n                while (st.length) {\n                    const [x, y] = st.pop();\n                    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {\n                        const nx = x + dx, ny = y + dy;\n                        if (nx >= 0 && nx < R && ny >= 0 && ny < C && grid[nx][ny] === '1') {\n                            grid[nx][ny] = '0'; st.push([nx, ny]);\n                        }\n                    }\n                }\n            }\n        }\n    }\n    return cnt;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int numIslands(char[][] grid) {\n        int R = grid.length, C = grid[0].length, cnt = 0;\n        Deque<int[]> st = new ArrayDeque<>();\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] == '1') {\n                    cnt++; grid[r][c] = '0'; st.push(new int[]{r, c});\n                    while (!st.isEmpty()) {\n                        int[] cur = st.pop();\n                        for (int[] d : dirs) {\n                            int nx = cur[0] + d[0], ny = cur[1] + d[1];\n                            if (nx >= 0 && nx < R && ny >= 0 && ny < C && grid[nx][ny] == '1') {\n                                grid[nx][ny] = '0'; st.push(new int[]{nx, ny});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return cnt;\n    }\n}`,
            cpp: `#include <vector>\n#include <stack>\n#include <utility>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int R = grid.size(), C = grid[0].size(), cnt = 0;\n        const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] == '1') {\n                    cnt++; grid[r][c] = '0';\n                    stack<pair<int,int>> st; st.push({r, c});\n                    while (!st.empty()) {\n                        pair<int,int> p = st.top(); st.pop();\n                        for (int k = 0; k < 4; k++) {\n                            int nx = p.first + dr[k], ny = p.second + dc[k];\n                            if (nx >= 0 && nx < R && ny >= 0 && ny < C && grid[nx][ny] == '1') {\n                                grid[nx][ny] = '0'; st.push({nx, ny});\n                            }\n                        }\n                    }\n                }\n            }\n        }\n        return cnt;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint numIslands(char** grid, int R, int* cols) {\n    if (R == 0) return 0;\n    int C = cols[0], cnt = 0;\n    int* qr = (int*)malloc(sizeof(int) * (R * C + 5));\n    int* qc = (int*)malloc(sizeof(int) * (R * C + 5));\n    const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n    for (int r = 0; r < R; r++) {\n        for (int c = 0; c < C; c++) {\n            if (grid[r][c] == '1') {\n                cnt++; grid[r][c] = '0';\n                int h = 0, t = 0; qr[t] = r; qc[t++] = c;\n                while (h < t) {\n                    int x = qr[h], y = qc[h++];\n                    for (int k = 0; k < 4; k++) {\n                        int nx = x + dr[k], ny = y + dc[k];\n                        if (nx >= 0 && nx < R && ny >= 0 && ny < C && grid[nx][ny] == '1') {\n                            grid[nx][ny] = '0'; qr[t] = nx; qc[t++] = ny;\n                        }\n                    }\n                }\n            }\n        }\n    }\n    free(qr); free(qc);\n    return cnt;\n}`
        }
    },

    // 66. Course Schedule (#207)
    {
        id: 'course_schedule',
        leetcodeId: 207,
        title: 'Course Schedule',
        difficulty: 'Medium',
        topic: 'Graphs & BFS/DFS',
        xpReward: 80,
        optimalTime: 'O(V + E)',
        optimalSpace: 'O(V + E)',
        description: 'There are `numCourses` courses labeled `0..numCourses-1`. Given `prerequisites[i] = [a, b]` meaning take `b` before `a`, return `true` if all courses can be finished (DAG check).',
        examples: [
            { input: 'numCourses = 2, prerequisites = [[1, 0]]', output: 'true' },
            { input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]', output: 'false' }
        ],
        constraints: ['1 <= numCourses <= 2000'],
        profileSizes: [10, 30, 60, 120, 240],
        vis: { type: 'graph', studio: 'visualize-graph.html', studioLabel: "Kahn's Topological Sort" },
        io: {
            pyFn: 'can_finish', jsFn: 'canFinish', javaMethod: 'canFinish', cppMethod: 'canFinish', cFn: 'canFinish',
            params: [{ name: 'numCourses', type: 'int' }, { name: 'prerequisites', type: 'int[][]' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Linear Chain', hidden: false, input: { numCourses: 2, prerequisites: [[1, 0]] }, expected: true },
            { id: 2, name: '2-Cycle Deadlock', hidden: false, input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, expected: false },
            { id: 3, name: 'Diamond DAG', hidden: true, input: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] }, expected: true },
            { id: 4, name: 'No Prerequisites', hidden: true, input: { numCourses: 3, prerequisites: [] }, expected: true }
        ],
        starterCode: {
            python: `from collections import deque\n\ndef can_finish(numCourses, prerequisites):\n    adj = [[] for _ in range(numCourses)]\n    indeg = [0] * numCourses\n    for a, b in prerequisites:\n        adj[b].append(a); indeg[a] += 1\n    q = deque([i for i in range(numCourses) if indeg[i] == 0])\n    seen = 0\n    while q:\n        u = q.popleft(); seen += 1\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0: q.append(v)\n    return seen == numCourses`,
            javascript: `function canFinish(numCourses, prerequisites) {\n    const adj = Array.from({ length: numCourses }, () => []);\n    const indeg = new Array(numCourses).fill(0);\n    for (const [a, b] of prerequisites) { adj[b].push(a); indeg[a]++; }\n    const q = [];\n    for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);\n    let seen = 0;\n    for (let h = 0; h < q.length; h++) {\n        const u = q[h]; seen++;\n        for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);\n    }\n    return seen === numCourses;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        int[] indeg = new int[numCourses];\n        for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }\n        Queue<Integer> q = new ArrayDeque<>();\n        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);\n        int seen = 0;\n        while (!q.isEmpty()) {\n            int u = q.poll(); seen++;\n            for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);\n        }\n        return seen == numCourses;\n    }\n}`,
            cpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        vector<vector<int>> adj(numCourses);\n        vector<int> indeg(numCourses, 0);\n        for (auto& p : prerequisites) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }\n        queue<int> q;\n        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);\n        int seen = 0;\n        while (!q.empty()) {\n            int u = q.front(); q.pop(); seen++;\n            for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);\n        }\n        return seen == numCourses;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <stdbool.h>\n\nbool canFinish(int n, int** pre, int m, int* cols) {\n    int* indeg = (int*)calloc(n, sizeof(int));\n    int* head = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) head[i] = -1;\n    int* to = m ? (int*)malloc(sizeof(int) * m) : NULL;\n    int* nxt = m ? (int*)malloc(sizeof(int) * m) : NULL;\n    for (int i = 0; i < m; i++) {\n        int a = pre[i][0], b = pre[i][1];\n        to[i] = a; nxt[i] = head[b]; head[b] = i; indeg[a]++;\n    }\n    int* q = (int*)malloc(sizeof(int) * n);\n    int f = 0, r = 0, seen = 0;\n    for (int i = 0; i < n; i++) if (indeg[i] == 0) q[r++] = i;\n    while (f < r) {\n        int u = q[f++]; seen++;\n        for (int e = head[u]; e != -1; e = nxt[e]) {\n            int v = to[e];\n            if (--indeg[v] == 0) q[r++] = v;\n        }\n    }\n    free(indeg); free(head); free(to); free(nxt); free(q);\n    return seen == n;\n}`
        }
    },

    // 67. Rotting Oranges (#994)
    {
        id: 'rotting_oranges',
        leetcodeId: 994,
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        topic: 'Graphs & BFS/DFS',
        xpReward: 80,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'In a grid (`0` empty, `1` fresh orange, `2` rotten orange), every minute any fresh orange adjacent to a rotten one turns rotten. Return the minimum minutes until no fresh oranges remain, or `-1` if impossible.',
        examples: [
            { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
            { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1' }
        ],
        constraints: ['1 <= m, n <= 10'],
        profileSizes: [9, 25, 49, 81],
        vis: { type: 'grid', studio: 'visualize-graph.html', studioLabel: 'Multi-Source Level BFS' },
        io: {
            pyFn: 'oranges_rotting', jsFn: 'orangesRotting', javaMethod: 'orangesRotting', cppMethod: 'orangesRotting', cFn: 'orangesRotting',
            params: [{ name: 'grid', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Spread in 4 Min', hidden: false, input: { grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] }, expected: 4 },
            { id: 2, name: 'Isolated Fresh', hidden: false, input: { grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] }, expected: -1 },
            { id: 3, name: 'No Fresh At All', hidden: false, input: { grid: [[0, 2]] }, expected: 0 }
        ],
        starterCode: {
            python: `from collections import deque\n\ndef oranges_rotting(grid):\n    R, C = len(grid), len(grid[0])\n    q = deque()\n    fresh = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == 2: q.append((r, c))\n            elif grid[r][c] == 1: fresh += 1\n    mins = 0\n    while q and fresh > 0:\n        mins += 1\n        for _ in range(len(q)):\n            r, c = q.popleft()\n            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:\n                    grid[nr][nc] = 2; fresh -= 1; q.append((nr, nc))\n    return mins if fresh == 0 else -1`,
            javascript: `function orangesRotting(grid) {\n    const R = grid.length, C = grid[0].length;\n    let q = [], fresh = 0, mins = 0;\n    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {\n        if (grid[r][c] === 2) q.push([r, c]);\n        else if (grid[r][c] === 1) fresh++;\n    }\n    while (q.length && fresh > 0) {\n        mins++; const next = [];\n        for (const [r, c] of q) {\n            for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {\n                const nr = r + dr, nc = c + dc;\n                if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1) {\n                    grid[nr][nc] = 2; fresh--; next.push([nr, nc]);\n                }\n            }\n        }\n        q = next;\n    }\n    return fresh === 0 ? mins : -1;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int orangesRotting(int[][] grid) {\n        int R = grid.length, C = grid[0].length, fresh = 0, mins = 0;\n        Queue<int[]> q = new ArrayDeque<>();\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {\n            if (grid[r][c] == 2) q.offer(new int[]{r, c});\n            else if (grid[r][c] == 1) fresh++;\n        }\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        while (!q.isEmpty() && fresh > 0) {\n            mins++;\n            for (int sz = q.size(); sz > 0; sz--) {\n                int[] p = q.poll();\n                for (int[] d : dirs) {\n                    int nr = p[0] + d[0], nc = p[1] + d[1];\n                    if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] == 1) {\n                        grid[nr][nc] = 2; fresh--; q.offer(new int[]{nr, nc});\n                    }\n                }\n            }\n        }\n        return fresh == 0 ? mins : -1;\n    }\n}`,
            cpp: `#include <vector>\n#include <queue>\n#include <utility>\nusing namespace std;\n\nclass Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        int R = grid.size(), C = grid[0].size(), fresh = 0, mins = 0;\n        queue<pair<int,int>> q;\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {\n            if (grid[r][c] == 2) q.push({r, c});\n            else if (grid[r][c] == 1) fresh++;\n        }\n        const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n        while (!q.empty() && fresh > 0) {\n            mins++;\n            for (int sz = q.size(); sz > 0; sz--) {\n                pair<int,int> p = q.front(); q.pop();\n                for (int k = 0; k < 4; k++) {\n                    int nr = p.first + dr[k], nc = p.second + dc[k];\n                    if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] == 1) {\n                        grid[nr][nc] = 2; fresh--; q.push({nr, nc});\n                    }\n                }\n            }\n        }\n        return fresh == 0 ? mins : -1;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint orangesRotting(int** grid, int R, int* cols) {\n    int C = cols[0], fresh = 0, mins = 0;\n    int* qr = (int*)malloc(sizeof(int) * (R * C + 5));\n    int* qc = (int*)malloc(sizeof(int) * (R * C + 5));\n    int h = 0, t = 0;\n    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {\n        if (grid[r][c] == 2) { qr[t] = r; qc[t++] = c; }\n        else if (grid[r][c] == 1) fresh++;\n    }\n    const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n    while (h < t && fresh > 0) {\n        int sz = t - h; mins++;\n        for (int i = 0; i < sz; i++) {\n            int r = qr[h], c = qc[h++];\n            for (int k = 0; k < 4; k++) {\n                int nr = r + dr[k], nc = c + dc[k];\n                if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] == 1) {\n                    grid[nr][nc] = 2; fresh--; qr[t] = nr; qc[t++] = nc;\n                }\n            }\n        }\n    }\n    free(qr); free(qc);\n    return fresh == 0 ? mins : -1;\n}`
        }
    },

    // 68. Binary Tree Level Order Traversal (#102)
    {
        id: 'binary_tree_level_order',
        leetcodeId: 102,
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given the `root` of a binary tree, return the level-order traversal of its node values (from left to right, level by level).',
        examples: [
            { input: 'root = [3, 9, 20, null, null, 15, 7]', output: '[[3], [9, 20], [15, 7]]' },
            { input: 'root = [1]', output: '[[1]]' }
        ],
        constraints: ['0 <= nodes <= 2000'],
        profileSizes: [15, 31, 63, 127, 255],
        vis: { type: 'tree', studio: 'visualize-tree.html', studioLabel: 'Queue BFS Level Sweep' },
        io: {
            pyFn: 'level_order', jsFn: 'levelOrder', javaMethod: 'levelOrder', cppMethod: 'levelOrder', cFn: 'levelOrder',
            javaReturn: 'List<List<Integer>>',
            params: [{ name: 'root', type: 'TreeNode' }],
            returnType: 'int[][]'
        },
        tests: [
            { id: 1, name: '3 Levels', hidden: false, input: { root: [3, 9, 20, null, null, 15, 7] }, expected: [[3], [9, 20], [15, 7]] },
            { id: 2, name: 'Single Node', hidden: false, input: { root: [1] }, expected: [[1]] },
            { id: 3, name: 'Empty Tree', hidden: true, input: { root: [] }, expected: [] }
        ],
        starterCode: {
            python: `from collections import deque\n\ndef level_order(root):\n    if not root: return []\n    res, q = [], deque([root])\n    while q:\n        lvl = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            lvl.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(lvl)\n    return res`,
            javascript: `function levelOrder(root) {\n    if (!root) return [];\n    const res = [], q = [root];\n    while (q.length) {\n        const len = q.length, lvl = [];\n        for (let i = 0; i < len; i++) {\n            const n = q.shift(); lvl.push(n.val);\n            if (n.left) q.push(n.left);\n            if (n.right) q.push(n.right);\n        }\n        res.push(lvl);\n    }\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new ArrayDeque<>(); q.offer(root);\n        while (!q.isEmpty()) {\n            int sz = q.size(); List<Integer> lvl = new ArrayList<>();\n            for (int i = 0; i < sz; i++) {\n                TreeNode n = q.poll(); lvl.add(n.val);\n                if (n.left != null) q.offer(n.left);\n                if (n.right != null) q.offer(n.right);\n            }\n            res.add(lvl);\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        vector<vector<int>> res;\n        if (!root) return res;\n        queue<TreeNode*> q; q.push(root);\n        while (!q.empty()) {\n            int sz = q.size(); vector<int> lvl;\n            while (sz--) {\n                TreeNode* n = q.front(); q.pop(); lvl.push_back(n->val);\n                if (n->left) q.push(n->left);\n                if (n->right) q.push(n->right);\n            }\n            res.push_back(lvl);\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {\n    if (!root) { *returnSize = 0; *returnColumnSizes = NULL; return NULL; }\n    struct TreeNode** q = (struct TreeNode**)malloc(sizeof(struct TreeNode*) * 2048);\n    int** res = (int**)malloc(sizeof(int*) * 2048);\n    *returnColumnSizes = (int*)malloc(sizeof(int) * 2048);\n    int h = 0, t = 0, lvlCnt = 0;\n    q[t++] = root;\n    while (h < t) {\n        int sz = t - h;\n        (*returnColumnSizes)[lvlCnt] = sz;\n        res[lvlCnt] = (int*)malloc(sizeof(int) * sz);\n        for (int i = 0; i < sz; i++) {\n            struct TreeNode* n = q[h++];\n            res[lvlCnt][i] = n->val;\n            if (n->left) q[t++] = n->left;\n            if (n->right) q[t++] = n->right;\n        }\n        lvlCnt++;\n    }\n    free(q);\n    *returnSize = lvlCnt;\n    return res;\n}`
        }
    },

    // 69. Validate Binary Search Tree (#98)
    {
        id: 'validate_bst',
        leetcodeId: 98,
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        topic: 'Trees & BST',
        xpReward: 80,
        optimalTime: 'O(n)',
        optimalSpace: 'O(h)',
        description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (left subtree values strictly less, right subtree values strictly greater).',
        examples: [
            { input: 'root = [2, 1, 3]', output: 'true' },
            { input: 'root = [5, 1, 4, null, null, 3, 6]', output: 'false' }
        ],
        constraints: ['1 <= nodes <= 10^4'],
        profileSizes: [15, 31, 63, 127, 255],
        vis: { type: 'tree', studio: 'visualize-tree.html', studioLabel: 'Min/Max Range BST Validator' },
        io: {
            pyFn: 'is_valid_bst', jsFn: 'isValidBST', javaMethod: 'isValidBST', cppMethod: 'isValidBST', cFn: 'isValidBST',
            params: [{ name: 'root', type: 'TreeNode' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Valid 3-Node BST', hidden: false, input: { root: [2, 1, 3] }, expected: true },
            { id: 2, name: 'Right Subtree Violation', hidden: false, input: { root: [5, 1, 4, null, null, 3, 6] }, expected: false },
            { id: 3, name: 'INT_MAX Single Node', hidden: true, input: { root: [2147483647] }, expected: true },
            { id: 4, name: 'Subtree Cross Violation', hidden: true, input: { root: [5, 4, 6, null, null, 3, 7] }, expected: false }
        ],
        starterCode: {
            python: `def is_valid_bst(root):\n    def check(node, lo, hi):\n        if not node: return True\n        if not (lo < node.val < hi): return False\n        return check(node.left, lo, node.val) and check(node.right, node.val, hi)\n    return check(root, float('-inf'), float('inf'))`,
            javascript: `function isValidBST(root) {\n    function check(node, lo, hi) {\n        if (!node) return true;\n        if (node.val <= lo || node.val >= hi) return false;\n        return check(node.left, lo, node.val) && check(node.right, node.val, hi);\n    }\n    return check(root, -Infinity, Infinity);\n}`,
            java: `class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);\n    }\n    private boolean check(TreeNode node, long lo, long hi) {\n        if (node == null) return true;\n        if (node.val <= lo || node.val >= hi) return false;\n        return check(node.left, lo, node.val) && check(node.right, node.val, hi);\n    }\n}`,
            cpp: `#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool check(TreeNode* node, long long lo, long long hi) {\n        if (!node) return true;\n        if (node->val <= lo || node->val >= hi) return false;\n        return check(node->left, lo, node->val) && check(node->right, node->val, hi);\n    }\n    bool isValidBST(TreeNode* root) { return check(root, LLONG_MIN, LLONG_MAX); }\n};`,
            c: `#include <stdbool.h>\n#include <limits.h>\n\nstatic bool _bstCheck(struct TreeNode* node, long long lo, long long hi) {\n    if (!node) return true;\n    if (node->val <= lo || node->val >= hi) return false;\n    return _bstCheck(node->left, lo, node->val) && _bstCheck(node->right, node->val, hi);\n}\n\nbool isValidBST(struct TreeNode* root) {\n    return _bstCheck(root, LLONG_MIN, LLONG_MAX);\n}`
        }
    },

    // 70. Kth Largest Element in an Array (#215)
    {
        id: 'kth_largest_element',
        leetcodeId: 215,
        title: 'Kth Largest Element in an Array',
        difficulty: 'Medium',
        topic: 'Heaps & Bucket Sort',
        xpReward: 80,
        optimalTime: 'O(n log k)',
        optimalSpace: 'O(k)',
        description: 'Given integer array `nums` and integer `k`, return the `k`-th largest element in the sorted order (not the `k`-th distinct element).',
        examples: [
            { input: 'nums = [3, 2, 1, 5, 6, 4], k = 2', output: '5' },
            { input: 'nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4', output: '4' }
        ],
        constraints: ['1 <= k <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Min-Heap / Quickselect' },
        io: {
            pyFn: 'find_kth_largest', jsFn: 'findKthLargest', javaMethod: 'findKthLargest', cppMethod: 'findKthLargest', cFn: 'findKthLargest',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '2nd Largest', hidden: false, input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expected: 5 },
            { id: 2, name: 'With Duplicates', hidden: false, input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expected: 4 },
            { id: 3, name: 'Single Item', hidden: true, input: { nums: [9], k: 1 }, expected: 9 },
            { id: 4, name: 'Negatives', hidden: true, input: { nums: [-1, -2, -3, -4], k: 2 }, expected: -2 }
        ],
        starterCode: {
            python: `import heapq\n\ndef find_kth_largest(nums, k):\n    h = nums[:k]\n    heapq.heapify(h)\n    for x in nums[k:]:\n        if x > h[0]: heapq.heapreplace(h, x)\n    return h[0]`,
            javascript: `function findKthLargest(nums, k) {\n    const heap = [];\n    const push = (v) => {\n        heap.push(v);\n        let i = heap.length - 1;\n        while (i > 0) {\n            const p = (i - 1) >> 1;\n            if (heap[p] <= heap[i]) break;\n            [heap[p], heap[i]] = [heap[i], heap[p]];\n            i = p;\n        }\n    };\n    const pop = () => {\n        const top = heap[0];\n        const last = heap.pop();\n        if (heap.length) {\n            heap[0] = last;\n            let i = 0;\n            while (true) {\n                let s = i, l = 2 * i + 1, r = 2 * i + 2;\n                if (l < heap.length && heap[l] < heap[s]) s = l;\n                if (r < heap.length && heap[r] < heap[s]) s = r;\n                if (s === i) break;\n                [heap[i], heap[s]] = [heap[s], heap[i]];\n                i = s;\n            }\n        }\n        return top;\n    };\n    for (const x of nums) { push(x); if (heap.length > k) pop(); }\n    return heap[0];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int findKthLargest(int[] nums, int k) {\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : nums) {\n            pq.offer(x);\n            if (pq.size() > k) pq.poll();\n        }\n        return pq.peek();\n    }\n}`,
            cpp: `#include <vector>\n#include <queue>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        priority_queue<int, vector<int>, greater<int>> pq;\n        for (int x : nums) {\n            pq.push(x);\n            if ((int)pq.size() > k) pq.pop();\n        }\n        return pq.top();\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpDesc(const void* a, const void* b) {\n    int x = *(const int*)a, y = *(const int*)b;\n    return (y > x) - (y < x);\n}\n\nint findKthLargest(const int* nums, int n, int k) {\n    int* copy = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) copy[i] = nums[i];\n    qsort(copy, n, sizeof(int), _cmpDesc);\n    int ans = copy[k - 1];\n    free(copy);\n    return ans;\n}`
        }
    }
];

module.exports = MEDIUM_PROBLEMS;
