/**
 * AlgoAI Service — Production-Ready AI Mentor Backend
 * Supports:
 * - Multi-provider streaming: Google Gemini (with multi-model cascade), OpenAI, Groq, or Built-in DSA Mentor Engine
 * - Authorized Tools: Code execution/debugging via container runner, algorithm knowledge retrieval, progressive hints, complexity analysis
 * - Context-aware system prompting (CodeLab code, compiler errors, active visualizer, Socratic Hint Mode, Mock Interview Mode)
 * - Agentic UI directives for launching visualizers with custom user inputs directly from chat
 * - Resilient streaming via Server-Sent Events (SSE) with automatic fallback
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const debuggerRunner = require('./debugger/runner');

// =========================================================================
// 1. AlgoLearn Canonical Algorithm & DSA Knowledge Base
// =========================================================================
const { ALGORITHM_KNOWLEDGE, generateConversationalResponse } = require('./algoai-knowledge');

// =========================================================================
// 2. Progressive Hint System (Socratic Problem Solving)
// =========================================================================
const PROGRESSIVE_HINTS = {
    'two_sum': [
        { level: 1, title: 'Understand the Goal', text: 'You need to find two indices `i` and `j` such that `nums[i] + nums[j] == target`. What is the brute-force approach, and what is its time complexity?' },
        { level: 2, title: 'Think about Trade-offs', text: 'Brute-force checks all pairs in O(n²). Can you trade space for speed? If you are at number `x`, what exact complementary number do you need to complete the sum?' },
        { level: 3, title: 'Data Structure Selection', text: 'The complement needed is `target - x`. What data structure allows O(1) average-time lookups to see if you have encountered `target - x` before?' },
        { level: 4, title: 'Algorithm Walkthrough', text: 'Use a `HashMap<Integer, Integer>` mapping `value -> index`. Iterate through the array once: for each number `x`, check if `target - x` is in the map. If yes, return both indices; otherwise, store `x -> current_index`.' },
        { level: 5, title: 'Java Solution', text: 'Here is the optimal O(n) time and O(n) space solution:\n```java\npublic int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[]{map.get(complement), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[0];\n}\n```' }
    ],
    'reverse_linked_list': [
        { level: 1, title: 'Pointers Needed', text: 'Consider a singly linked list `1 -> 2 -> 3 -> null`. What pointers do you need to track as you change `current.next`?' },
        { level: 2, title: 'Preventing Disconnection', text: 'Before reversing `curr.next = prev`, you must save `curr.next` in a temporary variable `nextTemp` so you don\'t lose the rest of the list.' },
        { level: 3, title: 'Step-by-Step Cycle', text: 'At each node: 1) `nextTemp = curr.next`, 2) `curr.next = prev`, 3) `prev = curr`, 4) `curr = nextTemp`. Stop when `curr == null`.' },
        { level: 4, title: 'Java Solution', text: 'Optimal O(n) time and O(1) space iterative solution:\n```java\npublic ListNode reverseList(ListNode head) {\n    ListNode prev = null;\n    ListNode curr = head;\n    while (curr != null) {\n        ListNode nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}\n```' }
    ]
};

// =========================================================================
// 3. System Prompt Architecture
// =========================================================================
function buildSystemPrompt(context = {}) {
    const page = context.page || 'index.html';
    const language = context.activeLanguage || 'java';
    const activeAlgorithm = context.activeAlgorithm || '';
    const activeCode = context.activeCode ? String(context.activeCode).slice(0, 3500) : '';
    const hintMode = Boolean(context.hintMode);
    const interviewMode = Boolean(context.interviewMode);
    const activeError = context.activeError || null;

    let modeInstructions = '';
    if (hintMode) {
        modeInstructions += `
ACTIVE MODE — SOCRATIC PROGRESSIVE HINTS (STRICT):
- Do NOT reveal the final complete working code solution right away.
- Give ONE clear, thought-provoking clue or guiding question at a time (e.g., identify the bottleneck or suggest a data structure property).
- Ask the student to confirm their next thought before unlocking the next hint level, unless they explicitly type "show full solution".`;
    }

    if (interviewMode) {
        modeInstructions += `
ACTIVE MODE — TECHNICAL MOCK INTERVIEWER (FAANG/MAANG STYLE):
- Conduct a realistic, conversational technical interview.
- Keep responses focused and interactive: ask clarifying questions about constraints/edge cases, challenge their time/space complexity, and give constructive feedback like a senior staff engineer.
- If they just started Mock Interview Mode, welcome them briefly and propose choosing an interview topic or dive straight into a warmup coding problem.`;
    }

    let errorSection = '';
    if (activeError && activeError.message) {
        errorSection = `
ACTIVE CODELAB ERROR TO FIX:
- Error Type: ${activeError.type || 'ERROR'}
- Failing Line: ${activeError.line || 'Unknown'}
- Diagnostic Output:
\`\`\`
${String(activeError.message).slice(0, 1200)}
\`\`\`
Explain clearly in plain English WHY this error occurred on that line, and provide the complete corrected ${language} code in a fenced code block so the user can click "Apply to CodeLab".`;
    }

    return `You are "AlgoAI", an expert senior software engineer, programming mentor, and interactive tutor inside the AlgoLearn web application.
Your mission is to help students master Data Structures & Algorithms, Java, Python, C++, C, and JavaScript.

CORE PERSONALITY & PEDAGOGY:
- Human, Warm & Sharp: Speak like a real senior developer pair-programming beside the student — never stiff or robotic.
- Big-O Rigor: Explain Time Complexity (best, average, worst) and Auxiliary Space Complexity clearly using inline math like $O(n \\log n)$ and $O(1)$.
- Step-by-Step Clarity: When breaking down algorithms or debugging code, trace states concretely with small examples.
- Code Formatting: Always use fenced code blocks with the language tag (e.g. \`\`\`java, \`\`\`python, \`\`\`cpp, \`\`\`javascript) so the UI renders copy and "Apply to CodeLab" buttons.
${modeInstructions}

CURRENT APPLICATION CONTEXT:
- Active Page: ${page}
- Active Language: ${language}
${activeAlgorithm ? `- Active Visualizer / Topic: ${activeAlgorithm}` : ''}
${activeCode ? `- Currently Open Code in CodeLab Editor:\n\`\`\`${language}\n${activeCode}\n\`\`\`` : ''}
${errorSection}

ALGOLEARN AGENTIC VISUALIZER ACTIONS:
You can give the user one-click launcher buttons inside the chat UI!
1. If the user asks to visualize, animate, demo, or trace a sorting algorithm (bubble, selection, insertion, quick, merge, heap) — especially with numbers like [42, 7, 19, 3, 28] — append ONE machine tag on its own final line:
[[ALGOAI_ACTION:{"type":"visualize","category":"sorting","algo":"quick","array":[42,7,19,3,28],"label":"Launch Quick Sort with [42, 7, 19, 3, 28]"}]]
2. If you recommend opening one of AlgoLearn's dedicated studios or visualizers (visualize-sorting.html, visualize-search.html, visualize-tree.html, visualize-graph.html, visualize-pathfinding.html, visualize-dp.html, visualize-backtracking.html, visualize-ds.html, codelab.html), you may append ONE navigation tag on its own final line:
[[ALGOAI_ACTION:{"type":"navigate","page":"visualize-tree.html","label":"Open Binary Tree Visualizer"}]]
Never alter the double-bracket JSON format of [[ALGOAI_ACTION:...]].`;
}

/**
 * Formats conversation history into valid alternating Gemini contents.
 */
function formatGeminiContents(messages = []) {
    const cleaned = [];
    for (const msg of messages) {
        if (!msg || !msg.content || !String(msg.content).trim()) continue;
        const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
        // Drop leading model turns since Gemini expects user turn first
        if (cleaned.length === 0 && role === 'model') continue;

        const text = String(msg.content);
        const prev = cleaned[cleaned.length - 1];
        if (prev && prev.role === role) {
            prev.parts[0].text += '\n\n' + text;
        } else {
            cleaned.push({ role, parts: [{ text }] });
        }
    }
    return cleaned;
}

// =========================================================================
// 4. Provider Strategy: Gemini (Cascade), OpenAI/Groq, or Built-in Engine
// =========================================================================
class AlgoAIService {
    constructor() {
        this.geminiKey = (process.env.GEMINI_API_KEY || '').trim();
        this.openaiKey = (process.env.OPENAI_API_KEY || '').trim();
        this.groqKey = (process.env.GROQ_API_KEY || '').trim();
        this.geminiModel = (process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim();
        this.openaiModel = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
        this.groqModel = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
        this.lastActiveModel = null;
    }

    getGeminiCandidateModels() {
        return Array.from(new Set([
            this.geminiModel,
            'gemini-3.5-flash',
            'gemini-3.8-flash',
            'gemini-flash-latest',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite'
        ].filter(Boolean)));
    }

    getStatus() {
        let provider = 'built-in-expert';
        let model = 'AlgoAI Heuristic & CodeLab Engine';

        if (this.geminiKey) {
            provider = 'gemini';
            model = this.lastActiveModel || this.geminiModel;
        } else if (this.groqKey) {
            provider = 'groq';
            model = this.groqModel;
        } else if (this.openaiKey) {
            provider = 'openai';
            model = this.openaiModel;
        }

        return {
            ready: true,
            provider,
            model,
            hasExternalKey: Boolean(this.geminiKey || this.openaiKey || this.groqKey),
            supportedLanguages: ['java', 'python', 'cpp', 'javascript', 'c'],
            features: [
                'Live Gemini Multi-Model AI Mentor',
                'Live Container Code Execution & Error Auto-Fix',
                'Step-by-Step Line Debugger',
                'Big-O Time & Space Complexity Analyzer',
                'Progressive Socratic Hints & Mock Interview Mode',
                'Agentic Visualizer Launching',
                'Streaming Markdown Responses'
            ]
        };
    }

    // ---------------------------------------------------------------------
    // Authorized Tool: Run Code via Docker Container Debugger
    // ---------------------------------------------------------------------
    async executeToolRunCode(code, language, input = '') {
        try {
            const traceResult = await debuggerRunner.run({
                code,
                language: language || 'java',
                breakpoints: [],
                input: input || ''
            });

            return {
                tool: 'run_code',
                success: traceResult.success !== false,
                language: language || 'java',
                stdout: traceResult.stdout || '',
                stderr: traceResult.stderr || (traceResult.error ? traceResult.error.message : ''),
                stepsCount: (traceResult.steps || []).length,
                hasError: Boolean(traceResult.error || (traceResult.stderr && !traceResult.stdout)),
                lastStepVariables: traceResult.steps && traceResult.steps.length > 0
                    ? traceResult.steps[traceResult.steps.length - 1].variables
                    : null
            };
        } catch (err) {
            return {
                tool: 'run_code',
                success: false,
                error: err.message
            };
        }
    }

    // ---------------------------------------------------------------------
    // Authorized Tool: Get Algorithm Canonical Knowledge
    // ---------------------------------------------------------------------
    executeToolGetAlgorithm(algoKey) {
        if (!algoKey) return null;
        const normalized = algoKey.toLowerCase().replace(/[\s-]/g, '_');
        for (const [key, data] of Object.entries(ALGORITHM_KNOWLEDGE)) {
            if (key === normalized || key.includes(normalized) || normalized.includes(key)) {
                return data;
            }
        }
        return null;
    }

    // ---------------------------------------------------------------------
    // Authorized Tool: Progressive Hint
    // ---------------------------------------------------------------------
    executeToolGetHint(problemKey, requestedLevel = 1) {
        const key = (problemKey || 'two_sum').toLowerCase().replace(/[\s-]/g, '_');
        const hints = PROGRESSIVE_HINTS[key] || PROGRESSIVE_HINTS['two_sum'];
        const targetLevel = Math.max(1, Math.min(requestedLevel, hints.length));
        return {
            problem: key,
            currentLevel: targetLevel,
            totalLevels: hints.length,
            hint: hints[targetLevel - 1],
            hasMore: targetLevel < hints.length
        };
    }

    // ---------------------------------------------------------------------
    // Built-in Expert Engine: Fallback / Offline Conversational Mentor
    // ---------------------------------------------------------------------
    async generateExpertResponse(messages, context = {}, toolResults = []) {
        return await generateConversationalResponse(
            messages,
            context,
            toolResults,
            (code, lang, input) => this.executeToolRunCode(code, lang, input),
            (problem, level) => this.executeToolGetHint(problem, level)
        );
    }

    // ---------------------------------------------------------------------
    // SSE Streaming Generator
    // ---------------------------------------------------------------------
    async streamChat({ messages, context = {} }, res) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const sendEvent = (data) => {
            if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            }
        };

        const toolResults = [];
        let activeProvider = 'built-in-expert';
        let activeModel = 'AlgoAI Built-in Engine';
        let hasStreamedAnyChunk = false;

        try {
            if (this.geminiKey) {
                const usedModel = await this.streamGeminiWithCascade(
                    { messages, context, toolResults },
                    (evt) => {
                        if (evt.type === 'chunk' && evt.text) hasStreamedAnyChunk = true;
                        sendEvent(evt);
                    }
                );
                activeProvider = 'gemini';
                activeModel = usedModel;
                this.lastActiveModel = usedModel;
            } else if (this.groqKey || this.openaiKey) {
                await this.streamOpenAICompatible(
                    { messages, context, toolResults },
                    (evt) => {
                        if (evt.type === 'chunk' && evt.text) hasStreamedAnyChunk = true;
                        sendEvent(evt);
                    }
                );
                activeProvider = this.groqKey ? 'groq' : 'openai';
                activeModel = this.groqKey ? this.groqModel : this.openaiModel;
            } else {
                const expertText = await this.generateExpertResponse(messages, context, toolResults);
                const words = expertText.split(/(\s+)/);
                for (const word of words) {
                    sendEvent({ type: 'chunk', text: word });
                    await new Promise(r => setTimeout(r, 10));
                }
            }

            sendEvent({
                type: 'done',
                toolResults,
                provider: activeProvider,
                model: activeModel,
                metadata: { timestamp: Date.now() }
            });
            res.end();
        } catch (err) {
            console.error('[AlgoAI Service Stream Error]:', err.message || err);
            // Graceful fallback to built-in expert ONLY if nothing was streamed or to complete answer
            try {
                if (hasStreamedAnyChunk) {
                    sendEvent({ type: 'chunk', text: `\n\n` });
                }
                const fallbackText = await this.generateExpertResponse(messages, context, toolResults);
                const words = fallbackText.split(/(\s+)/);
                for (const word of words) {
                    sendEvent({ type: 'chunk', text: word });
                    await new Promise(r => setTimeout(r, 8));
                }
                sendEvent({
                    type: 'done',
                    toolResults,
                    provider: 'built-in-expert',
                    model: 'AlgoAI Fallback Engine',
                    fallback: true
                });
            } catch (innerErr) {
                sendEvent({ type: 'error', error: err.message });
            }
            res.end();
        }
    }

    // ---------------------------------------------------------------------
    // Google Gemini Streaming with Multi-Model Cascade Resilience
    // ---------------------------------------------------------------------
    async streamGeminiWithCascade({ messages, context, toolResults }, sendEvent) {
        const candidates = this.getGeminiCandidateModels();
        let lastErr = null;

        for (const model of candidates) {
            let emittedForThisModel = false;
            try {
                await this.streamGeminiSingleModel(model, { messages, context }, (evt) => {
                    if (evt.type === 'chunk' && evt.text) emittedForThisModel = true;
                    sendEvent(evt);
                });
                if (emittedForThisModel) {
                    return model;
                }
                lastErr = new Error(`Gemini model ${model} returned an empty response.`);
            } catch (err) {
                lastErr = err;
                console.warn(`[AlgoAI] Model ${model} attempt failed (${err.message.slice(0, 140)}). Trying next candidate...`);
                // Never retry if chunks already started streaming to avoid garbled output
                if (emittedForThisModel) {
                    throw err;
                }
            }
        }
        throw lastErr || new Error('All Gemini candidate models failed.');
    }

    async streamGeminiSingleModel(model, { messages, context }, sendEvent) {
        const systemPrompt = buildSystemPrompt(context);
        const contents = formatGeminiContents(messages);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(this.geminiKey)}`;

        const bodyData = JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                temperature: context.interviewMode ? 0.5 : 0.4,
                maxOutputTokens: 2048
            }
        });

        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyData)
                },
                timeout: 25000
            }, (apiRes) => {
                if (apiRes.statusCode !== 200) {
                    let errBody = '';
                    apiRes.on('data', d => errBody += d);
                    apiRes.on('end', () => reject(new Error(`Gemini API Error ${apiRes.statusCode} (${model}): ${errBody}`)));
                    return;
                }

                let buffer = '';
                apiRes.on('data', chunk => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;
                        const jsonStr = trimmed.slice(5).trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const candidate = parsed.candidates && parsed.candidates[0];
                            const parts = candidate?.content?.parts || [];
                            const text = parts
                                .filter(p => !p.thought && typeof p.text === 'string')
                                .map(p => p.text)
                                .join('');
                            if (text) {
                                sendEvent({ type: 'chunk', text });
                            }
                        } catch (e) {
                            // ignore partial chunk JSON parse error
                        }
                    }
                });

                apiRes.on('end', () => {
                    // Process any trailing buffered SSE line
                    const remaining = (buffer || '').trim();
                    if (remaining.startsWith('data:')) {
                        try {
                            const parsed = JSON.parse(remaining.slice(5).trim());
                            const parts = parsed.candidates?.[0]?.content?.parts || [];
                            const text = parts.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('');
                            if (text) sendEvent({ type: 'chunk', text });
                        } catch (e) {}
                    }
                    resolve();
                });
                apiRes.on('error', reject);
            });

            req.on('timeout', () => {
                req.destroy(new Error(`Gemini stream timeout on ${model}`));
            });
            req.on('error', reject);
            req.write(bodyData);
            req.end();
        });
    }

    // ---------------------------------------------------------------------
    // Non-Streaming Gemini Single Call (Cascade)
    // ---------------------------------------------------------------------
    async generateGemini({ messages, context = {} }) {
        const systemPrompt = buildSystemPrompt(context);
        const contents = formatGeminiContents(messages);
        const candidates = this.getGeminiCandidateModels();
        let lastErr = null;

        for (const model of candidates) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.geminiKey)}`;
                const bodyData = JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents,
                    generationConfig: {
                        temperature: context.interviewMode ? 0.5 : 0.4,
                        maxOutputTokens: 2048
                    }
                });

                const reply = await new Promise((resolve, reject) => {
                    const req = https.request(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(bodyData)
                        },
                        timeout: 25000
                    }, (apiRes) => {
                        let body = '';
                        apiRes.on('data', d => body += d);
                        apiRes.on('end', () => {
                            if (apiRes.statusCode !== 200) {
                                return reject(new Error(`Gemini Error ${apiRes.statusCode}: ${body}`));
                            }
                            try {
                                const parsed = JSON.parse(body);
                                const parts = parsed.candidates?.[0]?.content?.parts || [];
                                const text = parts
                                    .filter(p => !p.thought && typeof p.text === 'string')
                                    .map(p => p.text)
                                    .join('');
                                if (!text) return reject(new Error('Empty Gemini reply'));
                                resolve(text);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                    req.on('timeout', () => req.destroy(new Error(`Gemini timeout (${model})`)));
                    req.on('error', reject);
                    req.write(bodyData);
                    req.end();
                });

                this.lastActiveModel = model;
                return { reply, model };
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Gemini unavailable');
    }

    // ---------------------------------------------------------------------
    // OpenAI / Groq Compatible Streaming
    // ---------------------------------------------------------------------
    async streamOpenAICompatible({ messages, context, toolResults }, sendEvent) {
        const isGroq = Boolean(this.groqKey);
        const apiKey = this.groqKey || this.openaiKey;
        const model = isGroq ? this.groqModel : this.openaiModel;
        const host = isGroq ? 'api.groq.com' : 'api.openai.com';
        const path = '/v1/chat/completions';

        const systemPrompt = buildSystemPrompt(context);
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const bodyData = JSON.stringify({
            model,
            messages: formattedMessages,
            temperature: 0.4,
            stream: true
        });

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: host,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Length': Buffer.byteLength(bodyData)
                }
            }, (apiRes) => {
                if (apiRes.statusCode !== 200) {
                    let errBody = '';
                    apiRes.on('data', d => errBody += d);
                    apiRes.on('end', () => reject(new Error(`AI API Error ${apiRes.statusCode}: ${errBody}`)));
                    return;
                }

                let buffer = '';
                apiRes.on('data', chunk => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed === 'data: [DONE]') continue;
                        if (trimmed.startsWith('data:')) {
                            const jsonStr = trimmed.slice(5).trim();
                            if (!jsonStr) continue;
                            try {
                                const parsed = JSON.parse(jsonStr);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    sendEvent({ type: 'chunk', text: content });
                                }
                            } catch (e) {}
                        }
                    }
                });

                apiRes.on('end', () => resolve());
                apiRes.on('error', reject);
            });

            req.on('error', reject);
            req.write(bodyData);
            req.end();
        });
    }

    // ---------------------------------------------------------------------
    // Non-Streaming JSON Chat
    // ---------------------------------------------------------------------
    async chat({ messages, context = {} }) {
        const toolResults = [];

        if (this.geminiKey) {
            try {
                const { reply, model } = await this.generateGemini({ messages, context });
                return {
                    success: true,
                    reply,
                    toolResults,
                    provider: 'gemini',
                    model
                };
            } catch (err) {
                console.warn('[AlgoAI Non-Stream Gemini Fallback]:', err.message);
            }
        }

        const reply = await this.generateExpertResponse(messages, context, toolResults);
        return {
            success: true,
            reply,
            toolResults,
            provider: 'built-in-expert',
            model: 'AlgoAI Heuristic & CodeLab Engine'
        };
    }
}

module.exports = new AlgoAIService();
