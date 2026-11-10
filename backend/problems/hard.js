/**
 * AlgoLearn Curated LeetCode Problem Bank — HARD (30 Problems)
 */

const HARD_PROBLEMS = [
    // 71. Median of Two Sorted Arrays (#4)
    {
        id: 'median_two_sorted_arrays',
        leetcodeId: 4,
        title: 'Median of Two Sorted Arrays',
        difficulty: 'Hard',
        topic: 'Binary Search',
        xpReward: 120,
        optimalTime: 'O(log(min(m, n)))',
        optimalSpace: 'O(1)',
        description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays in $O(\\log(m+n))$ time.',
        examples: [
            { input: 'nums1 = [1, 3], nums2 = [2]', output: '2.0' },
            { input: 'nums1 = [1, 2], nums2 = [3, 4]', output: '2.5' }
        ],
        constraints: ['0 <= m, n <= 1000', '1 <= m + n <= 2000'],
        profileSizes: [16, 64, 256, 1024, 4096],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Partition Binary Search' },
        io: {
            pyFn: 'find_median_sorted_arrays', jsFn: 'findMedianSortedArrays', javaMethod: 'findMedianSortedArrays', cppMethod: 'findMedianSortedArrays', cFn: 'findMedianSortedArrays',
            params: [{ name: 'nums1', type: 'int[]' }, { name: 'nums2', type: 'int[]' }],
            returnType: 'double',
            compareMode: 'float'
        },
        tests: [
            { id: 1, name: 'Odd Total', hidden: false, input: { nums1: [1, 3], nums2: [2] }, expected: 2.0 },
            { id: 2, name: 'Even Total', hidden: false, input: { nums1: [1, 2], nums2: [3, 4] }, expected: 2.5 },
            { id: 3, name: 'One Empty Array', hidden: true, input: { nums1: [], nums2: [1] }, expected: 1.0 },
            { id: 4, name: 'Shifted Ranges', hidden: true, input: { nums1: [1, 2], nums2: [-1, 3] }, expected: 1.5 }
        ],
        starterCode: {
            python: `def find_median_sorted_arrays(nums1, nums2):\n    A, B = nums1, nums2\n    if len(A) > len(B): A, B = B, A\n    m, n = len(A), len(B)\n    half = (m + n + 1) // 2\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        aL = A[i - 1] if i > 0 else float('-inf')\n        aR = A[i] if i < m else float('inf')\n        bL = B[j - 1] if j > 0 else float('-inf')\n        bR = B[j] if j < n else float('inf')\n        if aL <= bR and bL <= aR:\n            if (m + n) % 2:\n                return float(max(aL, bL))\n            return (max(aL, bL) + min(aR, bR)) / 2.0\n        elif aL > bR:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0.0`,
            javascript: `function findMedianSortedArrays(nums1, nums2) {\n    let A = nums1, B = nums2;\n    if (A.length > B.length) { [A, B] = [B, A]; }\n    const m = A.length, n = B.length, half = (m + n + 1) >> 1;\n    let lo = 0, hi = m;\n    while (lo <= hi) {\n        const i = (lo + hi) >> 1, j = half - i;\n        const aL = i > 0 ? A[i - 1] : -Infinity, aR = i < m ? A[i] : Infinity;\n        const bL = j > 0 ? B[j - 1] : -Infinity, bR = j < n ? B[j] : Infinity;\n        if (aL <= bR && bL <= aR) {\n            if ((m + n) % 2) return Math.max(aL, bL);\n            return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;\n        }\n        if (aL > bR) hi = i - 1; else lo = i + 1;\n    }\n    return 0.0;\n}`,
            java: `class Solution {\n    public double findMedianSortedArrays(int[] A, int[] B) {\n        if (A.length > B.length) return findMedianSortedArrays(B, A);\n        int m = A.length, n = B.length, half = (m + n + 1) / 2, lo = 0, hi = m;\n        while (lo <= hi) {\n            int i = (lo + hi) / 2, j = half - i;\n            int aL = i > 0 ? A[i - 1] : Integer.MIN_VALUE, aR = i < m ? A[i] : Integer.MAX_VALUE;\n            int bL = j > 0 ? B[j - 1] : Integer.MIN_VALUE, bR = j < n ? B[j] : Integer.MAX_VALUE;\n            if (aL <= bR && bL <= aR) {\n                if ((m + n) % 2 == 1) return Math.max(aL, bL);\n                return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;\n            }\n            if (aL > bR) hi = i - 1; else lo = i + 1;\n        }\n        return 0.0;\n    }\n}`,
            cpp: `#include <vector>\n#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& A, vector<int>& B) {\n        if (A.size() > B.size()) return findMedianSortedArrays(B, A);\n        int m = A.size(), n = B.size(), half = (m + n + 1) / 2, lo = 0, hi = m;\n        while (lo <= hi) {\n            int i = (lo + hi) / 2, j = half - i;\n            int aL = i > 0 ? A[i - 1] : INT_MIN, aR = i < m ? A[i] : INT_MAX;\n            int bL = j > 0 ? B[j - 1] : INT_MIN, bR = j < n ? B[j] : INT_MAX;\n            if (aL <= bR && bL <= aR) {\n                if ((m + n) % 2) return max(aL, bL);\n                return (max(aL, bL) + min(aR, bR)) / 2.0;\n            }\n            if (aL > bR) hi = i - 1; else lo = i + 1;\n        }\n        return 0.0;\n    }\n};`,
            c: `#include <limits.h>\n\ndouble findMedianSortedArrays(const int* A, int m, const int* B, int n) {\n    if (m > n) return findMedianSortedArrays(B, n, A, m);\n    int half = (m + n + 1) / 2, lo = 0, hi = m;\n    while (lo <= hi) {\n        int i = (lo + hi) / 2, j = half - i;\n        int aL = i > 0 ? A[i - 1] : INT_MIN, aR = i < m ? A[i] : INT_MAX;\n        int bL = j > 0 ? B[j - 1] : INT_MIN, bR = j < n ? B[j] : INT_MAX;\n        if (aL <= bR && bL <= aR) {\n            int maxL = aL > bL ? aL : bL;\n            int minR = aR < bR ? aR : bR;\n            if ((m + n) % 2) return (double)maxL;\n            return ((double)maxL + (double)minR) / 2.0;\n        }\n        if (aL > bR) hi = i - 1; else lo = i + 1;\n    }\n    return 0.0;\n}`
        }
    },

    // 72. Regular Expression Matching (#10)
    {
        id: 'regular_expression_matching',
        leetcodeId: 10,
        title: 'Regular Expression Matching',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'Given input string `s` and pattern `p`, implement regular expression matching with support for `.` (any single character) and `*` (zero or more of the preceding element) covering the entire input string.',
        examples: [
            { input: 's = "aa", p = "a*"', output: 'true' },
            { input: 's = "ab", p = ".*"', output: 'true' }
        ],
        constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20'],
        profileSizes: [5, 10, 15, 20],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: '2D Regex State Transition DP' },
        io: {
            pyFn: 'is_match', jsFn: 'isMatch', javaMethod: 'isMatch', cppMethod: 'isMatch', cFn: 'isMatch',
            params: [{ name: 's', type: 'string' }, { name: 'p', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'No Star Mismatch', hidden: false, input: { s: 'aa', p: 'a' }, expected: false },
            { id: 2, name: 'Star Repeat', hidden: false, input: { s: 'aa', p: 'a*' }, expected: true },
            { id: 3, name: 'Dot Star Wildcard', hidden: false, input: { s: 'ab', p: '.*' }, expected: true },
            { id: 4, name: 'Zero Occurrences', hidden: true, input: { s: 'aab', p: 'c*a*b' }, expected: true }
        ],
        starterCode: {
            python: `def is_match(s, p):\n    m, n = len(s), len(p)\n    dp = [[False] * (n + 1) for _ in range(m + 1)]\n    dp[0][0] = True\n    for j in range(2, n + 1):\n        if p[j - 1] == '*': dp[0][j] = dp[0][j - 2]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if p[j - 1] == '*':\n                dp[i][j] = dp[i][j - 2] or ((p[j - 2] == '.' or p[j - 2] == s[i - 1]) and dp[i - 1][j])\n            elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:\n                dp[i][j] = dp[i - 1][j - 1]\n    return dp[m][n]`,
            javascript: `function isMatch(s, p) {\n    const m = s.length, n = p.length;\n    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n    dp[0][0] = true;\n    for (let j = 2; j <= n; j++) if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];\n    for (let i = 1; i <= m; i++) {\n        for (let j = 1; j <= n; j++) {\n            if (p[j - 1] === '*') {\n                dp[i][j] = dp[i][j - 2] || ((p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j]);\n            } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {\n                dp[i][j] = dp[i - 1][j - 1];\n            }\n        }\n    }\n    return dp[m][n];\n}`,
            java: `class Solution {\n    public boolean isMatch(String s, String p) {\n        int m = s.length(), n = p.length();\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;\n        for (int j = 2; j <= n; j++) if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                char pc = p.charAt(j - 1);\n                if (pc == '*') {\n                    dp[i][j] = dp[i][j - 2] || ((p.charAt(j - 2) == '.' || p.charAt(j - 2) == s.charAt(i - 1)) && dp[i - 1][j]);\n                } else if (pc == '.' || pc == s.charAt(i - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isMatch(string s, string p) {\n        int m = s.size(), n = p.size();\n        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));\n        dp[0][0] = true;\n        for (int j = 2; j <= n; j++) if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (p[j - 1] == '*') {\n                    dp[i][j] = dp[i][j - 2] || ((p[j - 2] == '.' || p[j - 2] == s[i - 1]) && dp[i - 1][j]);\n                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                }\n            }\n        }\n        return dp[m][n];\n    }\n};`,
            c: `#include <stdbool.h>\n#include <string.h>\n\nbool isMatch(const char* s, const char* p) {\n    int m = (int)strlen(s), n = (int)strlen(p);\n    bool dp[25][25];\n    memset(dp, 0, sizeof(dp));\n    dp[0][0] = true;\n    for (int j = 2; j <= n; j++) if (p[j - 1] == '*') dp[0][j] = dp[0][j - 2];\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (p[j - 1] == '*') {\n                dp[i][j] = dp[i][j - 2] || ((p[j - 2] == '.' || p[j - 2] == s[i - 1]) && dp[i - 1][j]);\n            } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {\n                dp[i][j] = dp[i - 1][j - 1];\n            }\n        }\n    }\n    return dp[m][n];\n}`
        }
    },

    // 73. Reverse Nodes in k-Group (#25)
    {
        id: 'reverse_nodes_k_group',
        leetcodeId: 25,
        title: 'Reverse Nodes in k-Group',
        difficulty: 'Hard',
        topic: 'Linked List',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return the modified list. Nodes fewer than `k` at the end remain unchanged.',
        examples: [
            { input: 'head = [1, 2, 3, 4, 5], k = 2', output: '[2, 1, 4, 3, 5]' },
            { input: 'head = [1, 2, 3, 4, 5], k = 3', output: '[3, 2, 1, 4, 5]' }
        ],
        constraints: ['1 <= k <= n <= 5000'],
        profileSizes: [10, 30, 60, 120, 240],
        vis: { type: 'linked_list', studio: 'visualize-ds.html', studioLabel: 'In-Place k-Chunk Reversal' },
        io: {
            pyFn: 'reverse_k_group', jsFn: 'reverseKGroup', javaMethod: 'reverseKGroup', cppMethod: 'reverseKGroup', cFn: 'reverseKGroup',
            params: [{ name: 'head', type: 'ListNode' }, { name: 'k', type: 'int' }],
            returnType: 'ListNode'
        },
        tests: [
            { id: 1, name: 'k = 2', hidden: false, input: { head: [1, 2, 3, 4, 5], k: 2 }, expected: [2, 1, 4, 3, 5] },
            { id: 2, name: 'k = 3', hidden: false, input: { head: [1, 2, 3, 4, 5], k: 3 }, expected: [3, 2, 1, 4, 5] },
            { id: 3, name: 'k = 1 Identity', hidden: true, input: { head: [1, 2, 3], k: 1 }, expected: [1, 2, 3] }
        ],
        starterCode: {
            python: `def reverse_k_group(head, k):\n    dummy = ListNode(0, head)\n    gp = dummy\n    while True:\n        kth = gp\n        for _ in range(k):\n            kth = kth.next\n            if not kth: return dummy.next\n        gNext = kth.next\n        prev, curr = gNext, gp.next\n        while curr != gNext:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        tmp = gp.next\n        gp.next = kth\n        gp = tmp`,
            javascript: `function reverseKGroup(head, k) {\n    const dummy = new ListNode(0, head);\n    let gp = dummy;\n    while (true) {\n        let kth = gp;\n        for (let i = 0; i < k && kth; i++) kth = kth.next;\n        if (!kth) break;\n        const gNext = kth.next;\n        let prev = gNext, curr = gp.next;\n        while (curr !== gNext) {\n            const nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;\n        }\n        const tmp = gp.next; gp.next = kth; gp = tmp;\n    }\n    return dummy.next;\n}`,
            java: `class Solution {\n    public ListNode reverseKGroup(ListNode head, int k) {\n        ListNode dummy = new ListNode(0, head), gp = dummy;\n        while (true) {\n            ListNode kth = gp;\n            for (int i = 0; i < k && kth != null; i++) kth = kth.next;\n            if (kth == null) break;\n            ListNode gNext = kth.next, prev = gNext, curr = gp.next;\n            while (curr != gNext) {\n                ListNode nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;\n            }\n            ListNode tmp = gp.next; gp.next = kth; gp = tmp;\n        }\n        return dummy.next;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        ListNode dummy(0, head), *gp = &dummy;\n        while (true) {\n            ListNode* kth = gp;\n            for (int i = 0; i < k && kth; i++) kth = kth->next;\n            if (!kth) break;\n            ListNode *gNext = kth->next, *prev = gNext, *curr = gp->next;\n            while (curr != gNext) {\n                ListNode* nxt = curr->next; curr->next = prev; prev = curr; curr = nxt;\n            }\n            ListNode* tmp = gp->next; gp->next = kth; gp = tmp;\n        }\n        return dummy.next;\n    }\n};`,
            c: `struct ListNode* reverseKGroup(struct ListNode* head, int k) {\n    struct ListNode dummy = {0, head}, *gp = &dummy;\n    while (1) {\n        struct ListNode* kth = gp;\n        for (int i = 0; i < k && kth; i++) kth = kth->next;\n        if (!kth) break;\n        struct ListNode *gNext = kth->next, *prev = gNext, *curr = gp->next;\n        while (curr != gNext) {\n            struct ListNode* nxt = curr->next; curr->next = prev; prev = curr; curr = nxt;\n        }\n        struct ListNode* tmp = gp->next; gp->next = kth; gp = tmp;\n    }\n    return dummy.next;\n}`
        }
    },

    // 74. Longest Valid Parentheses (#32)
    {
        id: 'longest_valid_parentheses',
        leetcodeId: 32,
        title: 'Longest Valid Parentheses',
        difficulty: 'Hard',
        topic: 'Stack',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given a string containing just `(` and `)`, return the length of the longest valid (well-formed) parentheses substring.',
        examples: [
            { input: 's = "(()"', output: '2' },
            { input: 's = ")()())"', output: '4' }
        ],
        constraints: ['0 <= s.length <= 3 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Index Anchor Stack' },
        io: {
            pyFn: 'longest_valid_parentheses', jsFn: 'longestValidParentheses', javaMethod: 'longestValidParentheses', cppMethod: 'longestValidParentheses', cFn: 'longestValidParentheses',
            params: [{ name: 's', type: 'string' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Leading Open', hidden: false, input: { s: '(()' }, expected: 2 },
            { id: 2, name: 'Middle Span 4', hidden: false, input: { s: ')()())' }, expected: 4 },
            { id: 3, name: 'Empty String', hidden: false, input: { s: '' }, expected: 0 },
            { id: 4, name: 'Split Groups', hidden: true, input: { s: '()(()' }, expected: 2 }
        ],
        starterCode: {
            python: `def longest_valid_parentheses(s):\n    st = [-1]\n    best = 0\n    for i, ch in enumerate(s):\n        if ch == '(':\n            st.append(i)\n        else:\n            st.pop()\n            if not st: st.append(i)\n            else: best = max(best, i - st[-1])\n    return best`,
            javascript: `function longestValidParentheses(s) {\n    const st = [-1];\n    let best = 0;\n    for (let i = 0; i < s.length; i++) {\n        if (s[i] === '(') st.push(i);\n        else {\n            st.pop();\n            if (!st.length) st.push(i);\n            else best = Math.max(best, i - st[st.length - 1]);\n        }\n    }\n    return best;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int longestValidParentheses(String s) {\n        Deque<Integer> st = new ArrayDeque<>();\n        st.push(-1);\n        int best = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == '(') st.push(i);\n            else {\n                st.pop();\n                if (st.isEmpty()) st.push(i);\n                else best = Math.max(best, i - st.peek());\n            }\n        }\n        return best;\n    }\n}`,
            cpp: `#include <string>\n#include <stack>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {\n        stack<int> st; st.push(-1);\n        int best = 0;\n        for (int i = 0; i < (int)s.size(); i++) {\n            if (s[i] == '(') st.push(i);\n            else {\n                st.pop();\n                if (st.empty()) st.push(i);\n                else best = max(best, i - st.top());\n            }\n        }\n        return best;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nint longestValidParentheses(const char* s) {\n    int n = (int)strlen(s), best = 0, top = 0;\n    int* st = (int*)malloc(sizeof(int) * (n + 2));\n    st[0] = -1;\n    for (int i = 0; i < n; i++) {\n        if (s[i] == '(') st[++top] = i;\n        else {\n            top--;\n            if (top < 0) { st[0] = i; top = 0; }\n            else if (i - st[top] > best) best = i - st[top];\n        }\n    }\n    free(st);\n    return best;\n}`
        }
    },

    // 75. First Missing Positive (#41)
    {
        id: 'first_missing_positive',
        leetcodeId: 41,
        title: 'First Missing Positive',
        difficulty: 'Hard',
        topic: 'Arrays & Hashing',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given an unsorted integer array `nums`, return the smallest positive integer not present in `nums`, in $O(n)$ time and $O(1)$ auxiliary space.',
        examples: [
            { input: 'nums = [1, 2, 0]', output: '3' },
            { input: 'nums = [3, 4, -1, 1]', output: '2' }
        ],
        constraints: ['1 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-array.html', studioLabel: 'Cyclic Index Placement' },
        io: {
            pyFn: 'first_missing_positive', jsFn: 'firstMissingPositive', javaMethod: 'firstMissingPositive', cppMethod: 'firstMissingPositive', cFn: 'firstMissingPositive',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Gap at 3', hidden: false, input: { nums: [1, 2, 0] }, expected: 3 },
            { id: 2, name: 'Gap at 2', hidden: false, input: { nums: [3, 4, -1, 1] }, expected: 2 },
            { id: 3, name: 'Large Values', hidden: false, input: { nums: [7, 8, 9, 11, 12] }, expected: 1 },
            { id: 4, name: 'Exact Sequence', hidden: true, input: { nums: [1, 2, 3, 4] }, expected: 5 }
        ],
        starterCode: {
            python: `def first_missing_positive(nums):\n    n = len(nums)\n    for i in range(n):\n        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n            idx = nums[i] - 1\n            nums[i], nums[idx] = nums[idx], nums[i]\n    for i in range(n):\n        if nums[i] != i + 1: return i + 1\n    return n + 1`,
            javascript: `function firstMissingPositive(nums) {\n    const n = nums.length;\n    for (let i = 0; i < n; i++) {\n        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {\n            const idx = nums[i] - 1;\n            [nums[i], nums[idx]] = [nums[idx], nums[i]];\n        }\n    }\n    for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;\n    return n + 1;\n}`,
            java: `class Solution {\n    public int firstMissingPositive(int[] nums) {\n        int n = nums.length;\n        for (int i = 0; i < n; i++) {\n            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {\n                int idx = nums[i] - 1, tmp = nums[idx];\n                nums[idx] = nums[i]; nums[i] = tmp;\n            }\n        }\n        for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;\n        return n + 1;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int firstMissingPositive(vector<int>& nums) {\n        int n = nums.size();\n        for (int i = 0; i < n; i++) {\n            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i])\n                swap(nums[i], nums[nums[i] - 1]);\n        }\n        for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;\n        return n + 1;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint firstMissingPositive(const int* nums, int n) {\n    int* a = (int*)malloc(sizeof(int) * (n ? n : 1));\n    for (int i = 0; i < n; i++) a[i] = nums[i];\n    for (int i = 0; i < n; i++) {\n        while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] != a[i]) {\n            int idx = a[i] - 1, tmp = a[idx];\n            a[idx] = a[i]; a[i] = tmp;\n        }\n    }\n    int ans = n + 1;\n    for (int i = 0; i < n; i++) if (a[i] != i + 1) { ans = i + 1; break; }\n    free(a);\n    return ans;\n}`
        }
    },

    // 76. Trapping Rain Water (#42)
    {
        id: 'trapping_rain_water',
        leetcodeId: 42,
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        topic: 'Two Pointers',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
        examples: [
            { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
            { input: 'height = [4,2,0,3,2,5]', output: '9' }
        ],
        constraints: ['1 <= height.length <= 2 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-array.html', studioLabel: 'Elevation Trap Two Pointers' },
        io: {
            pyFn: 'trap', jsFn: 'trap', javaMethod: 'trap', cppMethod: 'trap', cFn: 'trap',
            params: [{ name: 'height', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic Basin', hidden: false, input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 },
            { id: 2, name: 'Deep Bowl', hidden: false, input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9 },
            { id: 3, name: 'Monotonic Slope', hidden: true, input: { height: [1, 2, 3, 4] }, expected: 0 }
        ],
        starterCode: {
            python: `def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    lMax, rMax, water = height[l], height[r], 0\n    while l < r:\n        if lMax < rMax:\n            l += 1\n            lMax = max(lMax, height[l])\n            water += lMax - height[l]\n        else:\n            r -= 1\n            rMax = max(rMax, height[r])\n            water += rMax - height[r]\n    return water`,
            javascript: `function trap(height) {\n    if (!height.length) return 0;\n    let l = 0, r = height.length - 1, lMax = height[l], rMax = height[r], water = 0;\n    while (l < r) {\n        if (lMax < rMax) { lMax = Math.max(lMax, height[++l]); water += lMax - height[l]; }\n        else { rMax = Math.max(rMax, height[--r]); water += rMax - height[r]; }\n    }\n    return water;\n}`,
            java: `class Solution {\n    public int trap(int[] height) {\n        if (height.length == 0) return 0;\n        int l = 0, r = height.length - 1, lMax = height[l], rMax = height[r], water = 0;\n        while (l < r) {\n            if (lMax < rMax) { lMax = Math.max(lMax, height[++l]); water += lMax - height[l]; }\n            else { rMax = Math.max(rMax, height[--r]); water += rMax - height[r]; }\n        }\n        return water;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        if (height.empty()) return 0;\n        int l = 0, r = (int)height.size() - 1, lMax = height[l], rMax = height[r], water = 0;\n        while (l < r) {\n            if (lMax < rMax) { lMax = max(lMax, height[++l]); water += lMax - height[l]; }\n            else { rMax = max(rMax, height[--r]); water += rMax - height[r]; }\n        }\n        return water;\n    }\n};`,
            c: `int trap(const int* height, int n) {\n    if (n == 0) return 0;\n    int l = 0, r = n - 1, lMax = height[l], rMax = height[r], water = 0;\n    while (l < r) {\n        if (lMax < rMax) {\n            l++; if (height[l] > lMax) lMax = height[l]; water += lMax - height[l];\n        } else {\n            r--; if (height[r] > rMax) rMax = height[r]; water += rMax - height[r];\n        }\n    }\n    return water;\n}`
        }
    },

    // 77. Wildcard Matching (#44)
    {
        id: 'wildcard_matching',
        leetcodeId: 44,
        title: 'Wildcard Matching',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(m + n)',
        optimalSpace: 'O(1)',
        description: 'Implement wildcard pattern matching for `?` (matches any single character) and `*` (matches any sequence of characters, including empty sequence) covering the entire input string `s`.',
        examples: [
            { input: 's = "adceb", p = "*a*b"', output: 'true' },
            { input: 's = "cb", p = "?a"', output: 'false' }
        ],
        constraints: ['0 <= s.length, p.length <= 2000'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Greedy Star Backtrack' },
        io: {
            pyFn: 'is_match_wildcard', jsFn: 'isMatch', javaMethod: 'isMatch', cppMethod: 'isMatch', cFn: 'isMatch',
            params: [{ name: 's', type: 'string' }, { name: 'p', type: 'string' }],
            returnType: 'bool'
        },
        tests: [
            { id: 1, name: 'Global Star False', hidden: false, input: { s: 'aa', p: 'a' }, expected: false },
            { id: 2, name: 'Pure Star', hidden: false, input: { s: 'aa', p: '*' }, expected: true },
            { id: 3, name: 'Multi Star', hidden: false, input: { s: 'adceb', p: '*a*b' }, expected: true },
            { id: 4, name: 'Question Mismatch', hidden: true, input: { s: 'cb', p: '?a' }, expected: false }
        ],
        starterCode: {
            python: `def is_match_wildcard(s, p):\n    i = j = match = 0\n    star = -1\n    while i < len(s):\n        if j < len(p) and (p[j] == s[i] or p[j] == '?'):\n            i += 1; j += 1\n        elif j < len(p) and p[j] == '*':\n            star = j; match = i; j += 1\n        elif star != -1:\n            j = star + 1; match += 1; i = match\n        else:\n            return False\n    while j < len(p) and p[j] == '*': j += 1\n    return j == len(p)`,
            javascript: `function isMatch(s, p) {\n    let i = 0, j = 0, star = -1, match = 0;\n    while (i < s.length) {\n        if (j < p.length && (p[j] === s[i] || p[j] === '?')) { i++; j++; }\n        else if (j < p.length && p[j] === '*') { star = j++; match = i; }\n        else if (star !== -1) { j = star + 1; i = ++match; }\n        else return false;\n    }\n    while (j < p.length && p[j] === '*') j++;\n    return j === p.length;\n}`,
            java: `class Solution {\n    public boolean isMatch(String s, String p) {\n        int i = 0, j = 0, star = -1, match = 0;\n        while (i < s.length()) {\n            if (j < p.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '?')) { i++; j++; }\n            else if (j < p.length() && p.charAt(j) == '*') { star = j++; match = i; }\n            else if (star != -1) { j = star + 1; i = ++match; }\n            else return false;\n        }\n        while (j < p.length() && p.charAt(j) == '*') j++;\n        return j == p.length();\n    }\n}`,
            cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isMatch(string s, string p) {\n        int i = 0, j = 0, star = -1, match = 0;\n        while (i < (int)s.size()) {\n            if (j < (int)p.size() && (p[j] == s[i] || p[j] == '?')) { i++; j++; }\n            else if (j < (int)p.size() && p[j] == '*') { star = j++; match = i; }\n            else if (star != -1) { j = star + 1; i = ++match; }\n            else return false;\n        }\n        while (j < (int)p.size() && p[j] == '*') j++;\n        return j == (int)p.size();\n    }\n};`,
            c: `#include <stdbool.h>\n\nbool isMatch(const char* s, const char* p) {\n    int i = 0, j = 0, star = -1, match = 0;\n    while (s[i]) {\n        if (p[j] && (p[j] == s[i] || p[j] == '?')) { i++; j++; }\n        else if (p[j] == '*') { star = j++; match = i; }\n        else if (star != -1) { j = star + 1; i = ++match; }\n        else return false;\n    }\n    while (p[j] == '*') j++;\n    return p[j] == '\\0';\n}`
        }
    },

    // 78. N-Queens II (#52)
    {
        id: 'n_queens_ii',
        leetcodeId: 52,
        title: 'N-Queens II',
        difficulty: 'Hard',
        topic: 'Backtracking',
        xpReward: 120,
        optimalTime: 'O(n!)',
        optimalSpace: 'O(n)',
        description: 'Given an integer `n`, return the number of distinct solutions to the n-queens puzzle where no two queens attack each other.',
        examples: [
            { input: 'n = 4', output: '2' },
            { input: 'n = 1', output: '1' }
        ],
        constraints: ['1 <= n <= 9'],
        profileSizes: [1, 2, 4, 6],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'N-Queens Chessboard Search' },
        io: {
            pyFn: 'total_n_queens', jsFn: 'totalNQueens', javaMethod: 'totalNQueens', cppMethod: 'totalNQueens', cFn: 'totalNQueens',
            params: [{ name: 'n', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '4-Queens', hidden: false, input: { n: 4 }, expected: 2 },
            { id: 2, name: '1-Queen', hidden: false, input: { n: 1 }, expected: 1 },
            { id: 3, name: '5-Queens', hidden: true, input: { n: 5 }, expected: 10 },
            { id: 4, name: '8-Queens Classic', hidden: true, input: { n: 8 }, expected: 92 }
        ],
        starterCode: {
            python: `def total_n_queens(n):\n    full = (1 << n) - 1\n    def dfs(cols, d1, d2):\n        if cols == full: return 1\n        avail = full & ~(cols | d1 | d2)\n        cnt = 0\n        while avail:\n            bit = avail & -avail\n            avail -= bit\n            cnt += dfs(cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1)\n        return cnt\n    return dfs(0, 0, 0)`,
            javascript: `function totalNQueens(n) {\n    const full = (1 << n) - 1;\n    function dfs(cols, d1, d2) {\n        if (cols === full) return 1;\n        let avail = full & ~(cols | d1 | d2), cnt = 0;\n        while (avail) {\n            const bit = avail & -avail;\n            avail -= bit;\n            cnt += dfs(cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);\n        }\n        return cnt;\n    }\n    return dfs(0, 0, 0);\n}`,
            java: `class Solution {\n    private int dfs(int full, int cols, int d1, int d2) {\n        if (cols == full) return 1;\n        int avail = full & ~(cols | d1 | d2), cnt = 0;\n        while (avail != 0) {\n            int bit = avail & -avail; avail -= bit;\n            cnt += dfs(full, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);\n        }\n        return cnt;\n    }\n    public int totalNQueens(int n) { return dfs((1 << n) - 1, 0, 0, 0); }\n}`,
            cpp: `class Solution {\npublic:\n    int dfs(int full, int cols, int d1, int d2) {\n        if (cols == full) return 1;\n        int avail = full & ~(cols | d1 | d2), cnt = 0;\n        while (avail) {\n            int bit = avail & -avail; avail -= bit;\n            cnt += dfs(full, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);\n        }\n        return cnt;\n    }\n    int totalNQueens(int n) { return dfs((1 << n) - 1, 0, 0, 0); }\n};`,
            c: `static int _nqDfs(int full, int cols, int d1, int d2) {\n    if (cols == full) return 1;\n    int avail = full & ~(cols | d1 | d2), cnt = 0;\n    while (avail) {\n        int bit = avail & -avail; avail -= bit;\n        cnt += _nqDfs(full, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);\n    }\n    return cnt;\n}\n\nint totalNQueens(int n) {\n    return _nqDfs((1 << n) - 1, 0, 0, 0);\n}`
        }
    },

    // 79. Minimum Window Substring (#76)
    {
        id: 'minimum_window_substring',
        leetcodeId: 76,
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        xpReward: 120,
        optimalTime: 'O(m + n)',
        optimalSpace: 'O(1)',
        description: 'Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window, or `""` if none exists.',
        examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
            { input: 's = "a", t = "aa"', output: '""' }
        ],
        constraints: ['1 <= s.length, t.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-array.html', studioLabel: 'Contracting Sliding Window' },
        io: {
            pyFn: 'min_window', jsFn: 'minWindow', javaMethod: 'minWindow', cppMethod: 'minWindow', cFn: 'minWindow',
            params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }],
            returnType: 'string'
        },
        tests: [
            { id: 1, name: 'BANC Window', hidden: false, input: { s: 'ADOBECODEBANC', t: 'ABC' }, expected: 'BANC' },
            { id: 2, name: 'Single Exact', hidden: false, input: { s: 'a', t: 'a' }, expected: 'a' },
            { id: 3, name: 'Insufficient Duplicate', hidden: false, input: { s: 'a', t: 'aa' }, expected: '' }
        ],
        starterCode: {
            python: `from collections import Counter\n\ndef min_window(s, t):\n    if not t or len(s) < len(t): return ""\n    need = Counter(t)\n    req, formed = len(need), 0\n    win = {}\n    l = 0\n    best = (float('inf'), 0, 0)\n    for r, ch in enumerate(s):\n        win[ch] = win.get(ch, 0) + 1\n        if ch in need and win[ch] == need[ch]: formed += 1\n        while formed == req:\n            if r - l + 1 < best[0]: best = (r - l + 1, l, r)\n            lc = s[l]; win[lc] -= 1\n            if lc in need and win[lc] < need[lc]: formed -= 1\n            l += 1\n    return "" if best[0] == float('inf') else s[best[1]:best[2]+1]`,
            javascript: `function minWindow(s, t) {\n    if (!t.length || s.length < t.length) return '';\n    const need = new Array(128).fill(0);\n    let req = 0;\n    for (let i = 0; i < t.length; i++) if (need[t.charCodeAt(i)]++ === 0) req++;\n    const have = new Array(128).fill(0);\n    let formed = 0, l = 0, bestLen = Infinity, bestL = 0;\n    for (let r = 0; r < s.length; r++) {\n        const rc = s.charCodeAt(r);\n        if (++have[rc] === need[rc]) formed++;\n        while (formed === req) {\n            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }\n            const lc = s.charCodeAt(l++);\n            if (have[lc]-- === need[lc]) formed--;\n        }\n    }\n    return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);\n}`,
            java: `class Solution {\n    public String minWindow(String s, String t) {\n        if (t.isEmpty() || s.length() < t.length()) return "";\n        int[] need = new int[128], have = new int[128];\n        int req = 0;\n        for (char c : t.toCharArray()) if (need[c]++ == 0) req++;\n        int formed = 0, l = 0, bestLen = Integer.MAX_VALUE, bestL = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char rc = s.charAt(r);\n            if (++have[rc] == need[rc]) formed++;\n            while (formed == req) {\n                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }\n                char lc = s.charAt(l++);\n                if (have[lc]-- == need[lc]) formed--;\n            }\n        }\n        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);\n    }\n}`,
            cpp: `#include <string>\n#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    string minWindow(string s, string t) {\n        if (t.empty() || s.size() < t.size()) return "";\n        int need[128] = {0}, have[128] = {0}, req = 0;\n        for (unsigned char c : t) if (need[c]++ == 0) req++;\n        int formed = 0, l = 0, bestLen = INT_MAX, bestL = 0;\n        for (int r = 0; r < (int)s.size(); r++) {\n            unsigned char rc = s[r];\n            if (++have[rc] == need[rc]) formed++;\n            while (formed == req) {\n                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }\n                unsigned char lc = s[l++];\n                if (have[lc]-- == need[lc]) formed--;\n            }\n        }\n        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n#include <limits.h>\n\nchar* minWindow(const char* s, const char* t) {\n    int sn = (int)strlen(s), tn = (int)strlen(t);\n    int need[128] = {0}, have[128] = {0}, req = 0;\n    for (int i = 0; i < tn; i++) if (need[(unsigned char)t[i]]++ == 0) req++;\n    int formed = 0, l = 0, bestLen = INT_MAX, bestL = 0;\n    for (int r = 0; r < sn; r++) {\n        unsigned char rc = (unsigned char)s[r];\n        if (++have[rc] == need[rc]) formed++;\n        while (formed == req) {\n            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }\n            unsigned char lc = (unsigned char)s[l++];\n            if (have[lc]-- == need[lc]) formed--;\n        }\n    }\n    if (bestLen == INT_MAX) { char* empty = (char*)calloc(1, 1); return empty; }\n    char* res = (char*)malloc(bestLen + 1);\n    memcpy(res, s + bestL, bestLen); res[bestLen] = '\\0';\n    return res;\n}`
        }
    },

    // 80. Largest Rectangle in Histogram (#84)
    {
        id: 'largest_rectangle_histogram',
        leetcodeId: 84,
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        topic: 'Stack',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Given an array of integers `heights` representing the histogram bar heights where each bar width is `1`, return the area of the largest rectangle in the histogram.',
        examples: [
            { input: 'heights = [2, 1, 5, 6, 2, 3]', output: '10' },
            { input: 'heights = [2, 4]', output: '4' }
        ],
        constraints: ['1 <= heights.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Monotonic Increasing Stack' },
        io: {
            pyFn: 'largest_rectangle_area', jsFn: 'largestRectangleArea', javaMethod: 'largestRectangleArea', cppMethod: 'largestRectangleArea', cFn: 'largestRectangleArea',
            params: [{ name: 'heights', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '6-Bar Histogram', hidden: false, input: { heights: [2, 1, 5, 6, 2, 3] }, expected: 10 },
            { id: 2, name: '2-Bar', hidden: false, input: { heights: [2, 4] }, expected: 4 },
            { id: 3, name: 'Flat Equal Bars', hidden: true, input: { heights: [3, 3, 3, 3] }, expected: 12 }
        ],
        starterCode: {
            python: `def largest_rectangle_area(heights):\n    st, best = [], 0\n    for i, h in enumerate(heights + [0]):\n        while st and heights[st[-1]] > h:\n            H = heights[st.pop()]\n            W = i if not st else i - st[-1] - 1\n            best = max(best, H * W)\n        st.append(i)\n    return best`,
            javascript: `function largestRectangleArea(heights) {\n    const st = []; let best = 0;\n    for (let i = 0; i <= heights.length; i++) {\n        const h = i === heights.length ? 0 : heights[i];\n        while (st.length && heights[st[st.length - 1]] > h) {\n            const H = heights[st.pop()];\n            const W = st.length ? i - st[st.length - 1] - 1 : i;\n            best = Math.max(best, H * W);\n        }\n        st.push(i);\n    }\n    return best;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int largestRectangleArea(int[] heights) {\n        Deque<Integer> st = new ArrayDeque<>();\n        int best = 0, n = heights.length;\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (!st.isEmpty() && heights[st.peek()] > h) {\n                int H = heights[st.pop()];\n                int W = st.isEmpty() ? i : i - st.peek() - 1;\n                best = Math.max(best, H * W);\n            }\n            st.push(i);\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <stack>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        stack<int> st; int best = 0, n = heights.size();\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (!st.empty() && heights[st.top()] > h) {\n                int H = heights[st.top()]; st.pop();\n                int W = st.empty() ? i : i - st.top() - 1;\n                best = max(best, H * W);\n            }\n            st.push(i);\n        }\n        return best;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint largestRectangleArea(const int* heights, int n) {\n    int* st = (int*)malloc(sizeof(int) * (n + 2));\n    int top = -1, best = 0;\n    for (int i = 0; i <= n; i++) {\n        int h = (i == n) ? 0 : heights[i];\n        while (top >= 0 && heights[st[top]] > h) {\n            int H = heights[st[top--]];\n            int W = top < 0 ? i : i - st[top] - 1;\n            if (H * W > best) best = H * W;\n        }\n        st[++top] = i;\n    }\n    free(st);\n    return best;\n}`
        }
    },

    // 81. Maximal Rectangle (#85)
    {
        id: 'maximal_rectangle',
        leetcodeId: 85,
        title: 'Maximal Rectangle',
        difficulty: 'Hard',
        topic: 'Stack',
        xpReward: 120,
        optimalTime: 'O(R * C)',
        optimalSpace: 'O(C)',
        description: 'Given a `rows x cols` binary matrix filled with `"0"` and `"1"`, find the largest rectangle containing only `"1"`s and return its area.',
        examples: [
            { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '6' },
            { input: 'matrix = [["0"]]', output: '0' }
        ],
        constraints: ['1 <= rows, cols <= 200'],
        profileSizes: [9, 25, 49, 81],
        vis: { type: 'grid', studio: 'visualize-ds.html', studioLabel: 'Histogram Stack Per Matrix Row' },
        io: {
            pyFn: 'maximal_rectangle', jsFn: 'maximalRectangle', javaMethod: 'maximalRectangle', cppMethod: 'maximalRectangle', cFn: 'maximalRectangle',
            params: [{ name: 'matrix', type: 'char[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Area 6 Rectangle', hidden: false, input: { matrix: ['10100', '10111', '11111', '10010'] }, expected: 6 },
            { id: 2, name: 'Single Zero', hidden: false, input: { matrix: ['0'] }, expected: 0 },
            { id: 3, name: 'Full 2x2', hidden: true, input: { matrix: ['11', '11'] }, expected: 4 }
        ],
        starterCode: {
            python: `def maximal_rectangle(matrix):\n    if not matrix: return 0\n    C = len(matrix[0])\n    h = [0] * (C + 1)\n    best = 0\n    for row in matrix:\n        for c in range(C): h[c] = h[c] + 1 if row[c] == '1' else 0\n        st = []\n        for i in range(C + 1):\n            while st and h[st[-1]] > h[i]:\n                H = h[st.pop()]\n                W = i if not st else i - st[-1] - 1\n                best = max(best, H * W)\n            st.append(i)\n    return best`,
            javascript: `function maximalRectangle(matrix) {\n    if (!matrix.length) return 0;\n    const C = matrix[0].length, h = new Array(C + 1).fill(0);\n    let best = 0;\n    for (const row of matrix) {\n        for (let c = 0; c < C; c++) h[c] = row[c] === '1' ? h[c] + 1 : 0;\n        const st = [];\n        for (let i = 0; i <= C; i++) {\n            while (st.length && h[st[st.length - 1]] > h[i]) {\n                const H = h[st.pop()];\n                const W = st.length ? i - st[st.length - 1] - 1 : i;\n                best = Math.max(best, H * W);\n            }\n            st.push(i);\n        }\n    }\n    return best;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int maximalRectangle(char[][] matrix) {\n        if (matrix.length == 0) return 0;\n        int C = matrix[0].length, best = 0;\n        int[] h = new int[C + 1];\n        for (char[] row : matrix) {\n            for (int c = 0; c < C; c++) h[c] = (row[c] == '1') ? h[c] + 1 : 0;\n            Deque<Integer> st = new ArrayDeque<>();\n            for (int i = 0; i <= C; i++) {\n                while (!st.isEmpty() && h[st.peek()] > h[i]) {\n                    int H = h[st.pop()], W = st.isEmpty() ? i : i - st.peek() - 1;\n                    best = Math.max(best, H * W);\n                }\n                st.push(i);\n            }\n        }\n        return best;\n    }\n}`,
            cpp: `#include <vector>\n#include <stack>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maximalRectangle(vector<vector<char>>& matrix) {\n        if (matrix.empty()) return 0;\n        int C = matrix[0].size(), best = 0;\n        vector<int> h(C + 1, 0);\n        for (auto& row : matrix) {\n            for (int c = 0; c < C; c++) h[c] = (row[c] == '1') ? h[c] + 1 : 0;\n            stack<int> st;\n            for (int i = 0; i <= C; i++) {\n                while (!st.empty() && h[st.top()] > h[i]) {\n                    int H = h[st.top()]; st.pop();\n                    int W = st.empty() ? i : i - st.top() - 1;\n                    best = max(best, H * W);\n                }\n                st.push(i);\n            }\n        }\n        return best;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint maximalRectangle(char** matrix, int R, int* cols) {\n    if (R == 0) return 0;\n    int C = cols[0], best = 0;\n    int* h = (int*)calloc(C + 1, sizeof(int));\n    int* st = (int*)malloc(sizeof(int) * (C + 2));\n    for (int r = 0; r < R; r++) {\n        for (int c = 0; c < C; c++) h[c] = (matrix[r][c] == '1') ? h[c] + 1 : 0;\n        int top = -1;\n        for (int i = 0; i <= C; i++) {\n            while (top >= 0 && h[st[top]] > h[i]) {\n                int H = h[st[top--]];\n                int W = top < 0 ? i : i - st[top] - 1;\n                if (H * W > best) best = H * W;\n            }\n            st[++top] = i;\n        }\n    }\n    free(h); free(st);\n    return best;\n}`
        }
    },

    // 82. Distinct Subsequences (#115)
    {
        id: 'distinct_subsequences',
        leetcodeId: 115,
        title: 'Distinct Subsequences',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(n)',
        description: 'Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equal `t`.',
        examples: [
            { input: 's = "rabbbit", t = "rabbit"', output: '3' },
            { input: 's = "babgbag", t = "bag"', output: '5' }
        ],
        constraints: ['1 <= s.length, t.length <= 1000'],
        profileSizes: [10, 25, 50, 100],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: '1D Compressed Subsequence DP' },
        io: {
            pyFn: 'num_distinct', jsFn: 'numDistinct', javaMethod: 'numDistinct', cppMethod: 'numDistinct', cFn: 'numDistinct',
            params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'rabbbit -> rabbit', hidden: false, input: { s: 'rabbbit', t: 'rabbit' }, expected: 3 },
            { id: 2, name: 'babgbag -> bag', hidden: false, input: { s: 'babgbag', t: 'bag' }, expected: 5 },
            { id: 3, name: 'No Match', hidden: true, input: { s: 'abc', t: 'abd' }, expected: 0 }
        ],
        starterCode: {
            python: `def num_distinct(s, t):\n    n = len(t)\n    dp = [1] + [0] * n\n    for ch in s:\n        for j in range(n, 0, -1):\n            if ch == t[j - 1]: dp[j] += dp[j - 1]\n    return dp[n]`,
            javascript: `function numDistinct(s, t) {\n    const n = t.length, dp = new Array(n + 1).fill(0);\n    dp[0] = 1;\n    for (let i = 0; i < s.length; i++) {\n        for (let j = n; j >= 1; j--) if (s[i] === t[j - 1]) dp[j] += dp[j - 1];\n    }\n    return dp[n];\n}`,
            java: `class Solution {\n    public int numDistinct(String s, String t) {\n        int n = t.length();\n        long[] dp = new long[n + 1]; dp[0] = 1;\n        for (int i = 0; i < s.length(); i++) {\n            for (int j = n; j >= 1; j--) if (s.charAt(i) == t.charAt(j - 1)) dp[j] += dp[j - 1];\n        }\n        return (int) dp[n];\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numDistinct(string s, string t) {\n        int n = t.size();\n        vector<unsigned long long> dp(n + 1, 0);\n        dp[0] = 1;\n        for (char c : s) {\n            for (int j = n; j >= 1; j--) if (c == t[j - 1]) dp[j] += dp[j - 1];\n        }\n        return (int)dp[n];\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nint numDistinct(const char* s, const char* t) {\n    int sn = (int)strlen(s), tn = (int)strlen(t);\n    unsigned long long* dp = (unsigned long long*)calloc(tn + 1, sizeof(unsigned long long));\n    dp[0] = 1;\n    for (int i = 0; i < sn; i++) {\n        for (int j = tn; j >= 1; j--) if (s[i] == t[j - 1]) dp[j] += dp[j - 1];\n    }\n    int ans = (int)dp[tn];\n    free(dp);\n    return ans;\n}`
        }
    },

    // 83. Best Time to Buy and Sell Stock III (#123)
    {
        id: 'best_time_stock_iii',
        leetcodeId: 123,
        title: 'Best Time to Buy & Sell Stock III',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(1)',
        description: 'Given array `prices` where `prices[i]` is the stock price on day `i`, find the maximum profit you can achieve completing at most two transactions.',
        examples: [
            { input: 'prices = [3,3,5,0,0,3,1,4]', output: '6' },
            { input: 'prices = [1,2,3,4,5]', output: '4' }
        ],
        constraints: ['1 <= prices.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: '4-State Transaction Machine' },
        io: {
            pyFn: 'max_profit_iii', jsFn: 'maxProfit', javaMethod: 'maxProfit', cppMethod: 'maxProfit', cFn: 'maxProfit',
            params: [{ name: 'prices', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Two Peaks', hidden: false, input: { prices: [3, 3, 5, 0, 0, 3, 1, 4] }, expected: 6 },
            { id: 2, name: 'Strict Climb', hidden: false, input: { prices: [1, 2, 3, 4, 5] }, expected: 4 },
            { id: 3, name: 'Declining', hidden: true, input: { prices: [7, 6, 4, 3, 1] }, expected: 0 }
        ],
        starterCode: {
            python: `def max_profit_iii(prices):\n    b1 = b2 = float('-inf')\n    s1 = s2 = 0\n    for p in prices:\n        b1 = max(b1, -p); s1 = max(s1, b1 + p)\n        b2 = max(b2, s1 - p); s2 = max(s2, b2 + p)\n    return s2`,
            javascript: `function maxProfit(prices) {\n    let b1 = -Infinity, s1 = 0, b2 = -Infinity, s2 = 0;\n    for (const p of prices) {\n        b1 = Math.max(b1, -p); s1 = Math.max(s1, b1 + p);\n        b2 = Math.max(b2, s1 - p); s2 = Math.max(s2, b2 + p);\n    }\n    return s2;\n}`,
            java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int b1 = Integer.MIN_VALUE, s1 = 0, b2 = Integer.MIN_VALUE, s2 = 0;\n        for (int p : prices) {\n            b1 = Math.max(b1, -p); s1 = Math.max(s1, b1 + p);\n            b2 = Math.max(b2, s1 - p); s2 = Math.max(s2, b2 + p);\n        }\n        return s2;\n    }\n}`,
            cpp: `#include <vector>\n#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int b1 = INT_MIN, s1 = 0, b2 = INT_MIN, s2 = 0;\n        for (int p : prices) {\n            b1 = max(b1, -p); s1 = max(s1, b1 + p);\n            b2 = max(b2, s1 - p); s2 = max(s2, b2 + p);\n        }\n        return s2;\n    }\n};`,
            c: `#include <limits.h>\n\nint maxProfit(const int* prices, int n) {\n    int b1 = INT_MIN, s1 = 0, b2 = INT_MIN, s2 = 0;\n    for (int i = 0; i < n; i++) {\n        int p = prices[i];\n        if (-p > b1) b1 = -p;\n        if (b1 + p > s1) s1 = b1 + p;\n        if (s1 - p > b2) b2 = s1 - p;\n        if (b2 + p > s2) s2 = b2 + p;\n    }\n    return s2;\n}`
        }
    },

    // 84. Binary Tree Maximum Path Sum (#124)
    {
        id: 'binary_tree_max_path_sum',
        leetcodeId: 124,
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        topic: 'Trees & BST',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(h)',
        description: 'Given the `root` of a non-empty binary tree, return the maximum path sum of any non-empty sequence of nodes where adjacent nodes share a parent-child edge.',
        examples: [
            { input: 'root = [-10, 9, 20, null, null, 15, 7]', output: '42' },
            { input: 'root = [1, 2, 3]', output: '6' }
        ],
        constraints: ['1 <= nodes <= 3 * 10^4'],
        profileSizes: [15, 31, 63, 127, 255],
        vis: { type: 'tree', studio: 'visualize-tree.html', studioLabel: 'Bottom-Up Gain DFS' },
        io: {
            pyFn: 'max_path_sum', jsFn: 'maxPathSum', javaMethod: 'maxPathSum', cppMethod: 'maxPathSum', cFn: 'maxPathSum',
            params: [{ name: 'root', type: 'TreeNode' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Subtree Arch 42', hidden: false, input: { root: [-10, 9, 20, null, null, 15, 7] }, expected: 42 },
            { id: 2, name: '3-Node Triangle', hidden: false, input: { root: [1, 2, 3] }, expected: 6 },
            { id: 3, name: 'All Negative', hidden: true, input: { root: [-3] }, expected: -3 }
        ],
        starterCode: {
            python: `def max_path_sum(root):\n    best = [float('-inf')]\n    def gain(node):\n        if not node: return 0\n        l = max(0, gain(node.left))\n        r = max(0, gain(node.right))\n        best[0] = max(best[0], node.val + l + r)\n        return node.val + max(l, r)\n    gain(root)\n    return best[0]`,
            javascript: `function maxPathSum(root) {\n    let best = -Infinity;\n    function gain(node) {\n        if (!node) return 0;\n        const l = Math.max(0, gain(node.left)), r = Math.max(0, gain(node.right));\n        best = Math.max(best, node.val + l + r);\n        return node.val + Math.max(l, r);\n    }\n    gain(root);\n    return best;\n}`,
            java: `class Solution {\n    private int best;\n    public int maxPathSum(TreeNode root) {\n        best = Integer.MIN_VALUE; gain(root); return best;\n    }\n    private int gain(TreeNode n) {\n        if (n == null) return 0;\n        int l = Math.max(0, gain(n.left)), r = Math.max(0, gain(n.right));\n        best = Math.max(best, n.val + l + r);\n        return n.val + Math.max(l, r);\n    }\n}`,
            cpp: `#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int best;\n    int gain(TreeNode* n) {\n        if (!n) return 0;\n        int l = max(0, gain(n->left)), r = max(0, gain(n->right));\n        best = max(best, n->val + l + r);\n        return n->val + max(l, r);\n    }\n    int maxPathSum(TreeNode* root) { best = INT_MIN; gain(root); return best; }\n};`,
            c: `#include <limits.h>\n\nstatic int _mpsGain(struct TreeNode* n, int* best) {\n    if (!n) return 0;\n    int l = _mpsGain(n->left, best); if (l < 0) l = 0;\n    int r = _mpsGain(n->right, best); if (r < 0) r = 0;\n    int sum = n->val + l + r;\n    if (sum > *best) *best = sum;\n    return n->val + (l > r ? l : r);\n}\n\nint maxPathSum(struct TreeNode* root) {\n    int best = INT_MIN;\n    _mpsGain(root, &best);\n    return best;\n}`
        }
    },

    // 85. Word Ladder (#127)
    {
        id: 'word_ladder',
        leetcodeId: 127,
        title: 'Word Ladder',
        difficulty: 'Hard',
        topic: 'Graphs & BFS/DFS',
        xpReward: 120,
        optimalTime: 'O(N * L^2)',
        optimalSpace: 'O(N * L)',
        description: 'Given `beginWord`, `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence changing one letter at a time, or `0` if impossible.',
        examples: [
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' },
            { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0' }
        ],
        constraints: ['1 <= wordList.length <= 5000', '1 <= word.length <= 10'],
        profileSizes: [5, 10, 15, 20],
        vis: { type: 'graph', studio: 'visualize-graph.html', studioLabel: 'Word Transformation BFS' },
        io: {
            pyFn: 'ladder_length', jsFn: 'ladderLength', javaMethod: 'ladderLength', cppMethod: 'ladderLength', cFn: 'ladderLength',
            params: [{ name: 'beginWord', type: 'string' }, { name: 'endWord', type: 'string' }, { name: 'wordList', type: 'string[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '5-Step Hit->Cog', hidden: false, input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] }, expected: 5 },
            { id: 2, name: 'Target Missing', hidden: false, input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] }, expected: 0 },
            { id: 3, name: 'Direct Hop', hidden: true, input: { beginWord: 'a', endWord: 'c', wordList: ['a', 'b', 'c'] }, expected: 2 }
        ],
        starterCode: {
            python: `from collections import deque\n\ndef ladder_length(beginWord, endWord, wordList):\n    words = set(wordList)\n    if endWord not in words: return 0\n    q = deque([(beginWord, 1)])\n    while q:\n        w, steps = q.popleft()\n        if w == endWord: return steps\n        for i in range(len(w)):\n            for ch in 'abcdefghijklmnopqrstuvwxyz':\n                nw = w[:i] + ch + w[i+1:]\n                if nw in words:\n                    words.remove(nw); q.append((nw, steps + 1))\n    return 0`,
            javascript: `function ladderLength(beginWord, endWord, wordList) {\n    const words = new Set(wordList);\n    if (!words.has(endWord)) return 0;\n    let q = [beginWord], steps = 1;\n    while (q.length) {\n        const next = [];\n        for (const w of q) {\n            if (w === endWord) return steps;\n            for (let i = 0; i < w.length; i++) {\n                for (let c = 97; c <= 122; c++) {\n                    const nw = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);\n                    if (words.has(nw)) { words.delete(nw); next.push(nw); }\n                }\n            }\n        }\n        q = next; steps++;\n    }\n    return 0;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int ladderLength(String beginWord, String endWord, String[] wordList) {\n        Set<String> words = new HashSet<>(Arrays.asList(wordList));\n        if (!words.contains(endWord)) return 0;\n        Queue<String> q = new ArrayDeque<>(); q.offer(beginWord);\n        int steps = 1;\n        while (!q.isEmpty()) {\n            for (int sz = q.size(); sz > 0; sz--) {\n                String w = q.poll();\n                if (w.equals(endWord)) return steps;\n                char[] arr = w.toCharArray();\n                for (int i = 0; i < arr.length; i++) {\n                    char old = arr[i];\n                    for (char c = 'a'; c <= 'z'; c++) {\n                        arr[i] = c; String nw = new String(arr);\n                        if (words.remove(nw)) q.offer(nw);\n                    }\n                    arr[i] = old;\n                }\n            }\n            steps++;\n        }\n        return 0;\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\n#include <unordered_set>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        unordered_set<string> words(wordList.begin(), wordList.end());\n        if (!words.count(endWord)) return 0;\n        queue<string> q; q.push(beginWord); int steps = 1;\n        while (!q.empty()) {\n            for (int sz = q.size(); sz > 0; sz--) {\n                string w = q.front(); q.pop();\n                if (w == endWord) return steps;\n                for (size_t i = 0; i < w.size(); i++) {\n                    char old = w[i];\n                    for (char c = 'a'; c <= 'z'; c++) {\n                        w[i] = c;\n                        if (words.erase(w)) q.push(w);\n                    }\n                    w[i] = old;\n                }\n            }\n            steps++;\n        }\n        return 0;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\nstatic bool _diffOne(const char* a, const char* b, int len) {\n    int d = 0;\n    for (int i = 0; i < len; i++) if (a[i] != b[i] && ++d > 1) return false;\n    return d == 1;\n}\n\nint ladderLength(const char* beginWord, const char* endWord, char** wordList, int n) {\n    int L = (int)strlen(beginWord), endIdx = -1;\n    for (int i = 0; i < n; i++) if (strcmp(wordList[i], endWord) == 0) endIdx = i;\n    if (endIdx == -1) return 0;\n    bool* vis = (bool*)calloc(n, sizeof(bool));\n    int* q = (int*)malloc(sizeof(int) * (n + 2));\n    int h = 0, t = 0, steps = 1;\n    for (int i = 0; i < n; i++) if (_diffOne(beginWord, wordList[i], L)) { vis[i] = true; q[t++] = i; }\n    while (h < t) {\n        steps++;\n        int sz = t - h;\n        for (int k = 0; k < sz; k++) {\n            int u = q[h++];\n            if (u == endIdx) { free(vis); free(q); return steps; }\n            for (int v = 0; v < n; v++) if (!vis[v] && _diffOne(wordList[u], wordList[v], L)) {\n                vis[v] = true; q[t++] = v;\n            }\n        }\n    }\n    free(vis); free(q);\n    return 0;\n}`
        }
    }
,

    // 86. Palindrome Partitioning II (#132)
    {
        id: 'palindrome_partitioning_ii',
        leetcodeId: 132,
        title: 'Palindrome Partitioning II',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(n^2)',
        optimalSpace: 'O(n)',
        description: 'Given a string `s`, partition `s` such that every substring of the partition is a palindrome. Return the minimum cuts needed.',
        examples: [
            { input: 's = "aab"', output: '1', explanation: '"aa" | "b" uses 1 cut.' },
            { input: 's = "a"', output: '0' }
        ],
        constraints: ['1 <= s.length <= 2000'],
        profileSizes: [10, 25, 50, 100],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Center-Expansion Min-Cut DP' },
        io: {
            pyFn: 'min_cut', jsFn: 'minCut', javaMethod: 'minCut', cppMethod: 'minCut', cFn: 'minCut',
            params: [{ name: 's', type: 'string' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'One Cut aab', hidden: false, input: { s: 'aab' }, expected: 1 },
            { id: 2, name: 'Single Char', hidden: false, input: { s: 'a' }, expected: 0 },
            { id: 3, name: 'Zero Cutsaba', hidden: false, input: { s: 'aba' }, expected: 0 },
            { id: 4, name: 'All Distinct', hidden: true, input: { s: 'abcd' }, expected: 3 }
        ],
        starterCode: {
            python: `def min_cut(s):\n    n = len(s)\n    cuts = list(range(n))\n    for c in range(n):\n        for d in (0, 1):\n            l, r = c, c + d\n            while l >= 0 and r < n and s[l] == s[r]:\n                cuts[r] = 0 if l == 0 else min(cuts[r], cuts[l - 1] + 1)\n                l -= 1; r += 1\n    return cuts[-1]`,
            javascript: `function minCut(s) {\n    const n = s.length, cuts = Array.from({ length: n }, (_, i) => i);\n    for (let c = 0; c < n; c++) {\n        for (const d of [0, 1]) {\n            let l = c, r = c + d;\n            while (l >= 0 && r < n && s[l] === s[r]) {\n                cuts[r] = l === 0 ? 0 : Math.min(cuts[r], cuts[l - 1] + 1);\n                l--; r++;\n            }\n        }\n    }\n    return cuts[n - 1];\n}`,
            java: `class Solution {\n    public int minCut(String s) {\n        int n = s.length();\n        int[] cuts = new int[n];\n        for (int i = 0; i < n; i++) cuts[i] = i;\n        for (int c = 0; c < n; c++) {\n            for (int d = 0; d <= 1; d++) {\n                int l = c, r = c + d;\n                while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) {\n                    cuts[r] = (l == 0) ? 0 : Math.min(cuts[r], cuts[l - 1] + 1);\n                    l--; r++;\n                }\n            }\n        }\n        return cuts[n - 1];\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minCut(string s) {\n        int n = s.size();\n        vector<int> cuts(n);\n        for (int i = 0; i < n; i++) cuts[i] = i;\n        for (int c = 0; c < n; c++) {\n            for (int d = 0; d <= 1; d++) {\n                int l = c, r = c + d;\n                while (l >= 0 && r < n && s[l] == s[r]) {\n                    cuts[r] = (l == 0) ? 0 : min(cuts[r], cuts[l - 1] + 1);\n                    l--; r++;\n                }\n            }\n        }\n        return cuts[n - 1];\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nint minCut(const char* s) {\n    int n = (int)strlen(s);\n    int* cuts = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) cuts[i] = i;\n    for (int c = 0; c < n; c++) {\n        for (int d = 0; d <= 1; d++) {\n            int l = c, r = c + d;\n            while (l >= 0 && r < n && s[l] == s[r]) {\n                int v = (l == 0) ? 0 : (cuts[l - 1] + 1);\n                if (v < cuts[r]) cuts[r] = v;\n                l--; r++;\n            }\n        }\n    }\n    int ans = cuts[n - 1]; free(cuts);\n    return ans;\n}`
        }
    },

    // 87. Candy (#135)
    {
        id: 'candy',
        leetcodeId: 135,
        title: 'Candy Distribution',
        difficulty: 'Hard',
        topic: 'Greedy',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(n)',
        description: 'Each child has a rating. Every child gets at least 1 candy, and children with a higher rating get more candies than their neighbors. Return the minimum total candies.',
        examples: [
            { input: 'ratings = [1, 0, 2]', output: '5' },
            { input: 'ratings = [1, 2, 2]', output: '4' }
        ],
        constraints: ['1 <= ratings.length <= 2 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-array.html', studioLabel: 'Two-Pass Slope Greedy' },
        io: {
            pyFn: 'candy', jsFn: 'candy', javaMethod: 'candy', cppMethod: 'candy', cFn: 'candy',
            params: [{ name: 'ratings', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Valley [1,0,2]', hidden: false, input: { ratings: [1, 0, 2] }, expected: 5 },
            { id: 2, name: 'Plateau [1,2,2]', hidden: false, input: { ratings: [1, 2, 2] }, expected: 4 },
            { id: 3, name: 'Mountain Peak', hidden: true, input: { ratings: [1, 3, 2, 2, 1] }, expected: 7 }
        ],
        starterCode: {
            python: `def candy(ratings):\n    n = len(ratings)\n    c = [1] * n\n    for i in range(1, n):\n        if ratings[i] > ratings[i - 1]: c[i] = c[i - 1] + 1\n    for i in range(n - 2, -1, -1):\n        if ratings[i] > ratings[i + 1]: c[i] = max(c[i], c[i + 1] + 1)\n    return sum(c)`,
            javascript: `function candy(ratings) {\n    const n = ratings.length, c = new Array(n).fill(1);\n    for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;\n    for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);\n    return c.reduce((a, b) => a + b, 0);\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int candy(int[] ratings) {\n        int n = ratings.length;\n        int[] c = new int[n]; Arrays.fill(c, 1);\n        for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;\n        int sum = c[n - 1];\n        for (int i = n - 2; i >= 0; i--) {\n            if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);\n            sum += c[i];\n        }\n        return sum;\n    }\n}`,
            cpp: `#include <vector>\n#include <numeric>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int candy(vector<int>& ratings) {\n        int n = ratings.size();\n        vector<int> c(n, 1);\n        for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;\n        for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = max(c[i], c[i + 1] + 1);\n        return accumulate(c.begin(), c.end(), 0);\n    }\n};`,
            c: `#include <stdlib.h>\n\nint candy(const int* ratings, int n) {\n    int* c = (int*)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) c[i] = 1;\n    for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;\n    int sum = c[n - 1];\n    for (int i = n - 2; i >= 0; i--) {\n        if (ratings[i] > ratings[i + 1] && c[i + 1] + 1 > c[i]) c[i] = c[i + 1] + 1;\n        sum += c[i];\n    }\n    free(c); return sum;\n}`
        }
    },

    // 88. Word Break II (#140)
    {
        id: 'word_break_ii',
        leetcodeId: 140,
        title: 'Word Break II',
        difficulty: 'Hard',
        topic: 'Backtracking',
        xpReward: 120,
        optimalTime: 'O(n * 2^n)',
        optimalSpace: 'O(n * 2^n)',
        description: 'Given a string `s` and a dictionary of strings `wordDict`, add spaces in `s` to construct a sentence where every word is in `wordDict`. Return all such possible sentences.',
        examples: [
            { input: 's = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]', output: '["cats and dog","cat sand dog"]' },
            { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: '[]' }
        ],
        constraints: ['1 <= s.length <= 20', '1 <= wordDict.length <= 1000'],
        profileSizes: [3, 6, 9, 12],
        vis: { type: 'backtracking', studio: 'visualize-backtracking.html', studioLabel: 'Memoized Sentence Segmentation' },
        io: {
            pyFn: 'word_break', jsFn: 'wordBreak', javaMethod: 'wordBreak', cppMethod: 'wordBreak', cFn: 'wordBreak',
            javaReturn: 'List<String>',
            params: [{ name: 's', type: 'string' }, { name: 'wordDict', type: 'string[]' }],
            returnType: 'string[]',
            compareMode: 'unordered_strings'
        },
        tests: [
            { id: 1, name: 'catsanddog', hidden: false, input: { s: 'catsanddog', wordDict: ['cat', 'cats', 'and', 'sand', 'dog'] }, expected: ['cats and dog', 'cat sand dog'] },
            { id: 2, name: 'pineapplepenapple', hidden: false, input: { s: 'pineapplepenapple', wordDict: ['apple', 'pen', 'applepen', 'pine', 'pineapple'] }, expected: ['pine apple pen apple', 'pineapple pen apple', 'pine applepen apple'] },
            { id: 3, name: 'Impossible Split', hidden: true, input: { s: 'catsandog', wordDict: ['cats', 'dog', 'sand', 'and', 'cat'] }, expected: [] }
        ],
        starterCode: {
            python: `def word_break(s, wordDict):\n    wset, memo = set(wordDict), {}\n    def dfs(i):\n        if i == len(s): return [""]\n        if i in memo: return memo[i]\n        res = []\n        for j in range(i + 1, len(s) + 1):\n            w = s[i:j]\n            if w in wset:\n                for tail in dfs(j):\n                    res.append(w if not tail else w + " " + tail)\n        memo[i] = res\n        return res\n    return dfs(0)`,
            javascript: `function wordBreak(s, wordDict) {\n    const wset = new Set(wordDict), memo = new Map();\n    function dfs(i) {\n        if (i === s.length) return [''];\n        if (memo.has(i)) return memo.get(i);\n        const res = [];\n        for (let j = i + 1; j <= s.length; j++) {\n            const w = s.slice(i, j);\n            if (wset.has(w)) {\n                for (const tail of dfs(j)) res.push(tail ? w + ' ' + tail : w);\n            }\n        }\n        memo.set(i, res); return res;\n    }\n    return dfs(0);\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<String> wordBreak(String s, String[] wordDict) {\n        Set<String> set = new HashSet<>(Arrays.asList(wordDict));\n        Map<Integer, List<String>> memo = new HashMap<>();\n        return dfs(s, 0, set, memo);\n    }\n    private List<String> dfs(String s, int i, Set<String> set, Map<Integer, List<String>> memo) {\n        if (memo.containsKey(i)) return memo.get(i);\n        List<String> res = new ArrayList<>();\n        if (i == s.length()) { res.add(""); return res; }\n        for (int j = i + 1; j <= s.length(); j++) {\n            String w = s.substring(i, j);\n            if (set.contains(w)) {\n                for (String tail : dfs(s, j, set, memo)) res.add(tail.isEmpty() ? w : w + " " + tail);\n            }\n        }\n        memo.put(i, res); return res;\n    }\n}`,
            cpp: `#include <string>\n#include <vector>\n#include <unordered_set>\n#include <unordered_map>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<string> wordBreak(string s, vector<string>& wordDict) {\n        unordered_set<string> wset(wordDict.begin(), wordDict.end());\n        unordered_map<int, vector<string>> memo;\n        function<vector<string>(int)> dfs = [&](int i) -> vector<string> {\n            if (memo.count(i)) return memo[i];\n            if (i == (int)s.size()) return {""};\n            vector<string> res;\n            for (int j = i + 1; j <= (int)s.size(); j++) {\n                string w = s.substr(i, j - i);\n                if (wset.count(w)) {\n                    for (const string& tail : dfs(j)) res.push_back(tail.empty() ? w : w + " " + tail);\n                }\n            }\n            return memo[i] = res;\n        };\n        return dfs(0);\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\nstatic void _wbDfs(const char* s, int sn, int idx, char** dict, int dn, char* buf, int blen, char*** res, int* cnt, int* cap) {\n    if (idx == sn) {\n        if (*cnt == *cap) { *cap *= 2; *res = (char**)realloc(*res, sizeof(char*) * (*cap)); }\n        buf[blen] = '\\0';\n        char* copy = (char*)malloc(blen + 1);\n        memcpy(copy, buf, blen + 1);\n        (*res)[(*cnt)++] = copy; return;\n    }\n    for (int i = 0; i < dn; i++) {\n        int wl = (int)strlen(dict[i]);\n        if (idx + wl <= sn && strncmp(s + idx, dict[i], wl) == 0) {\n            int nlen = blen;\n            if (nlen > 0) buf[nlen++] = ' ';\n            memcpy(buf + nlen, dict[i], wl); nlen += wl;\n            _wbDfs(s, sn, idx + wl, dict, dn, buf, nlen, res, cnt, cap);\n        }\n    }\n}\n\nchar** wordBreak(const char* s, char** wordDict, int dn, int* returnSize) {\n    int cap = 32, cnt = 0;\n    char** res = (char**)malloc(sizeof(char*) * cap);\n    char buf[128];\n    _wbDfs(s, (int)strlen(s), 0, wordDict, dn, buf, 0, &res, &cnt, &cap);\n    *returnSize = cnt; return res;\n}`
        }
    },

    // 89. Dungeon Game (#174)
    {
        id: 'dungeon_game',
        leetcodeId: 174,
        title: 'Dungeon Game',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(n)',
        description: 'Given an `m x n` grid `dungeon` of integer rooms (negative = damage, positive = orbs), find the knight’s minimum initial health to reach the bottom-right corner moving only right or down without ever dropping to `<= 0`.',
        examples: [
            { input: 'dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]', output: '7' },
            { input: 'dungeon = [[0]]', output: '1' }
        ],
        constraints: ['1 <= m, n <= 200'],
        profileSizes: [4, 9, 25, 64, 144],
        vis: { type: 'grid', studio: 'visualize-dp.html', studioLabel: 'Reverse Bottom-Right HP DP' },
        io: {
            pyFn: 'calculate_minimum_hp', jsFn: 'calculateMinimumHP', javaMethod: 'calculateMinimumHP', cppMethod: 'calculateMinimumHP', cFn: 'calculateMinimumHP',
            params: [{ name: 'dungeon', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Classic Dungeon 7', hidden: false, input: { dungeon: [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]] }, expected: 7 },
            { id: 2, name: 'Zero Room', hidden: false, input: { dungeon: [[0]] }, expected: 1 },
            { id: 3, name: 'Pure Healing', hidden: true, input: { dungeon: [[5, 2], [3, 1]] }, expected: 1 }
        ],
        starterCode: {
            python: `def calculate_minimum_hp(dungeon):\n    R, C = len(dungeon), len(dungeon[0])\n    dp = [float('inf')] * (C + 1)\n    dp[C - 1] = 1\n    for r in range(R - 1, -1, -1):\n        for c in range(C - 1, -1, -1):\n            need = min(dp[c], dp[c + 1]) - dungeon[r][c]\n            dp[c] = max(1, need)\n    return dp[0]`,
            javascript: `function calculateMinimumHP(dungeon) {\n    const R = dungeon.length, C = dungeon[0].length;\n    const dp = new Array(C + 1).fill(Infinity);\n    dp[C - 1] = 1;\n    for (let r = R - 1; r >= 0; r--) {\n        for (let c = C - 1; c >= 0; c--) dp[c] = Math.max(1, Math.min(dp[c], dp[c + 1]) - dungeon[r][c]);\n    }\n    return dp[0];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int calculateMinimumHP(int[][] dungeon) {\n        int R = dungeon.length, C = dungeon[0].length;\n        int[] dp = new int[C + 1]; Arrays.fill(dp, Integer.MAX_VALUE);\n        dp[C - 1] = 1;\n        for (int r = R - 1; r >= 0; r--)\n            for (int c = C - 1; c >= 0; c--)\n                dp[c] = Math.max(1, Math.min(dp[c], dp[c + 1]) - dungeon[r][c]);\n        return dp[0];\n    }\n}`,
            cpp: `#include <vector>\n#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int calculateMinimumHP(vector<vector<int>>& dungeon) {\n        int R = dungeon.size(), C = dungeon[0].size();\n        vector<int> dp(C + 1, INT_MAX); dp[C - 1] = 1;\n        for (int r = R - 1; r >= 0; r--)\n            for (int c = C - 1; c >= 0; c--)\n                dp[c] = max(1, min(dp[c], dp[c + 1]) - dungeon[r][c]);\n        return dp[0];\n    }\n};`,
            c: `#include <stdlib.h>\n#include <limits.h>\n\nint calculateMinimumHP(int** dungeon, int R, int* cols) {\n    int C = cols[0];\n    int* dp = (int*)malloc(sizeof(int) * (C + 1));\n    for (int i = 0; i <= C; i++) dp[i] = INT_MAX;\n    dp[C - 1] = 1;\n    for (int r = R - 1; r >= 0; r--) {\n        for (int c = C - 1; c >= 0; c--) {\n            int nxt = dp[c] < dp[c + 1] ? dp[c] : dp[c + 1];\n            int need = nxt - dungeon[r][c];\n            dp[c] = need > 1 ? need : 1;\n        }\n    }\n    int ans = dp[0]; free(dp); return ans;\n}`
        }
    },

    // 90. Best Time to Buy and Sell Stock IV (#188)
    {
        id: 'best_time_stock_iv',
        leetcodeId: 188,
        title: 'Best Time to Buy & Sell Stock IV',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(n * k)',
        optimalSpace: 'O(k)',
        description: 'Given integer `k` and array `prices`, find the maximum profit you can achieve completing at most `k` transactions (cannot hold multiple shares simultaneously).',
        examples: [
            { input: 'k = 2, prices = [2, 4, 1]', output: '2' },
            { input: 'k = 2, prices = [3, 2, 6, 5, 0, 3]', output: '7' }
        ],
        constraints: ['0 <= k <= 100', '0 <= prices.length <= 1000'],
        profileSizes: [20, 60, 120, 240],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'k-Transaction State DP' },
        io: {
            pyFn: 'max_profit_iv', jsFn: 'maxProfit', javaMethod: 'maxProfit', cppMethod: 'maxProfit', cFn: 'maxProfit',
            params: [{ name: 'k', type: 'int' }, { name: 'prices', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Simple Trade', hidden: false, input: { k: 2, prices: [2, 4, 1] }, expected: 2 },
            { id: 2, name: 'Two Swing Trades', hidden: false, input: { k: 2, prices: [3, 2, 6, 5, 0, 3] }, expected: 7 },
            { id: 3, name: 'k = 0', hidden: true, input: { k: 0, prices: [1, 3, 5] }, expected: 0 }
        ],
        starterCode: {
            python: `def max_profit_iv(k, prices):\n    n = len(prices)\n    if k == 0 or n < 2: return 0\n    if k >= n // 2:\n        return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n))\n    buy = [float('-inf')] * (k + 1)\n    sell = [0] * (k + 1)\n    for p in prices:\n        for t in range(1, k + 1):\n            buy[t] = max(buy[t], sell[t - 1] - p)\n            sell[t] = max(sell[t], buy[t] + p)\n    return sell[k]`,
            javascript: `function maxProfit(k, prices) {\n    const n = prices.length;\n    if (k === 0 || n < 2) return 0;\n    if (k >= n >> 1) {\n        let ans = 0; for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1];\n        return ans;\n    }\n    const buy = new Array(k + 1).fill(-Infinity), sell = new Array(k + 1).fill(0);\n    for (const p of prices) {\n        for (let t = 1; t <= k; t++) {\n            buy[t] = Math.max(buy[t], sell[t - 1] - p);\n            sell[t] = Math.max(sell[t], buy[t] + p);\n        }\n    }\n    return sell[k];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int maxProfit(int k, int[] prices) {\n        int n = prices.length;\n        if (k == 0 || n < 2) return 0;\n        if (k >= n / 2) {\n            int ans = 0; for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1];\n            return ans;\n        }\n        int[] buy = new int[k + 1], sell = new int[k + 1]; Arrays.fill(buy, Integer.MIN_VALUE);\n        for (int p : prices) {\n            for (int t = 1; t <= k; t++) {\n                buy[t] = Math.max(buy[t], sell[t - 1] - p);\n                sell[t] = Math.max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n}`,
            cpp: `#include <vector>\n#include <climits>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(int k, vector<int>& prices) {\n        int n = prices.size();\n        if (k == 0 || n < 2) return 0;\n        if (k >= n / 2) {\n            int ans = 0; for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1];\n            return ans;\n        }\n        vector<int> buy(k + 1, INT_MIN), sell(k + 1, 0);\n        for (int p : prices) {\n            for (int t = 1; t <= k; t++) {\n                buy[t] = max(buy[t], sell[t - 1] - p);\n                sell[t] = max(sell[t], buy[t] + p);\n            }\n        }\n        return sell[k];\n    }\n};`,
            c: `#include <stdlib.h>\n#include <limits.h>\n\nint maxProfit(int k, const int* prices, int n) {\n    if (k == 0 || n < 2) return 0;\n    if (k >= n / 2) {\n        int ans = 0; for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1];\n        return ans;\n    }\n    int* buy = (int*)malloc(sizeof(int) * (k + 1));\n    int* sell = (int*)calloc(k + 1, sizeof(int));\n    for (int t = 0; t <= k; t++) buy[t] = INT_MIN;\n    for (int i = 0; i < n; i++) {\n        int p = prices[i];\n        for (int t = 1; t <= k; t++) {\n            if (sell[t - 1] - p > buy[t]) buy[t] = sell[t - 1] - p;\n            if (buy[t] + p > sell[t]) sell[t] = buy[t] + p;\n        }\n    }\n    int ans = sell[k]; free(buy); free(sell); return ans;\n}`
        }
    },

    // 91. Word Search II (#212)
    {
        id: 'word_search_ii',
        leetcodeId: 212,
        title: 'Word Search II (Trie + DFS)',
        difficulty: 'Hard',
        topic: 'Backtracking',
        xpReward: 120,
        optimalTime: 'O(M*N * 4^L)',
        optimalSpace: 'O(sum(words))',
        description: 'Given an `m x n` grid `board` of letters and a list of strings `words`, return all words from `words` that can be formed by sequentially adjacent cells on the board.',
        examples: [
            { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' },
            { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]' }
        ],
        constraints: ['1 <= m, n <= 12', '1 <= words.length <= 3 * 10^4'],
        profileSizes: [4, 9, 16],
        vis: { type: 'grid', studio: 'visualize-backtracking.html', studioLabel: 'Prefix Trie + 2D Grid DFS' },
        io: {
            pyFn: 'find_words', jsFn: 'findWords', javaMethod: 'findWords', cppMethod: 'findWords', cFn: 'findWords',
            javaReturn: 'List<String>',
            params: [{ name: 'board', type: 'char[][]' }, { name: 'words', type: 'string[]' }],
            returnType: 'string[]',
            compareMode: 'unordered_strings'
        },
        tests: [
            { id: 1, name: 'Oath & Eat', hidden: false, input: { board: ['oaan', 'etae', 'ihkr', 'iflv'], words: ['oath', 'pea', 'eat', 'rain'] }, expected: ['eat', 'oath'] },
            { id: 2, name: 'No Reuse', hidden: false, input: { board: ['ab', 'cd'], words: ['abcb'] }, expected: [] },
            { id: 3, name: 'Adjacent 2x2', hidden: true, input: { board: ['ab', 'dc'], words: ['abcd', 'abdc', 'ac'] }, expected: ['abcd'] }
        ],
        starterCode: {
            python: `def find_words(board, words):\n    trie = {}\n    for w in words:\n        node = trie\n        for ch in w: node = node.setdefault(ch, {})\n        node['#'] = w\n    R, C, res = len(board), len(board[0]), []\n    def dfs(r, c, parent):\n        ch = board[r][c]\n        node = parent[ch]\n        if '#' in node:\n            res.append(node.pop('#'))\n        board[r][c] = '*'\n        for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):\n            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in node:\n                dfs(nr, nc, node)\n        board[r][c] = ch\n        if not node: parent.pop(ch)\n    for r in range(R):\n        for c in range(C):\n            if board[r][c] in trie: dfs(r, c, trie)\n    return res`,
            javascript: `function findWords(board, words) {\n    const root = {};\n    for (const w of words) {\n        let n = root; for (const ch of w) n = n[ch] || (n[ch] = {}); n.w = w;\n    }\n    const R = board.length, C = board[0].length, res = [];\n    function dfs(r, c, node) {\n        const ch = board[r][c], nxt = node[ch];\n        if (!nxt) return;\n        if (nxt.w) { res.push(nxt.w); nxt.w = null; }\n        board[r][c] = '#';\n        if (r + 1 < R) dfs(r + 1, c, nxt);\n        if (r > 0) dfs(r - 1, c, nxt);\n        if (c + 1 < C) dfs(r, c + 1, nxt);\n        if (c > 0) dfs(r, c - 1, nxt);\n        board[r][c] = ch;\n    }\n    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) dfs(r, c, root);\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    static class Trie { Trie[] ch = new Trie[26]; String word; }\n    public List<String> findWords(char[][] board, String[] words) {\n        Trie root = new Trie();\n        for (String w : words) {\n            Trie n = root; for (char c : w.toCharArray()) { int idx = c - 'a'; if (n.ch[idx] == null) n.ch[idx] = new Trie(); n = n.ch[idx]; } n.word = w;\n        }\n        List<String> res = new ArrayList<>();\n        for (int r = 0; r < board.length; r++) for (int c = 0; c < board[0].length; c++) dfs(board, r, c, root, res);\n        return res;\n    }\n    private void dfs(char[][] b, int r, int c, Trie n, List<String> res) {\n        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return;\n        char ch = b[r][c]; if (ch == '#' || n.ch[ch - 'a'] == null) return;\n        n = n.ch[ch - 'a'];\n        if (n.word != null) { res.add(n.word); n.word = null; }\n        b[r][c] = '#';\n        dfs(b, r+1, c, n, res); dfs(b, r-1, c, n, res); dfs(b, r, c+1, n, res); dfs(b, r, c-1, n, res);\n        b[r][c] = ch;\n    }\n}`,
            cpp: `#include <vector>\n#include <string>\n#include <functional>\nusing namespace std;\n\nclass Solution {\n    struct Trie { Trie* ch[26] = {nullptr}; string word; };\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        Trie* root = new Trie();\n        for (const string& w : words) {\n            Trie* n = root; for (char c : w) { int i = c - 'a'; if (!n->ch[i]) n->ch[i] = new Trie(); n = n->ch[i]; } n->word = w;\n        }\n        int R = board.size(), C = board[0].size(); vector<string> res;\n        function<void(int, int, Trie*)> dfs = [&](int r, int c, Trie* n) {\n            if (r < 0 || r >= R || c < 0 || c >= C) return;\n            char ch = board[r][c]; if (ch == '#' || !n->ch[ch - 'a']) return;\n            n = n->ch[ch - 'a'];\n            if (!n->word.empty()) { res.push_back(n->word); n->word.clear(); }\n            board[r][c] = '#';\n            dfs(r+1, c, n); dfs(r-1, c, n); dfs(r, c+1, n); dfs(r, c-1, n);\n            board[r][c] = ch;\n        };\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) dfs(r, c, root);\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <string.h>\n\ntypedef struct _WSNode { struct _WSNode* ch[26]; char* word; } _WSNode;\nstatic void _ws2Dfs(char** b, int R, int C, int r, int c, _WSNode* n, char*** res, int* cnt, int* cap) {\n    if (r < 0 || r >= R || c < 0 || c >= C) return;\n    char ch = b[r][c]; if (ch == '#' || !n->ch[ch - 'a']) return;\n    n = n->ch[ch - 'a'];\n    if (n->word) {\n        if (*cnt == *cap) { *cap *= 2; *res = (char**)realloc(*res, sizeof(char*) * (*cap)); }\n        (*res)[(*cnt)++] = n->word; n->word = NULL;\n    }\n    b[r][c] = '#';\n    _ws2Dfs(b, R, C, r+1, c, n, res, cnt, cap); _ws2Dfs(b, R, C, r-1, c, n, res, cnt, cap);\n    _ws2Dfs(b, R, C, r, c+1, n, res, cnt, cap); _ws2Dfs(b, R, C, r, c-1, n, res, cnt, cap);\n    b[r][c] = ch;\n}\n\nchar** findWords(char** board, int R, int* cols, char** words, int wn, int* returnSize) {\n    _WSNode* root = (_WSNode*)calloc(1, sizeof(_WSNode));\n    for (int i = 0; i < wn; i++) {\n        _WSNode* n = root;\n        for (int j = 0; words[i][j]; j++) { int idx = words[i][j] - 'a'; if (!n->ch[idx]) n->ch[idx] = (_WSNode*)calloc(1, sizeof(_WSNode)); n = n->ch[idx]; }\n        size_t L = strlen(words[i]) + 1; n->word = (char*)malloc(L); memcpy(n->word, words[i], L);\n    }\n    int cap = 16, cnt = 0, C = cols[0];\n    char** res = (char**)malloc(sizeof(char*) * cap);\n    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) _ws2Dfs(board, R, C, r, c, root, &res, &cnt, &cap);\n    *returnSize = cnt; return res;\n}`
        }
    },

    // 92. Sliding Window Maximum (#239)
    {
        id: 'sliding_window_maximum',
        leetcodeId: 239,
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        xpReward: 120,
        optimalTime: 'O(n)',
        optimalSpace: 'O(k)',
        description: 'Given an array `nums` and sliding window size `k` moving one index right per step, return the maximum element inside each window.',
        examples: [
            { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
            { input: 'nums = [1], k = 1', output: '[1]' }
        ],
        constraints: ['1 <= k <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'stack', studio: 'visualize-ds.html', studioLabel: 'Monotonic Decreasing Deque' },
        io: {
            pyFn: 'max_sliding_window', jsFn: 'maxSlidingWindow', javaMethod: 'maxSlidingWindow', cppMethod: 'maxSlidingWindow', cFn: 'maxSlidingWindow',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: 'Window k=3', hidden: false, input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, expected: [3, 3, 5, 5, 6, 7] },
            { id: 2, name: 'Window k=1', hidden: false, input: { nums: [1], k: 1 }, expected: [1] },
            { id: 3, name: 'Descending Array', hidden: true, input: { nums: [9, 8, 7, 6, 5], k: 2 }, expected: [9, 8, 7, 6] }
        ],
        starterCode: {
            python: `from collections import deque\n\ndef max_sliding_window(nums, k):\n    dq, res = deque(), []\n    for i, x in enumerate(nums):\n        while dq and dq[0] <= i - k: dq.popleft()\n        while dq and nums[dq[-1]] <= x: dq.pop()\n        dq.append(i)\n        if i >= k - 1: res.append(nums[dq[0]])\n    return res`,
            javascript: `function maxSlidingWindow(nums, k) {\n    const dq = [], res = []; let head = 0;\n    for (let i = 0; i < nums.length; i++) {\n        while (head < dq.length && dq[head] <= i - k) head++;\n        while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();\n        dq.push(i);\n        if (i >= k - 1) res.push(nums[dq[head]]);\n    }\n    return res;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        int n = nums.length;\n        int[] res = new int[n - k + 1];\n        Deque<Integer> dq = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) {\n            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();\n            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();\n            dq.offerLast(i);\n            if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <deque>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        deque<int> dq; vector<int> res;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n            dq.push_back(i);\n            if (i >= k - 1) res.push_back(nums[dq.front()]);\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n\nint* maxSlidingWindow(const int* nums, int n, int k, int* returnSize) {\n    int outN = n - k + 1;\n    int* res = (int*)malloc(sizeof(int) * (outN > 0 ? outN : 1));\n    int* dq = (int*)malloc(sizeof(int) * (n + 1));\n    int f = 0, r = 0;\n    for (int i = 0; i < n; i++) {\n        if (f < r && dq[f] <= i - k) f++;\n        while (f < r && nums[dq[r - 1]] <= nums[i]) r--;\n        dq[r++] = i;\n        if (i >= k - 1) res[i - k + 1] = nums[dq[f]];\n    }\n    free(dq);\n    *returnSize = outN > 0 ? outN : 0;\n    return res;\n}`
        }
    },

    // 93. Burst Balloons (#312)
    {
        id: 'burst_balloons',
        leetcodeId: 312,
        title: 'Burst Balloons',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(n^3)',
        optimalSpace: 'O(n^2)',
        description: 'Given `n` balloons indexed `0..n-1` with coin values `nums[i]`, bursting balloon `i` earns `nums[left]*nums[i]*nums[right]` coins. Return the maximum coins you can collect.',
        examples: [
            { input: 'nums = [3, 1, 5, 8]', output: '167' },
            { input: 'nums = [1, 5]', output: '10' }
        ],
        constraints: ['1 <= nums.length <= 300'],
        profileSizes: [3, 6, 10, 15],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Last-Burst Interval DP Table' },
        io: {
            pyFn: 'max_coins', jsFn: 'maxCoins', javaMethod: 'maxCoins', cppMethod: 'maxCoins', cFn: 'maxCoins',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '4 Balloons 167', hidden: false, input: { nums: [3, 1, 5, 8] }, expected: 167 },
            { id: 2, name: '2 Balloons', hidden: false, input: { nums: [1, 5] }, expected: 10 },
            { id: 3, name: 'Single Balloon', hidden: true, input: { nums: [9] }, expected: 9 }
        ],
        starterCode: {
            python: `def max_coins(nums):\n    a = [1] + nums + [1]\n    m = len(a)\n    dp = [[0] * m for _ in range(m)]\n    for gap in range(2, m):\n        for l in range(m - gap):\n            r = l + gap\n            best = 0\n            for k in range(l + 1, r):\n                best = max(best, dp[l][k] + a[l]*a[k]*a[r] + dp[k][r])\n            dp[l][r] = best\n    return dp[0][m - 1]`,
            javascript: `function maxCoins(nums) {\n    const a = [1, ...nums, 1], m = a.length;\n    const dp = Array.from({ length: m }, () => new Array(m).fill(0));\n    for (let gap = 2; gap < m; gap++) {\n        for (let l = 0; l + gap < m; l++) {\n            const r = l + gap;\n            for (let k = l + 1; k < r; k++) {\n                dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);\n            }\n        }\n    }\n    return dp[0][m - 1];\n}`,
            java: `class Solution {\n    public int maxCoins(int[] nums) {\n        int m = nums.length + 2;\n        int[] a = new int[m]; a[0] = a[m - 1] = 1;\n        for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];\n        int[][] dp = new int[m][m];\n        for (int gap = 2; gap < m; gap++)\n            for (int l = 0; l + gap < m; l++) {\n                int r = l + gap;\n                for (int k = l + 1; k < r; k++)\n                    dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);\n            }\n        return dp[0][m - 1];\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxCoins(vector<int>& nums) {\n        int m = nums.size() + 2;\n        vector<int> a(m, 1);\n        for (size_t i = 0; i < nums.size(); i++) a[i + 1] = nums[i];\n        vector<vector<int>> dp(m, vector<int>(m, 0));\n        for (int gap = 2; gap < m; gap++)\n            for (int l = 0; l + gap < m; l++) {\n                int r = l + gap;\n                for (int k = l + 1; k < r; k++)\n                    dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);\n            }\n        return dp[0][m - 1];\n    }\n};`,
            c: `#include <stdlib.h>\n\nint maxCoins(const int* nums, int n) {\n    int m = n + 2;\n    int* a = (int*)malloc(sizeof(int) * m); a[0] = a[m - 1] = 1;\n    for (int i = 0; i < n; i++) a[i + 1] = nums[i];\n    int* dp = (int*)calloc(m * m, sizeof(int));\n    for (int gap = 2; gap < m; gap++) {\n        for (int l = 0; l + gap < m; l++) {\n            int r = l + gap, best = 0;\n            for (int k = l + 1; k < r; k++) {\n                int v = dp[l * m + k] + a[l] * a[k] * a[r] + dp[k * m + r];\n                if (v > best) best = v;\n            }\n            dp[l * m + r] = best;\n        }\n    }\n    int ans = dp[m - 1]; free(a); free(dp); return ans;\n}`
        }
    },

    // 94. Count of Smaller Numbers After Self (#315)
    {
        id: 'count_smaller_after_self',
        leetcodeId: 315,
        title: 'Count of Smaller Numbers After Self',
        difficulty: 'Hard',
        topic: 'Sorting & Intervals',
        xpReward: 120,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given integer array `nums`, return integer array `counts` where `counts[i]` is the number of smaller elements to the right of `nums[i]`.',
        examples: [
            { input: 'nums = [5, 2, 6, 1]', output: '[2, 1, 1, 0]' },
            { input: 'nums = [-1, -1]', output: '[0, 0]' }
        ],
        constraints: ['1 <= nums.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Merge Sort Inversion Count' },
        io: {
            pyFn: 'count_smaller', jsFn: 'countSmaller', javaMethod: 'countSmaller', cppMethod: 'countSmaller', cFn: 'countSmaller',
            javaReturn: 'List<Integer>',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int[]'
        },
        tests: [
            { id: 1, name: '[5,2,6,1]', hidden: false, input: { nums: [5, 2, 6, 1] }, expected: [2, 1, 1, 0] },
            { id: 2, name: 'Duplicates', hidden: false, input: { nums: [-1, -1] }, expected: [0, 0] },
            { id: 3, name: 'Descending', hidden: true, input: { nums: [4, 3, 2, 1] }, expected: [3, 2, 1, 0] }
        ],
        starterCode: {
            python: `def count_smaller(nums):\n    n = len(nums)\n    counts = [0] * n\n    idx = list(range(n))\n    def sort(l, r):\n        if r - l <= 1: return\n        m = (l + r) // 2\n        sort(l, m); sort(m, r)\n        merged, j, rightCnt = [], m, 0\n        for i in range(l, m):\n            while j < r and nums[idx[j]] < nums[idx[i]]:\n                rightCnt += 1; merged.append(idx[j]); j += 1\n            counts[idx[i]] += rightCnt; merged.append(idx[i])\n        while j < r: merged.append(idx[j]); j += 1\n        idx[l:r] = merged\n    sort(0, n)\n    return counts`,
            javascript: `function countSmaller(nums) {\n    const n = nums.length, counts = new Array(n).fill(0), idx = Array.from({ length: n }, (_, i) => i);\n    function sort(l, r) {\n        if (r - l <= 1) return;\n        const m = (l + r) >> 1; sort(l, m); sort(m, r);\n        const tmp = []; let j = m, rc = 0;\n        for (let i = l; i < m; i++) {\n            while (j < r && nums[idx[j]] < nums[idx[i]]) { rc++; tmp.push(idx[j++]); }\n            counts[idx[i]] += rc; tmp.push(idx[i]);\n        }\n        while (j < r) tmp.push(idx[j++]);\n        for (let k = 0; k < tmp.length; k++) idx[l + k] = tmp[k];\n    }\n    sort(0, n); return counts;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public List<Integer> countSmaller(int[] nums) {\n        int n = nums.length; int[] counts = new int[n], idx = new int[n], tmp = new int[n];\n        for (int i = 0; i < n; i++) idx[i] = i;\n        sort(nums, idx, tmp, counts, 0, n);\n        List<Integer> res = new ArrayList<>(n);\n        for (int c : counts) res.add(c);\n        return res;\n    }\n    private void sort(int[] nums, int[] idx, int[] tmp, int[] counts, int l, int r) {\n        if (r - l <= 1) return;\n        int m = (l + r) / 2; sort(nums, idx, tmp, counts, l, m); sort(nums, idx, tmp, counts, m, r);\n        int k = 0, j = m, rc = 0;\n        for (int i = l; i < m; i++) {\n            while (j < r && nums[idx[j]] < nums[idx[i]]) { rc++; tmp[k++] = idx[j++]; }\n            counts[idx[i]] += rc; tmp[k++] = idx[i];\n        }\n        while (j < r) tmp[k++] = idx[j++];\n        System.arraycopy(tmp, 0, idx, l, k);\n    }\n}`,
            cpp: `#include <vector>\n#include <numeric>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> countSmaller(vector<int>& nums) {\n        int n = nums.size(); vector<int> counts(n, 0), idx(n), tmp(n);\n        iota(idx.begin(), idx.end(), 0);\n        function<void(int, int)> ms = [&](int l, int r) {\n            if (r - l <= 1) return;\n            int m = (l + r) / 2; ms(l, m); ms(m, r);\n            int k = 0, j = m, rc = 0;\n            for (int i = l; i < m; i++) {\n                while (j < r && nums[idx[j]] < nums[idx[i]]) { rc++; tmp[k++] = idx[j++]; }\n                counts[idx[i]] += rc; tmp[k++] = idx[i];\n            }\n            while (j < r) tmp[k++] = idx[j++];\n            for (int t = 0; t < k; t++) idx[l + t] = tmp[t];\n        };\n        ms(0, n); return counts;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic void _csMs(const int* nums, int* idx, int* tmp, int* counts, int l, int r) {\n    if (r - l <= 1) return;\n    int m = (l + r) / 2; _csMs(nums, idx, tmp, counts, l, m); _csMs(nums, idx, tmp, counts, m, r);\n    int k = 0, j = m, rc = 0;\n    for (int i = l; i < m; i++) {\n        while (j < r && nums[idx[j]] < nums[idx[i]]) { rc++; tmp[k++] = idx[j++]; }\n        counts[idx[i]] += rc; tmp[k++] = idx[i];\n    }\n    while (j < r) tmp[k++] = idx[j++];\n    for (int t = 0; t < k; t++) idx[l + t] = tmp[t];\n}\n\nint* countSmaller(const int* nums, int n, int* returnSize) {\n    int* counts = (int*)calloc(n ? n : 1, sizeof(int));\n    int* idx = (int*)malloc(sizeof(int) * (n ? n : 1));\n    int* tmp = (int*)malloc(sizeof(int) * (n ? n : 1));\n    for (int i = 0; i < n; i++) idx[i] = i;\n    _csMs(nums, idx, tmp, counts, 0, n);\n    free(idx); free(tmp);\n    *returnSize = n; return counts;\n}`
        }
    },

    // 95. Longest Increasing Path in a Matrix (#329)
    {
        id: 'longest_increasing_path_matrix',
        leetcodeId: 329,
        title: 'Longest Increasing Path in Matrix',
        difficulty: 'Hard',
        topic: 'Graphs & BFS/DFS',
        xpReward: 120,
        optimalTime: 'O(m * n)',
        optimalSpace: 'O(m * n)',
        description: 'Given an `m x n` integers `matrix`, return the length of the longest strictly increasing path moving left, right, up, or down.',
        examples: [
            { input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4', explanation: '1 -> 2 -> 6 -> 9.' },
            { input: 'matrix = [[3,4,5],[3,2,6],[2,2,1]]', output: '4' }
        ],
        constraints: ['1 <= m, n <= 200'],
        profileSizes: [4, 9, 25, 64, 144],
        vis: { type: 'grid', studio: 'visualize-graph.html', studioLabel: 'DAG Memoized Matrix DFS' },
        io: {
            pyFn: 'longest_increasing_path', jsFn: 'longestIncreasingPath', javaMethod: 'longestIncreasingPath', cppMethod: 'longestIncreasingPath', cFn: 'longestIncreasingPath',
            params: [{ name: 'matrix', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '1->2->6->9', hidden: false, input: { matrix: [[9, 9, 4], [6, 6, 8], [2, 1, 1]] }, expected: 4 },
            { id: 2, name: '3->4->5->6', hidden: false, input: { matrix: [[3, 4, 5], [3, 2, 6], [2, 2, 1]] }, expected: 4 },
            { id: 3, name: 'Single Cell', hidden: true, input: { matrix: [[1]] }, expected: 1 }
        ],
        starterCode: {
            python: `def longest_increasing_path(matrix):\n    R, C = len(matrix), len(matrix[0])\n    memo = [[0] * C for _ in range(R)]\n    def dfs(r, c):\n        if memo[r][c]: return memo[r][c]\n        best = 1\n        for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):\n            if 0 <= nr < R and 0 <= nc < C and matrix[nr][nc] > matrix[r][c]:\n                best = max(best, 1 + dfs(nr, nc))\n        memo[r][c] = best\n        return best\n    return max(dfs(r, c) for r in range(R) for c in range(C))`,
            javascript: `function longestIncreasingPath(matrix) {\n    const R = matrix.length, C = matrix[0].length;\n    const memo = Array.from({ length: R }, () => new Array(C).fill(0));\n    function dfs(r, c) {\n        if (memo[r][c]) return memo[r][c];\n        let best = 1;\n        for (const [nr, nc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]) {\n            if (nr >= 0 && nr < R && nc >= 0 && nc < C && matrix[nr][nc] > matrix[r][c]) best = Math.max(best, 1 + dfs(nr, nc));\n        }\n        return (memo[r][c] = best);\n    }\n    let ans = 0;\n    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) ans = Math.max(ans, dfs(r, c));\n    return ans;\n}`,
            java: `class Solution {\n    private int[][] memo;\n    private int R, C;\n    private static final int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};\n    public int longestIncreasingPath(int[][] matrix) {\n        R = matrix.length; C = matrix[0].length; memo = new int[R][C];\n        int ans = 0;\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) ans = Math.max(ans, dfs(matrix, r, c));\n        return ans;\n    }\n    private int dfs(int[][] m, int r, int c) {\n        if (memo[r][c] != 0) return memo[r][c];\n        int best = 1;\n        for (int[] d : DIRS) {\n            int nr = r + d[0], nc = c + d[1];\n            if (nr >= 0 && nr < R && nc >= 0 && nc < C && m[nr][nc] > m[r][c]) best = Math.max(best, 1 + dfs(m, nr, nc));\n        }\n        return memo[r][c] = best;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestIncreasingPath(vector<vector<int>>& matrix) {\n        int R = matrix.size(), C = matrix[0].size();\n        vector<vector<int>> memo(R, vector<int>(C, 0));\n        const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n        function<int(int, int)> dfs = [&](int r, int c) -> int {\n            if (memo[r][c]) return memo[r][c];\n            int best = 1;\n            for (int k = 0; k < 4; k++) {\n                int nr = r + dr[k], nc = c + dc[k];\n                if (nr >= 0 && nr < R && nc >= 0 && nc < C && matrix[nr][nc] > matrix[r][c]) best = max(best, 1 + dfs(nr, nc));\n            }\n            return memo[r][c] = best;\n        };\n        int ans = 0;\n        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) ans = max(ans, dfs(r, c));\n        return ans;\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _lipDfs(int** m, int R, int C, int* memo, int r, int c) {\n    if (memo[r * C + c]) return memo[r * C + c];\n    const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n    int best = 1;\n    for (int k = 0; k < 4; k++) {\n        int nr = r + dr[k], nc = c + dc[k];\n        if (nr >= 0 && nr < R && nc >= 0 && nc < C && m[nr][nc] > m[r][c]) {\n            int v = 1 + _lipDfs(m, R, C, memo, nr, nc);\n            if (v > best) best = v;\n        }\n    }\n    return memo[r * C + c] = best;\n}\n\nint longestIncreasingPath(int** matrix, int R, int* cols) {\n    int C = cols[0], ans = 0;\n    int* memo = (int*)calloc(R * C, sizeof(int));\n    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {\n        int v = _lipDfs(matrix, R, C, memo, r, c);\n        if (v > ans) ans = v;\n    }\n    free(memo); return ans;\n}`
        }
    },

    // 96. Russian Doll Envelopes (#354)
    {
        id: 'russian_doll_envelopes',
        leetcodeId: 354,
        title: 'Russian Doll Envelopes',
        difficulty: 'Hard',
        topic: 'Binary Search',
        xpReward: 120,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given envelopes `[w, h]`, one fits inside another if both `w1 < w2` and `h1 < h2`. Return the maximum number of Russian-doll nested envelopes.',
        examples: [
            { input: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]', output: '3', explanation: '[2,3] -> [5,4] -> [6,7].' },
            { input: 'envelopes = [[1,1],[1,1],[1,1]]', output: '1' }
        ],
        constraints: ['1 <= envelopes.length <= 10^5'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-sorting.html', studioLabel: '2D Sort + Patience LIS' },
        io: {
            pyFn: 'max_envelopes', jsFn: 'maxEnvelopes', javaMethod: 'maxEnvelopes', cppMethod: 'maxEnvelopes', cFn: 'maxEnvelopes',
            params: [{ name: 'envelopes', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Nest 3 Envelopes', hidden: false, input: { envelopes: [[5, 4], [6, 4], [6, 7], [2, 3]] }, expected: 3 },
            { id: 2, name: 'All Equal', hidden: false, input: { envelopes: [[1, 1], [1, 1], [1, 1]] }, expected: 1 },
            { id: 3, name: 'Same Width Trap', hidden: true, input: { envelopes: [[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]] }, expected: 4 }
        ],
        starterCode: {
            python: `import bisect\n\ndef max_envelopes(envelopes):\n    envelopes.sort(key=lambda x: (x[0], -x[1]))\n    tails = []\n    for _, h in envelopes:\n        i = bisect.bisect_left(tails, h)\n        if i == len(tails): tails.append(h)\n        else: tails[i] = h\n    return len(tails)`,
            javascript: `function maxEnvelopes(envelopes) {\n    envelopes.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]);\n    const tails = [];\n    for (const [, h] of envelopes) {\n        let l = 0, r = tails.length;\n        while (l < r) { const m = (l + r) >> 1; if (tails[m] < h) l = m + 1; else r = m; }\n        tails[l] = h;\n    }\n    return tails.length;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int maxEnvelopes(int[][] envelopes) {\n        Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));\n        int[] tails = new int[envelopes.length]; int sz = 0;\n        for (int[] e : envelopes) {\n            int h = e[1], l = 0, r = sz;\n            while (l < r) { int m = (l + r) >>> 1; if (tails[m] < h) l = m + 1; else r = m; }\n            tails[l] = h; if (l == sz) sz++;\n        }\n        return sz;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxEnvelopes(vector<vector<int>>& envelopes) {\n        sort(envelopes.begin(), envelopes.end(), [](const vector<int>& a, const vector<int>& b) {\n            return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];\n        });\n        vector<int> tails;\n        for (auto& e : envelopes) {\n            auto it = lower_bound(tails.begin(), tails.end(), e[1]);\n            if (it == tails.end()) tails.push_back(e[1]); else *it = e[1];\n        }\n        return tails.size();\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _cmpEnv(const void* a, const void* b) {\n    const int* x = *(const int* const*)a;\n    const int* y = *(const int* const*)b;\n    if (x[0] != y[0]) return (x[0] > y[0]) - (x[0] < y[0]);\n    return (y[1] > x[1]) - (y[1] < x[1]);\n}\n\nint maxEnvelopes(int** envelopes, int n, int* cols) {\n    qsort(envelopes, n, sizeof(int*), _cmpEnv);\n    int* tails = (int*)malloc(sizeof(int) * (n ? n : 1)); int sz = 0;\n    for (int i = 0; i < n; i++) {\n        int h = envelopes[i][1], l = 0, r = sz;\n        while (l < r) { int m = l + (r - l) / 2; if (tails[m] < h) l = m + 1; else r = m; }\n        tails[l] = h; if (l == sz) sz++;\n    }\n    free(tails); return sz;\n}`
        }
    },

    // 97. Split Array Largest Sum (#410)
    {
        id: 'split_array_largest_sum',
        leetcodeId: 410,
        title: 'Split Array Largest Sum',
        difficulty: 'Hard',
        topic: 'Binary Search',
        xpReward: 120,
        optimalTime: 'O(n log sum)',
        optimalSpace: 'O(1)',
        description: 'Given integer array `nums` and integer `k`, split `nums` into `k` non-empty contiguous subarrays such that the largest subarray sum is minimized. Return that minimized largest sum.',
        examples: [
            { input: 'nums = [7,2,5,10,8], k = 2', output: '18' },
            { input: 'nums = [1,2,3,4,5], k = 2', output: '9' }
        ],
        constraints: ['1 <= nums.length <= 1000', '1 <= k <= min(50, nums.length)'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'search', studio: 'visualize-search.html', studioLabel: 'Minimax Capacity Binary Search' },
        io: {
            pyFn: 'split_array', jsFn: 'splitArray', javaMethod: 'splitArray', cppMethod: 'splitArray', cFn: 'splitArray',
            params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'k = 2 Classic 18', hidden: false, input: { nums: [7, 2, 5, 10, 8], k: 2 }, expected: 18 },
            { id: 2, name: 'k = 2 Ascending 9', hidden: false, input: { nums: [1, 2, 3, 4, 5], k: 2 }, expected: 9 },
            { id: 3, name: 'Single Element Each', hidden: true, input: { nums: [1, 4, 4], k: 3 }, expected: 4 }
        ],
        starterCode: {
            python: `def split_array(nums, k):\n    lo, hi = max(nums), sum(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        parts, cur = 1, 0\n        for x in nums:\n            if cur + x > mid: parts += 1; cur = x\n            else: cur += x\n        if parts <= k: hi = mid\n        else: lo = mid + 1\n    return lo`,
            javascript: `function splitArray(nums, k) {\n    let lo = Math.max(...nums), hi = nums.reduce((a, b) => a + b, 0);\n    while (lo < hi) {\n        const mid = Math.floor((lo + hi) / 2);\n        let parts = 1, cur = 0;\n        for (const x of nums) {\n            if (cur + x > mid) { parts++; cur = x; }\n            else cur += x;\n        }\n        if (parts <= k) hi = mid; else lo = mid + 1;\n    }\n    return lo;\n}`,
            java: `class Solution {\n    public int splitArray(int[] nums, int k) {\n        long lo = 0, hi = 0;\n        for (int x : nums) { lo = Math.max(lo, x); hi += x; }\n        while (lo < hi) {\n            long mid = (lo + hi) / 2, cur = 0; int parts = 1;\n            for (int x : nums) { if (cur + x > mid) { parts++; cur = x; } else cur += x; }\n            if (parts <= k) hi = mid; else lo = mid + 1;\n        }\n        return (int) lo;\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int splitArray(vector<int>& nums, int k) {\n        long long lo = 0, hi = 0;\n        for (int x : nums) { lo = max(lo, (long long)x); hi += x; }\n        while (lo < hi) {\n            long long mid = (lo + hi) / 2, cur = 0; int parts = 1;\n            for (int x : nums) { if (cur + x > mid) { parts++; cur = x; } else cur += x; }\n            if (parts <= k) hi = mid; else lo = mid + 1;\n        }\n        return (int)lo;\n    }\n};`,
            c: `int splitArray(const int* nums, int n, int k) {\n    long long lo = 0, hi = 0;\n    for (int i = 0; i < n; i++) { if (nums[i] > lo) lo = nums[i]; hi += nums[i]; }\n    while (lo < hi) {\n        long long mid = (lo + hi) / 2, cur = 0; int parts = 1;\n        for (int i = 0; i < n; i++) { if (cur + nums[i] > mid) { parts++; cur = nums[i]; } else cur += nums[i]; }\n        if (parts <= k) hi = mid; else lo = mid + 1;\n    }\n    return (int)lo;\n}`
        }
    },

    // 98. Reverse Pairs (#493)
    {
        id: 'reverse_pairs',
        leetcodeId: 493,
        title: 'Reverse Pairs (nums[i] > 2*nums[j])',
        difficulty: 'Hard',
        topic: 'Sorting & Intervals',
        xpReward: 120,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given integer array `nums`, return the number of important reverse pairs `(i, j)` such that `0 <= i < j < nums.length` and `nums[i] > 2 * nums[j]`.',
        examples: [
            { input: 'nums = [1, 3, 2, 3, 1]', output: '2' },
            { input: 'nums = [2, 4, 3, 5, 1]', output: '3' }
        ],
        constraints: ['1 <= nums.length <= 5 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'array', studio: 'visualize-sorting.html', studioLabel: 'Merge Sort Pair Count' },
        io: {
            pyFn: 'reverse_pairs', jsFn: 'reversePairs', javaMethod: 'reversePairs', cppMethod: 'reversePairs', cFn: 'reversePairs',
            params: [{ name: 'nums', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '2 Reverse Pairs', hidden: false, input: { nums: [1, 3, 2, 3, 1] }, expected: 2 },
            { id: 2, name: '3 Reverse Pairs', hidden: false, input: { nums: [2, 4, 3, 5, 1] }, expected: 3 },
            { id: 3, name: 'INT_MAX Safe', hidden: true, input: { nums: [2147483647, 2147483647, 2147483647] }, expected: 0 }
        ],
        starterCode: {
            python: `def reverse_pairs(nums):\n    a = list(nums)\n    def ms(l, r):\n        if r - l <= 1: return 0\n        m = (l + r) // 2\n        cnt = ms(l, m) + ms(m, r)\n        j = m\n        for i in range(l, m):\n            while j < r and a[i] > 2 * a[j]: j += 1\n            cnt += j - m\n        a[l:r] = sorted(a[l:r])\n        return cnt\n    return ms(0, len(a))`,
            javascript: `function reversePairs(nums) {\n    const a = [...nums], tmp = new Array(nums.length);\n    function ms(l, r) {\n        if (r - l <= 1) return 0;\n        const m = (l + r) >> 1;\n        let cnt = ms(l, m) + ms(m, r), j = m;\n        for (let i = l; i < m; i++) { while (j < r && a[i] > 2 * a[j]) j++; cnt += j - m; }\n        let p = l, q = m, k = 0;\n        while (p < m && q < r) tmp[k++] = a[p] <= a[q] ? a[p++] : a[q++];\n        while (p < m) tmp[k++] = a[p++];\n        while (q < r) tmp[k++] = a[q++];\n        for (let t = 0; t < k; t++) a[l + t] = tmp[t];\n        return cnt;\n    }\n    return ms(0, a.length);\n}`,
            java: `class Solution {\n    public int reversePairs(int[] nums) { return ms(nums, new int[nums.length], 0, nums.length); }\n    private int ms(int[] a, int[] tmp, int l, int r) {\n        if (r - l <= 1) return 0;\n        int m = (l + r) / 2, cnt = ms(a, tmp, l, m) + ms(a, tmp, m, r), j = m;\n        for (int i = l; i < m; i++) { while (j < r && (long) a[i] > 2L * a[j]) j++; cnt += j - m; }\n        int p = l, q = m, k = 0;\n        while (p < m && q < r) tmp[k++] = a[p] <= a[q] ? a[p++] : a[q++];\n        while (p < m) tmp[k++] = a[p++];\n        while (q < r) tmp[k++] = a[q++];\n        System.arraycopy(tmp, 0, a, l, k);\n        return cnt;\n    }\n}`,
            cpp: `#include <vector>\n#include <functional>\nusing namespace std;\n\nclass Solution {\npublic:\n    int reversePairs(vector<int>& nums) {\n        vector<int> tmp(nums.size());\n        function<int(int, int)> ms = [&](int l, int r) -> int {\n            if (r - l <= 1) return 0;\n            int m = (l + r) / 2, cnt = ms(l, m) + ms(m, r), j = m;\n            for (int i = l; i < m; i++) { while (j < r && (long long)nums[i] > 2LL * nums[j]) j++; cnt += j - m; }\n            int p = l, q = m, k = 0;\n            while (p < m && q < r) tmp[k++] = nums[p] <= nums[q] ? nums[p++] : nums[q++];\n            while (p < m) tmp[k++] = nums[p++];\n            while (q < r) tmp[k++] = nums[q++];\n            for (int t = 0; t < k; t++) nums[l + t] = tmp[t];\n            return cnt;\n        };\n        return ms(0, nums.size());\n    }\n};`,
            c: `#include <stdlib.h>\n\nstatic int _rpMs(int* a, int* tmp, int l, int r) {\n    if (r - l <= 1) return 0;\n    int m = (l + r) / 2, cnt = _rpMs(a, tmp, l, m) + _rpMs(a, tmp, m, r), j = m;\n    for (int i = l; i < m; i++) { while (j < r && (long long)a[i] > 2LL * a[j]) j++; cnt += j - m; }\n    int p = l, q = m, k = 0;\n    while (p < m && q < r) tmp[k++] = a[p] <= a[q] ? a[p++] : a[q++];\n    while (p < m) tmp[k++] = a[p++];\n    while (q < r) tmp[k++] = a[q++];\n    for (int t = 0; t < k; t++) a[l + t] = tmp[t];\n    return cnt;\n}\n\nint reversePairs(const int* nums, int n) {\n    int* a = (int*)malloc(sizeof(int) * (n ? n : 1));\n    int* tmp = (int*)malloc(sizeof(int) * (n ? n : 1));\n    for (int i = 0; i < n; i++) a[i] = nums[i];\n    int ans = _rpMs(a, tmp, 0, n);\n    free(a); free(tmp); return ans;\n}`
        }
    },

    // 99. Swim in Rising Water (#778)
    {
        id: 'swim_in_rising_water',
        leetcodeId: 778,
        title: 'Swim in Rising Water',
        difficulty: 'Hard',
        topic: 'Graphs & Shortest Path',
        xpReward: 120,
        optimalTime: 'O(n^2 log n)',
        optimalSpace: 'O(n^2)',
        description: 'On an `n x n` elevation `grid`, water depth at time `t` is `t`. Starting at `(0,0)`, return the minimum time `t` required to reach `(n-1, n-1)`.',
        examples: [
            { input: 'grid = [[0,2],[1,3]]', output: '3' },
            { input: 'grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]', output: '16' }
        ],
        constraints: ['1 <= n <= 50'],
        profileSizes: [4, 9, 25, 49, 100],
        vis: { type: 'grid', studio: 'visualize-graph.html', studioLabel: 'Minimax Dijkstra / Flood BFS' },
        io: {
            pyFn: 'swim_in_water', jsFn: 'swimInWater', javaMethod: 'swimInWater', cppMethod: 'swimInWater', cFn: 'swimInWater',
            params: [{ name: 'grid', type: 'int[][]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: '2x2 Grid', hidden: false, input: { grid: [[0, 2], [1, 3]] }, expected: 3 },
            { id: 2, name: '5x5 Spiral 16', hidden: false, input: { grid: [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]] }, expected: 16 },
            { id: 3, name: '1x1 Grid', hidden: true, input: { grid: [[0]] }, expected: 0 }
        ],
        starterCode: {
            python: `import heapq\n\ndef swim_in_water(grid):\n    n = len(grid)\n    seen = {(0, 0)}\n    pq = [(grid[0][0], 0, 0)]\n    res = 0\n    while pq:\n        t, r, c = heapq.heappop(pq)\n        res = max(res, t)\n        if r == n - 1 and c == n - 1: return res\n        for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):\n            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                heapq.heappush(pq, (grid[nr][nc], nr, nc))\n    return res`,
            javascript: `function swimInWater(grid) {\n    const n = grid.length;\n    let lo = grid[0][0], hi = n * n - 1;\n    for (const row of grid) for (const v of row) hi = Math.max(hi, v);\n    const can = (t) => {\n        if (grid[0][0] > t) return false;\n        const seen = Array.from({ length: n }, () => new Uint8Array(n));\n        const q = [[0, 0]]; seen[0][0] = 1;\n        for (let h = 0; h < q.length; h++) {\n            const [r, c] = q[h]; if (r === n - 1 && c === n - 1) return true;\n            for (const [nr, nc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]) {\n                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc] && grid[nr][nc] <= t) {\n                    seen[nr][nc] = 1; q.push([nr, nc]);\n                }\n            }\n        }\n        return false;\n    };\n    while (lo < hi) { const mid = (lo + hi) >> 1; if (can(mid)) hi = mid; else lo = mid + 1; }\n    return lo;\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int swimInWater(int[][] grid) {\n        int n = grid.length, res = 0;\n        boolean[][] seen = new boolean[n][n];\n        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));\n        pq.offer(new int[]{grid[0][0], 0, 0}); seen[0][0] = true;\n        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n        while (!pq.isEmpty()) {\n            int[] cur = pq.poll(); res = Math.max(res, cur[0]);\n            if (cur[1] == n - 1 && cur[2] == n - 1) return res;\n            for (int[] d : dirs) {\n                int nr = cur[1] + d[0], nc = cur[2] + d[1];\n                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc]) {\n                    seen[nr][nc] = true; pq.offer(new int[]{grid[nr][nc], nr, nc});\n                }\n            }\n        }\n        return res;\n    }\n}`,
            cpp: `#include <vector>\n#include <queue>\n#include <tuple>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int swimInWater(vector<vector<int>>& grid) {\n        int n = grid.size(), res = 0;\n        vector<vector<bool>> seen(n, vector<bool>(n, false));\n        typedef pair<int, pair<int, int>> Node;\n        priority_queue<Node, vector<Node>, greater<Node>> pq;\n        pq.push({grid[0][0], {0, 0}}); seen[0][0] = true;\n        const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n        while (!pq.empty()) {\n            Node cur = pq.top(); pq.pop();\n            res = max(res, cur.first);\n            int r = cur.second.first, c = cur.second.second;\n            if (r == n - 1 && c == n - 1) return res;\n            for (int k = 0; k < 4; k++) {\n                int nr = r + dr[k], nc = c + dc[k];\n                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc]) {\n                    seen[nr][nc] = true; pq.push({grid[nr][nc], {nr, nc}});\n                }\n            }\n        }\n        return res;\n    }\n};`,
            c: `#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>\n\nstatic bool _swimCan(int** g, int n, int t, bool* seen, int* qr, int* qc) {\n    if (g[0][0] > t) return false;\n    memset(seen, 0, sizeof(bool) * n * n);\n    int h = 0, tail = 0; qr[tail] = 0; qc[tail++] = 0; seen[0] = true;\n    const int dr[4] = {1,-1,0,0}, dc[4] = {0,0,1,-1};\n    while (h < tail) {\n        int r = qr[h], c = qc[h++];\n        if (r == n - 1 && c == n - 1) return true;\n        for (int k = 0; k < 4; k++) {\n            int nr = r + dr[k], nc = c + dc[k];\n            if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr * n + nc] && g[nr][nc] <= t) {\n                seen[nr * n + nc] = true; qr[tail] = nr; qc[tail++] = nc;\n            }\n        }\n    }\n    return false;\n}\n\nint swimInWater(int** grid, int n, int* cols) {\n    int lo = grid[0][0], hi = n * n - 1;\n    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (grid[r][c] > hi) hi = grid[r][c];\n    bool* seen = (bool*)malloc(sizeof(bool) * n * n);\n    int* qr = (int*)malloc(sizeof(int) * n * n);\n    int* qc = (int*)malloc(sizeof(int) * n * n);\n    while (lo < hi) { int m = (lo + hi) / 2; if (_swimCan(grid, n, m, seen, qr, qc)) hi = m; else lo = m + 1; }\n    free(seen); free(qr); free(qc); return lo;\n}`
        }
    },

    // 100. Maximum Profit in Job Scheduling (#1235)
    {
        id: 'job_scheduling',
        leetcodeId: 1235,
        title: 'Maximum Profit in Job Scheduling',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        xpReward: 120,
        optimalTime: 'O(n log n)',
        optimalSpace: 'O(n)',
        description: 'Given `n` jobs where job `i` runs `[startTime[i], endTime[i]]` with profit `profit[i]`, return the maximum profit from non-overlapping jobs.',
        examples: [
            { input: 'startTime=[1,2,3,3], endTime=[3,4,5,6], profit=[50,10,40,70]', output: '120' },
            { input: 'startTime=[1,2,3,4,6], endTime=[3,5,10,6,9], profit=[20,20,100,70,60]', output: '150' }
        ],
        constraints: ['1 <= n <= 5 * 10^4'],
        profileSizes: [20, 60, 120, 240, 480],
        vis: { type: 'dp', studio: 'visualize-dp.html', studioLabel: 'Weighted Interval DP + Binary Search' },
        io: {
            pyFn: 'job_scheduling', jsFn: 'jobScheduling', javaMethod: 'jobScheduling', cppMethod: 'jobScheduling', cFn: 'jobScheduling',
            params: [{ name: 'startTime', type: 'int[]' }, { name: 'endTime', type: 'int[]' }, { name: 'profit', type: 'int[]' }],
            returnType: 'int'
        },
        tests: [
            { id: 1, name: 'Profit 120', hidden: false, input: { startTime: [1, 2, 3, 3], endTime: [3, 4, 5, 6], profit: [50, 10, 40, 70] }, expected: 120 },
            { id: 2, name: 'Profit 150', hidden: false, input: { startTime: [1, 2, 3, 4, 6], endTime: [3, 5, 10, 6, 9], profit: [20, 20, 100, 70, 60] }, expected: 150 },
            { id: 3, name: 'Nested Single', hidden: true, input: { startTime: [1, 1, 1], endTime: [2, 3, 4], profit: [5, 6, 4] }, expected: 6 }
        ],
        starterCode: {
            python: `import bisect\n\ndef job_scheduling(startTime, endTime, profit):\n    jobs = sorted(zip(endTime, startTime, profit))\n    ends = [0]\n    dp = [0]\n    for e, s, p in jobs:\n        idx = bisect.bisect_right(ends, s) - 1\n        cur = dp[idx] + p\n        if cur > dp[-1]:\n            ends.append(e); dp.append(cur)\n    return dp[-1]`,
            javascript: `function jobScheduling(startTime, endTime, profit) {\n    const jobs = startTime.map((s, i) => [endTime[i], s, profit[i]]).sort((a, b) => a[0] - b[0]);\n    const ends = [0], dp = [0];\n    for (const [e, s, p] of jobs) {\n        let l = 0, r = ends.length;\n        while (l < r) { const m = (l + r) >> 1; if (ends[m] <= s) l = m + 1; else r = m; }\n        const cur = dp[l - 1] + p;\n        if (cur > dp[dp.length - 1]) { ends.push(e); dp.push(cur); }\n    }\n    return dp[dp.length - 1];\n}`,
            java: `import java.util.*;\n\nclass Solution {\n    public int jobScheduling(int[] startTime, int[] endTime, int[] profit) {\n        int n = startTime.length;\n        int[][] jobs = new int[n][3];\n        for (int i = 0; i < n; i++) jobs[i] = new int[]{endTime[i], startTime[i], profit[i]};\n        Arrays.sort(jobs, (a, b) -> Integer.compare(a[0], b[0]));\n        int[] dp = new int[n + 1];\n        for (int i = 0; i < n; i++) {\n            int l = 0, r = i;\n            while (l < r) { int m = (l + r) >>> 1; if (jobs[m][0] <= jobs[i][1]) l = m + 1; else r = m; }\n            dp[i + 1] = Math.max(dp[i], dp[l] + jobs[i][2]);\n        }\n        return dp[n];\n    }\n}`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {\n        int n = startTime.size();\n        vector<vector<int>> jobs(n);\n        for (int i = 0; i < n; i++) jobs[i] = {endTime[i], startTime[i], profit[i]};\n        sort(jobs.begin(), jobs.end());\n        vector<int> dp(n + 1, 0);\n        for (int i = 0; i < n; i++) {\n            int l = 0, r = i;\n            while (l < r) { int m = (l + r) / 2; if (jobs[m][0] <= jobs[i][1]) l = m + 1; else r = m; }\n            dp[i + 1] = max(dp[i], dp[l] + jobs[i][2]);\n        }\n        return dp[n];\n    }\n};`,
            c: `#include <stdlib.h>\n\ntypedef struct { int e, s, p; } _Job;\nstatic int _cmpJob(const void* a, const void* b) {\n    const _Job *x = (const _Job*)a, *y = (const _Job*)b;\n    return (x->e > y->e) - (x->e < y->e);\n}\n\nint jobScheduling(const int* startTime, int n, const int* endTime, int n2, const int* profit, int n3) {\n    _Job* jobs = (_Job*)malloc(sizeof(_Job) * n);\n    for (int i = 0; i < n; i++) { jobs[i].s = startTime[i]; jobs[i].e = endTime[i]; jobs[i].p = profit[i]; }\n    qsort(jobs, n, sizeof(_Job), _cmpJob);\n    int* dp = (int*)calloc(n + 1, sizeof(int));\n    for (int i = 0; i < n; i++) {\n        int l = 0, r = i;\n        while (l < r) { int m = (l + r) / 2; if (jobs[m].e <= jobs[i].s) l = m + 1; else r = m; }\n        int take = dp[l] + jobs[i].p;\n        dp[i + 1] = dp[i] > take ? dp[i] : take;\n    }\n    int ans = dp[n]; free(jobs); free(dp); return ans;\n}`
        }
    }
];

module.exports = HARD_PROBLEMS;
