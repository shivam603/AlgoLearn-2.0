"""
Java Execution Adapter
Compiles Java source code with debug symbols (-g) and traces execution using JavaTracer (JDI).
"""

import sys
import os
import subprocess
import json
import re

def extract_class_name(code):
    # 1. Prioritize explicit public class
    pub_match = re.search(r'\bpublic\s+class\s+([A-Za-z0-9_]+)', code)
    if pub_match:
        return pub_match.group(1)

    # 2. Look for class containing main method
    class_blocks = list(re.finditer(r'\bclass\s+([A-Za-z0-9_]+)[^{]*\{', code))
    for m in class_blocks:
        start_idx = m.start()
        snippet = code[start_idx:start_idx + 1500]
        if "public static void main" in snippet:
            return m.group(1)

    # 3. Fallback to any class or Main
    match = re.search(r'\bclass\s+([A-Za-z0-9_]+)', code)
    if match:
        return match.group(1)
    return "Main"

def parse_javac_errors(stderr, filename):
    # Format: Main.java:4: error: cannot find symbol
    pattern = re.compile(rf"{re.escape(filename)}:(\d+):\s+error:\s+(.*)")
    errors = []
    first_line = 1
    first_msg = "Compilation failed"

    lines = stderr.splitlines()
    for i, line in enumerate(lines):
        m = pattern.search(line)
        if m:
            l = int(m.group(1))
            msg = m.group(2)
            col = 1
            if i + 2 < len(lines) and "^" in lines[i + 2]:
                col = lines[i + 2].index("^") + 1
            errors.append({"line": l, "column": col, "message": msg})
            if first_msg == "Compilation failed":
                first_line = l
                first_msg = f"{msg} (line {l})"

    return {
        "type": "CompilationError",
        "message": first_msg,
        "line": first_line,
        "column": 1,
        "allErrors": errors,
        "raw": stderr
    }

def compile_and_trace(source_path, breakpoints=None):
    source_path = os.path.abspath(source_path)
    source_dir = os.path.dirname(source_path)
    filename = os.path.basename(source_path)
    
    with open(source_path, "r", encoding="utf-8") as f:
        code = f.read()

    main_class = extract_class_name(code)

    # Compile with -g
    javac_cmd = ["javac", "-g", source_path]
    comp_proc = subprocess.run(javac_cmd, capture_output=True, text=True)

    if comp_proc.returncode != 0:
        err_info = parse_javac_errors(comp_proc.stderr, filename)
        return {
            "success": False,
            "stage": "compilation",
            "language": "java",
            "error": err_info,
            "steps": [],
            "stdout": comp_proc.stdout,
            "stderr": comp_proc.stderr
        }

    # Run JavaTracer
    adapters_dir = os.path.dirname(os.path.abspath(__file__))
    tracer_class = "JavaTracer"
    cp_sep = ";" if sys.platform == "win32" else ":"
    classpath = f"{adapters_dir}{cp_sep}{source_dir}"

    bp_str = ",".join(str(b) for b in (breakpoints or []))
    java_cmd = [
        "java",
        "-classpath",
        classpath,
        tracer_class,
        source_dir,
        main_class,
        filename,
        bp_str
    ]

    try:
        run_proc = subprocess.run(java_cmd, capture_output=True, text=True, timeout=12)
        output = run_proc.stdout + run_proc.stderr

        if "___DEBUG_JSON_START___" in output:
            parts = output.split("___DEBUG_JSON_START___")[1].split("___DEBUG_JSON_END___")[0]
            result = json.loads(parts)
            return result
        else:
            return {
                "success": False,
                "language": "java",
                "error": {
                    "type": "ExecutionError",
                    "message": "Tracer failed to produce output.",
                    "raw": output
                },
                "steps": [],
                "stdout": "",
                "stderr": output
            }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "language": "java",
            "error": {
                "type": "TimeoutError",
                "message": "Execution timed out (12s limit)."
            },
            "steps": [],
            "stdout": "",
            "stderr": "Execution timed out"
        }
    except Exception as e:
        return {
            "success": False,
            "language": "java",
            "error": {
                "type": "ExecutionError",
                "message": str(e)
            },
            "steps": [],
            "stdout": "",
            "stderr": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": {"message": "Usage: python java_adapter.py <source_file> [breakpoints_json]"}}))
        sys.exit(1)

    src = sys.argv[1]
    bps = []
    if len(sys.argv) >= 3:
        try:
            bps = json.loads(sys.argv[2])
        except Exception:
            bps = []

    res = compile_and_trace(src, bps)
    print(json.dumps(res))

