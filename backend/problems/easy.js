/**
 * AlgoLearn Curated LeetCode Problem Bank — EASY (30 Problems)
 */

const EASY_PROBLEMS = [
    // 1. Two Sum (#1)
    {
        id: 'two_sum',
        leetcodeId: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an array of integers `nums` and an integer `target`, return indices `[i, j]` of the two distinct numbers such that `nums[i] + nums[j] == target`.',
        examples: [
            { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] == 2 + 7 == 9.' },
            { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid pair exists.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Hashing & Arrays' },
        io: {
            pyFn: 'two_sum', jsFn: 'twoSum', javaMethod: 'twoSum', cppMethod: 'twoSum', cFn: 'twoSum',
            cLegacy: true,
            cSkeleton: `// Store the two matching indices in outIdx[0] and outIdx[1]\nvoid twoSum(const int* nums, int n, int target, int* outIdx) {\n    outIdx[0] = 0; outIdx[1] = 1;\n}`,
            params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int[]', compareMode: 'two_sum_pair'
        },
        tests: [
            { id: 1, name: 'Basic Pair', hidden: false, input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
            { id: 2, name: 'Non-Zero Start', hidden: false, input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
            { id: 3, name: 'Duplicate Values', hidden: false, input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
            { id: 4, name: 'Negative Numbers', hidden: true, input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] },
            { id: 5, name: 'End Elements', hidden: true, input: { nums: [15, 22, 8, 19, 31, 4, 11], target: 15 }, expected: [5, 6] }
        ],
        starterCode: {
            python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []`,
            javascript: `function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (seen.has(comp)) return [seen.get(comp), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) return {seen[comp], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
            c: `void twoSum(const int* nums, int n, int target, int* outIdx) {\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                outIdx[0] = i; outIdx[1] = j; return;\n            }\n        }\n    }\n}`
        }
    },

    // 2. Valid Parentheses (#20)
    {
        id: 'valid_parentheses',
        leetcodeId: 20,
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        topic: 'Stack & Queue',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given a string `s` containing only `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string has valid, properly nested closing brackets.',
        examples: [
            { input: 's = "()"', output: 'true' },
            { input: 's = "()[]{}"', output: 'true' },
            { input: 's = "(]"', output: 'false' }
        ],
        constraints: ['1 <= s.length <= 10^4', 's consists of bracket characters only.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Stack (LIFO)' },
        io: {
            pyFn: 'is_valid', jsFn: 'isValid', javaMethod: 'isValid', cppMethod: 'isValid', cFn: 'isValid',
            cLegacy: true,
            cSkeleton: `int isValid(const char* s) {\n    return 0;\n}`,
            params: [{ name: 's', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Single Pair', hidden: false, input: { s: '()' }, expected: true },
            { id: 2, name: 'Sequential Types', hidden: false, input: { s: '()[]{}' }, expected: true },
            { id: 3, name: 'Mismatched Pair', hidden: false, input: { s: '(]' }, expected: false },
            { id: 4, name: 'Deep Nesting', hidden: true, input: { s: '([{}])' }, expected: true },
            { id: 5, name: 'Unclosed Brackets', hidden: true, input: { s: '(((' }, expected: false },
            { id: 6, name: 'Crossed Order', hidden: true, input: { s: '([)]' }, expected: false }
        ],
        starterCode: {
            python: `def is_valid(s):\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        else:\n            if not stack or stack[-1] != pairs.get(ch):\n                return False\n            stack.pop()\n    return len(stack) == 0`,
            javascript: `function isValid(s) {\n    const stack = [];\n    const pairs = { ')': '(', ']': '[', '}': '{' };\n    for (const ch of s) {\n        if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);\n        else if (stack.pop() !== pairs[ch]) return false;\n    }\n    return stack.length === 0;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '[') stack.push(']');\n            else if (c == '{') stack.push('}');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
            cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '[') st.push(']');\n            else if (c == '{') st.push('}');\n            else {\n                if (st.empty() || st.top() != c) return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};`,
            c: `int isValid(const char* s) {\n    char stack[10005];\n    int top = -1;\n    for (int i = 0; s[i] != '\\0'; i++) {\n        char c = s[i];\n        if (c == '(') stack[++top] = ')';\n        else if (c == '[') stack[++top] = ']';\n        else if (c == '{') stack[++top] = '}';\n        else {\n            if (top < 0 || stack[top--] != c) return 0;\n        }\n    }\n    return top == -1 ? 1 : 0;\n}`
        }
    },

    // 3. Binary Search (#704)
    {
        id: 'binary_search',
        leetcodeId: 704,
        title: 'Binary Search',
        difficulty: 'Easy',
        topic: 'Binary Search',
        xpReward: 50,
        optimalTime: 'O(log n)',
        optimalSpace: 'O(1)',
        description: 'Given a sorted array of distinct integers `nums` and an integer `target`, write an $O(\\log n)$ algorithm returning the index of `target`, or `-1` if absent.',
        examples: [
            { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4' },
            { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1' }
        ],
        constraints: ['1 <= nums.length <= 10^4', 'All elements in nums are sorted ascending.'],
        profileSizes: [16, 64, 256, 1024, 4096],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Searching Visualizer' },
        io: {
            pyFn: 'binary_search', jsFn: 'binarySearch', javaMethod: 'search', cppMethod: 'search', cFn: 'binarySearch',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Target Found', hidden: false, input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
            { id: 2, name: 'Target Missing', hidden: false, input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 },
            { id: 3, name: 'Single Element', hidden: false, input: { nums: [5], target: 5 }, expected: 0 },
            { id: 4, name: 'Left Boundary', hidden: true, input: { nums: [1, 4, 8, 13, 21, 34, 55, 89], target: 1 }, expected: 0 },
            { id: 5, name: 'Right Boundary', hidden: true, input: { nums: [1, 4, 8, 13, 21, 34, 55, 89], target: 89 }, expected: 7 }
        ],
        starterCode: {
            python: `def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
            javascript: `function binarySearch(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = left + Math.floor((right - left) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
            java: `class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int left = 0, right = (int)nums.size() - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n};`,
            c: `int binarySearch(const int* nums, int numsSize, int target) {\n    int left = 0, right = numsSize - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`
        }
    },

    // 4. Climbing Stairs (#70)
    {
        id: 'climbing_stairs',
        leetcodeId: 70,
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'You are climbing a staircase of `n` steps. Each time you can climb either `1` or `2` steps. In how many distinct ways can you reach the top?',
        examples: [
            { input: 'n = 2', output: '2', explanation: '1+1 or 2.' },
            { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1.' }
        ],
        constraints: ['1 <= n <= 45'],
        profileSizes: [5, 10, 15, 22, 30],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Dynamic Programming' },
        io: {
            pyFn: 'climb_stairs', jsFn: 'climbStairs', javaMethod: 'climbStairs', cppMethod: 'climbStairs', cFn: 'climbStairs',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Two Steps', hidden: false, input: { n: 2 }, expected: 2 },
            { id: 2, name: 'Three Steps', hidden: false, input: { n: 3 }, expected: 3 },
            { id: 3, name: 'Five Steps', hidden: false, input: { n: 5 }, expected: 8 },
            { id: 4, name: 'Base Case n=1', hidden: true, input: { n: 1 }, expected: 1 },
            { id: 5, name: 'Twenty Steps', hidden: true, input: { n: 20 }, expected: 10946 }
        ],
        starterCode: {
            python: `def climb_stairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b`,
            javascript: `function climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) [a, b] = [b, a + b];\n    return b;\n}`,
            java: `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int next = a + b; a = b; b = next;\n        }\n        return b;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int next = a + b; a = b; b = next;\n        }\n        return b;\n    }\n};`,
            c: `int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int next = a + b; a = b; b = next;\n    }\n    return b;\n}`
        }
    },

    // 5. Best Time to Buy and Sell Stock (#121)
    {
        id: 'best_time_buy_sell_stock',
        leetcodeId: 121,
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        topic: 'Sliding Window',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an array `prices` where `prices[i]` is the stock price on day `i`, maximize your profit by choosing a single day to buy one stock and a future day to sell it.',
        examples: [
            { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5.' },
            { input: 'prices = [7, 6, 4, 3, 1]', output: '0' }
        ],
        constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-dp.html', studioLabel: 'Greedy & Window' },
        io: {
            pyFn: 'max_profit', jsFn: 'maxProfit', javaMethod: 'maxProfit', cppMethod: 'maxProfit', cFn: 'maxProfit',
            params: [{ name: 'prices', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic Peak', hidden: false, input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
            { id: 2, name: 'Monotonic Decrease', hidden: false, input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
            { id: 3, name: 'Single Day', hidden: false, input: { prices: [5] }, expected: 0 },
            { id: 4, name: 'Two Peaks', hidden: true, input: { prices: [3, 8, 1, 9, 2] }, expected: 8 },
            { id: 5, name: 'Flat Prices', hidden: true, input: { prices: [4, 4, 4, 4] }, expected: 0 }
        ],
        starterCode: {
            python: `def max_profit(prices):\n    min_p = float('inf')\n    best = 0\n    for p in prices:\n        min_p = min(min_p, p)\n        best = max(best, p - min_p)\n    return best`,
            javascript: `function maxProfit(prices) {\n    let minP = Infinity, best = 0;\n    for (const p of prices) {\n        if (p < minP) minP = p;\n        if (p - minP > best) best = p - minP;\n    }\n    return best;\n}`,
            java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int minP = Integer.MAX_VALUE, best = 0;\n        for (int p : prices) {\n            if (p < minP) minP = p;\n            else best = Math.max(best, p - minP);\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\n#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int minP = INT_MAX, best = 0;\n        for (int p : prices) {\n            minP = min(minP, p);\n            best = max(best, p - minP);\n        }\n        return best;\n    }\n};`,
            c: `#include <limits.h>\n\nint maxProfit(const int* prices, int pricesSize) {\n    int minP = INT_MAX, best = 0;\n    for (int i = 0; i < pricesSize; i++) {\n        if (prices[i] < minP) minP = prices[i];\n        else if (prices[i] - minP > best) best = prices[i] - minP;\n    }\n    return best;\n}`
        }
    },

    // 6. Valid Palindrome (#125)
    {
        id: 'valid_palindrome',
        leetcodeId: 125,
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase and removing non-alphanumeric characters, it reads the same forward and backward.',
        examples: [
            { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
            { input: 's = "race a car"', output: 'false' }
        ],
        constraints: ['1 <= s.length <= 2 * 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Two Pointers' },
        io: {
            pyFn: 'is_palindrome', jsFn: 'isPalindrome', javaMethod: 'isPalindrome', cppMethod: 'isPalindrome', cFn: 'isPalindrome',
            params: [{ name: 's', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Classic Phrase', hidden: false, input: { s: 'A man, a plan, a canal: Panama' }, expected: true },
            { id: 2, name: 'Not Palindrome', hidden: false, input: { s: 'race a car' }, expected: false },
            { id: 3, name: 'Spaces Only', hidden: false, input: { s: ' ' }, expected: true },
            { id: 4, name: 'Alphanumeric Mix', hidden: true, input: { s: '0P' }, expected: false },
            { id: 5, name: 'Digits Mirror', hidden: true, input: { s: '1a2b2a1' }, expected: true }
        ],
        starterCode: {
            python: `def is_palindrome(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower(): return False\n        l += 1\n        r -= 1\n    return True`,
            javascript: `function isPalindrome(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    let l = 0, r = clean.length - 1;\n    while (l < r) {\n        if (clean[l++] !== clean[r--]) return false;\n    }\n    return true;\n}`,
            java: `class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}`,
            cpp: `#include <string>\n#include <cctype>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        int l = 0, r = (int)s.size() - 1;\n        while (l < r) {\n            while (l < r && !isalnum((unsigned char)s[l])) l++;\n            while (l < r && !isalnum((unsigned char)s[r])) r--;\n            if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;\n            l++; r--;\n        }\n        return true;\n    }\n};`,
            c: `#include <stdbool.h>\n#include <ctype.h>\n#include <string.h>\n\nbool isPalindrome(char* s) {\n    int l = 0, r = (int)strlen(s) - 1;\n    while (l < r) {\n        while (l < r && !isalnum((unsigned char)s[l])) l++;\n        while (l < r && !isalnum((unsigned char)s[r])) r--;\n        if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;\n        l++; r--;\n    }\n    return true;\n}`
        }
    },

    // 7. Contains Duplicate (#217)
    {
        id: 'contains_duplicate',
        leetcodeId: 217,
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
        examples: [
            { input: 'nums = [1, 2, 3, 1]', output: 'true' },
            { input: 'nums = [1, 2, 3, 4]', output: 'false' }
        ],
        constraints: ['1 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Hash Set' },
        io: {
            pyFn: 'contains_duplicate', jsFn: 'containsDuplicate', javaMethod: 'containsDuplicate', cppMethod: 'containsDuplicate', cFn: 'containsDuplicate',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Duplicate Present', hidden: false, input: { nums: [1, 2, 3, 1] }, expected: true },
            { id: 2, name: 'All Distinct', hidden: false, input: { nums: [1, 2, 3, 4] }, expected: false },
            { id: 3, name: 'Many Repeats', hidden: false, input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expected: true },
            { id: 4, name: 'Single Item', hidden: true, input: { nums: [99] }, expected: false },
            { id: 5, name: 'Negative Duplicate', hidden: true, input: { nums: [-5, 0, 7, -5] }, expected: true }
        ],
        starterCode: {
            python: `def contains_duplicate(nums):\n    seen = set()\n    for x in nums:\n        if x in seen: return True\n        seen.add(x)\n    return False`,
            javascript: `function containsDuplicate(nums) {\n    return new Set(nums).size !== nums.length;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> seen = new HashSet<>();\n        for (int x : nums) if (!seen.add(x)) return true;\n        return false;\n    }\n}`,
            cpp: `#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        unordered_set<int> seen;\n        for (int x : nums) {\n            if (seen.count(x)) return true;\n            seen.insert(x);\n        }\n        return false;\n    }\n};`,
            c: `#include <stdbool.h>\n#include <stdlib.h>\n\nstatic int _cmpInt(const void* a, const void* b) {\n    int x = *(const int*)a, y = *(const int*)b;\n    return (x > y) - (x < y);\n}\n\nbool containsDuplicate(const int* nums, int numsSize) {\n    if (numsSize < 2) return false;\n    int* copy = (int*)malloc(sizeof(int) * numsSize);\n    for (int i = 0; i < numsSize; i++) copy[i] = nums[i];\n    qsort(copy, numsSize, sizeof(int), _cmpInt);\n    bool dup = false;\n    for (int i = 1; i < numsSize; i++) if (copy[i] == copy[i - 1]) { dup = true; break; }\n    free(copy);\n    return dup;\n}`
        }
    },

    // 8. Valid Anagram (#242)
    {
        id: 'valid_anagram',
        leetcodeId: 242,
        title: 'Valid Anagram',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
        examples: [
            { input: 's = "anagram", t = "nagaram"', output: 'true' },
            { input: 's = "rat", t = "car"', output: 'false' }
        ],
        constraints: ['1 <= s.length, t.length <= 5 * 10^4', 'Lowercase English letters only.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Frequency Hashing' },
        io: {
            pyFn: 'is_anagram', jsFn: 'isAnagram', javaMethod: 'isAnagram', cppMethod: 'isAnagram', cFn: 'isAnagram',
            params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Matching Anagram', hidden: false, input: { s: 'anagram', t: 'nagaram' }, expected: true },
            { id: 2, name: 'Different Letters', hidden: false, input: { s: 'rat', t: 'car' }, expected: false },
            { id: 3, name: 'Different Lengths', hidden: false, input: { s: 'ab', t: 'a' }, expected: false },
            { id: 4, name: 'Repeated Letters', hidden: true, input: { s: 'aacc', t: 'ccac' }, expected: false },
            { id: 5, name: 'Single Char', hidden: true, input: { s: 'z', t: 'z' }, expected: true }
        ],
        starterCode: {
            python: `from collections import Counter\n\ndef is_anagram(s, t):\n    return len(s) == len(t) and Counter(s) == Counter(t)`,
            javascript: `function isAnagram(s, t) {\n    if (s.length !== t.length) return false;\n    const cnt = new Array(26).fill(0);\n    for (let i = 0; i < s.length; i++) {\n        cnt[s.charCodeAt(i) - 97]++;\n        cnt[t.charCodeAt(i) - 97]--;\n    }\n    return cnt.every(x => x === 0);\n}`,
            java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] cnt = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            cnt[s.charAt(i) - 'a']++;\n            cnt[t.charAt(i) - 'a']--;\n        }\n        for (int x : cnt) if (x != 0) return false;\n        return true;\n    }\n}`,
            cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        if (s.size() != t.size()) return false;\n        int cnt[26] = {0};\n        for (size_t i = 0; i < s.size(); i++) {\n            cnt[s[i] - 'a']++;\n            cnt[t[i] - 'a']--;\n        }\n        for (int x : cnt) if (x != 0) return false;\n        return true;\n    }\n};`,
            c: `#include <stdbool.h>\n#include <string.h>\n\nbool isAnagram(char* s, char* t) {\n    int n = (int)strlen(s), m = (int)strlen(t);\n    if (n != m) return false;\n    int cnt[26] = {0};\n    for (int i = 0; i < n; i++) {\n        cnt[s[i] - 'a']++;\n        cnt[t[i] - 'a']--;\n    }\n    for (int i = 0; i < 26; i++) if (cnt[i] != 0) return false;\n    return true;\n}`
        }
    },

    // 9. Move Zeroes (#283)
    {
        id: 'move_zeroes',
        leetcodeId: 283,
        title: 'Move Zeroes',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements in-place.',
        examples: [
            { input: 'nums = [0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' },
            { input: 'nums = [0]', output: '[0]' }
        ],
        constraints: ['1 <= nums.length <= 10^4', 'Modify nums in-place.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Two Pointers Partition' },
        io: {
            pyFn: 'move_zeroes', jsFn: 'moveZeroes', javaMethod: 'moveZeroes', cppMethod: 'moveZeroes', cFn: 'moveZeroes',
            params: [{ name: 'nums', type: 'int[]', mut: true }],
            returnType: 'void_arr0'
        },
        tests: [
            { id: 1, name: 'Mixed Zeroes', hidden: false, input: { nums: [0, 1, 0, 3, 12] }, expected: [1, 3, 12, 0, 0] },
            { id: 2, name: 'Single Zero', hidden: false, input: { nums: [0] }, expected: [0] },
            { id: 3, name: 'No Zeroes', hidden: false, input: { nums: [4, 2, 9] }, expected: [4, 2, 9] },
            { id: 4, name: 'Leading Zeroes', hidden: true, input: { nums: [0, 0, 0, 5, 1] }, expected: [5, 1, 0, 0, 0] },
            { id: 5, name: 'All Zeroes', hidden: true, input: { nums: [0, 0, 0] }, expected: [0, 0, 0] }
        ],
        starterCode: {
            python: `def move_zeroes(nums):\n    pos = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[pos], nums[i] = nums[i], nums[pos]\n            pos += 1`,
            javascript: `function moveZeroes(nums) {\n    let pos = 0;\n    for (let i = 0; i < nums.length; i++) {\n        if (nums[i] !== 0) {\n            [nums[pos], nums[i]] = [nums[i], nums[pos]];\n            pos++;\n        }\n    }\n}`,
            java: `class Solution {\n    public void moveZeroes(int[] nums) {\n        int pos = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != 0) {\n                int tmp = nums[pos]; nums[pos] = nums[i]; nums[i] = tmp;\n                pos++;\n            }\n        }\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        int pos = 0;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (nums[i] != 0) swap(nums[pos++], nums[i]);\n        }\n    }\n};`,
            c: `void moveZeroes(int* nums, int numsSize) {\n    int pos = 0;\n    for (int i = 0; i < numsSize; i++) {\n        if (nums[i] != 0) {\n            int tmp = nums[pos]; nums[pos] = nums[i]; nums[i] = tmp;\n            pos++;\n        }\n    }\n}`
        }
    },

    // 10. Reverse String (#344)
    {
        id: 'reverse_string',
        leetcodeId: 344,
        title: 'Reverse String',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Write a function that reverses an array of characters `s` in-place with $O(1)$ extra memory.',
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
            { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
        ],
        constraints: ['1 <= s.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Two-Pointer Swap' },
        io: {
            pyFn: 'reverse_string', jsFn: 'reverseString', javaMethod: 'reverseString', cppMethod: 'reverseString', cFn: 'reverseString',
            params: [{ name: 's', type: 'char[]', mut: true }],
            returnType: 'void_char0'
        },
        tests: [
            { id: 1, name: 'Hello', hidden: false, input: { s: ['h', 'e', 'l', 'l', 'o'] }, expected: ['o', 'l', 'l', 'e', 'h'] },
            { id: 2, name: 'Hannah', hidden: false, input: { s: ['H', 'a', 'n', 'n', 'a', 'h'] }, expected: ['h', 'a', 'n', 'n', 'a', 'H'] },
            { id: 3, name: 'Single Char', hidden: false, input: { s: ['A'] }, expected: ['A'] },
            { id: 4, name: 'Two Chars', hidden: true, input: { s: ['x', 'y'] }, expected: ['y', 'x'] },
            { id: 5, name: 'Digits', hidden: true, input: { s: ['1', '2', '3', '4'] }, expected: ['4', '3', '2', '1'] }
        ],
        starterCode: {
            python: `def reverse_string(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        s[l], s[r] = s[r], s[l]\n        l += 1\n        r -= 1`,
            javascript: `function reverseString(s) {\n    let l = 0, r = s.length - 1;\n    while (l < r) {\n        [s[l], s[r]] = [s[r], s[l]];\n        l++; r--;\n    }\n}`,
            java: `class Solution {\n    public void reverseString(char[] s) {\n        int l = 0, r = s.length - 1;\n        while (l < r) {\n            char t = s[l]; s[l++] = s[r]; s[r--] = t;\n        }\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int l = 0, r = (int)s.size() - 1;\n        while (l < r) swap(s[l++], s[r--]);\n    }\n};`,
            c: `void reverseString(char* s, int sSize) {\n    int l = 0, r = sSize - 1;\n    while (l < r) {\n        char t = s[l]; s[l++] = s[r]; s[r--] = t;\n    }\n}`
        }
    },

    // 11. Remove Duplicates from Sorted Array (#26)
    {
        id: 'remove_duplicates_sorted',
        leetcodeId: 26,
        title: 'Remove Duplicates from Sorted Array',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an integer array `nums` sorted in non-decreasing order, remove duplicates in-place so each unique element appears once and return the number `k` of unique elements.',
        examples: [
            { input: 'nums = [1, 1, 2]', output: '2' },
            { input: 'nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]', output: '5' }
        ],
        constraints: ['1 <= nums.length <= 3 * 10^4', 'nums is sorted non-decreasingly.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-search.html', studioLabel: 'Slow/Fast Pointers' },
        io: {
            pyFn: 'remove_duplicates', jsFn: 'removeDuplicates', javaMethod: 'removeDuplicates', cppMethod: 'removeDuplicates', cFn: 'removeDuplicates',
            params: [{ name: 'nums', type: 'int[]', mut: true }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Short Pair', hidden: false, input: { nums: [1, 1, 2] }, expected: 2 },
            { id: 2, name: 'Ten Items', hidden: false, input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] }, expected: 5 },
            { id: 3, name: 'All Same', hidden: false, input: { nums: [7, 7, 7, 7] }, expected: 1 },
            { id: 4, name: 'All Unique', hidden: true, input: { nums: [-3, -1, 0, 2, 5] }, expected: 5 },
            { id: 5, name: 'Single Item', hidden: true, input: { nums: [42] }, expected: 1 }
        ],
        starterCode: {
            python: `def remove_duplicates(nums):\n    if not nums: return 0\n    k = 1\n    for i in range(1, len(nums)):\n        if nums[i] != nums[k - 1]:\n            nums[k] = nums[i]\n            k += 1\n    return k`,
            javascript: `function removeDuplicates(nums) {\n    if (!nums.length) return 0;\n    let k = 1;\n    for (let i = 1; i < nums.length; i++) {\n        if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];\n    }\n    return k;\n}`,
            java: `class Solution {\n    public int removeDuplicates(int[] nums) {\n        if (nums.length == 0) return 0;\n        int k = 1;\n        for (int i = 1; i < nums.length; i++) {\n            if (nums[i] != nums[k - 1]) nums[k++] = nums[i];\n        }\n        return k;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int removeDuplicates(vector<int>& nums) {\n        if (nums.empty()) return 0;\n        int k = 1;\n        for (int i = 1; i < (int)nums.size(); i++) {\n            if (nums[i] != nums[k - 1]) nums[k++] = nums[i];\n        }\n        return k;\n    }\n};`,
            c: `int removeDuplicates(int* nums, int numsSize) {\n    if (numsSize == 0) return 0;\n    int k = 1;\n    for (int i = 1; i < numsSize; i++) {\n        if (nums[i] != nums[k - 1]) nums[k++] = nums[i];\n    }\n    return k;\n}`
        }
    },

    // 12. Majority Element (#169)
    {
        id: 'majority_element',
        leetcodeId: 169,
        title: 'Majority Element',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an array `nums` of size `n`, return the majority element that appears strictly more than `⌊n / 2⌋` times using Boyer-Moore Voting Algorithm.',
        examples: [
            { input: 'nums = [3, 2, 3]', output: '3' },
            { input: 'nums = [2, 2, 1, 1, 1, 2, 2]', output: '2' }
        ],
        constraints: ['1 <= nums.length <= 5 * 10^4', 'A majority element always exists.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Boyer-Moore Voting' },
        io: {
            pyFn: 'majority_element', jsFn: 'majorityElement', javaMethod: 'majorityElement', cppMethod: 'majorityElement', cFn: 'majorityElement',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Size 3', hidden: false, input: { nums: [3, 2, 3] }, expected: 3 },
            { id: 2, name: 'Size 7', hidden: false, input: { nums: [2, 2, 1, 1, 1, 2, 2] }, expected: 2 },
            { id: 3, name: 'Single Element', hidden: false, input: { nums: [1] }, expected: 1 },
            { id: 4, name: 'Negative Majority', hidden: true, input: { nums: [-1, 1, 1, -1, -1] }, expected: -1 },
            { id: 5, name: 'All Equal', hidden: true, input: { nums: [9, 9, 9, 9] }, expected: 9 }
        ],
        starterCode: {
            python: `def majority_element(nums):\n    cand, count = 0, 0\n    for x in nums:\n        if count == 0: cand = x\n        count += 1 if x == cand else -1\n    return cand`,
            javascript: `function majorityElement(nums) {\n    let cand = 0, count = 0;\n    for (const x of nums) {\n        if (count === 0) cand = x;\n        count += (x === cand) ? 1 : -1;\n    }\n    return cand;\n}`,
            java: `class Solution {\n    public int majorityElement(int[] nums) {\n        int cand = 0, count = 0;\n        for (int x : nums) {\n            if (count == 0) cand = x;\n            count += (x == cand) ? 1 : -1;\n        }\n        return cand;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        int cand = 0, count = 0;\n        for (int x : nums) {\n            if (count == 0) cand = x;\n            count += (x == cand) ? 1 : -1;\n        }\n        return cand;\n    }\n};`,
            c: `int majorityElement(const int* nums, int numsSize) {\n    int cand = 0, count = 0;\n    for (int i = 0; i < numsSize; i++) {\n        if (count == 0) cand = nums[i];\n        count += (nums[i] == cand) ? 1 : -1;\n    }\n    return cand;\n}`
        }
    },

    // 13. Missing Number (#268)
    {
        id: 'missing_number',
        leetcodeId: 268,
        title: 'Missing Number',
        difficulty: 'Easy',
        topic: 'Bit Manipulation & Math',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.',
        examples: [
            { input: 'nums = [3, 0, 1]', output: '2' },
            { input: 'nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]', output: '8' }
        ],
        constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= n'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'bits', studio: 'visualize-ds.html', studioLabel: 'XOR Bit Cancellation' },
        io: {
            pyFn: 'missing_number', jsFn: 'missingNumber', javaMethod: 'missingNumber', cppMethod: 'missingNumber', cFn: 'missingNumber',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Small Array', hidden: false, input: { nums: [3, 0, 1] }, expected: 2 },
            { id: 2, name: 'Size Two', hidden: false, input: { nums: [0, 1] }, expected: 2 },
            { id: 3, name: 'Nine Items', hidden: false, input: { nums: [9, 6, 4, 2, 3, 5, 7, 0, 1] }, expected: 8 },
            { id: 4, name: 'Zero Missing', hidden: true, input: { nums: [1] }, expected: 0 },
            { id: 5, name: 'One Missing', hidden: true, input: { nums: [0] }, expected: 1 }
        ],
        starterCode: {
            python: `def missing_number(nums):\n    ans = len(nums)\n    for i, x in enumerate(nums):\n        ans ^= i ^ x\n    return ans`,
            javascript: `function missingNumber(nums) {\n    let ans = nums.length;\n    for (let i = 0; i < nums.length; i++) ans ^= i ^ nums[i];\n    return ans;\n}`,
            java: `class Solution {\n    public int missingNumber(int[] nums) {\n        int ans = nums.length;\n        for (int i = 0; i < nums.length; i++) ans ^= i ^ nums[i];\n        return ans;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        int ans = (int)nums.size();\n        for (int i = 0; i < (int)nums.size(); i++) ans ^= i ^ nums[i];\n        return ans;\n    }\n};`,
            c: `int missingNumber(const int* nums, int numsSize) {\n    int ans = numsSize;\n    for (int i = 0; i < numsSize; i++) ans ^= i ^ nums[i];\n    return ans;\n}`
        }
    },

    // 14. Single Number (#136)
    {
        id: 'single_number',
        leetcodeId: 136,
        title: 'Single Number',
        difficulty: 'Easy',
        topic: 'Bit Manipulation & Math',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single unique element in linear time and constant space.',
        examples: [
            { input: 'nums = [2, 2, 1]', output: '1' },
            { input: 'nums = [4, 1, 2, 1, 2]', output: '4' }
        ],
        constraints: ['1 <= nums.length <= 3 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'bits', studio: 'visualize-ds.html', studioLabel: 'Bitwise XOR Fold' },
        io: {
            pyFn: 'single_number', jsFn: 'singleNumber', javaMethod: 'singleNumber', cppMethod: 'singleNumber', cFn: 'singleNumber',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Three Items', hidden: false, input: { nums: [2, 2, 1] }, expected: 1 },
            { id: 2, name: 'Five Items', hidden: false, input: { nums: [4, 1, 2, 1, 2] }, expected: 4 },
            { id: 3, name: 'Single Item', hidden: false, input: { nums: [1] }, expected: 1 },
            { id: 4, name: 'Negatives', hidden: true, input: { nums: [-3, 7, -3] }, expected: 7 },
            { id: 5, name: 'Zero Singleton', hidden: true, input: { nums: [5, 0, 5] }, expected: 0 }
        ],
        starterCode: {
            python: `def single_number(nums):\n    ans = 0\n    for x in nums: ans ^= x\n    return ans`,
            javascript: `function singleNumber(nums) {\n    let ans = 0;\n    for (const x of nums) ans ^= x;\n    return ans;\n}`,
            java: `class Solution {\n    public int singleNumber(int[] nums) {\n        int ans = 0;\n        for (int x : nums) ans ^= x;\n        return ans;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        int ans = 0;\n        for (int x : nums) ans ^= x;\n        return ans;\n    }\n};`,
            c: `int singleNumber(const int* nums, int numsSize) {\n    int ans = 0;\n    for (int i = 0; i < numsSize; i++) ans ^= nums[i];\n    return ans;\n}`
        }
    },

    // 15. Number of 1 Bits (#191)
    {
        id: 'number_of_1_bits',
        leetcodeId: 191,
        title: 'Number of 1 Bits (Hamming Weight)',
        difficulty: 'Easy',
        topic: 'Bit Manipulation & Math',
        xpReward: 50,
        optimalTime: 'O(k)',
        optimalSpace: 'O(1)',
        description: 'Given a positive integer `n`, return the number of set bits (`1` bits) it has in its binary representation.',
        examples: [
            { input: 'n = 11', output: '3', explanation: '11 in binary is 1011, which has three 1 bits.' },
            { input: 'n = 128', output: '1' }
        ],
        constraints: ['1 <= n <= 2^31 - 1'],
        profileSizes: [15, 127, 1023, 8191, 65535],
        vis: { type: 'bits', studio: 'visualize-ds.html', studioLabel: 'Brian Kernighan Bit Trick' },
        io: {
            pyFn: 'hamming_weight', jsFn: 'hammingWeight', javaMethod: 'hammingWeight', cppMethod: 'hammingWeight', cFn: 'hammingWeight',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Binary 1011', hidden: false, input: { n: 11 }, expected: 3 },
            { id: 2, name: 'Power of Two', hidden: false, input: { n: 128 }, expected: 1 },
            { id: 3, name: 'All Ones (255)', hidden: false, input: { n: 255 }, expected: 8 },
            { id: 4, name: 'One', hidden: true, input: { n: 1 }, expected: 1 },
            { id: 5, name: 'Large Alternating', hidden: true, input: { n: 1431655765 }, expected: 16 }
        ],
        starterCode: {
            python: `def hamming_weight(n):\n    cnt = 0\n    while n:\n        n &= n - 1\n        cnt += 1\n    return cnt`,
            javascript: `function hammingWeight(n) {\n    let cnt = 0;\n    while (n > 0) {\n        n &= (n - 1);\n        cnt++;\n    }\n    return cnt;\n}`,
            java: `class Solution {\n    public int hammingWeight(int n) {\n        int cnt = 0;\n        while (n != 0) {\n            n &= (n - 1);\n            cnt++;\n        }\n        return cnt;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int hammingWeight(int n) {\n        int cnt = 0;\n        while (n) { n &= (n - 1); cnt++; }\n        return cnt;\n    }\n};`,
            c: `int hammingWeight(int n) {\n    int cnt = 0;\n    unsigned int u = (unsigned int)n;\n    while (u) { u &= (u - 1); cnt++; }\n    return cnt;\n}`
        }
    },

    // 16. Counting Bits (#338)
    {
        id: 'counting_bits',
        leetcodeId: 338,
        title: 'Counting Bits',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an integer `n`, return an array `ans` of length `n + 1` where `ans[i]` is the number of `1`s in the binary representation of `i`.',
        examples: [
            { input: 'n = 2', output: '[0, 1, 1]' },
            { input: 'n = 5', output: '[0, 1, 1, 2, 1, 2]' }
        ],
        constraints: ['0 <= n <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'DP Bit Shift' },
        io: {
            pyFn: 'count_bits', jsFn: 'countBits', javaMethod: 'countBits', cppMethod: 'countBits', cFn: 'countBits',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: 'n = 2', hidden: false, input: { n: 2 }, expected: [0, 1, 1] },
            { id: 2, name: 'n = 5', hidden: false, input: { n: 5 }, expected: [0, 1, 1, 2, 1, 2] },
            { id: 3, name: 'n = 0', hidden: false, input: { n: 0 }, expected: [0] },
            { id: 4, name: 'n = 8', hidden: true, input: { n: 8 }, expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
            { id: 5, name: 'n = 1', hidden: true, input: { n: 1 }, expected: [0, 1] }
        ],
        starterCode: {
            python: `def count_bits(n):\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i >> 1] + (i & 1)\n    return dp`,
            javascript: `function countBits(n) {\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n    return dp;\n}`,
            java: `class Solution {\n    public int[] countBits(int n) {\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n        return dp;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> countBits(int n) {\n        vector<int> dp(n + 1, 0);\n        for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n        return dp;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* countBits(int n, int* returnSize) {\n    *returnSize = n + 1;\n    int* dp = (int*)calloc(n + 1, sizeof(int));\n    for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n    return dp;\n}`
        }
    },

    // 17. Fibonacci Number (#509)
    {
        id: 'fibonacci_number',
        leetcodeId: 509,
        title: 'Fibonacci Number',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given `n`, calculate `F(n)`, where `F(0) = 0`, `F(1) = 1`, and `F(n) = F(n - 1) + F(n - 2)` for `n > 1`.',
        examples: [
            { input: 'n = 2', output: '1' },
            { input: 'n = 4', output: '3' }
        ],
        constraints: ['0 <= n <= 30'],
        profileSizes: [4, 8, 12, 20, 30],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Bottom-Up DP' },
        io: {
            pyFn: 'fib', jsFn: 'fib', javaMethod: 'fib', cppMethod: 'fib', cFn: 'fib',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'n = 2', hidden: false, input: { n: 2 }, expected: 1 },
            { id: 2, name: 'n = 3', hidden: false, input: { n: 3 }, expected: 2 },
            { id: 3, name: 'n = 4', hidden: false, input: { n: 4 }, expected: 3 },
            { id: 4, name: 'n = 0', hidden: true, input: { n: 0 }, expected: 0 },
            { id: 5, name: 'n = 15', hidden: true, input: { n: 15 }, expected: 610 }
        ],
        starterCode: {
            python: `def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b`,
            javascript: `function fib(n) {\n    if (n <= 1) return n;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n    return b;\n}`,
            java: `class Solution {\n    public int fib(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n        return b;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int fib(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n        return b;\n    }\n};`,
            c: `int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n    return b;\n}`
        }
    },

    // 18. Min Cost Climbing Stairs (#746)
    {
        id: 'min_cost_climbing_stairs',
        leetcodeId: 746,
        title: 'Min Cost Climbing Stairs',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given `cost[i]` for each step `i`, you can start at index `0` or `1` and climb `1` or `2` steps at a time. Return the minimum cost to reach the top past the last step.',
        examples: [
            { input: 'cost = [10, 15, 20]', output: '15' },
            { input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]', output: '6' }
        ],
        constraints: ['2 <= cost.length <= 1000'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'DP State Transition' },
        io: {
            pyFn: 'min_cost_climbing_stairs', jsFn: 'minCostClimbingStairs', javaMethod: 'minCostClimbingStairs', cppMethod: 'minCostClimbingStairs', cFn: 'minCostClimbingStairs',
            params: [{ name: 'cost', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Three Steps', hidden: false, input: { cost: [10, 15, 20] }, expected: 15 },
            { id: 2, name: 'Ten Steps Jump', hidden: false, input: { cost: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1] }, expected: 6 },
            { id: 3, name: 'Two Steps', hidden: false, input: { cost: [5, 2] }, expected: 2 },
            { id: 4, name: 'Zeros Mix', hidden: true, input: { cost: [0, 1, 2, 0] }, expected: 1 },
            { id: 5, name: 'Uniform Cost', hidden: true, input: { cost: [3, 3, 3, 3, 3] }, expected: 6 }
        ],
        starterCode: {
            python: `def min_cost_climbing_stairs(cost):\n    prev2, prev1 = 0, 0\n    for i in range(2, len(cost) + 1):\n        cur = min(prev1 + cost[i - 1], prev2 + cost[i - 2])\n        prev2, prev1 = prev1, cur\n    return prev1`,
            javascript: `function minCostClimbingStairs(cost) {\n    let prev2 = 0, prev1 = 0;\n    for (let i = 2; i <= cost.length; i++) {\n        const cur = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);\n        prev2 = prev1; prev1 = cur;\n    }\n    return prev1;\n}`,
            java: `class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        int prev2 = 0, prev1 = 0;\n        for (int i = 2; i <= cost.length; i++) {\n            int cur = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);\n            prev2 = prev1; prev1 = cur;\n        }\n        return prev1;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minCostClimbingStairs(vector<int>& cost) {\n        int prev2 = 0, prev1 = 0;\n        for (int i = 2; i <= (int)cost.size(); i++) {\n            int cur = min(prev1 + cost[i - 1], prev2 + cost[i - 2]);\n            prev2 = prev1; prev1 = cur;\n        }\n        return prev1;\n    }\n};`,
            c: `int minCostClimbingStairs(const int* cost, int costSize) {\n    int prev2 = 0, prev1 = 0;\n    for (int i = 2; i <= costSize; i++) {\n        int a = prev1 + cost[i - 1], b = prev2 + cost[i - 2];\n        int cur = a < b ? a : b;\n        prev2 = prev1; prev1 = cur;\n    }\n    return prev1;\n}`
        }
    },

    // 19. Search Insert Position (#35)
    {
        id: 'search_insert_position',
        leetcodeId: 35,
        title: 'Search Insert Position',
        difficulty: 'Easy',
        topic: 'Binary Search',
        xpReward: 50,
        optimalTime: 'O(log n)',
        optimalSpace: 'O(1)',
        description: 'Given a sorted array of distinct integers `nums` and a `target` value, return the index if `target` is found, or the index where it would be inserted in order.',
        examples: [
            { input: 'nums = [1, 3, 5, 6], target = 5', output: '2' },
            { input: 'nums = [1, 3, 5, 6], target = 2', output: '1' }
        ],
        constraints: ['1 <= nums.length <= 10^4', 'nums contains distinct ascending values.'],
        profileSizes: [16, 64, 256, 1024, 4096],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Lower-Bound Binary Search' },
        io: {
            pyFn: 'search_insert', jsFn: 'searchInsert', javaMethod: 'searchInsert', cppMethod: 'searchInsert', cFn: 'searchInsert',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Target Exists', hidden: false, input: { nums: [1, 3, 5, 6], target: 5 }, expected: 2 },
            { id: 2, name: 'Insert Middle', hidden: false, input: { nums: [1, 3, 5, 6], target: 2 }, expected: 1 },
            { id: 3, name: 'Insert End', hidden: false, input: { nums: [1, 3, 5, 6], target: 7 }, expected: 4 },
            { id: 4, name: 'Insert Front', hidden: true, input: { nums: [1, 3, 5, 6], target: 0 }, expected: 0 },
            { id: 5, name: 'Single Item', hidden: true, input: { nums: [10], target: 10 }, expected: 0 }
        ],
        starterCode: {
            python: `def search_insert(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[m] < target: l = m + 1\n        else: r = m - 1\n    return l`,
            javascript: `function searchInsert(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = (l + r) >> 1;\n        if (nums[m] === target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return l;\n}`,
            java: `class Solution {\n    public int searchInsert(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return l;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        int l = 0, r = (int)nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return l;\n    }\n};`,
            c: `int searchInsert(const int* nums, int numsSize, int target) {\n    int l = 0, r = numsSize - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return l;\n}`
        }
    },

    // 20. Sqrt(x) (#69)
    {
        id: 'sqrtx',
        leetcodeId: 69,
        title: 'Sqrt(x)',
        difficulty: 'Easy',
        topic: 'Binary Search',
        xpReward: 50,
        optimalTime: 'O(log x)',
        optimalSpace: 'O(1)',
        description: 'Given a non-negative integer `x`, return the integer square root of `x` rounded down to the nearest integer without using built-in exponent operators.',
        examples: [
            { input: 'x = 4', output: '2' },
            { input: 'x = 8', output: '2' }
        ],
        constraints: ['0 <= x <= 2^31 - 1'],
        profileSizes: [16, 256, 4096, 65536, 1048576],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Binary Search on Answer' },
        io: {
            pyFn: 'my_sqrt', jsFn: 'mySqrt', javaMethod: 'mySqrt', cppMethod: 'mySqrt', cFn: 'mySqrt',
            params: [{ name: 'x', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Exact Square', hidden: false, input: { x: 4 }, expected: 2 },
            { id: 2, name: 'Floored Root', hidden: false, input: { x: 8 }, expected: 2 },
            { id: 3, name: 'Zero', hidden: false, input: { x: 0 }, expected: 0 },
            { id: 4, name: 'One', hidden: true, input: { x: 1 }, expected: 1 },
            { id: 5, name: 'Large Overflow Safe', hidden: true, input: { x: 2147395599 }, expected: 46339 }
        ],
        starterCode: {
            python: `def my_sqrt(x):\n    if x < 2: return x\n    l, r = 1, x // 2\n    ans = 1\n    while l <= r:\n        m = (l + r) // 2\n        if m <= x // m:\n            ans = m\n            l = m + 1\n        else:\n            r = m - 1\n    return ans`,
            javascript: `function mySqrt(x) {\n    if (x < 2) return x;\n    let l = 1, r = Math.floor(x / 2), ans = 1;\n    while (l <= r) {\n        const m = l + Math.floor((r - l) / 2);\n        if (m <= x / m) { ans = m; l = m + 1; }\n        else r = m - 1;\n    }\n    return ans;\n}`,
            java: `class Solution {\n    public int mySqrt(int x) {\n        if (x < 2) return x;\n        int l = 1, r = x / 2, ans = 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (m <= x / m) { ans = m; l = m + 1; }\n            else r = m - 1;\n        }\n        return ans;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int mySqrt(int x) {\n        if (x < 2) return x;\n        long long l = 1, r = x / 2, ans = 1;\n        while (l <= r) {\n            long long m = l + (r - l) / 2;\n            if (m * m <= x) { ans = m; l = m + 1; }\n            else r = m - 1;\n        }\n        return (int)ans;\n    }\n};`,
            c: `int mySqrt(int x) {\n    if (x < 2) return x;\n    long long l = 1, r = x / 2, ans = 1;\n    while (l <= r) {\n        long long m = l + (r - l) / 2;\n        if (m * m <= x) { ans = m; l = m + 1; }\n        else r = m - 1;\n    }\n    return (int)ans;\n}`
        }
    },

    // 21. Palindrome Number (#9)
    {
        id: 'palindrome_number',
        leetcodeId: 9,
        title: 'Palindrome Number',
        difficulty: 'Easy',
        topic: 'Bit Manipulation & Math',
        xpReward: 50,
        optimalTime: 'O(log10 n)',
        optimalSpace: 'O(1)',
        description: 'Given an integer `x`, return `true` if `x` reads the same backward as forward without converting to a string.',
        examples: [
            { input: 'x = 121', output: 'true' },
            { input: 'x = -121', output: 'false' }
        ],
        constraints: ['-2^31 <= x <= 2^31 - 1'],
        profileSizes: [12, 1221, 1234321, 123454321, 1999999991],
        vis: { type: 'bits', studio: 'visualize-ds.html', studioLabel: 'Digit Reversal' },
        io: {
            pyFn: 'is_palindrome_num', jsFn: 'isPalindromeNum', javaMethod: 'isPalindrome', cppMethod: 'isPalindrome', cFn: 'isPalindromeNum',
            params: [{ name: 'x', type: 'int' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Positive Palindrome', hidden: false, input: { x: 121 }, expected: true },
            { id: 2, name: 'Negative Number', hidden: false, input: { x: -121 }, expected: false },
            { id: 3, name: 'Trailing Zero', hidden: false, input: { x: 10 }, expected: false },
            { id: 4, name: 'Zero', hidden: true, input: { x: 0 }, expected: true },
            { id: 5, name: 'Even Digits', hidden: true, input: { x: 123321 }, expected: true }
        ],
        starterCode: {
            python: `def is_palindrome_num(x):\n    if x < 0 or (x % 10 == 0 and x != 0): return False\n    rev = 0\n    while x > rev:\n        rev = rev * 10 + x % 10\n        x //= 10\n    return x == rev or x == rev // 10`,
            javascript: `function isPalindromeNum(x) {\n    if (x < 0 || (x % 10 === 0 && x !== 0)) return false;\n    let rev = 0;\n    while (x > rev) {\n        rev = rev * 10 + (x % 10);\n        x = Math.floor(x / 10);\n    }\n    return x === rev || x === Math.floor(rev / 10);\n}`,
            java: `class Solution {\n    public boolean isPalindrome(int x) {\n        if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n        int rev = 0;\n        while (x > rev) {\n            rev = rev * 10 + x % 10;\n            x /= 10;\n        }\n        return x == rev || x == rev / 10;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n        int rev = 0;\n        while (x > rev) { rev = rev * 10 + x % 10; x /= 10; }\n        return x == rev || x == rev / 10;\n    }\n};`,
            c: `#include <stdbool.h>\n\nbool isPalindromeNum(int x) {\n    if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n    int rev = 0;\n    while (x > rev) { rev = rev * 10 + x % 10; x /= 10; }\n    return x == rev || x == rev / 10;\n}`
        }
    },

    // 22. Longest Common Prefix (#14)
    {
        id: 'longest_common_prefix',
        leetcodeId: 14,
        title: 'Longest Common Prefix',
        difficulty: 'Easy',
        topic: 'Tries & Strings',
        xpReward: 50,
        optimalTime: 'O(S)',
        optimalSpace: 'O(1)',
        description: 'Write a function to find the longest common prefix string amongst an array of strings `strs`. If there is none, return an empty string `""`.',
        examples: [
            { input: 'strs = ["flower", "flow", "flight"]', output: '"fl"' },
            { input: 'strs = ["dog", "racecar", "car"]', output: '""' }
        ],
        constraints: ['1 <= strs.length <= 200'],
        profileSizes: [10, 30, 60, 120, 200],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Vertical String Scan' },
        io: {
            pyFn: 'longest_common_prefix', jsFn: 'longestCommonPrefix', javaMethod: 'longestCommonPrefix', cppMethod: 'longestCommonPrefix', cFn: 'longestCommonPrefix',
            params: [{ name: 'strs', type: 'string[]' }],
            returnType: 'string'
        },
        tests: [
            { id: 1, name: 'Common fl', hidden: false, input: { strs: ['flower', 'flow', 'flight'] }, expected: 'fl' },
            { id: 2, name: 'No Prefix', hidden: false, input: { strs: ['dog', 'racecar', 'car'] }, expected: '' },
            { id: 3, name: 'Single String', hidden: false, input: { strs: ['algo'] }, expected: 'algo' },
            { id: 4, name: 'Short Empty', hidden: true, input: { strs: ['ab', ''] }, expected: '' },
            { id: 5, name: 'Exact Match', hidden: true, input: { strs: ['test', 'test', 'test'] }, expected: 'test' }
        ],
        starterCode: {
            python: `def longest_common_prefix(strs):\n    if not strs: return ""\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return ""\n    return prefix`,
            javascript: `function longestCommonPrefix(strs) {\n    if (!strs.length) return '';\n    let pref = strs[0];\n    for (let i = 1; i < strs.length; i++) {\n        while (!strs[i].startsWith(pref)) {\n            pref = pref.slice(0, -1);\n            if (!pref) return '';\n        }\n    }\n    return pref;\n}`,
            java: `class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        if (strs.length == 0) return "";\n        String pref = strs[0];\n        for (int i = 1; i < strs.length; i++) {\n            while (!strs[i].startsWith(pref)) {\n                pref = pref.substring(0, pref.length() - 1);\n                if (pref.isEmpty()) return "";\n            }\n        }\n        return pref;\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string longestCommonPrefix(vector<string>& strs) {\n        if (strs.empty()) return "";\n        for (size_t i = 0; i < strs[0].size(); i++) {\n            char c = strs[0][i];\n            for (size_t j = 1; j < strs.size(); j++) {\n                if (i >= strs[j].size() || strs[j][i] != c) return strs[0].substr(0, i);\n            }\n        }\n        return strs[0];\n    }\n};`,
            c: `#include <string.h>\n#include <stdlib.h>\n\nchar* longestCommonPrefix(char** strs, int strsSize) {\n    if (strsSize == 0) {\n        char* empty = (char*)malloc(1); empty[0] = '\\0'; return empty;\n    }\n    int len = (int)strlen(strs[0]);\n    for (int i = 0; i < len; i++) {\n        for (int j = 1; j < strsSize; j++) {\n            if (strs[j][i] == '\\0' || strs[j][i] != strs[0][i]) {\n                char* res = (char*)malloc(i + 1);\n                memcpy(res, strs[0], i); res[i] = '\\0'; return res;\n            }\n        }\n    }\n    char* res = (char*)malloc(len + 1);\n    memcpy(res, strs[0], len + 1);\n    return res;\n}`
        }
    },

    // 23. Plus One (#66)
    {
        id: 'plus_one',
        leetcodeId: 66,
        title: 'Plus One',
        difficulty: 'Easy',
        topic: 'Bit Manipulation & Math',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'You are given a large integer represented as an integer array `digits`, where `digits[i]` is the i-th digit. Increment the large integer by one and return the resulting array.',
        examples: [
            { input: 'digits = [1, 2, 3]', output: '[1, 2, 4]' },
            { input: 'digits = [9, 9]', output: '[1, 0, 0]' }
        ],
        constraints: ['1 <= digits.length <= 100'],
        profileSizes: [10, 25, 50, 100, 200],
        vis: { type: 'array', studio: 'visualize-ds.html', studioLabel: 'Carry Propagation' },
        io: {
            pyFn: 'plus_one', jsFn: 'plusOne', javaMethod: 'plusOne', cppMethod: 'plusOne', cFn: 'plusOne',
            params: [{ name: 'digits', type: 'int[]' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: 'No Carry', hidden: false, input: { digits: [1, 2, 3] }, expected: [1, 2, 4] },
            { id: 2, name: 'Single Carry', hidden: false, input: { digits: [1, 9] }, expected: [2, 0] },
            { id: 3, name: 'Full Rollover', hidden: false, input: { digits: [9, 9, 9] }, expected: [1, 0, 0, 0] },
            { id: 4, name: 'Single Nine', hidden: true, input: { digits: [9] }, expected: [1, 0] },
            { id: 5, name: 'Zero', hidden: true, input: { digits: [0] }, expected: [1] }
        ],
        starterCode: {
            python: `def plus_one(digits):\n    res = list(digits)\n    for i in range(len(res) - 1, -1, -1):\n        if res[i] < 9:\n            res[i] += 1\n            return res\n        res[i] = 0\n    return [1] + res`,
            javascript: `function plusOne(digits) {\n    const res = [...digits];\n    for (let i = res.length - 1; i >= 0; i--) {\n        if (res[i] < 9) { res[i]++; return res; }\n        res[i] = 0;\n    }\n    return [1, ...res];\n}`,
            java: `class Solution {\n    public int[] plusOne(int[] digits) {\n        for (int i = digits.length - 1; i >= 0; i--) {\n            if (digits[i] < 9) { digits[i]++; return digits; }\n            digits[i] = 0;\n        }\n        int[] res = new int[digits.length + 1];\n        res[0] = 1;\n        return res;\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> plusOne(vector<int>& digits) {\n        for (int i = (int)digits.size() - 1; i >= 0; i--) {\n            if (digits[i] < 9) { digits[i]++; return digits; }\n            digits[i] = 0;\n        }\n        digits.insert(digits.begin(), 1);\n        return digits;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* plusOne(const int* digits, int digitsSize, int* returnSize) {\n    int* res = (int*)malloc(sizeof(int) * (digitsSize + 1));\n    for (int i = 0; i < digitsSize; i++) res[i] = digits[i];\n    for (int i = digitsSize - 1; i >= 0; i--) {\n        if (res[i] < 9) { res[i]++; *returnSize = digitsSize; return res; }\n        res[i] = 0;\n    }\n    res[0] = 1;\n    for (int i = 1; i <= digitsSize; i++) res[i] = 0;\n    *returnSize = digitsSize + 1;\n    return res;\n}`
        }
    },

    // 24. Merge Sorted Array (#88)
    {
        id: 'merge_sorted_array',
        leetcodeId: 88,
        title: 'Merge Sorted Array',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        xpReward: 50,
        optimalTime: 'O(m + n)',
        optimalSpace: 'O(1)',
        description: 'Given two sorted arrays `nums1` (with length `m + n`, padded with `n` trailing zeros) and `nums2` of size `n`, merge `nums2` into `nums1` in-place in sorted order.',
        examples: [
            { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1, 2, 2, 3, 5, 6]' },
            { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' }
        ],
        constraints: ['nums1.length == m + n'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Reverse Two-Pointer Merge' },
        io: {
            pyFn: 'merge', jsFn: 'merge', javaMethod: 'merge', cppMethod: 'merge', cFn: 'merge',
            params: [
                { name: 'nums1', type: 'int[]', mut: true },
                { name: 'm', type: 'int' },
                { name: 'nums2', type: 'int[]' },
                { name: 'n', type: 'int' }
            ],
            returnType: 'void_arr0'
        },
        tests: [
            { id: 1, name: 'Equal Halves', hidden: false, input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }, expected: [1, 2, 2, 3, 5, 6] },
            { id: 2, name: 'Empty Second', hidden: false, input: { nums1: [1], m: 1, nums2: [], n: 0 }, expected: [1] },
            { id: 3, name: 'Empty First', hidden: false, input: { nums1: [0], m: 0, nums2: [5], n: 1 }, expected: [5] },
            { id: 4, name: 'All Second Smaller', hidden: true, input: { nums1: [4, 5, 6, 0, 0], m: 3, nums2: [1, 2], n: 2 }, expected: [1, 2, 4, 5, 6] }
        ],
        starterCode: {
            python: `def merge(nums1, m, nums2, n):\n    i, j, k = m - 1, n - 1, m + n - 1\n    while j >= 0:\n        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[k] = nums1[i]; i -= 1\n        else:\n            nums1[k] = nums2[j]; j -= 1\n        k -= 1`,
            javascript: `function merge(nums1, m, nums2, n) {\n    let i = m - 1, j = n - 1, k = m + n - 1;\n    while (j >= 0) {\n        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];\n        else nums1[k--] = nums2[j--];\n    }\n}`,
            java: `class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        int i = m - 1, j = n - 1, k = m + n - 1;\n        while (j >= 0) {\n            if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];\n            else nums1[k--] = nums2[j--];\n        }\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        int i = m - 1, j = n - 1, k = m + n - 1;\n        while (j >= 0) {\n            if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];\n            else nums1[k--] = nums2[j--];\n        }\n    }\n};`,
            c: `void merge(int* nums1, int nums1Size, int m, const int* nums2, int nums2Size, int n) {\n    int i = m - 1, j = n - 1, k = m + n - 1;\n    while (j >= 0) {\n        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];\n        else nums1[k--] = nums2[j--];\n    }\n}`
        }
    },

    // 25. Reverse Linked List (#206)
    {
        id: 'reverse_linked_list',
        leetcodeId: 206,
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        topic: 'Linked List',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given the `head` of a singly linked list, reverse the list iteratively or recursively and return the reversed head.',
        examples: [
            { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
            { input: 'head = [1, 2]', output: '[2, 1]' }
        ],
        constraints: ['0 <= Number of nodes <= 5000'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'linked_list', studio: 'visualize-ds.html', studioLabel: 'Linked List Pointers' },
        io: {
            pyFn: 'reverse_list', jsFn: 'reverseList', javaMethod: 'reverseList', cppMethod: 'reverseList', cFn: 'reverseList',
            params: [{ name: 'head', type: 'ListNode' }],
            returnType: 'ListNode'
        },
        tests: [
            { id: 1, name: 'Five Nodes', hidden: false, input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
            { id: 2, name: 'Two Nodes', hidden: false, input: { head: [1, 2] }, expected: [2, 1] },
            { id: 3, name: 'Empty List', hidden: false, input: { head: [] }, expected: [] },
            { id: 4, name: 'Single Node', hidden: true, input: { head: [99] }, expected: [99] }
        ],
        starterCode: {
            python: `def reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
            javascript: `function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`,
            java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n};`,
            c: `#include <stddef.h>\n\nstruct ListNode* reverseList(struct ListNode* head) {\n    struct ListNode *prev = NULL, *curr = head;\n    while (curr) {\n        struct ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`
        }
    },

    // 26. Merge Two Sorted Lists (#21)
    {
        id: 'merge_two_sorted_lists',
        leetcodeId: 21,
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        topic: 'Linked List',
        xpReward: 50,
        optimalTime: 'O(n + m)',
        optimalSpace: 'O(1)',
        description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge them into one sorted linked list by splicing nodes together.',
        examples: [
            { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]' },
            { input: 'list1 = [], list2 = [0]', output: '[0]' }
        ],
        constraints: ['0 <= list length <= 50', 'Both lists are sorted non-decreasingly.'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'linked_list', studio: 'visualize-ds.html', studioLabel: 'Linked List Dummy Splice' },
        io: {
            pyFn: 'merge_two_lists', jsFn: 'mergeTwoLists', javaMethod: 'mergeTwoLists', cppMethod: 'mergeTwoLists', cFn: 'mergeTwoLists',
            params: [{ name: 'list1', type: 'ListNode' }, { name: 'list2', type: 'ListNode' }],
            returnType: 'ListNode'
        },
        tests: [
            { id: 1, name: 'Interleaved Lists', hidden: false, input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expected: [1, 1, 2, 3, 4, 4] },
            { id: 2, name: 'Both Empty', hidden: false, input: { list1: [], list2: [] }, expected: [] },
            { id: 3, name: 'One Empty', hidden: false, input: { list1: [], list2: [0] }, expected: [0] },
            { id: 4, name: 'Negatives', hidden: true, input: { list1: [-3, 1], list2: [-5, 0, 2] }, expected: [-5, -3, 0, 1, 2] }
        ],
        starterCode: {
            python: `def merge_two_lists(list1, list2):\n    dummy = ListNode(0)\n    tail = dummy\n    while list1 and list2:\n        if list1.val <= list2.val:\n            tail.next = list1; list1 = list1.next\n        else:\n            tail.next = list2; list2 = list2.next\n        tail = tail.next\n    tail.next = list1 or list2\n    return dummy.next`,
            javascript: `function mergeTwoLists(list1, list2) {\n    const dummy = new ListNode(0);\n    let tail = dummy;\n    while (list1 && list2) {\n        if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }\n        else { tail.next = list2; list2 = list2.next; }\n        tail = tail.next;\n    }\n    tail.next = list1 || list2;\n    return dummy.next;\n}`,
            java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        ListNode dummy = new ListNode(0), tail = dummy;\n        while (list1 != null && list2 != null) {\n            if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }\n            else { tail.next = list2; list2 = list2.next; }\n            tail = tail.next;\n        }\n        tail.next = (list1 != null) ? list1 : list2;\n        return dummy.next;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        ListNode dummy(0); ListNode* tail = &dummy;\n        while (list1 && list2) {\n            if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }\n            else { tail->next = list2; list2 = list2->next; }\n            tail = tail->next;\n        }\n        tail->next = list1 ? list1 : list2;\n        return dummy.next;\n    }\n};`,
            c: `#include <stddef.h>\n\nstruct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {\n    struct ListNode dummy; dummy.next = NULL;\n    struct ListNode* tail = &dummy;\n    while (list1 && list2) {\n        if (list1->val <= list2->val) { tail->next = list1; list1 = list1->next; }\n        else { tail->next = list2; list2 = list2->next; }\n        tail = tail->next;\n    }\n    tail->next = list1 ? list1 : list2;\n    return dummy.next;\n}`
        }
    },

    // 27. Linked List Cycle (#141)
    {
        id: 'linked_list_cycle',
        leetcodeId: 141,
        title: 'Linked List Cycle',
        difficulty: 'Easy',
        topic: 'Linked List',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given `head`, the head of a linked list, determine if the linked list has a cycle in it using Floyd’s Tortoise and Hare pointers.',
        examples: [
            { input: 'head = [3, 2, 0, -4], pos = 1', output: 'true' },
            { input: 'head = [1], pos = -1', output: 'false' }
        ],
        constraints: ['0 <= Number of nodes <= 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'linked_list', studio: 'visualize-ds.html', studioLabel: 'Floyd Cycle Detection' },
        io: {
            pyFn: 'has_cycle', jsFn: 'hasCycle', javaMethod: 'hasCycle', cppMethod: 'hasCycle', cFn: 'hasCycle',
            params: [{ name: 'head', type: 'ListNodeCycle' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: '4-Node Cycle', hidden: false, input: { head: [3, 2, 0, -4], pos: 1 }, expected: true },
            { id: 2, name: '2-Node Self Loop', hidden: false, input: { head: [1, 2], pos: 0 }, expected: true },
            { id: 3, name: 'No Cycle', hidden: false, input: { head: [1], pos: -1 }, expected: false },
            { id: 4, name: 'Empty List', hidden: true, input: { head: [], pos: -1 }, expected: false },
            { id: 5, name: 'Linear Multi', hidden: true, input: { head: [10, 20, 30, 40], pos: -1 }, expected: false }
        ],
        starterCode: {
            python: `def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False`,
            javascript: `function hasCycle(head) {\n    let slow = head, fast = head;\n    while (fast && fast.next) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) return true;\n    }\n    return false;\n}`,
            java: `class Solution {\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n};`,
            c: `#include <stdbool.h>\n\nbool hasCycle(struct ListNode* head) {\n    struct ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}`
        }
    },

    // 28. Invert Binary Tree (#226)
    {
        id: 'invert_binary_tree',
        leetcodeId: 226,
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees & BST',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(h)',
        description: 'Given the `root` of a binary tree, invert (mirror) the tree by swapping every left and right subtree, and return its root.',
        examples: [
            { input: 'root = [4, 2, 7, 1, 3, 6, 9]', output: '[4, 7, 2, 9, 6, 3, 1]' },
            { input: 'root = [2, 1, 3]', output: '[2, 3, 1]' }
        ],
        constraints: ['0 <= Number of nodes <= 100'],
        profileSizes: [15, 31, 63, 127, 255],
        vis: { type: 'tree', studio: 'visualize-tree.html', studioLabel: 'Binary Tree Visualizer' },
        io: {
            pyFn: 'invert_tree', jsFn: 'invertTree', javaMethod: 'invertTree', cppMethod: 'invertTree', cFn: 'invertTree',
            params: [{ name: 'root', type: 'TreeNode' }],
            returnType: 'TreeNode'
        },
        tests: [
            { id: 1, name: 'Balanced 7-Node', hidden: false, input: { root: [4, 2, 7, 1, 3, 6, 9] }, expected: [4, 7, 2, 9, 6, 3, 1] },
            { id: 2, name: '3-Node Tree', hidden: false, input: { root: [2, 1, 3] }, expected: [2, 3, 1] },
            { id: 3, name: 'Empty Tree', hidden: false, input: { root: [] }, expected: [] },
            { id: 4, name: 'Left Child Only', hidden: true, input: { root: [1, 2] }, expected: [1, null, 2] }
        ],
        starterCode: {
            python: `def invert_tree(root):\n    if not root: return None\n    root.left, root.right = invert_tree(root.right), invert_tree(root.left)\n    return root`,
            javascript: `function invertTree(root) {\n    if (!root) return null;\n    const left = invertTree(root.left);\n    const right = invertTree(root.right);\n    root.left = right;\n    root.right = left;\n    return root;\n}`,
            java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode l = invertTree(root.left);\n        TreeNode r = invertTree(root.right);\n        root.left = r;\n        root.right = l;\n        return root;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* l = invertTree(root->left);\n        TreeNode* r = invertTree(root->right);\n        root->left = r;\n        root->right = l;\n        return root;\n    }\n};`,
            c: `#include <stddef.h>\n\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    if (!root) return NULL;\n    struct TreeNode* l = invertTree(root->left);\n    struct TreeNode* r = invertTree(root->right);\n    root->left = r;\n    root->right = l;\n    return root;\n}`
        }
    },

    // 29. Maximum Depth of Binary Tree (#104)
    {
        id: 'max_depth_binary_tree',
        leetcodeId: 104,
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees & BST',
        xpReward: 50,
        optimalTime: 'O(n)',
        optimalSpace: 'O(h)',
        description: 'Given the `root` of a binary tree, return its maximum depth (the number of nodes along the longest path from the root node down to the farthest leaf node).',
        examples: [
            { input: 'root = [3, 9, 20, null, null, 15, 7]', output: '3' },
            { input: 'root = [1, null, 2]', output: '2' }
        ],
        constraints: ['0 <= Number of nodes <= 10^4'],
        profileSizes: [15, 31, 63, 127, 255],
        vis: { type: 'tree', studio: 'visualize-tree.html', studioLabel: 'DFS Tree Depth' },
        io: {
            pyFn: 'max_depth', jsFn: 'maxDepth', javaMethod: 'maxDepth', cppMethod: 'maxDepth', cFn: 'maxDepth',
            params: [{ name: 'root', type: 'TreeNode' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Depth 3 Tree', hidden: false, input: { root: [3, 9, 20, null, null, 15, 7] }, expected: 3 },
            { id: 2, name: 'Skewed 2-Node', hidden: false, input: { root: [1, null, 2] }, expected: 2 },
            { id: 3, name: 'Empty Tree', hidden: false, input: { root: [] }, expected: 0 },
            { id: 4, name: 'Single Root', hidden: true, input: { root: [5] }, expected: 1 }
        ],
        starterCode: {
            python: `def max_depth(root):\n    if not root: return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))`,
            javascript: `function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}`,
            java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}`,
            cpp: `#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        if (!root) return 0;\n        return 1 + max(maxDepth(root->left), maxDepth(root->right));\n    }\n};`,
            c: `int maxDepth(struct TreeNode* root) {\n    if (!root) return 0;\n    int l = maxDepth(root->left), r = maxDepth(root->right);\n    return 1 + (l > r ? l : r);\n}`
        }
    },

    // 30. Flood Fill (#733)
    {
        id: 'flood_fill',
        leetcodeId: 733,
        title: 'Flood Fill',
        difficulty: 'Easy',
        topic: 'Graphs & BFS/DFS',
        xpReward: 50,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'Given a 2D integer grid `image`, perform a flood fill starting from pixel `image[sr][sc]` with new `color`, replacing all 4-directionally connected cells of the same starting color.',
        examples: [
            { input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]' },
            { input: 'image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0', output: '[[0,0,0],[0,0,0]]' }
        ],
        constraints: ['1 <= m, n <= 50'],
        profileSizes: [16, 36, 64, 100, 144],
        vis: { type: 'grid', studio: 'visualize-graph.html', studioLabel: 'Grid DFS Flood Fill' },
        io: {
            pyFn: 'flood_fill', jsFn: 'floodFill', javaMethod: 'floodFill', cppMethod: 'floodFill', cFn: 'floodFill',
            params: [
                { name: 'image', type: 'int[][]' },
                { name: 'sr', type: 'int' },
                { name: 'sc', type: 'int' },
                { name: 'color', type: 'int' }
            ],
            returnType: 'int[][]'
        },
        tests: [
            { id: 1, name: '3x3 Fill Center', hidden: false, input: { image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 }, expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
            { id: 2, name: 'Same Color No-Op', hidden: false, input: { image: [[0, 0, 0], [0, 0, 0]], sr: 0, sc: 0, color: 0 }, expected: [[0, 0, 0], [0, 0, 0]] },
            { id: 3, name: 'Single Cell', hidden: false, input: { image: [[5]], sr: 0, sc: 0, color: 9 }, expected: [[9]] },
            { id: 4, name: 'Corner Island', hidden: true, input: { image: [[1, 0], [0, 1]], sr: 0, sc: 0, color: 3 }, expected: [[3, 0], [0, 1]] }
        ],
        starterCode: {
            python: `def flood_fill(image, sr, sc, color):\n    orig = image[sr][sc]\n    if orig == color: return image\n    R, C = len(image), len(image[0])\n    def dfs(r, c):\n        if r < 0 or r >= R or c < 0 or c >= C or image[r][c] != orig: return\n        image[r][c] = color\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n    dfs(sr, sc)\n    return image`,
            javascript: `function floodFill(image, sr, sc, color) {\n    const orig = image[sr][sc];\n    if (orig === color) return image;\n    const R = image.length, C = image[0].length;\n    function dfs(r, c) {\n        if (r < 0 || r >= R || c < 0 || c >= C || image[r][c] !== orig) return;\n        image[r][c] = color;\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    dfs(sr, sc);\n    return image;\n}`,
            java: `class Solution {\n    public int[][] floodFill(int[][] image, int sr, int sc, int color) {\n        int orig = image[sr][sc];\n        if (orig != color) dfs(image, sr, sc, orig, color);\n        return image;\n    }\n    private void dfs(int[][] img, int r, int c, int orig, int col) {\n        if (r < 0 || r >= img.length || c < 0 || c >= img[0].length || img[r][c] != orig) return;\n        img[r][c] = col;\n        dfs(img, r + 1, c, orig, col); dfs(img, r - 1, c, orig, col);\n        dfs(img, r, c + 1, orig, col); dfs(img, r, c - 1, orig, col);\n    }\n}`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void dfs(vector<vector<int>>& img, int r, int c, int orig, int col) {\n        if (r < 0 || r >= (int)img.size() || c < 0 || c >= (int)img[0].size() || img[r][c] != orig) return;\n        img[r][c] = col;\n        dfs(img, r + 1, c, orig, col); dfs(img, r - 1, c, orig, col);\n        dfs(img, r, c + 1, orig, col); dfs(img, r, c - 1, orig, col);\n    }\n    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {\n        if (image[sr][sc] != color) dfs(image, sr, sc, image[sr][sc], color);\n        return image;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic void _ffDfs(int** img, int R, int C, int r, int c, int orig, int col) {\n    if (r < 0 || r >= R || c < 0 || c >= C || img[r][c] != orig) return;\n    img[r][c] = col;\n    _ffDfs(img, R, C, r + 1, c, orig, col); _ffDfs(img, R, C, r - 1, c, orig, col);\n    _ffDfs(img, R, C, r, c + 1, orig, col); _ffDfs(img, R, C, r, c - 1, orig, col);\n}\n\nint** floodFill(int** image, int imageSize, int* imageColSize, int sr, int sc, int color, int* returnSize, int** returnColumnSizes) {\n    int R = imageSize, C = imageColSize[0];\n    int orig = image[sr][sc];\n    if (orig != color) _ffDfs(image, R, C, sr, sc, orig, color);\n    *returnSize = R;\n    *returnColumnSizes = (int*)malloc(sizeof(int) * R);\n    for (int i = 0; i < R; i++) (*returnColumnSizes)[i] = imageColSize[i];\n    return image;\n}`
        }
    }
];

module.exports = EASY_PROBLEMS;

