"""
Python Execution Tracer Adapter
Uses Python's standard `sys.settrace()` to perform line-by-line debugging of arbitrary Python code.
Emits a structured JSON trace including call stack, local variables, types, line numbers, and output.
"""

import sys
import os
import json
import io
import math
import types
import inspect
import traceback

class PythonTracer:
    def __init__(self, target_filepath, breakpoints=None, max_steps=10000):
        self.target_filepath = os.path.abspath(target_filepath)
        self.target_filename = os.path.basename(target_filepath)
        self.breakpoints = set(breakpoints or [])
        self.max_steps = max_steps
        self.steps = []
        self.step_count = 0
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
        self.last_stdout_pos = 0
        self.last_stderr_pos = 0
        self.orig_stdout = sys.stdout
        self.orig_stderr = sys.stderr
        self.is_truncated = False
        self.runtime_error = None

    def serialize_value(self, val, seen=None, depth=0):
        """Converts any Python value into a clean, safe string and JSON-compatible representation."""
        tname = type(val).__name__
        if seen is None:
            seen = set()
        try:
            if val is None:
                return None, "NoneType"
            if isinstance(val, bool):
                return val, tname
            if isinstance(val, int):
                return val, tname
            if isinstance(val, float):
                if math.isnan(val):
                    return "NaN", tname
                if math.isinf(val):
                    return "Infinity" if val > 0 else "-Infinity", tname
                return val, tname
            if isinstance(val, str):
                if len(val) > 200:
                    return val[:200] + "...", f"str[{len(val)}]"
                return val, tname
            if depth > 6:
                return f"<{tname} ...>", tname
            obj_id = id(val)
            if obj_id in seen:
                return f"<circular {tname}>", tname
            next_seen = seen | {obj_id}
            if isinstance(val, (list, tuple)):
                length = len(val)
                type_label = f"{tname}[{length}]"
                if length > 50:
                    items = [self.serialize_value(x, next_seen, depth + 1)[0] for x in val[:50]]
                    items.append(f"... +{length - 50} more")
                    return items, type_label
                items = [self.serialize_value(x, next_seen, depth + 1)[0] for x in val]
                return items, type_label
            if isinstance(val, dict):
                length = len(val)
                type_label = f"dict[{length}]"
                if length > 50:
                    d = {str(k): self.serialize_value(v, next_seen, depth + 1)[0] for i, (k, v) in enumerate(val.items()) if i < 50}
                    d["..."] = f"+{length - 50} more keys"
                    return d, type_label
                return {str(k): self.serialize_value(v, next_seen, depth + 1)[0] for k, v in val.items()}, type_label
            if isinstance(val, set):
                return [self.serialize_value(x, next_seen, depth + 1)[0] for i, x in enumerate(val) if i < 30], f"set[{len(val)}]"
            if isinstance(val, types.ModuleType):
                return f"<module '{getattr(val, '__name__', tname)}'>", "module"
            
            # General object / class instance (e.g. ListNode, TreeNode, custom classes)
            if hasattr(val, '__dict__') and not isinstance(val, type):
                fields = {}
                for k, v in list(val.__dict__.items())[:20]:
                    if not k.startswith('_'):
                        fields[k] = self.serialize_value(v, next_seen, depth + 1)[0]
                if fields:
                    fields["__type__"] = tname
                    return fields, tname

            repr_str = repr(val)
            if len(repr_str) > 150:
                repr_str = repr_str[:150] + "..."
            return repr_str, tname
        except Exception:
            return "<unserializable>", tname

    def get_incremental_output(self):
        new_out = self.stdout_buf.getvalue()[self.last_stdout_pos:]
        self.last_stdout_pos = len(self.stdout_buf.getvalue())
        return new_out

    def trace_callback(self, frame, event, arg):
        if self.step_count >= self.max_steps:
            self.is_truncated = True
            sys.settrace(None)
            return None

        # Filter: only trace frames from the target file
        frame_file = os.path.abspath(frame.f_code.co_filename)
        if frame_file != self.target_filepath:
            return self.trace_callback

        line_no = frame.f_lineno
        func_name = frame.f_code.co_name

        # Build Call Stack
        stack = []
        curr = frame
        depth = 0
        while curr is not None:
            c_file = os.path.abspath(curr.f_code.co_filename)
            if c_file == self.target_filepath:
                stack.append({
                    "name": curr.f_code.co_name,
                    "line": curr.f_lineno,
                    "depth": depth
                })
                depth += 1
            curr = curr.f_back
        # stack is ordered top-frame first (leaf to root)

        # Collect local variables
        raw_locals = frame.f_locals
        variables = {}
        variable_types = {}
        for var_name, var_val in raw_locals.items():
            # Skip internal python module attributes
            if var_name.startswith("__") and var_name.endswith("__"):
                continue
            s_val, s_type = self.serialize_value(var_val)
            variables[var_name] = s_val
            variable_types[var_name] = s_type

        inc_output = self.get_incremental_output()

        desc = f"Executing line {line_no} in {func_name}()"
        if event == 'call':
            desc = f"Called function {func_name}()"
        elif event == 'return':
            ret_val, ret_type = self.serialize_value(arg)
            desc = f"Returning from {func_name}() with {ret_val}"
            variables["<return>"] = ret_val
            variable_types["<return>"] = ret_type
        elif event == 'exception':
            exc_type, exc_val, _ = arg
            desc = f"Exception raised: {exc_type.__name__}: {exc_val}"

        step_data = {
            "step": self.step_count + 1,
            "line": line_no,
            "function": func_name,
            "eventType": event,
            "isBreakpoint": (line_no in self.breakpoints),
            "description": desc,
            "callStack": stack,
            "variables": variables,
            "variableTypes": variable_types,
            "output": inc_output
        }

        self.steps.append(step_data)
        self.step_count += 1
        return self.trace_callback

    def run(self, code_str):
        # 1. Pre-check syntax
        try:
            compiled = compile(code_str, self.target_filepath, 'exec')
        except SyntaxError as e:
            return {
                "success": False,
                "stage": "compilation",
                "error": {
                    "type": "SyntaxError",
                    "message": e.msg,
                    "line": e.lineno or 1,
                    "column": e.offset or 1
                },
                "steps": [],
                "stdout": "",
                "stderr": f"SyntaxError: {e.msg} at line {e.lineno}"
            }
        except Exception as e:
            return {
                "success": False,
                "stage": "compilation",
                "error": {
                    "type": type(e).__name__,
                    "message": str(e),
                    "line": 1,
                    "column": 1
                },
                "steps": [],
                "stdout": "",
                "stderr": str(e)
            }

        # 2. Redirect stdout/stderr and execute with trace
        sys.stdout = self.stdout_buf
        sys.stderr = self.stderr_buf

        globals_dict = {
            "__name__": "__main__",
            "__file__": self.target_filepath,
            "__doc__": None,
            "__builtins__": __builtins__
        }

        sys.settrace(self.trace_callback)
        has_runtime_error = False

        try:
            exec(compiled, globals_dict)
        except Exception as e:
            has_runtime_error = True
            exc_type, exc_value, exc_tb = sys.exc_info()
            tb_lines = traceback.format_exception(exc_type, exc_value, exc_tb)
            
            # Find the error line in target file
            err_line = 1
            for frame_info in traceback.extract_tb(exc_tb):
                if os.path.abspath(frame_info.filename) == self.target_filepath:
                    err_line = frame_info.lineno

            self.runtime_error = {
                "type": type(e).__name__,
                "message": str(e),
                "line": err_line,
                "traceback": "".join(tb_lines)
            }
        finally:
            sys.settrace(None)
            sys.stdout = self.orig_stdout
            sys.stderr = self.orig_stderr

        total_stdout = self.stdout_buf.getvalue()
        total_stderr = self.stderr_buf.getvalue()

        # Check for remaining output
        inc_output = self.get_incremental_output()
        if inc_output and self.steps:
            self.steps[-1]["output"] = (self.steps[-1]["output"] or "") + inc_output

        return {
            "success": True,
            "language": "python",
            "totalSteps": len(self.steps),
            "isTruncated": self.is_truncated,
            "hasRuntimeError": has_runtime_error,
            "error": self.runtime_error,
            "steps": self.steps,
            "stdout": total_stdout,
            "stderr": total_stderr + (("\n" + self.runtime_error["traceback"]) if self.runtime_error else "")
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": {"message": "Usage: python_adapter.py <source_file> [breakpoints_json]"}}))
        sys.exit(1)

    source_path = sys.argv[1]
    bps = []
    if len(sys.argv) >= 3:
        try:
            bps = json.loads(sys.argv[2])
        except Exception:
            bps = []

    with open(source_path, "r", encoding="utf-8") as f:
        code = f.read()

    tracer = PythonTracer(source_path, breakpoints=bps)
    result = tracer.run(code)
    print(json.dumps(result, allow_nan=False))

