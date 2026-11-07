"""
C and C++ Execution Adapter
Compiles C/C++ source code with debugging symbols (-g -O0),
executes under GDB using GDB Python automation, and collects execution traces.
"""

import sys
import os
import subprocess
import json
import re

def parse_compiler_errors(stderr, filename):
    # Typical gcc format: main.c:4:5: error: expected ';' before 'return'
    pattern = re.compile(rf"{re.escape(filename)}:(\d+):(\d+):\s+(?:fatal\s+)?(error|warning):\s+(.*)")
    errors = []
    first_line = 1
    first_col = 1
    first_msg = "Compilation failed"

    for line in stderr.splitlines():
        match = pattern.search(line)
        if match:
            l = int(match.group(1))
            c = int(match.group(2))
            severity = match.group(3)
            msg = match.group(4)
            if severity == "error":
                errors.append({"line": l, "column": c, "message": msg})
                if first_msg == "Compilation failed":
                    first_line = l
                    first_col = c
                    first_msg = f"{msg} (line {l}, col {c})"

    return {
        "type": "CompilationError",
        "message": first_msg,
        "line": first_line,
        "column": first_col,
        "allErrors": errors,
        "raw": stderr
    }

def compile_and_trace(source_path, language="c", breakpoints=None):
    source_path = os.path.abspath(source_path)
    source_dir = os.path.dirname(source_path)
    filename = os.path.basename(source_path)
    base_name = os.path.splitext(filename)[0]
    out_binary = os.path.join(source_dir, base_name)
    if sys.platform == "win32":
        out_binary += ".exe"

    compiler = "g++" if language in ["cpp", "c++"] else "gcc"

    # Step 1: Compile with debug symbols
    compile_cmd = [compiler, "-g", "-O0", source_path, "-o", out_binary]
    comp_proc = subprocess.run(compile_cmd, capture_output=True, text=True)

    if comp_proc.returncode != 0:
        err_info = parse_compiler_errors(comp_proc.stderr, filename)
        return {
            "success": False,
            "stage": "compilation",
            "language": language,
            "error": err_info,
            "steps": [],
            "stdout": comp_proc.stdout,
            "stderr": comp_proc.stderr
        }

    # Step 2: Run program once normally to capture complete stdout
    try:
        run_proc = subprocess.run([out_binary], capture_output=True, text=True, timeout=5)
        program_stdout = run_proc.stdout
        program_stderr = run_proc.stderr
    except subprocess.TimeoutExpired:
        program_stdout = ""
        program_stderr = "Execution timed out (5s limit)"
    except Exception as e:
        program_stdout = ""
        program_stderr = str(e)

    # Step 3: Run GDB for step-by-step tracing
    gdb_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gdb_tracer.py")
    env = os.environ.copy()
    env["DEBUG_TARGET_FILE"] = filename
    env["DEBUG_BREAKPOINTS"] = json.dumps(breakpoints or [])

    gdb_cmd = ["gdb", "-q", "-batch", "-x", gdb_script, out_binary]
    try:
        gdb_proc = subprocess.run(gdb_cmd, env=env, capture_output=True, text=True, timeout=10)
        output = gdb_proc.stdout + gdb_proc.stderr

        if "___DEBUG_JSON_START___" in output:
            parts = output.split("___DEBUG_JSON_START___")[1].split("___DEBUG_JSON_END___")[0]
            result = json.loads(parts)
            result["language"] = language
            result["stdout"] = program_stdout
            result["stderr"] = program_stderr
            return result
        else:
            return {
                "success": False,
                "language": language,
                "error": {
                    "type": "GdbError",
                    "message": "GDB execution completed without producing trace output.",
                    "raw": output
                },
                "steps": [],
                "stdout": program_stdout,
                "stderr": program_stderr
            }
    except FileNotFoundError:
        # GDB not found directly (e.g. on host without GDB). Return clear error or fallback
        return {
            "success": False,
            "language": language,
            "error": {
                "type": "EnvironmentError",
                "message": "GDB debugger is not available in host environment. Please run in Docker container."
            },
            "steps": [],
            "stdout": program_stdout,
            "stderr": program_stderr
        }
    except Exception as e:
        return {
            "success": False,
            "language": language,
            "error": {
                "type": "GdbError",
                "message": str(e)
            },
            "steps": [],
            "stdout": program_stdout,
            "stderr": program_stderr
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": {"message": "Usage: python c_cpp_adapter.py <source_file> [language] [breakpoints_json]"}}))
        sys.exit(1)

    src = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) >= 3 else ("cpp" if src.endswith(".cpp") else "c")
    bps = []
    if len(sys.argv) >= 4:
        try:
            bps = json.loads(sys.argv[3])
        except Exception:
            bps = []

    res = compile_and_trace(src, lang, bps)
    print(json.dumps(res))

