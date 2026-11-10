/**
 * AlgoLearn Generic Multi-Language Test Harness, Skeleton Generator & Comparator
 * Supports Python, JavaScript, Java, C++, and C across 100+ DSA problems.
 */

function toCamel(str) {
    return String(str).replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
}

function getPyType(t) {
    switch (t) {
        case 'int': return 'int';
        case 'double': return 'float';
        case 'bool': return 'bool';
        case 'string': return 'str';
        case 'char[]': return 'List[str]';
        case 'int[]': return 'List[int]';
        case 'string[]': return 'List[str]';
        case 'int[][]': return 'List[List[int]]';
        case 'string[][]': return 'List[List[str]]';
        case 'char[][]': return 'List[List[str]]';
        case 'ListNode':
        case 'ListNodeCycle': return 'Optional[ListNode]';
        case 'TreeNode': return 'Optional[TreeNode]';
        case 'void_arr0':
        case 'void_char0': return 'None';
        default: return 'Any';
    }
}

function getJavaType(t) {
    switch (t) {
        case 'int': return 'int';
        case 'double': return 'double';
        case 'bool': return 'boolean';
        case 'string': return 'String';
        case 'char[]': return 'char[]';
        case 'int[]': return 'int[]';
        case 'string[]': return 'String[]';
        case 'int[][]': return 'int[][]';
        case 'string[][]': return 'List<List<String>>';
        case 'char[][]': return 'char[][]';
        case 'ListNode':
        case 'ListNodeCycle': return 'ListNode';
        case 'TreeNode': return 'TreeNode';
        case 'void_arr0':
        case 'void_char0': return 'void';
        default: return 'int';
    }
}

function getCppType(t, isParam = true) {
    switch (t) {
        case 'int': return 'int';
        case 'double': return 'double';
        case 'bool': return 'bool';
        case 'string': return 'string';
        case 'char[]': return isParam ? 'vector<char>&' : 'vector<char>';
        case 'int[]': return isParam ? 'vector<int>&' : 'vector<int>';
        case 'string[]': return isParam ? 'vector<string>&' : 'vector<string>';
        case 'int[][]': return isParam ? 'vector<vector<int>>&' : 'vector<vector<int>>';
        case 'string[][]': return isParam ? 'vector<vector<string>>&' : 'vector<vector<string>>';
        case 'char[][]': return isParam ? 'vector<vector<char>>&' : 'vector<vector<char>>';
        case 'ListNode':
        case 'ListNodeCycle': return 'ListNode*';
        case 'TreeNode': return 'TreeNode*';
        case 'void_arr0':
        case 'void_char0': return 'void';
        default: return 'int';
    }
}

function getCParamSig(p) {
    switch (p.type) {
        case 'int': return `int ${p.name}`;
        case 'double': return `double ${p.name}`;
        case 'bool': return `bool ${p.name}`;
        case 'string': return `char* ${p.name}`;
        case 'char[]': return `char* ${p.name}, int ${p.name}Size`;
        case 'int[]': return p.mut ? `int* ${p.name}, int ${p.name}Size` : `const int* ${p.name}, int ${p.name}Size`;
        case 'string[]': return `char** ${p.name}, int ${p.name}Size`;
        case 'int[][]': return `int** ${p.name}, int ${p.name}Size, int* ${p.name}ColSize`;
        case 'char[][]': return `char** ${p.name}, int ${p.name}Size, int* ${p.name}ColSize`;
        case 'ListNode':
        case 'ListNodeCycle': return `struct ListNode* ${p.name}`;
        case 'TreeNode': return `struct TreeNode* ${p.name}`;
        default: return `int ${p.name}`;
    }
}

function getCReturnType(t) {
    switch (t) {
        case 'int': return 'int';
        case 'double': return 'double';
        case 'bool': return 'bool';
        case 'string': return 'char*';
        case 'int[]': return 'int*';
        case 'string[]': return 'char**';
        case 'int[][]': return 'int**';
        case 'string[][]': return 'char***';
        case 'ListNode': return 'struct ListNode*';
        case 'TreeNode': return 'struct TreeNode*';
        case 'void_arr0':
        case 'void_char0': return 'void';
        default: return 'int';
    }
}

function generateDuelSkeleton(problem) {
    if (problem.duelSkeletons) return problem.duelSkeletons;
    const io = problem.io;
    if (!io) return problem.starterCode || {};

    const params = io.params || [];
    const ret = io.returnType;
    const pyFn = io.pyFn || toCamel(problem.id);
    const jsFn = io.jsFn || toCamel(problem.id);
    const javaFn = io.javaMethod || jsFn;
    const cppFn = io.cppMethod || jsFn;
    const cFn = io.cFn || jsFn;
    const javaRet = io.javaReturn || getJavaType(ret);
    const cppRet = getCppType(ret, false);
    const cRet = getCReturnType(ret);

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const listCommentPy = hasList ? `# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n` : '';
    const treeCommentPy = hasTree ? `# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val; self.left = left; self.right = right\n` : '';
    const nodeCommentJs = (hasList ? `// function ListNode(val, next) { this.val = val; this.next = next || null; }\n` : '') +
        (hasTree ? `// function TreeNode(val, left, right) { this.val = val; this.left = left || null; this.right = right || null; }\n` : '');
    const nodeCommentCStyle = (hasList ? `/* struct ListNode { int val; ListNode *next; }; */\n` : '') +
        (hasTree ? `/* struct TreeNode { int val; TreeNode *left; TreeNode *right; }; */\n` : '');

    const defaultVal = (lang, rType) => {
        if (lang === 'python') {
            if (rType === 'void_arr0' || rType === 'void_char0') return '';
            if (rType === 'int') return '0';
            if (rType === 'double') return '0.0';
            if (rType === 'bool') return 'False';
            if (rType === 'string') return '""';
            if (rType === 'ListNode' || rType === 'TreeNode') return 'None';
            return '[]';
        }
        if (lang === 'javascript') {
            if (rType === 'void_arr0' || rType === 'void_char0') return '';
            if (rType === 'int' || rType === 'double') return '0';
            if (rType === 'bool') return 'false';
            if (rType === 'string') return '""';
            if (rType === 'ListNode' || rType === 'TreeNode') return 'null';
            return '[]';
        }
        if (lang === 'java') {
            if (rType === 'void_arr0' || rType === 'void_char0') return '';
            if (rType === 'int') return '0';
            if (rType === 'double') return '0.0';
            if (rType === 'bool') return 'false';
            if (rType === 'string') return '""';
            if (rType === 'ListNode' || rType === 'TreeNode') return 'null';
            if (javaRet.startsWith('List<')) return 'new ArrayList<>()';
            if (rType === 'int[]') return 'new int[]{}';
            if (rType === 'int[][]') return 'new int[0][0]';
            if (rType === 'string[]') return 'new String[]{}';
            return 'null';
        }
        if (lang === 'cpp') {
            if (rType === 'void_arr0' || rType === 'void_char0') return '';
            if (rType === 'int') return '0';
            if (rType === 'double') return '0.0';
            if (rType === 'bool') return 'false';
            if (rType === 'string') return '""';
            if (rType === 'ListNode' || rType === 'TreeNode') return 'nullptr';
            return '{}';
        }
        return '0';
    };

    const pyParamsStr = params.map(p => p.name).join(', ');
    const jsParamsStr = params.map(p => p.name).join(', ');
    const javaParamsStr = params.map(p => `${getJavaType(p.type)} ${p.name}`).join(', ');
    const cppParamsStr = params.map(p => `${getCppType(p.type, true)} ${p.name}`).join(', ');

    // C skeleton
    let cSkeleton = '';
    if (io.cSkeleton) {
        cSkeleton = io.cSkeleton;
    } else {
        const cPList = params.map(getCParamSig);
        if (ret === 'int[]' || ret === 'string[]') {
            cPList.push('int* returnSize');
        } else if (ret === 'int[][]' || ret === 'string[][]') {
            cPList.push('int* returnSize', 'int** returnColumnSizes');
        }
        const cParamStr = cPList.length ? cPList.join(', ') : 'void';
        let cBody = '    return 0;';
        if (ret === 'void_arr0' || ret === 'void_char0') cBody = '    // Modify in-place';
        else if (ret === 'bool') cBody = '    return false;';
        else if (ret === 'double') cBody = '    return 0.0;';
        else if (ret === 'string') cBody = '    return "";';
        else if (ret === 'ListNode' || ret === 'TreeNode') cBody = '    return NULL;';
        else if (ret === 'int[]' || ret === 'string[]') cBody = '    *returnSize = 0;\n    return NULL;';
        else if (ret === 'int[][]' || ret === 'string[][]') cBody = '    *returnSize = 0;\n    *returnColumnSizes = NULL;\n    return NULL;';

        const cHdr = (ret === 'bool' ? '#include <stdbool.h>\n' : '') + '#include <stdlib.h>\n';
        cSkeleton = `${nodeCommentCStyle}${cHdr}\n${cRet} ${cFn}(${cParamStr}) {\n${cBody}\n}`;
    }

    const pyRetLine = ret === 'void_arr0' || ret === 'void_char0' ? '    pass' : `    return ${defaultVal('python', ret)}`;
    const jsRetLine = ret === 'void_arr0' || ret === 'void_char0' ? '    // Modify first parameter in-place' : `    return ${defaultVal('javascript', ret)};`;
    const javaRetLine = ret === 'void_arr0' || ret === 'void_char0' ? '        // Modify first parameter in-place' : `        return ${defaultVal('java', ret)};`;
    const cppRetLine = ret === 'void_arr0' || ret === 'void_char0' ? '        // Modify first parameter in-place' : `        return ${defaultVal('cpp', ret)};`;

    return {
        python: `${listCommentPy}${treeCommentPy}def ${pyFn}(${pyParamsStr}):\n    # Implement your solution (${problem.optimalTime || 'optimal'})\n${pyRetLine}`,
        javascript: `${nodeCommentJs}function ${jsFn}(${jsParamsStr}) {\n    // Implement your solution (${problem.optimalTime || 'optimal'})\n${jsRetLine}\n}`,
        java: `${nodeCommentCStyle}import java.util.*;\n\nclass Solution {\n    public ${javaRet} ${javaFn}(${javaParamsStr}) {\n${javaRetLine}\n    }\n}`,
        cpp: `${nodeCommentCStyle}#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppRet} ${cppFn}(${cppParamsStr}) {\n${cppRetLine}\n    }\n};`,
        c: cSkeleton
    };
}

// ============================================================================
// Comparison Logic
// ============================================================================

function normalizeNestedArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
        .map(sub => Array.isArray(sub) ? [...sub].map(x => (typeof x === 'number' || typeof x === 'string') ? x : JSON.stringify(x)) : [sub])
        .map(sub => {
            const copy = [...sub];
            if (copy.every(v => typeof v === 'number')) copy.sort((a, b) => a - b);
            else copy.sort();
            return copy;
        })
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function compareTestOutput(problem, testCase, actual) {
    const problemId = typeof problem === 'string' ? problem : problem.id;
    const mode = (typeof problem === 'object' && problem.io && problem.io.compareMode) || 'exact';

    if (actual === undefined) return false;

    if (problemId === 'two_sum' || mode === 'two_sum_pair') {
        const nums = testCase.input.nums;
        const target = testCase.input.target;
        return (
            Array.isArray(actual) &&
            actual.length === 2 &&
            Number.isInteger(actual[0]) &&
            Number.isInteger(actual[1]) &&
            actual[0] !== actual[1] &&
            actual[0] >= 0 && actual[0] < nums.length &&
            actual[1] >= 0 && actual[1] < nums.length &&
            nums[actual[0]] + nums[actual[1]] === target
        );
    }

    if (mode === 'float') {
        if (actual === null) return false;
        return Math.abs(Number(actual) - Number(testCase.expected)) <= 1e-4;
    }

    if (mode === 'unordered_arr') {
        if (!Array.isArray(actual) || !Array.isArray(testCase.expected)) return false;
        if (actual.length !== testCase.expected.length) return false;
        const a = [...actual].sort((x, y) => Number(x) - Number(y));
        const b = [...testCase.expected].sort((x, y) => Number(x) - Number(y));
        return JSON.stringify(a) === JSON.stringify(b);
    }

    if (mode === 'unordered_strings') {
        if (!Array.isArray(actual) || !Array.isArray(testCase.expected)) return false;
        if (actual.length !== testCase.expected.length) return false;
        const a = [...actual].map(String).sort();
        const b = [...testCase.expected].map(String).sort();
        return JSON.stringify(a) === JSON.stringify(b);
    }

    if (mode === 'unordered_nested') {
        if (!Array.isArray(actual) || !Array.isArray(testCase.expected)) return false;
        return JSON.stringify(normalizeNestedArray(actual)) === JSON.stringify(normalizeNestedArray(testCase.expected));
    }

    if (typeof testCase.expected === 'boolean') {
        if (actual === null) return false;
        if (typeof actual === 'number') return Boolean(actual) === testCase.expected;
        return Boolean(actual) === testCase.expected;
    }

    if (typeof testCase.expected === 'number') {
        if (actual === null) return false;
        return Number(actual) === testCase.expected;
    }

    // Trim trailing nulls for binary tree level-order serialization
    if (problem && problem.io && problem.io.returnType === 'TreeNode' && Array.isArray(actual) && Array.isArray(testCase.expected)) {
        const trim = (arr) => {
            const c = [...arr];
            while (c.length > 0 && (c[c.length - 1] === null || c[c.length - 1] === undefined)) c.pop();
            return c;
        };
        return JSON.stringify(trim(actual)) === JSON.stringify(trim(testCase.expected));
    }

    return JSON.stringify(actual) === JSON.stringify(testCase.expected);
}

// ============================================================================
// Python Harness
// ============================================================================

function buildPythonHarness(problem, userCode, tests) {
    const io = problem.io;
    const pyFn = io.pyFn || toCamel(problem.id);
    const params = io.params || [];
    const ret = io.returnType;

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const nodeHelpers = `
${hasList && !/^\s*class\s+ListNode\b/m.test(userCode) ? `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
` : ''}
${hasTree && !/^\s*class\s+TreeNode\b/m.test(userCode) ? `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
` : ''}
def _al_build_list(arr, pos=-1):
    if not arr: return None
    nodes = [ListNode(v) for v in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos is not None and pos >= 0 and pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0]

def _al_list_to_arr(head):
    res, seen = [], set()
    while head and id(head) not in seen and len(res) < 5000:
        seen.add(id(head))
        res.append(head.val)
        head = head.next
    return res

def _al_build_tree(arr):
    if not arr or arr[0] is None: return None
    root = TreeNode(arr[0])
    q = deque([root])
    i = 1
    while q and i < len(arr):
        node = q.popleft()
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            q.append(node.right)
        i += 1
    return root

def _al_tree_to_arr(root):
    if not root: return []
    res, q = [], deque([root])
    while q:
        node = q.popleft()
        if node is None:
            res.append(None)
        else:
            res.append(node.val)
            q.append(node.left)
            q.append(node.right)
    while res and res[-1] is None:
        res.pop()
    return res
`;

    const argExprs = params.map(p => {
        if (p.type === 'int[]') return `list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'char[]') return `list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'string[]') return `list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'int[][]') return `[row[:] for row in tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'char[][]') return `[list(row) for row in tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'ListNode') return `_al_build_list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'ListNodeCycle') return `_al_build_list(tc[${JSON.stringify(p.name)}], tc.get("pos", -1))`;
        if (p.type === 'TreeNode') return `_al_build_tree(tc[${JSON.stringify(p.name)}])`;
        return `tc[${JSON.stringify(p.name)}]`;
    });

    let invokeBlock = '';
    if (ret === 'void_arr0' || ret === 'void_char0') {
        invokeBlock = `
        _arg0 = ${argExprs[0]}
        ${pyFn}(_arg0${argExprs.length > 1 ? ', ' + argExprs.slice(1).join(', ') : ''})
        ans = _arg0`;
    } else if (ret === 'ListNode') {
        invokeBlock = `        ans = _al_list_to_arr(${pyFn}(${argExprs.join(', ')}))`;
    } else if (ret === 'TreeNode') {
        invokeBlock = `        ans = _al_tree_to_arr(${pyFn}(${argExprs.join(', ')}))`;
    } else {
        invokeBlock = `        ans = ${pyFn}(${argExprs.join(', ')})`;
    }

    return `import json, time, math, bisect, heapq
from collections import defaultdict, Counter, deque
from functools import lru_cache
from typing import List, Optional, Dict, Set, Tuple
${nodeHelpers}
${userCode}

__TESTS__ = json.loads(${JSON.stringify(JSON.stringify(tests.map(tc => tc.input)))})
__RESULTS__ = []
for idx, tc in enumerate(__TESTS__):
    t0 = time.perf_counter()
    try:
${invokeBlock}
        dt = round((time.perf_counter() - t0) * 1000, 3)
        __RESULTS__.append({"ok": True, "actual": ans, "runtimeMs": dt})
    except Exception as ex:
        dt = round((time.perf_counter() - t0) * 1000, 3)
        __RESULTS__.append({"ok": False, "error": f"{type(ex).__name__}: {ex}", "runtimeMs": dt})

with open("result.json", "w", encoding="utf-8") as f:
    json.dump(__RESULTS__, f)
`;
}

// ============================================================================
// JavaScript Harness
// ============================================================================

function buildJavaScriptHarness(problem, userCode, tests) {
    const io = problem.io;
    const jsFn = io.jsFn || toCamel(problem.id);
    const params = io.params || [];
    const ret = io.returnType;

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const nodeHelpers = `
${hasList && !/\b(?:function|class)\s+ListNode\b/.test(userCode) ? `
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}
` : ''}
${hasTree && !/\b(?:function|class)\s+TreeNode\b/.test(userCode) ? `
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}
` : ''}
function _alBuildList(arr, pos = -1) {
    if (!arr || !arr.length) return null;
    const nodes = arr.map(v => new ListNode(v));
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
    if (typeof pos === 'number' && pos >= 0 && pos < nodes.length) nodes[nodes.length - 1].next = nodes[pos];
    return nodes[0];
}
function _alListToArr(head) {
    const res = [], seen = new Set();
    let cur = head;
    while (cur && !seen.has(cur) && res.length < 5000) {
        seen.add(cur);
        res.push(cur.val);
        cur = cur.next;
    }
    return res;
}
function _alBuildTree(arr) {
    if (!arr || !arr.length || arr[0] === null) return null;
    const root = new TreeNode(arr[0]);
    const q = [root];
    let i = 1;
    while (q.length && i < arr.length) {
        const node = q.shift();
        if (i < arr.length && arr[i] !== null) {
            node.left = new TreeNode(arr[i]);
            q.push(node.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
            node.right = new TreeNode(arr[i]);
            q.push(node.right);
        }
        i++;
    }
    return root;
}
function _alTreeToArr(root) {
    if (!root) return [];
    const res = [], q = [root];
    while (q.length) {
        const node = q.shift();
        if (!node) res.push(null);
        else {
            res.push(node.val);
            q.push(node.left || null);
            q.push(node.right || null);
        }
    }
    while (res.length && res[res.length - 1] === null) res.pop();
    return res;
}
`;

    const argExprs = params.map(p => {
        if (p.type === 'int[]' || p.type === 'string[]') return `[...tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'char[]') return `Array.isArray(tc[${JSON.stringify(p.name)}]) ? [...tc[${JSON.stringify(p.name)}]] : String(tc[${JSON.stringify(p.name)}]).split('')`;
        if (p.type === 'int[][]') return `tc[${JSON.stringify(p.name)}].map(r => [...r])`;
        if (p.type === 'char[][]') return `tc[${JSON.stringify(p.name)}].map(r => Array.isArray(r) ? [...r] : String(r).split(''))`;
        if (p.type === 'ListNode') return `_alBuildList(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'ListNodeCycle') return `_alBuildList(tc[${JSON.stringify(p.name)}], tc.pos ?? -1)`;
        if (p.type === 'TreeNode') return `_alBuildTree(tc[${JSON.stringify(p.name)}])`;
        return `tc[${JSON.stringify(p.name)}]`;
    });

    let invokeBlock = '';
    if (ret === 'void_arr0' || ret === 'void_char0') {
        invokeBlock = `
        const _arg0 = ${argExprs[0]};
        ${jsFn}(_arg0${argExprs.length > 1 ? ', ' + argExprs.slice(1).join(', ') : ''});
        const ans = _arg0;`;
    } else if (ret === 'ListNode') {
        invokeBlock = `        const ans = _alListToArr(${jsFn}(${argExprs.join(', ')}));`;
    } else if (ret === 'TreeNode') {
        invokeBlock = `        const ans = _alTreeToArr(${jsFn}(${argExprs.join(', ')}));`;
    } else {
        invokeBlock = `        const ans = ${jsFn}(${argExprs.join(', ')});`;
    }

    return `const fs = require('fs');
${nodeHelpers}
${userCode}

const __TESTS__ = ${JSON.stringify(tests.map(tc => tc.input))};
const __RESULTS__ = [];
for (let idx = 0; idx < __TESTS__.length; idx++) {
    const tc = __TESTS__[idx];
    const t0 = process.hrtime.bigint();
    try {
${invokeBlock}
        const dt = Number(process.hrtime.bigint() - t0) / 1e6;
        __RESULTS__.push({ ok: true, actual: ans, runtimeMs: Math.round(dt * 1000) / 1000 });
    } catch (ex) {
        const dt = Number(process.hrtime.bigint() - t0) / 1e6;
        __RESULTS__.push({ ok: false, error: ex.name + ': ' + ex.message, runtimeMs: Math.round(dt * 1000) / 1000 });
    }
}
fs.writeFileSync('result.json', JSON.stringify(__RESULTS__));
`;
}

// ============================================================================
// Java Harness
// ============================================================================

function toJavaLiteral(val, type, tcInput) {
    if (type === 'int') return String(Number(val));
    if (type === 'double') return String(Number(val));
    if (type === 'bool') return val ? 'true' : 'false';
    if (type === 'string') return JSON.stringify(String(val));
    if (type === 'char[]') {
        const chars = Array.isArray(val) ? val : String(val).split('');
        return `new char[]{${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}`;
    }
    if (type === 'int[]') return `new int[]{${(val || []).join(',')}}`;
    if (type === 'string[]') return `new String[]{${(val || []).map(s => JSON.stringify(String(s))).join(',')}}`;
    if (type === 'int[][]') return `new int[][]{${(val || []).map(r => `{${r.join(',')}}`).join(',')}}`;
    if (type === 'char[][]') {
        const rows = (val || []).map(r => {
            const chars = Array.isArray(r) ? r : String(r).split('');
            return `{${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}`;
        });
        return `new char[][]{${rows.join(',')}}`;
    }
    if (type === 'ListNode') {
        return `buildList(new int[]{${(val || []).join(',')}}, -1)`;
    }
    if (type === 'ListNodeCycle') {
        const pos = tcInput && typeof tcInput.pos === 'number' ? tcInput.pos : -1;
        return `buildList(new int[]{${(val || []).join(',')}}, ${pos})`;
    }
    if (type === 'TreeNode') {
        const items = (val || []).map(x => (x === null || x === undefined) ? 'null' : String(x));
        return `buildTree(new Integer[]{${items.join(',')}})`;
    }
    return String(val);
}

function buildJavaHarness(problem, userCode, tests) {
    const extraImports = [];
    const cleanUserCode = userCode
        .replace(/^\s*package\s+[^;]+;/gm, '')
        .replace(/^\s*(import\s+[^;]+;)/gm, (_, imp) => {
            if (!/java\.util\.\*/.test(imp) && !/java\.io\.\*/.test(imp)) extraImports.push(imp.trim());
            return '';
        })
        .replace(/\bpublic\s+class\s+Solution\b/g, 'class Solution');

    const io = problem.io;
    const javaFn = io.javaMethod || io.jsFn || toCamel(problem.id);
    const params = io.params || [];
    const ret = io.returnType;

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const listDecl = !/\bclass\s+ListNode\s*\{/.test(cleanUserCode) ? `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
` : '';
    const treeDecl = !/\bclass\s+TreeNode\s*\{/.test(cleanUserCode) ? `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
` : '';

    let bodyCases = '';
    tests.forEach((tc, i) => {
        const declArgs = params.map((p, idx) => `${getJavaType(p.type)} _a${idx} = ${toJavaLiteral(tc.input[p.name], p.type, tc.input)};`).join('\n                ');
        const argNames = params.map((_, idx) => `_a${idx}`).join(', ');

        let callLine = '';
        if (ret === 'void_arr0' || ret === 'void_char0') {
            callLine = `sol.${javaFn}(${argNames});
                double dt = (System.nanoTime() - t0) / 1e6;
                sb.append("{\\"ok\\":true,\\"actual\\":").append(toJson(_a0)).append(",\\"runtimeMs\\":").append(dt).append("}");`;
        } else {
            callLine = `var ans = sol.${javaFn}(${argNames});
                double dt = (System.nanoTime() - t0) / 1e6;
                sb.append("{\\"ok\\":true,\\"actual\\":").append(toJson(ans)).append(",\\"runtimeMs\\":").append(dt).append("}");`;
        }

        bodyCases += `
            try {
                ${declArgs}
                long t0 = System.nanoTime();
                ${callLine}
            } catch (Throwable ex) {
                sb.append("{\\"ok\\":false,\\"error\\":").append(jsonStr(ex.toString())).append(",\\"runtimeMs\\":0}");
            }`;
        if (i < tests.length - 1) bodyCases += `\n            sb.append(",");`;
    });

    return `import java.util.*;
import java.io.*;
${extraImports.join('\n')}
${hasList ? listDecl : ''}
${hasTree ? treeDecl : ''}
${cleanUserCode}

public class JudgeRunner {
${hasList ? `    static ListNode buildList(int[] arr, int pos) {
        if (arr == null || arr.length == 0) return null;
        ListNode[] nodes = new ListNode[arr.length];
        for (int i = 0; i < arr.length; i++) nodes[i] = new ListNode(arr[i]);
        for (int i = 0; i < arr.length - 1; i++) nodes[i].next = nodes[i + 1];
        if (pos >= 0 && pos < arr.length) nodes[arr.length - 1].next = nodes[pos];
        return nodes[0];
    }` : ''}
${hasTree ? `    static TreeNode buildTree(Integer[] arr) {
        if (arr == null || arr.length == 0 || arr[0] == null) return null;
        TreeNode root = new TreeNode(arr[0]);
        Queue<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.length) {
            TreeNode node = q.poll();
            if (i < arr.length && arr[i] != null) {
                node.left = new TreeNode(arr[i]);
                q.offer(node.left);
            }
            i++;
            if (i < arr.length && arr[i] != null) {
                node.right = new TreeNode(arr[i]);
                q.offer(node.right);
            }
            i++;
        }
        return root;
    }` : ''}
    static String toJson(int v) { return String.valueOf(v); }
    static String toJson(long v) { return String.valueOf(v); }
    static String toJson(double v) { return String.valueOf(v); }
    static String toJson(boolean v) { return v ? "true" : "false"; }
    static String toJson(String s) { return jsonStr(s); }
    static String toJson(int[] a) {
        if (a == null) return "null";
        StringBuilder s = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { if (i > 0) s.append(","); s.append(a[i]); }
        return s.append("]").toString();
    }
    static String toJson(char[] a) {
        if (a == null) return "null";
        StringBuilder s = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { if (i > 0) s.append(","); s.append(jsonStr(String.valueOf(a[i]))); }
        return s.append("]").toString();
    }
    static String toJson(String[] a) {
        if (a == null) return "null";
        StringBuilder s = new StringBuilder("[");
        for (int i = 0; i < a.length; i++) { if (i > 0) s.append(","); s.append(jsonStr(a[i])); }
        return s.append("]").toString();
    }
    static String toJson(int[][] m) {
        if (m == null) return "null";
        StringBuilder s = new StringBuilder("[");
        for (int i = 0; i < m.length; i++) { if (i > 0) s.append(","); s.append(toJson(m[i])); }
        return s.append("]").toString();
    }
    static String toJson(List<?> list) {
        if (list == null) return "null";
        StringBuilder s = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) s.append(",");
            Object item = list.get(i);
            if (item == null) s.append("null");
            else if (item instanceof List<?>) s.append(toJson((List<?>) item));
            else if (item instanceof int[]) s.append(toJson((int[]) item));
            else if (item instanceof String) s.append(jsonStr((String) item));
            else if (item instanceof Boolean || item instanceof Number) s.append(item.toString());
            else s.append(jsonStr(item.toString()));
        }
        return s.append("]").toString();
    }
${hasList ? `    static String toJson(ListNode head) {
        StringBuilder s = new StringBuilder("[");
        Set<ListNode> seen = new HashSet<>();
        int count = 0;
        while (head != null && !seen.contains(head) && count++ < 5000) {
            seen.add(head);
            if (s.length() > 1) s.append(",");
            s.append(head.val);
            head = head.next;
        }
        return s.append("]").toString();
    }` : ''}
${hasTree ? `    static String toJson(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n == null) out.add("null");
            else {
                out.add(String.valueOf(n.val));
                q.offer(n.left);
                q.offer(n.right);
            }
        }
        int end = out.size();
        while (end > 0 && "null".equals(out.get(end - 1))) end--;
        return "[" + String.join(",", out.subList(0, end)) + "]";
    }` : ''}
    static String jsonStr(String x) {
        if (x == null) return "null";
        return "\\"" + x.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "") + "\\"";
    }
    public static void main(String[] args) throws Exception {
        Solution sol = new Solution();
        StringBuilder sb = new StringBuilder("[");
        ${bodyCases}
        sb.append("]");
        try (PrintWriter pw = new PrintWriter("result.json", "UTF-8")) {
            pw.print(sb.toString());
        }
    }
}
`;
}

// ============================================================================
// C++ Harness
// ============================================================================

function toCppLiteral(val, type, tcInput) {
    if (type === 'int' || type === 'double') return String(Number(val));
    if (type === 'bool') return val ? 'true' : 'false';
    if (type === 'string') return JSON.stringify(String(val));
    if (type === 'char[]') {
        const chars = Array.isArray(val) ? val : String(val).split('');
        return `{${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}`;
    }
    if (type === 'int[]') return `{${(val || []).join(',')}}`;
    if (type === 'string[]') return `{${(val || []).map(s => JSON.stringify(String(s))).join(',')}}`;
    if (type === 'int[][]') return `{${(val || []).map(r => `{${r.join(',')}}`).join(',')}}`;
    if (type === 'char[][]') {
        const rows = (val || []).map(r => {
            const chars = Array.isArray(r) ? r : String(r).split('');
            return `{${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}`;
        });
        return `{${rows.join(',')}}`;
    }
    if (type === 'ListNode') return `_alBuildList({${(val || []).join(',')}}, -1)`;
    if (type === 'ListNodeCycle') {
        const pos = tcInput && typeof tcInput.pos === 'number' ? tcInput.pos : -1;
        return `_alBuildList({${(val || []).join(',')}}, ${pos})`;
    }
    if (type === 'TreeNode') {
        const vals = (val || []).map(v => (v === null || v === undefined) ? 'INT_MIN' : String(v));
        return `_alBuildTree({${vals.join(',')}})`;
    }
    return String(val);
}

function buildCppHarness(problem, userCode, tests) {
    const io = problem.io;
    const cppFn = io.cppMethod || io.jsFn || toCamel(problem.id);
    const params = io.params || [];
    const ret = io.returnType;

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const listDecl = !/\b(struct|class)\s+ListNode\s*\{/.test(userCode) ? `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
` : '';
    const treeDecl = !/\b(struct|class)\s+TreeNode\s*\{/.test(userCode) ? `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
` : '';

    let casesCode = '';
    tests.forEach((tc, i) => {
        const decls = params.map((p, idx) => {
            const cType = getCppType(p.type, false);
            return `${cType} _a${idx} = ${toCppLiteral(tc.input[p.name], p.type, tc.input)};`;
        }).join('\n        ');
        const argsStr = params.map((_, idx) => `_a${idx}`).join(', ');

        if (ret === 'void_arr0' || ret === 'void_char0') {
            casesCode += `
    {
        ${decls}
        auto t0 = chrono::high_resolution_clock::now();
        sol.${cppFn}(${argsStr});
        double dt = chrono::duration<double, milli>(chrono::high_resolution_clock::now() - t0).count();
        out << "{\\"ok\\":true,\\"actual\\":" << _toJson(_a0) << ",\\"runtimeMs\\":" << dt << "}";
    }`;
        } else {
            const retCpp = getCppType(ret, false);
            casesCode += `
    {
        ${decls}
        auto t0 = chrono::high_resolution_clock::now();
        ${retCpp} ans = sol.${cppFn}(${argsStr});
        double dt = chrono::duration<double, milli>(chrono::high_resolution_clock::now() - t0).count();
        out << "{\\"ok\\":true,\\"actual\\":" << _toJson(ans) << ",\\"runtimeMs\\":" << dt << "}";
    }`;
        }
        if (i < tests.length - 1) casesCode += `\n    out << ",";`;
    });

    return `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <deque>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <climits>
#include <chrono>
#include <fstream>
#include <sstream>
#include <functional>
using namespace std;
${hasList ? listDecl : ''}
${hasTree ? treeDecl : ''}
${hasList ? `
static ListNode* _alBuildList(const vector<int>& vals, int pos) {
    if (vals.empty()) return nullptr;
    vector<ListNode*> nodes;
    for (int v : vals) nodes.push_back(new ListNode(v));
    for (size_t i = 0; i + 1 < nodes.size(); i++) nodes[i]->next = nodes[i + 1];
    if (pos >= 0 && pos < (int)nodes.size()) nodes.back()->next = nodes[pos];
    return nodes[0];
}
` : ''}
${hasTree ? `
static TreeNode* _alBuildTree(const vector<int>& vals) {
    if (vals.empty() || vals[0] == INT_MIN) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* cur = q.front(); q.pop();
        if (i < vals.size() && vals[i] != INT_MIN) { cur->left = new TreeNode(vals[i]); q.push(cur->left); }
        i++;
        if (i < vals.size() && vals[i] != INT_MIN) { cur->right = new TreeNode(vals[i]); q.push(cur->right); }
        i++;
    }
    return root;
}
` : ''}
${userCode}

static string _jsonStr(const string& x) {
    string r = "\\"";
    for (char c : x) {
        if (c == '\\\\') r += "\\\\\\\\";
        else if (c == '"') r += "\\\\\\"";
        else if (c == '\\n') r += "\\\\n";
        else if (c != '\\r') r += c;
    }
    return r + "\\"";
}
static string _toJson(int v) { return to_string(v); }
static string _toJson(double v) { ostringstream ss; ss << v; return ss.str(); }
static string _toJson(bool v) { return v ? "true" : "false"; }
static string _toJson(const string& v) { return _jsonStr(v); }
static string _toJson(const vector<int>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}
static string _toJson(const vector<char>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _jsonStr(string(1, v[i])); }
    return s + "]";
}
static string _toJson(const vector<string>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _jsonStr(v[i]); }
    return s + "]";
}
static string _toJson(const vector<vector<int>>& m) {
    string s = "[";
    for (size_t i = 0; i < m.size(); i++) { if (i) s += ","; s += _toJson(m[i]); }
    return s + "]";
}
static string _toJson(const vector<vector<string>>& m) {
    string s = "[";
    for (size_t i = 0; i < m.size(); i++) { if (i) s += ","; s += _toJson(m[i]); }
    return s + "]";
}
${hasList ? `
static string _toJson(ListNode* head) {
    string s = "[";
    unordered_set<ListNode*> seen;
    int cnt = 0;
    while (head && !seen.count(head) && cnt++ < 5000) {
        seen.insert(head);
        if (s.size() > 1) s += ",";
        s += to_string(head->val);
        head = head->next;
    }
    return s + "]";
}
` : ''}
${hasTree ? `
static string _toJson(TreeNode* root) {
    if (!root) return "[]";
    vector<string> out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        if (!n) out.push_back("null");
        else {
            out.push_back(to_string(n->val));
            q.push(n->left);
            q.push(n->right);
        }
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string s = "[";
    for (size_t i = 0; i < out.size(); i++) { if (i) s += ","; s += out[i]; }
    return s + "]";
}
` : ''}

int main() {
    Solution sol;
    ofstream out("result.json");
    out << "[";
    ${casesCode}
    out << "]";
    out.close();
    return 0;
}
`;
}

// ============================================================================
// C Harness (Supports legacy 3 custom signatures + uniform LeetCode C signatures)
// ============================================================================

function buildLegacyCHarness(problem, userCode, tests) {
    let casesCode = '';
    tests.forEach((tc, i) => {
        if (problem.id === 'two_sum') {
            casesCode += `
    {
        int nums[] = {${tc.input.nums.join(',')}};
        int outIdx[2] = {-1, -1};
        clock_t t0 = clock();
        twoSum(nums, ${tc.input.nums.length}, ${tc.input.target}, outIdx);
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":[%d,%d],\\"runtimeMs\\":%.3f}", outIdx[0], outIdx[1], dt);
    }`;
        } else if (problem.id === 'valid_parentheses') {
            casesCode += `
    {
        const char* s = ${JSON.stringify(tc.input.s)};
        clock_t t0 = clock();
        int ans = isValid(s);
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":%s,\\"runtimeMs\\":%.3f}", ans ? "true" : "false", dt);
    }`;
        } else if (problem.id === 'merge_intervals') {
            const init = tc.input.intervals.map(r => `{${r[0]},${r[1]}}`).join(',');
            casesCode += `
    {
        int iv[][2] = {${init}};
        int outMat[${tc.input.intervals.length + 2}][2];
        clock_t t0 = clock();
        int cnt = mergeIntervals(iv, ${tc.input.intervals.length}, outMat);
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":[");
        for (int k = 0; k < cnt; k++) {
            fprintf(fp, "%s[%d,%d]", k ? "," : "", outMat[k][0], outMat[k][1]);
        }
        fprintf(fp, "],\\"runtimeMs\\":%.3f}", dt);
    }`;
        }
        if (i < tests.length - 1) casesCode += `\n    fprintf(fp, ",");`;
    });

    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

${userCode}

int main(void) {
    FILE *fp = fopen("result.json", "w");
    if (!fp) return 1;
    fprintf(fp, "[");
    ${casesCode}
    fprintf(fp, "]");
    fclose(fp);
    return 0;
}
`;
}

function buildCHarness(problem, userCode, tests) {
    if (problem.io && problem.io.cLegacy) {
        return buildLegacyCHarness(problem, userCode, tests);
    }

    const io = problem.io;
    const cFn = io.cFn || io.jsFn || toCamel(problem.id);
    const params = io.params || [];
    const ret = io.returnType;

    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || ret === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || ret === 'TreeNode';

    const listDecl = !/struct\s+ListNode\s*\{/.test(userCode) ? `
struct ListNode {
    int val;
    struct ListNode *next;
};
` : '';
    const treeDecl = !/struct\s+TreeNode\s*\{/.test(userCode) ? `
struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};
` : '';

    let casesCode = '';
    tests.forEach((tc, i) => {
        const argDecls = [];
        const callArgs = [];

        params.forEach((p, idx) => {
            const v = tc.input[p.name];
            if (p.type === 'int' || p.type === 'double') {
                argDecls.push(`${p.type} _a${idx} = ${Number(v)};`);
                callArgs.push(`_a${idx}`);
            } else if (p.type === 'bool') {
                argDecls.push(`bool _a${idx} = ${v ? 'true' : 'false'};`);
                callArgs.push(`_a${idx}`);
            } else if (p.type === 'string') {
                argDecls.push(`char* _a${idx} = _alStrdup(${JSON.stringify(String(v))});`);
                callArgs.push(`_a${idx}`);
            } else if (p.type === 'char[]') {
                const chars = Array.isArray(v) ? v : String(v).split('');
                const n = chars.length;
                if (n === 0) {
                    argDecls.push(`char* _a${idx} = NULL; int _a${idx}Size = 0;`);
                } else {
                    argDecls.push(`char _a${idx}[] = {${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}; int _a${idx}Size = ${n};`);
                }
                callArgs.push(`_a${idx}`, `_a${idx}Size`);
            } else if (p.type === 'int[]') {
                const arr = Array.isArray(v) ? v : [];
                const n = arr.length;
                if (n === 0) {
                    argDecls.push(`int* _a${idx} = NULL; int _a${idx}Size = 0;`);
                } else {
                    argDecls.push(`int _a${idx}[] = {${arr.join(',')}}; int _a${idx}Size = ${n};`);
                }
                callArgs.push(`_a${idx}`, `_a${idx}Size`);
            } else if (p.type === 'string[]') {
                const arr = Array.isArray(v) ? v : [];
                const n = arr.length;
                if (n === 0) {
                    argDecls.push(`char** _a${idx} = NULL; int _a${idx}Size = 0;`);
                } else {
                    argDecls.push(`char* _a${idx}[] = {${arr.map(s => `_alStrdup(${JSON.stringify(String(s))})`).join(',')}}; int _a${idx}Size = ${n};`);
                }
                callArgs.push(`_a${idx}`, `_a${idx}Size`);
            } else if (p.type === 'int[][]') {
                const mat = Array.isArray(v) ? v : [];
                const r = mat.length;
                if (r === 0) {
                    argDecls.push(`int** _a${idx} = NULL; int _a${idx}Size = 0; int* _a${idx}Col = NULL;`);
                } else {
                    const rowInits = mat.map((row, ri) => {
                        const cs = row.length;
                        if (cs === 0) return `_a${idx}[${ri}] = NULL; _a${idx}Col[${ri}] = 0;`;
                        return `int _r${idx}_${ri}[] = {${row.join(',')}}; _a${idx}[${ri}] = (int*)malloc(sizeof(int)*${cs}); memcpy(_a${idx}[${ri}], _r${idx}_${ri}, sizeof(int)*${cs}); _a${idx}Col[${ri}] = ${cs};`;
                    }).join(' ');
                    argDecls.push(`int _a${idx}Size = ${r}; int** _a${idx} = (int**)malloc(sizeof(int*)*${r}); int* _a${idx}Col = (int*)malloc(sizeof(int)*${r}); ${rowInits}`);
                }
                callArgs.push(`_a${idx}`, `_a${idx}Size`, `_a${idx}Col`);
            } else if (p.type === 'char[][]') {
                const mat = Array.isArray(v) ? v : [];
                const r = mat.length;
                if (r === 0) {
                    argDecls.push(`char** _a${idx} = NULL; int _a${idx}Size = 0; int* _a${idx}Col = NULL;`);
                } else {
                    const rowInits = mat.map((row, ri) => {
                        const chars = Array.isArray(row) ? row : String(row).split('');
                        const cs = chars.length;
                        if (cs === 0) return `_a${idx}[${ri}] = NULL; _a${idx}Col[${ri}] = 0;`;
                        return `char _c${idx}_${ri}[] = {${chars.map(c => `'${String(c).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(',')}}; _a${idx}[${ri}] = (char*)malloc(sizeof(char)*${cs}); memcpy(_a${idx}[${ri}], _c${idx}_${ri}, sizeof(char)*${cs}); _a${idx}Col[${ri}] = ${cs};`;
                    }).join(' ');
                    argDecls.push(`int _a${idx}Size = ${r}; char** _a${idx} = (char**)malloc(sizeof(char*)*${r}); int* _a${idx}Col = (int*)malloc(sizeof(int)*${r}); ${rowInits}`);
                }
                callArgs.push(`_a${idx}`, `_a${idx}Size`, `_a${idx}Col`);
            } else if (p.type === 'ListNode') {
                const arr = Array.isArray(v) ? v : [];
                if (arr.length === 0) {
                    argDecls.push(`struct ListNode* _a${idx} = NULL;`);
                } else {
                    argDecls.push(`int _larr${idx}[] = {${arr.join(',')}}; struct ListNode* _a${idx} = _alBuildList(_larr${idx}, ${arr.length}, -1);`);
                }
                callArgs.push(`_a${idx}`);
            } else if (p.type === 'ListNodeCycle') {
                const arr = Array.isArray(v) ? v : [];
                const pos = tc.input && typeof tc.input.pos === 'number' ? tc.input.pos : -1;
                if (arr.length === 0) {
                    argDecls.push(`struct ListNode* _a${idx} = NULL;`);
                } else {
                    argDecls.push(`int _larr${idx}[] = {${arr.join(',')}}; struct ListNode* _a${idx} = _alBuildList(_larr${idx}, ${arr.length}, ${pos});`);
                }
                callArgs.push(`_a${idx}`);
            } else if (p.type === 'TreeNode') {
                const arr = Array.isArray(v) ? v : [];
                if (arr.length === 0) {
                    argDecls.push(`struct TreeNode* _a${idx} = NULL;`);
                } else {
                    const vals = arr.map(x => (x === null || x === undefined) ? 'INT_MIN' : String(x));
                    argDecls.push(`int _tarr${idx}[] = {${vals.join(',')}}; struct TreeNode* _a${idx} = _alBuildTree(_tarr${idx}, ${arr.length});`);
                }
                callArgs.push(`_a${idx}`);
            }
        });

        let invokeAndPrint = '';
        if (ret === 'void_arr0') {
            invokeAndPrint = `
        clock_t t0 = clock();
        ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintIntArr(fp, _a0, _a0Size);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'void_char0') {
            invokeAndPrint = `
        clock_t t0 = clock();
        ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintCharArr(fp, _a0, _a0Size);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'int') {
            invokeAndPrint = `
        clock_t t0 = clock();
        int ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":%d,\\"runtimeMs\\":%.3f}", ans, dt);`;
        } else if (ret === 'double') {
            invokeAndPrint = `
        clock_t t0 = clock();
        double ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":%.6f,\\"runtimeMs\\":%.3f}", ans, dt);`;
        } else if (ret === 'bool') {
            invokeAndPrint = `
        clock_t t0 = clock();
        bool ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":%s,\\"runtimeMs\\":%.3f}", ans ? "true" : "false", dt);`;
        } else if (ret === 'string') {
            invokeAndPrint = `
        clock_t t0 = clock();
        char* ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintJsonStr(fp, ans);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'int[]') {
            const cArgs = [...callArgs, '&_retSize'].join(', ');
            invokeAndPrint = `
        int _retSize = 0;
        clock_t t0 = clock();
        int* ans = ${cFn}(${cArgs});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintIntArr(fp, ans, _retSize);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'string[]') {
            const cArgs = [...callArgs, '&_retSize'].join(', ');
            invokeAndPrint = `
        int _retSize = 0;
        clock_t t0 = clock();
        char** ans = ${cFn}(${cArgs});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintStrArr(fp, ans, _retSize);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'int[][]') {
            const cArgs = [...callArgs, '&_retSize', '&_retCols'].join(', ');
            invokeAndPrint = `
        int _retSize = 0; int* _retCols = NULL;
        clock_t t0 = clock();
        int** ans = ${cFn}(${cArgs});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintIntMat(fp, ans, _retSize, _retCols);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'string[][]') {
            const cArgs = [...callArgs, '&_retSize', '&_retCols'].join(', ');
            invokeAndPrint = `
        int _retSize = 0; int* _retCols = NULL;
        clock_t t0 = clock();
        char*** ans = ${cFn}(${cArgs});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintStrMat(fp, ans, _retSize, _retCols);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'ListNode') {
            invokeAndPrint = `
        clock_t t0 = clock();
        struct ListNode* ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintList(fp, ans);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        } else if (ret === 'TreeNode') {
            invokeAndPrint = `
        clock_t t0 = clock();
        struct TreeNode* ans = ${cFn}(${callArgs.join(', ')});
        double dt = ((double)(clock() - t0) / CLOCKS_PER_SEC) * 1000.0;
        fprintf(fp, "{\\"ok\\":true,\\"actual\\":");
        _fprintTree(fp, ans);
        fprintf(fp, ",\\"runtimeMs\\":%.3f}", dt);`;
        }

        casesCode += `
    {
        ${argDecls.join('\n        ')}
        ${invokeAndPrint}
    }`;
        if (i < tests.length - 1) casesCode += `\n    fprintf(fp, ",");`;
    });

    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <limits.h>
#include <math.h>
#include <time.h>
${hasList ? listDecl : ''}
${hasTree ? treeDecl : ''}
static char* _alStrdup(const char* src) {
    if (!src) return NULL;
    size_t len = strlen(src) + 1;
    char* copy = (char*)malloc(len);
    if (copy) memcpy(copy, src, len);
    return copy;
}
static void _fprintJsonStr(FILE* fp, const char* s) {
    if (!s) { fprintf(fp, "null"); return; }
    fputc('"', fp);
    for (size_t i = 0; s[i]; i++) {
        if (s[i] == '\\\\') fprintf(fp, "\\\\\\\\");
        else if (s[i] == '"') fprintf(fp, "\\\\\\"");
        else if (s[i] == '\\n') fprintf(fp, "\\\\n");
        else if (s[i] != '\\r') fputc(s[i], fp);
    }
    fputc('"', fp);
}
static void _fprintIntArr(FILE* fp, const int* a, int n) {
    fputc('[', fp);
    for (int i = 0; i < n; i++) fprintf(fp, "%s%d", i ? "," : "", a[i]);
    fputc(']', fp);
}
static void _fprintCharArr(FILE* fp, const char* a, int n) {
    fputc('[', fp);
    for (int i = 0; i < n; i++) {
        if (i) fputc(',', fp);
        char buf[2] = { a[i], '\\0' };
        _fprintJsonStr(fp, buf);
    }
    fputc(']', fp);
}
static void _fprintStrArr(FILE* fp, char** a, int n) {
    fputc('[', fp);
    for (int i = 0; i < n; i++) { if (i) fputc(',', fp); _fprintJsonStr(fp, a[i]); }
    fputc(']', fp);
}
static void _fprintIntMat(FILE* fp, int** m, int r, const int* cols) {
    fputc('[', fp);
    for (int i = 0; i < r; i++) {
        if (i) fputc(',', fp);
        _fprintIntArr(fp, m[i], cols ? cols[i] : 0);
    }
    fputc(']', fp);
}
static void _fprintStrMat(FILE* fp, char*** m, int r, const int* cols) {
    fputc('[', fp);
    for (int i = 0; i < r; i++) {
        if (i) fputc(',', fp);
        _fprintStrArr(fp, m[i], cols ? cols[i] : 0);
    }
    fputc(']', fp);
}
${hasList ? `
static struct ListNode* _alBuildList(const int* arr, int n, int pos) {
    if (n <= 0) return NULL;
    struct ListNode** nodes = (struct ListNode**)malloc(sizeof(struct ListNode*) * n);
    for (int i = 0; i < n; i++) {
        nodes[i] = (struct ListNode*)malloc(sizeof(struct ListNode));
        nodes[i]->val = arr[i];
        nodes[i]->next = NULL;
    }
    for (int i = 0; i < n - 1; i++) nodes[i]->next = nodes[i + 1];
    if (pos >= 0 && pos < n) nodes[n - 1]->next = nodes[pos];
    struct ListNode* head = nodes[0];
    free(nodes);
    return head;
}
static void _fprintList(FILE* fp, struct ListNode* head) {
    fputc('[', fp);
    int cnt = 0;
    while (head && cnt < 5000) {
        if (cnt++) fputc(',', fp);
        fprintf(fp, "%d", head->val);
        head = head->next;
    }
    fputc(']', fp);
}
` : ''}
${hasTree ? `
static struct TreeNode* _alBuildTree(const int* arr, int n) {
    if (n <= 0 || arr[0] == INT_MIN) return NULL;
    struct TreeNode** q = (struct TreeNode**)malloc(sizeof(struct TreeNode*) * (n + 5));
    struct TreeNode* root = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    root->val = arr[0]; root->left = root->right = NULL;
    int head = 0, tail = 0;
    q[tail++] = root;
    int i = 1;
    while (head < tail && i < n) {
        struct TreeNode* cur = q[head++];
        if (i < n && arr[i] != INT_MIN) {
            cur->left = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            cur->left->val = arr[i]; cur->left->left = cur->left->right = NULL;
            q[tail++] = cur->left;
        }
        i++;
        if (i < n && arr[i] != INT_MIN) {
            cur->right = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            cur->right->val = arr[i]; cur->right->left = cur->right->right = NULL;
            q[tail++] = cur->right;
        }
        i++;
    }
    free(q);
    return root;
}
static void _fprintTree(FILE* fp, struct TreeNode* root) {
    if (!root) { fprintf(fp, "[]"); return; }
    struct TreeNode** q = (struct TreeNode**)malloc(sizeof(struct TreeNode*) * 4096);
    int vals[4096];
    bool isNull[4096];
    int head = 0, tail = 0, outN = 0;
    q[tail++] = root;
    while (head < tail && outN < 4090) {
        struct TreeNode* cur = q[head++];
        if (!cur) {
            isNull[outN++] = true;
        } else {
            vals[outN] = cur->val;
            isNull[outN++] = false;
            q[tail++] = cur->left;
            q[tail++] = cur->right;
        }
    }
    while (outN > 0 && isNull[outN - 1]) outN--;
    fputc('[', fp);
    for (int i = 0; i < outN; i++) {
        if (i) fputc(',', fp);
        if (isNull[i]) fprintf(fp, "null");
        else fprintf(fp, "%d", vals[i]);
    }
    fputc(']', fp);
    free(q);
}
` : ''}

${userCode}

int main(void) {
    FILE *fp = fopen("result.json", "w");
    if (!fp) return 1;
    fprintf(fp, "[");
    ${casesCode}
    fprintf(fp, "]");
    fclose(fp);
    return 0;
}
`;
}

// ============================================================================
// Profiler Support for All 100 Problems
// ============================================================================

function generateScaledInputsForProblem(problem, sizes) {
    if (typeof problem.generateScaledInputs === 'function') {
        return problem.generateScaledInputs(sizes);
    }
    const baseTest = (problem.tests && problem.tests[0] && problem.tests[0].input) || {};
    const io = problem.io || { params: [] };
    const params = io.params || [];

    return sizes.map(n => {
        if (problem.id === 'two_sum') {
            const nums = Array.from({ length: n }, (_, i) => i + 1);
            return { n, input: { nums, target: (n - 1) + n } };
        }
        if (problem.id === 'valid_parentheses') {
            return { n, input: { s: '()'.repeat(Math.max(1, Math.floor(n / 2))) } };
        }
        if (problem.id === 'binary_search' || problem.id === 'search_insert_position') {
            const nums = Array.from({ length: n }, (_, i) => i * 2);
            return { n, input: { nums, target: (n - 1) * 2 + 1 } };
        }
        if (problem.id === 'merge_intervals') {
            const intervals = Array.from({ length: n }, (_, i) => [i * 3, i * 3 + 2]);
            return { n, input: { intervals } };
        }

        const out = {};
        for (const p of params) {
            if (p.type === 'int[]') {
                if (p.name === 'nums2' || problem.id === 'median_two_sorted_arrays') {
                    out[p.name] = p.name === 'nums1'
                        ? Array.from({ length: n }, (_, i) => i * 2)
                        : Array.from({ length: Math.max(1, Math.floor(n / 2)) }, (_, i) => i * 2 + 1);
                } else if (problem.id === 'sort_colors') {
                    out[p.name] = Array.from({ length: n }, (_, i) => (2 - (i % 3)));
                } else if (problem.id === 'remove_duplicates_sorted' || problem.id === 'two_sum_ii') {
                    out[p.name] = Array.from({ length: n }, (_, i) => i * 2 + 1);
                } else if (problem.id === 'search_rotated_sorted_array' || problem.id === 'find_min_rotated_sorted_array') {
                    const pivot = Math.floor(n / 2);
                    out[p.name] = Array.from({ length: n }, (_, i) => ((i + pivot) % n) * 2 + 1);
                } else if (problem.id === 'coin_change') {
                    out[p.name] = [1, 2, 5];
                } else if (problem.id === 'combination_sum') {
                    out[p.name] = [2, 3, 5, 7];
                } else if (p.name === 'endTime') {
                    out[p.name] = Array.from({ length: n }, (_, i) => i * 2 + 2);
                } else if (p.name === 'startTime') {
                    out[p.name] = Array.from({ length: n }, (_, i) => i * 2 + 1);
                } else if (p.name === 'profit' || p.name === 'piles' || p.name === 'heights' || p.name === 'height' || p.name === 'ratings' || p.name === 'prices' || p.name === 'cost' || problem.id === 'split_array_largest_sum' || problem.id === 'min_size_subarray_sum' || problem.id === 'house_robber' || problem.id === 'house_robber_ii') {
                    out[p.name] = Array.from({ length: n }, (_, i) => ((i * 7 + 3) % 20) + 1);
                } else if (problem.id === 'majority_element') {
                    out[p.name] = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 7 : i));
                } else if (problem.id === 'missing_number') {
                    out[p.name] = Array.from({ length: n }, (_, i) => (i === n - 1 ? n : i));
                } else if (problem.id === 'single_number') {
                    const pairs = [];
                    for (let i = 0; i < Math.max(1, Math.floor(n / 2)); i++) pairs.push(i + 1, i + 1);
                    pairs.push(99999);
                    out[p.name] = pairs;
                } else if (problem.id === 'plus_one') {
                    out[p.name] = Array.from({ length: n }, () => 9);
                } else {
                    out[p.name] = Array.from({ length: n }, (_, i) => ((i * 37 + 13) % (n + 5)) - Math.floor(n / 4));
                }
            } else if (p.type === 'string') {
                if (p.name === 's' && (problem.id.includes('parenthes') || problem.id === 'longest_valid_parentheses')) {
                    out[p.name] = '('.repeat(Math.floor(n / 2)) + ')'.repeat(Math.floor(n / 2));
                } else if (p.name === 'word') {
                    out[p.name] = 'ab';
                } else if (p.name === 'p') {
                    out[p.name] = 'a*b*c?'.slice(0, Math.max(2, Math.min(n, 12)));
                } else if (p.name === 't' || p.name === 'text2' || p.name === 's2') {
                    const alpha = 'abcdef';
                    let s2 = '';
                    for (let i = 0; i < Math.min(n, 16); i++) s2 += alpha[i % alpha.length];
                    out[p.name] = s2 || 'abc';
                } else if (typeof baseTest[p.name] === 'string' && baseTest[p.name].length > 0 && p.name !== 'beginWord' && p.name !== 'endWord') {
                    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
                    let s = '';
                    for (let i = 0; i < n; i++) s += alphabet[i % alphabet.length];
                    out[p.name] = s;
                } else {
                    out[p.name] = baseTest[p.name] || 'abc';
                }
            } else if (p.type === 'char[]') {
                out[p.name] = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + (i % 26)));
            } else if (p.type === 'string[]') {
                if (problem.id === 'word_ladder' || problem.id === 'word_break_ii' || problem.id === 'word_search_ii') {
                    out[p.name] = baseTest[p.name] || ['hot', 'dot', 'dog'];
                } else {
                    out[p.name] = Array.from({ length: n }, (_, i) => 'w' + (i % 5) + String.fromCharCode(97 + (i % 7)));
                }
            } else if (p.type === 'int[][]') {
                if (problem.id === 'course_schedule') {
                    out[p.name] = Array.from({ length: Math.max(1, n - 1) }, (_, i) => [i + 1, i]);
                } else if (problem.id === 'flood_fill' || problem.id === 'unique_paths' || problem.id === 'dungeon_game' || problem.id === 'longest_increasing_path_matrix' || problem.id === 'swim_in_rising_water') {
                    const side = Math.max(2, Math.round(Math.sqrt(n)));
                    out[p.name] = Array.from({ length: side }, (_, r) => Array.from({ length: side }, (__, c) => (r * side + c) % 9 + 1));
                } else if (problem.id === 'russian_doll_envelopes') {
                    out[p.name] = Array.from({ length: n }, (_, i) => [i + 1, (n - i) + 2]);
                } else {
                    out[p.name] = Array.from({ length: n }, (_, i) => [i * 2, i * 2 + 1]);
                }
            } else if (p.type === 'char[][]') {
                const side = Math.max(2, Math.round(Math.sqrt(n)));
                const useAlpha = problem.id === 'word_search' || problem.id === 'word_search_ii';
                out[p.name] = Array.from({ length: side }, (_, r) =>
                    Array.from({ length: side }, (__, c) => (useAlpha ? String.fromCharCode(97 + ((r + c) % 4)) : ((r + c) % 2 === 0 ? '1' : '0'))).join('')
                );
            } else if (p.type === 'ListNode' || p.type === 'ListNodeCycle') {
                out[p.name] = Array.from({ length: n }, (_, i) => i + 1);
                if (p.type === 'ListNodeCycle') out.pos = -1;
            } else if (p.type === 'TreeNode') {
                out[p.name] = Array.from({ length: n }, (_, i) => i + 1);
            } else if (p.type === 'int') {
                if (p.name === 'k' || p.name === 'amount' || p.name === 'h') out[p.name] = Math.max(1, Math.min(n, 8));
                else if (p.name === 'numCourses') out[p.name] = n;
                else if (p.name === 'm' && params.some(q => q.name === 'nums1')) out[p.name] = Math.floor(n / 2);
                else if (p.name === 'n' && params.some(q => q.name === 'nums2')) out[p.name] = Math.max(1, Math.floor(n / 2));
                else if (p.name === 'sr' || p.name === 'sc') out[p.name] = 0;
                else if (p.name === 'color') out[p.name] = 2;
                else if (p.name === 'target') out[p.name] = problem.id === 'combination_sum' ? 6 : n + 99;
                else out[p.name] = n;
            } else {
                out[p.name] = baseTest[p.name];
            }
        }
        // Special fixups for multi-param invariants
        if (problem.id === 'merge_sorted_array') {
            const half = Math.max(1, Math.floor(n / 2));
            out.nums1 = [...Array.from({ length: half }, (_, i) => i * 2), ...Array(half).fill(0)];
            out.m = half;
            out.nums2 = Array.from({ length: half }, (_, i) => i * 2 + 1);
            out.n = half;
        }
        if (problem.id === 'rotting_oranges' && Array.isArray(out.grid)) {
            const side = out.grid.length;
            out.grid = Array.from({ length: side }, (_, r) =>
                Array.from({ length: side }, (__, c) => (r === 0 && c === 0 ? 2 : 1))
            );
        }
        return { n, input: out };
    });
}

function buildPythonProfileScript(problem, userCode, scaled) {
    const io = problem.io;
    const pyFn = io.pyFn || toCamel(problem.id);
    const params = io.params || [];
    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || io.returnType === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || io.returnType === 'TreeNode';

    const argExprs = params.map(p => {
        if (p.type === 'int[]' || p.type === 'char[]' || p.type === 'string[]') return `list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'int[][]') return `[row[:] for row in tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'char[][]') return `[list(row) for row in tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'ListNode') return `_al_build_list(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'ListNodeCycle') return `_al_build_list(tc[${JSON.stringify(p.name)}], tc.get("pos", -1))`;
        if (p.type === 'TreeNode') return `_al_build_tree(tc[${JSON.stringify(p.name)}])`;
        return `tc[${JSON.stringify(p.name)}]`;
    });

    const nodeBlock = `
from collections import deque, defaultdict, Counter
from typing import List, Optional, Dict, Set, Tuple
import math, bisect, heapq
${hasList && !/^\s*class\s+ListNode\b/m.test(userCode) ? `
class ListNode:
    def __init__(self, val=0, next=None): self.val = val; self.next = next
` : ''}
${hasTree && !/^\s*class\s+TreeNode\b/m.test(userCode) ? `
class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right
` : ''}
def _al_build_list(arr, pos=-1):
    if not arr: return None
    nodes = [ListNode(v) for v in arr]
    for i in range(len(nodes) - 1): nodes[i].next = nodes[i + 1]
    if pos is not None and pos >= 0 and pos < len(nodes): nodes[-1].next = nodes[pos]
    return nodes[0]
def _al_build_tree(arr):
    if not arr or arr[0] is None: return None
    root = TreeNode(arr[0]); q = deque([root]); i = 1
    while q and i < len(arr):
        node = q.popleft()
        if i < len(arr) and arr[i] is not None: node.left = TreeNode(arr[i]); q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None: node.right = TreeNode(arr[i]); q.append(node.right)
        i += 1
    return root
`;

    return `import json, sys, time
${nodeBlock}
${userCode}

__CASES__ = json.loads(${JSON.stringify(JSON.stringify(scaled))})
__POINTS__ = []
for item in __CASES__:
    tc = item["input"]
    _p_args = (${argExprs.join(', ')},)
    steps = [0]
    def _tr(frame, ev, arg):
        if ev == 'line' or ev == 'call':
            steps[0] += 1
            if steps[0] > 400000:
                return None
        return _tr
    t0 = time.perf_counter()
    sys.settrace(_tr)
    try:
        ${pyFn}(*_p_args)
    finally:
        sys.settrace(None)
    dt = round((time.perf_counter() - t0) * 1000, 3)
    __POINTS__.append({"n": item["n"], "ops": steps[0], "timeMs": dt})

with open("profile.json", "w", encoding="utf-8") as f:
    json.dump(__POINTS__, f)
`;
}

function buildJavaScriptProfileScript(problem, instrCode, scaled) {
    const io = problem.io;
    const jsFn = io.jsFn || toCamel(problem.id);
    const params = io.params || [];
    const hasList = params.some(p => p.type === 'ListNode' || p.type === 'ListNodeCycle') || io.returnType === 'ListNode';
    const hasTree = params.some(p => p.type === 'TreeNode') || io.returnType === 'TreeNode';

    const argExprs = params.map(p => {
        if (p.type === 'int[]' || p.type === 'string[]') return `[...tc[${JSON.stringify(p.name)}]]`;
        if (p.type === 'char[]') return `Array.isArray(tc[${JSON.stringify(p.name)}]) ? [...tc[${JSON.stringify(p.name)}]] : String(tc[${JSON.stringify(p.name)}]).split('')`;
        if (p.type === 'int[][]') return `tc[${JSON.stringify(p.name)}].map(r => [...r])`;
        if (p.type === 'char[][]') return `tc[${JSON.stringify(p.name)}].map(r => Array.isArray(r) ? [...r] : String(r).split(''))`;
        if (p.type === 'ListNode') return `_alBuildList(tc[${JSON.stringify(p.name)}])`;
        if (p.type === 'ListNodeCycle') return `_alBuildList(tc[${JSON.stringify(p.name)}], tc.pos ?? -1)`;
        if (p.type === 'TreeNode') return `_alBuildTree(tc[${JSON.stringify(p.name)}])`;
        return `tc[${JSON.stringify(p.name)}]`;
    });

    return `const fs = require('fs');
let __ops__ = 0;
${hasList && !/\b(?:function|class)\s+ListNode\b/.test(instrCode) ? `function ListNode(val, next) { this.val = val || 0; this.next = next || null; }` : ''}
${hasTree && !/\b(?:function|class)\s+TreeNode\b/.test(instrCode) ? `function TreeNode(val, left, right) { this.val = val || 0; this.left = left || null; this.right = right || null; }` : ''}
function _alBuildList(arr, pos = -1) {
    if (!arr || !arr.length) return null;
    const nodes = arr.map(v => new ListNode(v));
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
    if (pos >= 0 && pos < nodes.length) nodes[nodes.length - 1].next = nodes[pos];
    return nodes[0];
}
function _alBuildTree(arr) {
    if (!arr || !arr.length || arr[0] === null) return null;
    const root = new TreeNode(arr[0]); const q = [root]; let i = 1;
    while (q.length && i < arr.length) {
        const node = q.shift();
        if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); q.push(node.left); }
        i++;
        if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); q.push(node.right); }
        i++;
    }
    return root;
}
${instrCode}

const __CASES__ = ${JSON.stringify(scaled)};
const __POINTS__ = [];
for (const item of __CASES__) {
    const tc = item.input;
    const _args = [${argExprs.join(', ')}];
    __ops__ = 0;
    const t0 = process.hrtime.bigint();
    ${jsFn}(..._args);
    const dt = Math.round((Number(process.hrtime.bigint() - t0) / 1e6) * 1000) / 1000;
    __POINTS__.push({ n: item.n, ops: Math.max(1, __ops__), timeMs: dt });
}
fs.writeFileSync('profile.json', JSON.stringify(__POINTS__));
`;
}

module.exports = {
    generateDuelSkeleton,
    compareTestOutput,
    buildPythonHarness,
    buildJavaScriptHarness,
    buildJavaHarness,
    buildCppHarness,
    buildCHarness,
    generateScaledInputsForProblem,
    buildPythonProfileScript,
    buildJavaScriptProfileScript
};
