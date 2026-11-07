/**
 * JavaScript Execution Tracer Adapter
 * Uses Babel AST instrumentation and Node.js VM to trace arbitrary user JavaScript code.
 * Collects line numbers, call stack, local variables, variable changes, console output, and exceptions.
 */

const fs = require('fs');
const vm = require('vm');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

class JavaScriptTracer {
    constructor(sourcePath, breakpoints = [], maxSteps = 10000) {
        this.sourcePath = sourcePath;
        this.breakpoints = new Set(breakpoints.map(Number));
        this.maxSteps = maxSteps;
        this.steps = [];
        this.stepCount = 0;
        this.stdoutBuffer = [];
        this.stderrBuffer = [];
        this.callStack = [{ name: 'global', line: 1, depth: 0 }];
    }

    serializeValue(val, seen = new WeakSet()) {
        if (val === undefined) return { value: 'undefined', type: 'undefined' };
        if (val === null) return { value: null, type: 'null' };
        if (typeof val === 'number') return { value: val, type: 'number' };
        if (typeof val === 'boolean') return { value: val, type: 'boolean' };
        if (typeof val === 'string') {
            const truncated = val.length > 200 ? val.slice(0, 200) + '...' : val;
            return { value: truncated, type: `string[${val.length}]` };
        }
        if (typeof val === 'function') {
            return { value: `function ${val.name || 'anonymous'}()`, type: 'function' };
        }
        if (typeof val === 'symbol') {
            return { value: val.toString(), type: 'symbol' };
        }
        if (typeof val === 'bigint') {
            return { value: val.toString() + 'n', type: 'bigint' };
        }

        if (typeof val === 'object') {
            if (seen.has(val)) {
                return { value: '[Circular]', type: 'Object' };
            }
            seen.add(val);

            if (Array.isArray(val)) {
                const len = val.length;
                const items = [];
                const limit = Math.min(len, 50);
                for (let i = 0; i < limit; i++) {
                    items.push(this.serializeValue(val[i], seen).value);
                }
                if (len > 50) items.push(`...+${len - 50} more`);
                return { value: items, type: `Array[${len}]` };
            }

            // Normal object
            const obj = {};
            const keys = Object.keys(val);
            const limit = Math.min(keys.length, 50);
            for (let i = 0; i < limit; i++) {
                const k = keys[i];
                obj[k] = this.serializeValue(val[k], seen).value;
            }
            if (keys.length > 50) obj['...'] = `+${keys.length - 50} more`;
            return { value: obj, type: val.constructor ? val.constructor.name : 'Object' };
        }

        return { value: String(val), type: typeof val };
    }

    getVisibleBindings(path) {
        const names = new Set();
        let curr = path.scope;
        while (curr) {
            if (curr.bindings) {
                for (const k of Object.keys(curr.bindings)) {
                    if (!k.startsWith('__')) {
                        names.add(k);
                    }
                }
            }
            curr = curr.parent;
        }
        return Array.from(names);
    }

    instrument(code) {
        const self = this;
        let ast;
        try {
            ast = parser.parse(code, {
                sourceType: 'script',
                locations: true,
                errorRecovery: false
            });
        } catch (err) {
            return {
                syntaxError: {
                    type: 'SyntaxError',
                    message: err.message,
                    line: err.loc ? err.loc.line : 1,
                    column: err.loc ? err.loc.column : 1
                }
            };
        }

        const makeTraceCall = (line, funcName, bindingNames) => {
            const objProps = [];
            for (const name of bindingNames) {
                objProps.push(
                    t.tryStatement(
                        t.blockStatement([
                            t.ifStatement(
                                t.binaryExpression(
                                    '!==',
                                    t.unaryExpression('typeof', t.identifier(name)),
                                    t.stringLiteral('undefined')
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        '=',
                                        t.memberExpression(t.identifier('_v'), t.stringLiteral(name), true),
                                        t.identifier(name)
                                    )
                                )
                            )
                        ]),
                        t.catchClause(t.identifier('_e'), t.blockStatement([]))
                    )
                );
            }

            const varGetter = t.arrowFunctionExpression(
                [],
                t.blockStatement([
                    t.variableDeclaration('const', [
                        t.variableDeclarator(t.identifier('_v'), t.objectExpression([]))
                    ]),
                    ...objProps,
                    t.returnStatement(t.identifier('_v'))
                ])
            );

            const call = t.expressionStatement(
                t.callExpression(t.identifier('__trace__'), [
                    t.numericLiteral(line),
                    t.stringLiteral(funcName),
                    varGetter
                ])
            );
            call._isTracer = true;
            return call;
        };

        const makeFuncEnter = (funcName, line) => {
            const enter = t.expressionStatement(
                t.callExpression(t.identifier('__func_enter__'), [
                    t.stringLiteral(funcName),
                    t.numericLiteral(line)
                ])
            );
            enter._isTracer = true;
            return enter;
        };

        // Pass 1: normalize single-statement blocks
        traverse(ast, {
            IfStatement(path) {
                if (!t.isBlockStatement(path.node.consequent)) {
                    path.node.consequent = t.blockStatement([path.node.consequent]);
                }
                if (path.node.alternate && !t.isBlockStatement(path.node.alternate) && !t.isIfStatement(path.node.alternate)) {
                    path.node.alternate = t.blockStatement([path.node.alternate]);
                }
            },
            Loop(path) {
                if (!t.isBlockStatement(path.node.body)) {
                    path.node.body = t.blockStatement([path.node.body]);
                }
            }
        });

        // Pass 2: collect statements to instrument
        const targets = [];
        const funcEnters = [];

        traverse(ast, {
            Function(path) {
                const funcName = path.node.id ? path.node.id.name : (path.parent && path.parent.id ? path.parent.id.name : 'anonymous');
                const line = path.node.loc ? path.node.loc.start.line : 1;
                funcEnters.push({ path, funcName, line });
            },
            Statement(path) {
                if (
                    t.isBlockStatement(path.node) ||
                    t.isProgram(path.node) ||
                    t.isFunctionDeclaration(path.node) ||
                    path.node._isTracer
                ) {
                    return;
                }
                const funcParent = path.getFunctionParent();
                const funcName = funcParent && funcParent.node.id ? funcParent.node.id.name : 'global';
                const line = path.node.loc ? path.node.loc.start.line : 1;
                const bindings = self.getVisibleBindings(path);
                targets.push({ path, line, funcName, bindings });
            }
        });

        // Insert function entries
        for (const item of funcEnters) {
            if (t.isBlockStatement(item.path.node.body)) {
                item.path.node.body.body.unshift(makeFuncEnter(item.funcName, item.line));
            }
        }

        // Insert trace statements
        for (const item of targets) {
            const traceStmt = makeTraceCall(item.line, item.funcName, item.bindings);
            item.path.insertBefore(traceStmt);
        }

        const output = generate(ast, { retainLines: false });
        return { instrumentedCode: output.code };
    }

    run(userCode) {
        // 1. Instrument code
        const instrResult = this.instrument(userCode);
        if (instrResult.syntaxError) {
            return {
                success: false,
                stage: 'compilation',
                error: instrResult.syntaxError,
                steps: [],
                stdout: '',
                stderr: `${instrResult.syntaxError.type}: ${instrResult.syntaxError.message} at line ${instrResult.syntaxError.line}`
            };
        }

        let pendingOutput = '';
        let isTruncated = false;
        let runtimeError = null;

        const sandbox = {
            console: {
                log: (...args) => {
                    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
                    this.stdoutBuffer.push(text);
                    pendingOutput += text;
                },
                error: (...args) => {
                    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
                    this.stderrBuffer.push(text);
                    pendingOutput += text;
                },
                warn: (...args) => {
                    const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
                    this.stdoutBuffer.push(text);
                    pendingOutput += text;
                }
            },
            __func_enter__: (funcName, line) => {
                this.callStack.push({
                    name: funcName,
                    line: line,
                    depth: this.callStack.length
                });
            },
            __func_exit__: () => {
                if (this.callStack.length > 1) {
                    this.callStack.pop();
                }
            },
            __trace__: (line, funcName, varGetter) => {
                if (this.stepCount >= this.maxSteps) {
                    isTruncated = true;
                    throw new Error('__EXECUTION_TRUNCATED_MAX_STEPS__');
                }

                let rawVars = {};
                try {
                    rawVars = varGetter();
                } catch (e) {
                    rawVars = {};
                }

                const variables = {};
                const variableTypes = {};
                for (const [k, v] of Object.entries(rawVars)) {
                    const s = this.serializeValue(v);
                    variables[k] = s.value;
                    variableTypes[k] = s.type;
                }

                // Update line in top frame of callStack
                if (this.callStack.length > 0) {
                    this.callStack[this.callStack.length - 1].line = line;
                }

                const out = pendingOutput;
                pendingOutput = '';

                this.steps.push({
                    step: this.stepCount + 1,
                    line: line,
                    function: funcName,
                    eventType: 'step',
                    isBreakpoint: this.breakpoints.has(line),
                    description: `Executing line ${line} in ${funcName}()`,
                    callStack: JSON.parse(JSON.stringify(this.callStack)).reverse(),
                    variables: variables,
                    variableTypes: variableTypes,
                    output: out
                });

                this.stepCount++;
            },
            Math,
            Number,
            String,
            Boolean,
            Array,
            Object,
            JSON,
            Date,
            RegExp,
            Map,
            Set,
            parseInt,
            parseFloat,
            isNaN,
            isFinite
        };

        const context = vm.createContext(sandbox);

        try {
            const script = new vm.Script(instrResult.instrumentedCode, {
                filename: this.sourcePath,
                timeout: 5000
            });
            script.runInContext(context);
        } catch (err) {
            if (err.message !== '__EXECUTION_TRUNCATED_MAX_STEPS__') {
                runtimeError = {
                    type: err.name || 'RuntimeError',
                    message: err.message,
                    line: this.steps.length > 0 ? this.steps[this.steps.length - 1].line : 1,
                    stack: err.stack
                };
            }
        }

        // Add any trailing output
        if (pendingOutput && this.steps.length > 0) {
            this.steps[this.steps.length - 1].output = (this.steps[this.steps.length - 1].output || '') + pendingOutput;
        }

        return {
            success: true,
            language: 'javascript',
            totalSteps: this.steps.length,
            isTruncated: isTruncated,
            hasRuntimeError: !!runtimeError,
            error: runtimeError,
            steps: this.steps,
            stdout: this.stdoutBuffer.join(''),
            stderr: this.stderrBuffer.join('') + (runtimeError ? `\n${runtimeError.type}: ${runtimeError.message}` : '')
        };
    }
}

if (require.main === module) {
    if (process.argv.length < 3) {
        console.log(JSON.stringify({ success: false, error: { message: 'Usage: node javascript_adapter.js <source_file> [breakpoints_json]' } }));
        process.exit(1);
    }

    const sourcePath = process.argv[2];
    let bps = [];
    if (process.argv[3]) {
        try {
            bps = JSON.parse(process.argv[3]);
        } catch (e) {
            bps = [];
        }
    }

    const code = fs.readFileSync(sourcePath, 'utf8');
    const tracer = new JavaScriptTracer(sourcePath, bps);
    const result = tracer.run(code);
    console.log(JSON.stringify(result));
}

module.exports = JavaScriptTracer;
