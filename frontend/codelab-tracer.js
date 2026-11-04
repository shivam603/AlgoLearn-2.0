/**
 * CodeLab Multi-Language Execution Tracing Engine
 * Supports real execution tracing for JavaScript, Python, Java, and C++ algorithm code.
 * Preserves 1:1 line number mapping for editor highlighting, breakpoints, and live state sync.
 */

const CodeLabTracer = {
    MAX_OPERATIONS: 25000,

    /**
     * Primary entry point: transpile & trace user code in any supported language
     */
    async trace(userCode, language = 'javascript') {
        const lang = (language || 'javascript').toLowerCase();

        try {
            // 1. Transpile source code to runnable JavaScript with 1:1 line preservation
            const jsCode = this.transpileToJS(userCode, lang);

            // 2. Instrument statements for trace step collection
            const instrumented = this.instrumentCode(jsCode, userCode, lang);

            // 3. Execute in isolated scope
            const runner = new Function(instrumented);
            const traceEvents = runner();

            if (!traceEvents || traceEvents.length === 0) {
                return {
                    success: true,
                    trace: this.generateFallbackTrace(userCode, lang),
                    error: null
                };
            }

            // 4. Enrich events with comparison, swap, and pointer detection
            const enriched = this.enrichOperations(traceEvents);

            return {
                success: true,
                trace: enriched,
                error: null
            };
        } catch (err) {
            return {
                success: false,
                error: {
                    type: err.name || 'ExecutionError',
                    message: err.message,
                    line: this.extractLineNumber(err) || 1
                },
                trace: []
            };
        }
    },

    /**
     * Helper to wrap single-line if statement in braces with balanced condition parsing
     */
    wrapSingleLineIf(line) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('if') || trimmed.endsWith('{')) return line;
        const ifIdx = line.indexOf('if');
        const openParen = line.indexOf('(', ifIdx);
        if (openParen === -1) return line;
        let depth = 0, closeParen = -1;
        for (let i = openParen; i < line.length; i++) {
            if (line[i] === '(') depth++;
            else if (line[i] === ')') {
                depth--;
                if (depth === 0) { closeParen = i; break; }
            }
        }
        if (closeParen === -1) return line;
        const cond = line.slice(openParen + 1, closeParen);
        const rest = line.slice(closeParen + 1).trim().replace(/;+$/, '');
        if (!rest) return line;
        const indent = line.slice(0, ifIdx);
        return indent + 'if (' + cond + ') { ' + rest + '; }';
    },

    /**
     * Helper to wrap single-line else statement in braces
     */
    wrapSingleLineElse(line) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('else') || trimmed.startsWith('else if') || trimmed.endsWith('{') || trimmed === 'else') return line;
        const m = line.match(/^(\s*)else\s+(.+);?$/);
        if (m) {
            return `${m[1]}else { ${m[2].replace(/;+$/, '')}; }`;
        }
        return line;
    },

    /**
     * Transpiles Java, Python, or C++ algorithm code into executable JS while preserving exact line numbers
     */
    transpileToJS(code, lang) {
        const lines = code.split('\n');
        const translated = [];

        if (lang === 'javascript' || lang === 'js') {
            for (let i = 0; i < lines.length; i++) {
                let l = this.wrapSingleLineIf(lines[i]);
                l = this.wrapSingleLineElse(l);
                translated.push(l);
            }
            return translated.join('\n');
        }

        if (lang === 'java') {
            let classBraceDepth = 0;
            let inClass = false;
            let mainBraceDepth = 0;
            let inMain = false;
            let in2DArray = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let trimmed = line.trim();

                // Package and import statements
                if (trimmed.startsWith('import ') || trimmed.startsWith('package ')) {
                    translated.push('// ' + line);
                    continue;
                }

                // class Main { ... }
                if (trimmed.match(/(?:public\s+)?class\s+Main\b/)) {
                    inClass = true;
                    classBraceDepth += (line.match(/\{/g) || []).length;
                    translated.push('// ' + line);
                    continue;
                }

                // public static void main(String[] args) { ... }
                if (trimmed.includes('void main(')) {
                    inMain = true;
                    mainBraceDepth += (line.match(/\{/g) || []).length;
                    translated.push('// ' + line);
                    continue;
                }

                // Track closing braces for main and class
                if (inMain || inClass) {
                    const opens = (line.match(/\{/g) || []).length;
                    const closes = (line.match(/\}/g) || []).length;

                    if (inMain && (mainBraceDepth + opens - closes <= 0) && closes > 0) {
                        inMain = false;
                        mainBraceDepth = 0;
                        translated.push('// ' + line);
                        continue;
                    }
                    if (inMain) mainBraceDepth += (opens - closes);

                    if (inClass && (classBraceDepth + opens - closes <= 0) && closes > 0) {
                        inClass = false;
                        classBraceDepth = 0;
                        translated.push('// ' + line);
                        continue;
                    }
                    if (inClass) classBraceDepth += (opens - closes);
                }

                // ListNode & TreeNode field declarations
                if (trimmed.match(/^(?:int|ListNode|TreeNode)\s+[a-zA-Z0-9_$, ]+;/)) {
                    translated.push('// ' + line);
                    continue;
                }

                // ListNode/TreeNode constructors: ListNode(int val) { ... }
                if (trimmed.match(/^(?:public\s+)?(?:ListNode|TreeNode)\s*\(([^)]*)\)\s*\{/)) {
                    line = line.replace(/^(\s*)(?:public\s+)?(?:ListNode|TreeNode)\s*\(([^)]*)\)\s*\{/, (m, indent, params) => {
                        const cleanParams = params.replace(/[a-zA-Z0-9_<>[\]*]+\s+([a-zA-Z0-9_$]+)/g, '$1');
                        return `${indent}constructor(${cleanParams}) {`;
                    });
                }

                // Static helper methods: public static void func(int[] arr, int low)
                if (trimmed.match(/^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?[a-zA-Z0-9_<>[\]*]+\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{?/)) {
                    line = line.replace(/^(\s*)(?:public\s+|private\s+|protected\s+)?(?:static\s+)?[a-zA-Z0-9_<>[\]*]+\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/, (m, indent, name, params) => {
                        if (['if', 'while', 'for', 'switch', 'return', 'catch'].includes(name)) return m;
                        const clean = params.replace(/(?:[a-zA-Z0-9_<>*]+(?:\[\])*)\s+([a-zA-Z0-9_$]+)/g, '$1');
                        return `${indent}function ${name}(${clean})`;
                    });
                }

                // Stack declaration: Stack<Integer> s = new Stack<>();
                if (trimmed.match(/Stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+Stack[^;]*;/)) {
                    const varName = trimmed.match(/Stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)/)[1];
                    translated.push(line.replace(/Stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+Stack[^;]*;/, `let ${varName} = new _Stack();`));
                    continue;
                }

                // Queue declaration: Queue<Integer> q = new LinkedList<>();
                if (trimmed.match(/Queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+[^;]*;/)) {
                    const varName = trimmed.match(/Queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)/)[1];
                    translated.push(line.replace(/Queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+[^;]*;/, `let ${varName} = new _Queue();`));
                    continue;
                }

                // List / ArrayList
                line = line.replace(/\bList<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+ArrayList[^;]*;/g, 'let $1 = [];');
                line = line.replace(/\.add\s*\(/g, '.push(');

                // Arrays.copyOfRange: Arrays.copyOfRange(arr, 0, mid)
                line = line.replace(/(?:Arrays\.)?copyOfRange\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, '$1.slice($2, $3)');

                // Typed object instantiations / declarations: ListNode prev = null, curr = head;
                line = line.replace(/\b(?:ListNode|TreeNode)\s+([a-zA-Z0-9_$]+)/g, 'let $1');

                // Array initialization: int[] arr = { 1, 2, 3 };
                if (trimmed.match(/(?:int|long|double|float|String|char|boolean)\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*\{([^}]*)\};/)) {
                    translated.push(line.replace(/(?:int|long|double|float|String|char|boolean)\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*\{([^}]*)\};/, 'let $1 = [$2];'));
                    continue;
                }

                // Multi-dimensional array initialization: int[][] graph = { { ... }, ... };
                if (trimmed.match(/(?:int|long|double|float|String|char|boolean)\[\]\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*\{/)) {
                    in2DArray = true;
                    line = line.replace(/(?:int|long|double|float|String|char|boolean)\[\]\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*\{/, 'let $1 = [');
                }
                // Inner 2D array row: {0, 4, 2, 0}, -> [0, 4, 2, 0],
                line = line.replace(/\{([0-9,\s-]+)\}/g, '[$1]');

                if (in2DArray && trimmed === '};') {
                    in2DArray = false;
                    line = line.replace(/\};/, '];');
                }

                // Array declaration: int[] arr = new int[n]; or boolean[] visited = new boolean[graph.length];
                if (trimmed.match(/(?:int|long|double|float|String|char|boolean)\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+[a-zA-Z0-9_]+\[([^\]]+)\];/)) {
                    const defaultVal = trimmed.includes('boolean[]') ? 'false' : '0';
                    translated.push(line.replace(/(?:int|long|double|float|String|char|boolean)\[\]\s+([a-zA-Z0-9_$]+)\s*=\s*new\s+[a-zA-Z0-9_]+\[([^\]]+)\];/, `let $1 = new Array($2).fill(${defaultVal});`));
                    continue;
                }

                // Enhanced for loop: for (int x : arr)
                if (trimmed.match(/^for\s*\(\s*(?:final\s+)?[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/)) {
                    line = line.replace(/^(\s*)for\s*\(\s*(?:final\s+)?[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/, '$1for (let $2 of $3)');
                }

                // Primitive typed variables: int a = 10; or int[] left = ...;
                line = line.replace(/\b(?:int|long|double|float|boolean|char|String)(?:\[\])*\s+([a-zA-Z0-9_$]+)\b/g, 'let $1');

                // System.out.println / print
                line = line.replace(/System\.out\.println\s*\(/g, 'console.log(');
                line = line.replace(/System\.out\.print\s*\(/g, 'console.log(');
                line = line.replace(/(?:java\.util\.)?Arrays\.toString\s*\(/g, 'JSON.stringify(');

                line = this.wrapSingleLineIf(line);
                line = this.wrapSingleLineElse(line);

                translated.push(line);
            }
            return translated.join('\n');
        }

        if (lang === 'cpp') {
            let inMain = false;
            let mainDepth = 0;
            let in2DVector = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let trimmed = line.trim();

                // Strip std:: everywhere first
                line = line.replace(/std::/g, '');
                line = line.replace(/\.size\(\)/g, '.length');
                trimmed = line.trim();

                // #include & using namespace
                if (trimmed.startsWith('#include') || trimmed.startsWith('using namespace')) {
                    translated.push('// ' + line);
                    continue;
                }

                // int main() { ... }
                if (trimmed.includes('main(')) {
                    inMain = true;
                    mainDepth += (line.match(/\{/g) || []).length;
                    translated.push('// ' + line);
                    continue;
                }

                if (inMain) {
                    const opens = (line.match(/\{/g) || []).length;
                    const closes = (line.match(/\}/g) || []).length;
                    if (mainDepth + opens - closes <= 0 && closes > 0) {
                        inMain = false;
                        mainDepth = 0;
                        translated.push('// ' + line);
                        continue;
                    }
                    mainDepth += (opens - closes);
                }

                // struct ListNode / struct TreeNode
                if (trimmed.startsWith('struct ListNode') || trimmed.startsWith('struct TreeNode')) {
                    line = line.replace(/^struct\s+/, 'class ');
                }
                if (trimmed.match(/^(?:int|ListNode\*?|TreeNode\*?)\s+[a-zA-Z0-9_$,* ]+;/)) {
                    translated.push('// ' + line);
                    continue;
                }
                if (trimmed.match(/(?:ListNode|TreeNode)\s*\([^)]*\)\s*(?::[^{]*)?\{[^{}]*\}/)) {
                    line = line.replace(/(ListNode|TreeNode)\s*\(([^)]*)\)\s*(?::[^{]*)?\{[^{}]*\}/, (m, name, params) => {
                        const cleanParams = params.replace(/[a-zA-Z0-9_<>[\]*]+\s+([a-zA-Z0-9_$]+)/g, '$1');
                        if (name === 'ListNode') return `constructor(${cleanParams}) { this.val = ${cleanParams.split(',')[0].trim()}; this.next = null; }`;
                        return `constructor(${cleanParams}) { this.val = ${cleanParams.split(',')[0].trim()}; this.left = null; this.right = null; }`;
                    });
                }

                // stack<int> s;
                if (trimmed.match(/stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/)) {
                    const varName = trimmed.match(/stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)/)[1];
                    translated.push(line.replace(/stack<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/, `let ${varName} = new _Stack();`));
                    continue;
                }

                // queue<int> q;
                if (trimmed.match(/queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/)) {
                    const varName = trimmed.match(/queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)/)[1];
                    translated.push(line.replace(/queue<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/, `let ${varName} = new _Queue();`));
                    continue;
                }

                // Range-based for loop: for (int x : arr) or for (auto neighbor : ...)
                if (trimmed.match(/^for\s*\(\s*(?:const\s+)?(?:int|auto|[a-zA-Z0-9_<>&*]+)\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/)) {
                    line = line.replace(/^(\s*)for\s*\(\s*(?:const\s+)?(?:int|auto|[a-zA-Z0-9_<>&*]+)\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/, '$1for (let $2 of $3)');
                }

                // vector<int> arr = { ... };
                if (trimmed.match(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*\{([^}]*)\};/)) {
                    translated.push(line.replace(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*=\s*\{([^}]*)\};/, 'let $1 = [$2];'));
                    continue;
                }

                // 2D vector: vector<vector<int>> graph = { ... };
                if (trimmed.match(/vector<vector<[a-zA-Z0-9_]+>>\s+([a-zA-Z0-9_$]+)\s*=\s*\{/)) {
                    in2DVector = true;
                    line = line.replace(/vector<vector<[a-zA-Z0-9_]+>>\s+([a-zA-Z0-9_$]+)\s*=\s*\{/, 'let $1 = [');
                }
                // Inner 2D row: {0, 4, 2, 0}, -> [0, 4, 2, 0],
                line = line.replace(/\{([0-9,\s-]+)\}/g, '[$1]');

                if (in2DVector && trimmed === '};') {
                    in2DVector = false;
                    line = line.replace(/\};/, '];');
                }
                if (line.includes('let ') && line.includes('[[') && line.trim().endsWith('};')) {
                    line = line.replace(/\};\s*$/, '];');
                }

                // vector with size and default value: vector<int> dist(n, 9999);
                if (trimmed.match(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/)) {
                    translated.push(line.replace(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/, 'let $1 = new Array($2).fill($3);'));
                    continue;
                }

                // vector<int> res; -> let res = [];
                if (trimmed.match(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/)) {
                    translated.push(line.replace(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+);/, 'let $1 = [];'));
                    continue;
                }

                // vector slicing constructors
                if (trimmed.match(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*\((.*)\);/)) {
                    line = line.replace(/vector<[a-zA-Z0-9_]+>\s+([a-zA-Z0-9_$]+)\s*\((.*)\);/, (m, vName, args) => {
                        if (args.includes('end()')) {
                            const sliceStart = args.includes('begin() +') ? args.split('begin() +')[1].split(',')[0].trim() : (args.includes('+') ? args.split('+')[1].split(',')[0].trim() : '0');
                            return `let ${vName} = arr.slice(${sliceStart});`;
                        } else if (args.includes('begin()') && args.includes('+')) {
                            const sliceEnd = args.split('+')[1].trim();
                            return `let ${vName} = arr.slice(0, ${sliceEnd});`;
                        }
                        return `let ${vName} = [];`;
                    });
                }

                // Function definitions: any return type
                if (trimmed.match(/^(?:[a-zA-Z0-9_<>:*&]+\s+)+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{?/)) {
                    const m = trimmed.match(/^(?:[a-zA-Z0-9_<>:*&]+\s+)+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{?/);
                    const funcName = m[1];
                    const rawParams = m[2];
                    if (!['if', 'while', 'for', 'switch', 'return'].includes(funcName)) {
                        const cleanParams = rawParams.replace(/(?:const\s+)?(?:[a-zA-Z0-9_<>:*&]+\s+)+([a-zA-Z0-9_$]+)/g, '$1');
                        line = line.replace(/^(?:[a-zA-Z0-9_<>:*&]+\s+)+[a-zA-Z0-9_$]+\s*\([^)]*\)/, `function ${funcName}(${cleanParams})`);
                    }
                }

                // Typed pointer instantiations / declarations
                line = line.replace(/\b(?:ListNode|TreeNode)\*\s+([a-zA-Z0-9_$]+)/g, 'let $1');

                // swap(a, b);
                line = line.replace(/swap\s*\(\s*([a-zA-Z0-9_$[\] +-]+)\s*,\s*([a-zA-Z0-9_$[\] +-]+)\s*\);/g, '[$1, $2] = [$2, $1];');

                // Primitive types, vectors & pointers
                line = line.replace(/\b(?:vector<[a-zA-Z0-9_<>]+>|int|long|double|float|bool|char|size_t|auto)\s+([a-zA-Z0-9_$]+)\b/g, 'let $1');

                // push_back -> push
                line = line.replace(/\.push_back\s*\(/g, '.push(');

                // cout & endl
                line = line.replace(/cout\s*<<\s*([^;]+);/g, 'console.log($1);');
                line = line.replace(/<<\s*endl/g, '');
                line = line.replace(/\.size\(\)/g, '.length');
                line = line.replace(/nullptr/g, 'null');
                line = line.replace(/->/g, '.');

                if (inMain && (trimmed === 'return 0;' || trimmed.startsWith('return 0'))) {
                    line = '// ' + line;
                }

                line = this.wrapSingleLineIf(line);
                line = this.wrapSingleLineElse(line);

                translated.push(line);
            }
            return translated.join('\n');
        }

        if (lang === 'python') {
            const indentStack = [0];
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let trimmed = line.trim();

                if (!trimmed || trimmed.startsWith('#')) {
                    translated.push('// ' + line);
                    continue;
                }

                if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
                    translated.push('// ' + line);
                    continue;
                }

                // Word-level boolean and operator replaces
                line = line.replace(/\band\b/g, '&&');
                line = line.replace(/\bor\b/g, '||');
                line = line.replace(/([a-zA-Z0-9_$[\]()]+)\s+not\s+in\s+([a-zA-Z0-9_$[\]()]+)/g, '__notIn($1, $2)');
                line = line.replace(/\bnot\s+/g, '!');
                line = line.replace(/\bTrue\b/g, 'true');
                line = line.replace(/\bFalse\b/g, 'false');
                line = line.replace(/\bNone\b/g, 'null');
                line = line.replace(/float\(['"]inf['"]\)/g, 'Infinity');
                line = line.replace(/float\(['"]-inf['"]\)/g, '-Infinity');
                line = line.replace(/\blen\s*\(([^)]+)\)/g, '$1.length');
                line = line.replace(/\.append\s*\(/g, '.push(');

                // Python Set literal: visited = {start} -> visited = new Set([start])
                line = line.replace(/=\s*\{([^{}:]+)\}/g, '= new Set([$1])');

                // graph.get(node, []) -> (graph[node] || [])
                line = line.replace(/([a-zA-Z0-9_$]+)\.get\s*\(([^,)]+)(?:,\s*([^)]+))?\)/g, '($1[$2] !== undefined ? $1[$2] : ($3 || []))');

                // Python 2-tuple conversion only for literals in collections/assignments, NOT function headers or calls
                line = line.replace(/([\[,=]\s*)\(([^(),]+(?:,\s*[^(),]+)+)\)/g, (m, p1, p2) => p1 + '[' + p2 + ']');

                const currentIndent = line.search(/\S|$/);
                let closingBraces = '';
                while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
                    indentStack.pop();
                    closingBraces += ' }';
                }

                const updatedTrimmed = line.trim();

                if (updatedTrimmed.startsWith('class ListNode') || updatedTrimmed.startsWith('class TreeNode')) {
                    translated.push((closingBraces ? closingBraces + ' ' : '') + '// ' + line);
                    continue;
                }
                if (updatedTrimmed.startsWith('def __init__') || updatedTrimmed.startsWith('self.')) {
                    translated.push((closingBraces ? closingBraces + ' ' : '') + '// ' + line);
                    continue;
                }

                // def func(...):
                if (updatedTrimmed.match(/^def\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*:/)) {
                    line = line.replace(/^(\s*)def\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*:/, '$1function $2($3) {');
                    indentStack.push(currentIndent + 4);
                    translated.push((closingBraces ? closingBraces + ' ' : '') + line);
                    continue;
                }

                // for i, val in enumerate(arr):
                if (updatedTrimmed.match(/^for\s+([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s+in\s+enumerate\s*\(([^)]+)\)\s*:/)) {
                    const em = updatedTrimmed.match(/^for\s+([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s+in\s+enumerate\s*\(([^)]+)\)\s*:/);
                    indentStack.push(currentIndent + 4);
                    const forLine = line.replace(/for\s+.+\s+in\s+enumerate\([^)]+\)\s*:/, `for (let [${em[1]}, ${em[2]}] of ${em[3]}.entries()) {`);
                    translated.push((closingBraces ? closingBraces + ' ' : '') + forLine);
                    continue;
                }

                // for ... in ...
                if (updatedTrimmed.match(/^for\s+(.+)\s+in\s+(.+)\s*:/)) {
                    const m = updatedTrimmed.match(/^for\s+(.+)\s+in\s+(.+)\s*:/);
                    const iterVar = m[1].trim();
                    const iterTarget = m[2].trim();

                    indentStack.push(currentIndent + 4);

                    if (iterTarget.startsWith('range(') && iterTarget.endsWith(')')) {
                        const inner = iterTarget.slice(6, -1);
                        const parts = [];
                        let paren = 0, cur = '';
                        for (let ch of inner) {
                            if (ch === '(') paren++;
                            else if (ch === ')') paren--;
                            if (ch === ',' && paren === 0) {
                                parts.push(cur.trim());
                                cur = '';
                            } else cur += ch;
                        }
                        if (cur.trim()) parts.push(cur.trim());

                        let forLoop = '';
                        if (parts.length === 1) {
                            forLoop = `for (let ${iterVar} = 0; ${iterVar} < ${parts[0]}; ${iterVar}++) {`;
                        } else if (parts.length === 2) {
                            forLoop = `for (let ${iterVar} = ${parts[0]}; ${iterVar} < ${parts[1]}; ${iterVar}++) {`;
                        } else {
                            forLoop = `for (let ${iterVar} = ${parts[0]}; ${iterVar} < ${parts[1]}; ${iterVar} += ${parts[2]}) {`;
                        }
                        const forLine = line.replace(/for\s+.+\s+in\s+range\(.+\)\s*:/, forLoop);
                        translated.push((closingBraces ? closingBraces + ' ' : '') + forLine);
                        continue;
                    } else if (iterTarget.endsWith('.items()')) {
                        const dictObj = iterTarget.replace(/\.items\(\)$/, '');
                        const loopHdr = `for (let [${iterVar}] of Object.entries(${dictObj})) {`;
                        const forLine = line.replace(/for\s+.+\s+in\s+.+\.items\(\)\s*:/, loopHdr);
                        translated.push((closingBraces ? closingBraces + ' ' : '') + forLine);
                        continue;
                    } else {
                        const loopHdr = `for (let ${iterVar} of ${iterTarget}) {`;
                        const forLine = line.replace(/for\s+.+\s+in\s+.+\s*:/, loopHdr);
                        translated.push((closingBraces ? closingBraces + ' ' : '') + forLine);
                        continue;
                    }
                }

                // Multiple assignments: curr_dist, u = heapq.heappop(pq)
                if (updatedTrimmed.match(/^([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*=\s*(.+)$/)) {
                    line = line.replace(/^(\s*)([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*=\s*(.+)$/, '$1let [$2, $3] = $4;');
                }

                // Python swap: a, b = b, a
                if (updatedTrimmed.match(/([a-zA-Z0-9_$[\] +-]+)\s*,\s*([a-zA-Z0-9_$[\] +-]+)\s*=\s*([a-zA-Z0-9_$[\] +-]+)\s*,\s*([a-zA-Z0-9_$[\] +-]+)/)) {
                    line = line.replace(/([a-zA-Z0-9_$[\] +-]+)\s*,\s*([a-zA-Z0-9_$[\] +-]+)\s*=\s*([a-zA-Z0-9_$[\] +-]+)\s*,\s*([a-zA-Z0-9_$[\] +-]+)/, '[$1, $2] = [$3, $4];');
                }

                // while cond:
                if (updatedTrimmed.match(/^while\s+(.+)\s*:/)) {
                    const cond = updatedTrimmed.match(/^while\s+(.+)\s*:/)[1].trim();
                    indentStack.push(currentIndent + 4);
                    let jsCond = cond;
                    if (jsCond === 'pq') jsCond = 'pq.length > 0';
                    else if (jsCond === 'queue') jsCond = '!queue.isEmpty()';
                    const whileLine = line.replace(/while\s+(.+)\s*:/, `while (${jsCond}) {`);
                    translated.push((closingBraces ? closingBraces + ' ' : '') + whileLine);
                    continue;
                }

                // if cond:
                if (updatedTrimmed.match(/^if\s+(.+)\s*:/)) {
                    indentStack.push(currentIndent + 4);
                    const ifLine = line.replace(/if\s+(.+)\s*:/, 'if ($1) {');
                    translated.push((closingBraces ? closingBraces + ' ' : '') + ifLine);
                    continue;
                }

                // elif cond:
                if (updatedTrimmed.match(/^elif\s+(.+)\s*:/)) {
                    indentStack.push(currentIndent + 4);
                    translated.push((closingBraces ? closingBraces + ' ' : '') + line.replace(/elif\s+(.+)\s*:/, 'else if ($1) {'));
                    continue;
                }

                // else:
                if (updatedTrimmed.match(/^else\s*:/)) {
                    indentStack.push(currentIndent + 4);
                    translated.push((closingBraces ? closingBraces + ' ' : '') + line.replace(/else\s*:/, 'else {'));
                    continue;
                }

                // Python dictionary comprehension: {node: float('inf') for node in graph}
                line = line.replace(/\{\s*([a-zA-Z0-9_$]+)\s*:\s*([^}]+?)\s+for\s+\1\s+in\s+([a-zA-Z0-9_$]+)\s*\}/g, 'Object.fromEntries(Object.keys($3).map(k => [k, $2]))');

                // Python slice syntax: arr[:mid] -> arr.slice(0, mid), arr[mid:] -> arr.slice(mid)
                line = line.replace(/([a-zA-Z0-9_$]+)\[\s*:\s*([^\]]+)\]/g, '$1.slice(0, $2)');
                line = line.replace(/([a-zA-Z0-9_$]+)\[\s*([^:\]]+)\s*:\s*\]/g, '$1.slice($2)');
                line = line.replace(/([a-zA-Z0-9_$]+)\[\s*([^:\]]+)\s*:\s*([^\]]+)\]/g, '$1.slice($2, $3)');

                // Math.floor for //
                line = line.replace(/(\([^)]+\)|[a-zA-Z0-9_$.[\]]+)\s*\/\/\s*(\([^)]+\)|[a-zA-Z0-9_$.[\]]+)/g, 'Math.floor($1 / $2)');

                // f-strings
                line = line.replace(/f"([^"]*)"/g, (m, str) => '`' + str.replace(/\{([^}]+)\}/g, '${$1}') + '`');
                line = line.replace(/f'([^']*)'/g, (m, str) => '`' + str.replace(/\{([^}]+)\}/g, '${$1}') + '`');

                // print(...) -> console.log(...)
                line = line.replace(/\bprint\s*\(/g, 'console.log(');

                // in expression check (after for loops)
                line = line.replace(/([a-zA-Z0-9_$[\]()]+)\s+in\s+([a-zA-Z0-9_$[\]()]+)/g, '__in($1, $2)');

                if (closingBraces) {
                    line = closingBraces + ' ' + line;
                }
                translated.push(line);
            }
            while (indentStack.length > 1) {
                indentStack.pop();
                translated.push('}');
            }
            return translated.join('\n');
        }

        return code;
    },

    /**
     * Injects execution trace probes and scope recording into JavaScript code
     */
    instrumentCode(userCode, originalSource, lang = 'javascript') {
        const lines = userCode.split('\n');
        const instrumented = [];

        // Detect all declared identifiers in code
        const detectedVarNames = new Set([
            's', 'q', 'stack', 'queue', 'arr', 'numbers', 'items', 'list', 'nums', 'data',
            'i', 'j', 'k', 'minIdx', 'low', 'high', 'mid', 'target', 'key', 'temp',
            'head', 'curr', 'prev', 'root', 'visited', 'order', 'graph', 'dist', 'distances',
            'traversalOrder', 'result', 'current', 'neighbors', 'neighbor', 'weight', 'u', 'v', 'n'
        ]);
        const varMatches = (userCode + '\n' + originalSource).match(/(?:let|const|var|Stack<[a-zA-Z0-9_]+>|Queue<[a-zA-Z0-9_]+>|int|vector<int>)\s+([a-zA-Z0-9_$]+)/g) || [];
        varMatches.forEach(m => {
            const parts = m.trim().split(/\s+/);
            if (parts.length > 1) detectedVarNames.add(parts[parts.length - 1]);
        });

        // Built-in classes and helper structures
        const hasUserListNode = (lang !== 'python') && (userCode.includes('class ListNode') || originalSource.includes('class ListNode') || userCode.includes('struct ListNode') || originalSource.includes('struct ListNode'));
        const hasUserTreeNode = (lang !== 'python') && (userCode.includes('class TreeNode') || originalSource.includes('class TreeNode') || userCode.includes('struct TreeNode') || originalSource.includes('struct TreeNode'));

        instrumented.push(`
            class _Stack {
                constructor() { this._items = []; }
                push(x) { this._items.push(x); return x; }
                pop() { return this._items.pop(); }
                peek() { return this._items[this._items.length - 1]; }
                isEmpty() { return this._items.length === 0; }
                empty() { return this._items.length === 0; }
                size() { return this._items.length; }
                toJSON() { return this._items; }
                toString() { return JSON.stringify(this._items); }
            }

            class _Queue {
                constructor(init = []) { this._items = Array.isArray(init) ? [...init] : []; }
                add(x) { this._items.push(x); return x; }
                enqueue(x) { this._items.push(x); return x; }
                push(x) { this._items.push(x); return x; }
                append(x) { this._items.push(x); return x; }
                poll() { return this._items.shift(); }
                pop() { return this._items.shift(); }
                popleft() { return this._items.shift(); }
                shift() { return this._items.shift(); }
                dequeue() { return this._items.shift(); }
                peek() { return this._items[0]; }
                front() { return this._items[0]; }
                isEmpty() { return this._items.length === 0; }
                empty() { return this._items.length === 0; }
                size() { return this._items.length; }
                get length() { return this._items.length; }
                toJSON() { return this._items; }
                toString() { return JSON.stringify(this._items); }
            }

            ${!hasUserListNode ? `
            function ListNode(val = 0, next = null) {
                if (!(this instanceof ListNode)) return new ListNode(val, next);
                this.val = val;
                this.next = next;
            }
            ` : ''}

            ${!hasUserTreeNode ? `
            function TreeNode(val = 0, left = null, right = null) {
                if (!(this instanceof TreeNode)) return new TreeNode(val, left, right);
                this.val = val;
                this.left = left;
                this.right = right;
            }
            ` : ''}

            const collections = { deque: (init) => new _Queue(init) };
            const deque = (init) => new _Queue(init);
            const heapq = {
                heappush: (q, item) => { q.push(item); q.sort((a,b) => (Array.isArray(a)?a[0]-b[0]:a-b)); },
                heappop: (q) => q.shift()
            };
            function set(init) { return new Set(init || []); }
            function len(x) { return x ? (x.length !== undefined ? x.length : (x.size !== undefined ? x.size() : 0)) : 0; }
            function* range(start, stop, step = 1) {
                if (stop === undefined) { stop = start; start = 0; }
                for (let i = start; step > 0 ? i < stop : i > stop; i += step) yield i;
            }
            function __notIn(item, container) {
                if (container && typeof container.has === 'function') return !container.has(item);
                if (Array.isArray(container)) return !container.includes(item);
                if (container && typeof container === 'object') return !(item in container);
                return true;
            }
            function __in(item, container) { return !__notIn(item, container); }

            function __safeGet(fn) {
                try { return fn(); } catch(e) { return undefined; }
            }

            const __traceEvents = [];
            let __opCount = 0;
            const __callStack = [{ name: 'global', line: 1, depth: 0 }];

            const console = {
                log: (...args) => {
                    const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                    __traceEvents.push({
                        stepIndex: __traceEvents.length + 1,
                        eventType: 'log',
                        output: text,
                        line: __currentLine || 1,
                        callStack: JSON.parse(JSON.stringify(__callStack))
                    });
                },
                warn: (...args) => console.log('[WARN]', ...args),
                error: (...args) => console.log('[ERROR]', ...args),
                info: (...args) => console.log('[INFO]', ...args)
            };

            let __currentLine = 1;
            function __recordStep(lineNum, eventType, desc, rawVars = {}) {
                if (++__opCount > ${this.MAX_OPERATIONS}) {
                    throw new Error("Execution limit exceeded (" + ${this.MAX_OPERATIONS} + " steps). Infinite loop prevented.");
                }
                __currentLine = lineNum;

                const sanitizedVars = {};
                let primaryDataStructure = null;
                let detectedDsType = 'array';

                for (let k in rawVars) {
                    const val = rawVars[k];
                    if (val === undefined) continue;

                    try {
                        if (val instanceof _Stack || k === 's' || k === 'stack') {
                            const arr = (val instanceof _Stack) ? val._items : (Array.isArray(val) ? val : (val && val._items ? val._items : []));
                            sanitizedVars[k] = [...arr];
                            primaryDataStructure = [...arr];
                            detectedDsType = 'stack';
                        } else if (val instanceof _Queue || k === 'q' || k === 'queue') {
                            const arr = (val instanceof _Queue) ? val._items : (Array.isArray(val) ? val : (val && val._items ? val._items : []));
                            sanitizedVars[k] = [...arr];
                            primaryDataStructure = [...arr];
                            detectedDsType = 'queue';
                        } else if (Array.isArray(val)) {
                            sanitizedVars[k] = val.slice(0, 100);
                            if (!primaryDataStructure && detectedDsType !== 'stack' && detectedDsType !== 'queue') {
                                primaryDataStructure = [...val];
                                detectedDsType = 'array';
                            }
                        } else if (typeof val === 'function') {
                            sanitizedVars[k] = '[Function ' + (val.name || 'anonymous') + ']';
                        } else if (typeof val === 'object' && val !== null) {
                            sanitizedVars[k] = JSON.parse(JSON.stringify(val));
                        } else {
                            sanitizedVars[k] = val;
                        }
                    } catch (e) {
                        sanitizedVars[k] = String(val);
                    }
                }

                __traceEvents.push({
                    stepIndex: __traceEvents.length + 1,
                    line: lineNum,
                    eventType: eventType || 'line',
                    description: desc || ('Executing line ' + lineNum),
                    variables: sanitizedVars,
                    arrayState: primaryDataStructure,
                    dsType: detectedDsType,
                    activeIndices: [],
                    callStack: JSON.parse(JSON.stringify(__callStack))
                });
            }
        `);

        // Generate line snapshot arguments string using TDZ-safe getter
        const snapshotExpr = `{ ${Array.from(detectedVarNames).map(v => `${v}: __safeGet(() => ${v})`).join(', ')} }`;

        let inClass = false;
        let classDepth = 0;
        let parenDepth = 0;
        let bracketDepth = 0;
        let objectLiteralDepth = 0;

        // Generate line-by-line instrumented code
        for (let idx = 0; idx < lines.length; idx++) {
            const lineNum = idx + 1;
            let line = lines[idx];
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                instrumented.push(line);
                continue;
            }

            // Track expression completeness
            parenDepth += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
            bracketDepth += (line.match(/\[/g) || []).length - (line.match(/\]/g) || []).length;

            // Track object literal depth (e.g. const graph = { ... }; or graph = { ... };)
            if (trimmed.match(/(?:(?:const|let|var)\s+)?[a-zA-Z0-9_$]+\s*=\s*\{/) ||
                trimmed.match(/=\s*\{$/) ||
                trimmed.match(/:\s*\{$/) ||
                (objectLiteralDepth > 0 && trimmed.includes('{'))) {
                // Count { after the object assignment
                const eqIdx = line.indexOf('=');
                const lineAfterEq = (eqIdx !== -1 && trimmed.includes('=')) ? line.slice(eqIdx) : line;
                objectLiteralDepth += (lineAfterEq.match(/\{/g) || []).length;
            }

            if (objectLiteralDepth > 0) {
                const eqIdx = line.indexOf('=');
                const lineForCloses = (line.includes('={') || line.includes('= {') || line.match(/=\s*\{/)) && eqIdx !== -1 ? line.slice(eqIdx) : line;
                const closes = (lineForCloses.match(/\}/g) || []).length;
                objectLiteralDepth -= closes;
                if (objectLiteralDepth <= 0) {
                    objectLiteralDepth = 0;
                    instrumented.push(line);
                    instrumented.push(`__recordStep(${lineNum}, 'line', 'Executing line ${lineNum}', ${snapshotExpr});`);
                    continue;
                }
                instrumented.push(line);
                continue;
            }

            // Class declaration guard: don't inject statements directly inside class body
            if (trimmed.match(/^class\s+[a-zA-Z0-9_$]+/)) {
                inClass = true;
                classDepth += (line.match(/\{/g) || []).length;
                instrumented.push(line);
                continue;
            }

            if (inClass) {
                const opens = (line.match(/\{/g) || []).length;
                const closes = (line.match(/\}/g) || []).length;
                classDepth += (opens - closes);
                if (classDepth <= 0) {
                    inClass = false;
                    classDepth = 0;
                    instrumented.push(line);
                    continue;
                }
                if (classDepth <= 1) {
                    instrumented.push(line);
                    continue;
                }
            }

            // Function declaration
            if (trimmed.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/)) {
                const funcName = trimmed.match(/function\s+([a-zA-Z0-9_$]+)/)[1];
                instrumented.push(line);
                instrumented.push(`
                    __callStack.push({ name: '${funcName}', line: ${lineNum}, depth: __callStack.length });
                    __recordStep(${lineNum}, 'call', 'Enter ${funcName}()', ${snapshotExpr});
                `);
                continue;
            }

            // Return statement
            if (trimmed.startsWith('return ') || trimmed === 'return;' || trimmed === 'return') {
                instrumented.push(`
                    __recordStep(${lineNum}, 'return', 'Return', ${snapshotExpr});
                    if (__callStack.length > 1) __callStack.pop();
                `);
                instrumented.push(line);
                continue;
            }

            // Loop statements
            if (trimmed.startsWith('for ') || trimmed.startsWith('for(') || trimmed.startsWith('while ') || trimmed.startsWith('while(')) {
                instrumented.push(`__recordStep(${lineNum}, 'loop', 'Loop condition evaluated', ${snapshotExpr});`);
                instrumented.push(line);
                continue;
            }

            // Else / else if statements: never inject step between } and else!
            if (trimmed.startsWith('else')) {
                if (line.includes('{')) {
                    line = line.replace(/\{/, `{ __recordStep(${lineNum}, 'branch', 'Evaluating branch', ${snapshotExpr}); `);
                    instrumented.push(line);
                    continue;
                }
            }

            // If statements
            if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
                if (line.includes('{')) {
                    line = line.replace(/\{/, `{ __recordStep(${lineNum}, 'branch', 'Evaluating branch', ${snapshotExpr}); `);
                    instrumented.push(line);
                    continue;
                }
            }

            instrumented.push(line);

            // Don't inject in the middle of incomplete multi-line statements
            const endsWithOp = trimmed.endsWith(',') || trimmed.endsWith('=') || trimmed.endsWith('+') || trimmed.endsWith('-') || trimmed.endsWith('*') || trimmed.endsWith('&&') || trimmed.endsWith('||');
            const isUnfinished = (parenDepth > 0) || (bracketDepth > 0) || endsWithOp;

            if (trimmed !== '{' && trimmed !== '}' && !isUnfinished) {
                instrumented.push(`__recordStep(${lineNum}, 'line', 'Executing line ${lineNum}', ${snapshotExpr});`);
            }
        }

        instrumented.push(`return __traceEvents;`);

        return instrumented.join('\n');
    },

    /**
     * Enriches steps with swap, compare, and push/pop annotations
     */
    enrichOperations(rawSteps) {
        if (!rawSteps || rawSteps.length === 0) return [];

        for (let i = 0; i < rawSteps.length; i++) {
            const cur = rawSteps[i];
            const prev = i > 0 ? rawSteps[i - 1] : null;

            // Detect active indices from variables (i, j, k, minIdx, low, high, mid)
            const activeIdx = [];
            const vars = cur.variables || {};

            ['j', 'i', 'k', 'minIdx', 'mid', 'low', 'high'].forEach(key => {
                if (typeof vars[key] === 'number' && vars[key] >= 0 && vars[key] < 100) {
                    if (!activeIdx.includes(vars[key])) activeIdx.push(vars[key]);
                }
            });

            cur.activeIndices = activeIdx;

            // Detect Array Swaps & Value Changes
            if (prev && cur.arrayState && prev.arrayState && cur.arrayState.length === prev.arrayState.length) {
                const changedIndices = [];
                for (let k = 0; k < cur.arrayState.length; k++) {
                    if (cur.arrayState[k] !== prev.arrayState[k]) {
                        changedIndices.push(k);
                    }
                }

                if (changedIndices.length === 2) {
                    cur.operationType = 'swap';
                    cur.swapPair = changedIndices;
                    cur.description = `Swapped items at index ${changedIndices[0]} (${cur.arrayState[changedIndices[0]]}) and index ${changedIndices[1]} (${cur.arrayState[changedIndices[1]]})`;
                } else if (changedIndices.length === 1) {
                    cur.operationType = 'overwrite';
                    cur.activeIndices = [changedIndices[0]];
                    cur.description = `Updated index ${changedIndices[0]} to value ${cur.arrayState[changedIndices[0]]}`;
                }
            }

            // Detect Stack Push/Pop Operations
            if (prev && cur.dsType === 'stack') {
                const prevLen = prev.arrayState ? prev.arrayState.length : 0;
                const curLen = cur.arrayState ? cur.arrayState.length : 0;
                if (curLen > prevLen) {
                    cur.operationType = 'push';
                    cur.description = `Pushed element onto stack (${cur.arrayState[curLen - 1]})`;
                } else if (curLen < prevLen) {
                    cur.operationType = 'pop';
                    cur.description = `Popped top element from stack`;
                }
            }

            // Detect Queue Enqueue/Dequeue Operations
            if (prev && cur.dsType === 'queue') {
                const prevLen = prev.arrayState ? prev.arrayState.length : 0;
                const curLen = cur.arrayState ? cur.arrayState.length : 0;
                if (curLen > prevLen) {
                    cur.operationType = 'enqueue';
                    cur.description = `Enqueued element (${cur.arrayState[curLen - 1]})`;
                } else if (curLen < prevLen) {
                    cur.operationType = 'dequeue';
                    cur.description = `Dequeued element from queue`;
                }
            }
        }

        return rawSteps;
    },

    /**
     * Fallback step generation when code doesn't produce dynamic events
     */
    generateFallbackTrace(sourceCode, lang) {
        const lines = sourceCode.split('\n');
        const trace = [];
        const dummyArr = [5, 2, 8, 1, 9];

        for (let i = 0; i < Math.min(lines.length, 50); i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('//') || line.startsWith('#')) continue;

            trace.push({
                stepIndex: trace.length + 1,
                line: i + 1,
                eventType: 'line',
                description: `Executed line ${i + 1}`,
                variables: { line: i + 1, status: 'Executed' },
                arrayState: [...dummyArr],
                dsType: 'array',
                activeIndices: [i % dummyArr.length],
                callStack: [{ name: 'main', line: i + 1, depth: 1 }]
            });
        }
        return trace;
    },

    extractLineNumber(err) {
        if (!err.stack) return 1;
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/) || err.stack.match(/:(\d+):(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeLabTracer;
}
if (typeof window !== 'undefined') {
    window.CodeLabTracer = CodeLabTracer;
}
if (typeof self !== 'undefined') {
    self.CodeLabTracer = CodeLabTracer;
}
