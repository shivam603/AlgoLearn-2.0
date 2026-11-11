/**
 * Master Debugger Runner
 * Manages containerized execution environments, resource limits, and language adapter dispatch.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawn, spawnSync } = require('child_process');

const PYTHON_BIN = (() => {
    try {
        if (spawnSync('python', ['--version'], { stdio: 'ignore' }).status === 0) return 'python';
    } catch (e) {}
    return 'python3';
})();

class DebuggerRunner {
    constructor() {
        this.adaptersDir = path.join(__dirname, 'adapters');
        this.dockerImage = 'algolearn-debugger:latest';
        this.timeoutMs = 30000;
    }

    extractJavaClassName(code) {
        // 1. Prioritize explicit public class
        const publicMatch = code.match(/\bpublic\s+class\s+([A-Za-z0-9_]+)/);
        if (publicMatch) return publicMatch[1];

        // 2. Look for class containing main method
        const classMatches = [...code.matchAll(/\bclass\s+([A-Za-z0-9_]+)[^{]*\{/g)];
        for (const m of classMatches) {
            const startIdx = m.index;
            const snippet = code.slice(startIdx, startIdx + 1500);
            if (/public\s+static\s+void\s+main/.test(snippet)) {
                return m[1];
            }
        }

        // 3. Fallback to any class or Main
        const anyMatch = code.match(/\bclass\s+([A-Za-z0-9_]+)/);
        return anyMatch ? anyMatch[1] : 'Main';
    }

    normalizeLanguage(lang) {
        if (!lang) return 'javascript';
        const l = lang.toLowerCase().trim();
        if (l === 'js' || l === 'javascript') return 'javascript';
        if (l === 'py' || l === 'python') return 'python';
        if (l === 'c') return 'c';
        if (l === 'cpp' || l === 'c++') return 'cpp';
        if (l === 'java') return 'java';
        return 'javascript';
    }

    getTargetFilename(lang, code) {
        switch (lang) {
            case 'python': return 'main.py';
            case 'javascript': return 'main.js';
            case 'c': return 'main.c';
            case 'cpp': return 'main.cpp';
            case 'java': {
                const className = this.extractJavaClassName(code);
                return `${className}.java`;
            }
            default: return 'main.txt';
        }
    }

    async run(options) {
        const { code, language, breakpoints = [] } = options;
        const lang = this.normalizeLanguage(language);

        if (!code || typeof code !== 'string') {
            return {
                success: false,
                error: { message: 'Source code cannot be empty' }
            };
        }

        // Create temporary isolated workspace folder
        const tmpDir = path.join(
            os.tmpdir(),
            `algolearn_debug_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        );
        fs.mkdirSync(tmpDir, { recursive: true });

        const filename = this.getTargetFilename(lang, code);
        const sourcePath = path.join(tmpDir, filename);
        fs.writeFileSync(sourcePath, code, 'utf8');

        const bpsJson = JSON.stringify(breakpoints || []);

        try {
            // Attempt 1: Run in isolated Docker container with strict resource limits
            const dockerResult = await this.runInDocker(tmpDir, filename, lang, bpsJson);
            if (dockerResult) {
                return dockerResult;
            }
        } catch (dockerErr) {
            console.warn('[DebuggerRunner] Docker execution unavailable, using host fallback:', dockerErr.message);
        }

        // Attempt 2: Fallback to host adapter execution if Docker is unavailable
        try {
            return await this.runOnHost(sourcePath, lang, bpsJson);
        } catch (hostErr) {
            return {
                success: false,
                error: {
                    type: 'ExecutionError',
                    message: hostErr.message
                },
                steps: [],
                stdout: '',
                stderr: hostErr.message
            };
        } finally {
            // Cleanup workspace
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch (e) {}
        }
    }

    runInDocker(hostDir, filename, lang, bpsJson) {
        return new Promise((resolve, reject) => {
            // Format path for Docker volume mounting on Windows/Linux
            let posixMount = hostDir.replace(/\\/g, '/');
            if (/^[A-Za-z]:/.test(posixMount)) {
                const drive = posixMount[0].toLowerCase();
                posixMount = '/' + drive + posixMount.slice(2);
            }

            const args = [
                'run',
                '--rm',
                '--network', 'none',
                '--memory=256m',
                '--cpus=1.0',
                '--pids-limit=64',
                '-v', `${posixMount}:/workspace`,
                this.dockerImage,
                lang,
                `/workspace/${filename}`,
                bpsJson
            ];

            const proc = spawn('docker', args, { timeout: this.timeoutMs });
            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (d) => { stdout += d.toString(); });
            proc.stderr.on('data', (d) => { stderr += d.toString(); });

            proc.on('error', (err) => {
                reject(err);
            });

            proc.on('close', (code) => {
                const combined = stdout.trim();
                if (!combined) {
                    reject(new Error(stderr || 'Docker execution produced no output'));
                    return;
                }

                // Check for JSON output
                try {
                    let jsonStr = combined;
                    if (combined.includes('___DEBUG_JSON_START___')) {
                        jsonStr = combined.split('___DEBUG_JSON_START___')[1].split('___DEBUG_JSON_END___')[0];
                    }
                    const parsed = JSON.parse(jsonStr);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Failed to parse Docker output: ${combined.slice(0, 300)}`));
                }
            });
        });
    }

    runOnHost(sourcePath, lang, bpsJson) {
        return new Promise((resolve, reject) => {
            let cmd = '';

            switch (lang) {
                case 'python':
                    cmd = `${PYTHON_BIN} "${path.join(this.adaptersDir, 'python_adapter.py')}" "${sourcePath}" "${bpsJson.replace(/"/g, '\\"')}"`;
                    break;
                case 'javascript':
                    cmd = `node "${path.join(this.adaptersDir, 'javascript_adapter.js')}" "${sourcePath}" "${bpsJson.replace(/"/g, '\\"')}"`;
                    break;
                case 'java':
                    cmd = `${PYTHON_BIN} "${path.join(this.adaptersDir, 'java_adapter.py')}" "${sourcePath}" "${bpsJson.replace(/"/g, '\\"')}"`;
                    break;
                case 'c':
                    cmd = `${PYTHON_BIN} "${path.join(this.adaptersDir, 'c_cpp_adapter.py')}" "${sourcePath}" c "${bpsJson.replace(/"/g, '\\"')}"`;
                    break;
                case 'cpp':
                    cmd = `${PYTHON_BIN} "${path.join(this.adaptersDir, 'c_cpp_adapter.py')}" "${sourcePath}" cpp "${bpsJson.replace(/"/g, '\\"')}"`;
                    break;
                default:
                    return reject(new Error(`Unsupported language: ${lang}`));
            }

            exec(cmd, { timeout: this.timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
                const combined = (stdout || '').trim();
                if (!combined && err) {
                    return reject(err);
                }

                try {
                    let jsonStr = combined;
                    if (combined.includes('___DEBUG_JSON_START___')) {
                        jsonStr = combined.split('___DEBUG_JSON_START___')[1].split('___DEBUG_JSON_END___')[0];
                    }
                    const parsed = JSON.parse(jsonStr);
                    resolve(parsed);
                } catch (e) {
                    resolve({
                        success: false,
                        error: {
                            type: 'ParseError',
                            message: 'Could not parse adapter output',
                            raw: combined.slice(0, 500)
                        },
                        steps: [],
                        stdout: stdout,
                        stderr: stderr
                    });
                }
            });
        });
    }
}

module.exports = new DebuggerRunner();

