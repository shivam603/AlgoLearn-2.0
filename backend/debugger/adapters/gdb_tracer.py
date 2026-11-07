import gdb
import json
import os
import sys

def parse_gdb_val(val_str, type_str):
    if not val_str:
        return val_str
    trimmed = val_str.strip()
    if trimmed.startswith("{") and trimmed.endswith("}"):
        inner = trimmed[1:-1].strip()
        parts = inner.split(",")
        parsed_items = []
        is_num_array = True
        for p in parts:
            p_strip = p.strip()
            try:
                parsed_items.append(int(p_strip))
            except ValueError:
                try:
                    parsed_items.append(float(p_strip))
                except ValueError:
                    is_num_array = False
                    break
        if is_num_array and parsed_items:
            return parsed_items
    try:
        if type_str.startswith("int") or type_str in ["short", "long", "size_t", "char"]:
            return int(trimmed)
        if type_str in ["float", "double"]:
            return float(trimmed)
    except Exception:
        pass
    return val_str

def trace_program():
    target_filename = os.environ.get("DEBUG_TARGET_FILE", "main.c")
    breakpoints_raw = os.environ.get("DEBUG_BREAKPOINTS", "[]")
    try:
        user_breakpoints = json.loads(breakpoints_raw)
    except Exception:
        user_breakpoints = []
    bps_set = set(user_breakpoints)

    gdb.execute("set pagination off")
    gdb.execute("set confirm off")

    try:
        gdb.execute("break main")
    except Exception as e:
        print(json.dumps({"success": False, "error": {"type": "GdbError", "message": f"Could not break at main: {e}"}}))
        return

    for bp in user_breakpoints:
        try:
            gdb.execute(f"break {target_filename}:{bp}")
        except Exception:
            pass

    try:
        gdb.execute("run")
    except Exception as e:
        print(json.dumps({"success": False, "error": {"type": "GdbError", "message": f"Run failed: {e}"}}))
        return

    steps = []
    max_steps = 5000
    step_count = 0

    while step_count < max_steps:
        try:
            frame = gdb.selected_frame()
        except Exception:
            break

        sal = frame.find_sal()
        symtab = sal.symtab
        if not symtab or not symtab.filename.endswith(target_filename):
            try:
                out = gdb.execute("finish", to_string=True)
                continue
            except Exception:
                try:
                    out = gdb.execute("next", to_string=True)
                    if "exited" in out:
                        break
                    continue
                except Exception:
                    break

        line = sal.line
        func_name = frame.name() or "main"

        # Build stack
        stack = []
        f = frame
        depth = 0
        while f is not None:
            try:
                f_sal = f.find_sal()
                if f_sal and f_sal.symtab and f_sal.symtab.filename.endswith(target_filename):
                    stack.append({
                        "name": f.name() or "function",
                        "line": f_sal.line,
                        "depth": depth
                    })
                    depth += 1
                f = f.older()
            except Exception:
                break

        # Collect variables
        variables = {}
        variable_types = {}
        try:
            block = frame.block()
            while block:
                for symbol in block:
                    if symbol.is_variable or symbol.is_argument:
                        name = symbol.name
                        if name not in variables:
                            try:
                                val = frame.read_var(symbol)
                                val_str = str(val)
                                t_str = str(symbol.type)
                                variables[name] = parse_gdb_val(val_str, t_str)
                                variable_types[name] = t_str
                            except Exception:
                                pass
                if block.is_global or block.is_static:
                    break
                block = block.superblock
        except Exception:
            pass

        steps.append({
            "step": step_count + 1,
            "line": line,
            "function": func_name,
            "eventType": "step",
            "isBreakpoint": (line in bps_set),
            "description": f"Executing line {line} in {func_name}()",
            "callStack": stack,
            "variables": variables,
            "variableTypes": variable_types,
            "output": ""
        })
        step_count += 1

        try:
            out = gdb.execute("step", to_string=True)
            if "exited" in out or "Program terminated" in out:
                break
        except Exception:
            break

    # Format result
    result = {
        "success": True,
        "language": "c",
        "totalSteps": len(steps),
        "steps": steps,
        "stdout": "",
        "stderr": ""
    }
    # Output token for parent parser
    print("___DEBUG_JSON_START___" + json.dumps(result) + "___DEBUG_JSON_END___")

try:
    trace_program()
except Exception as e:
    print("___DEBUG_JSON_START___" + json.dumps({"success": False, "error": {"type": "RuntimeError", "message": str(e)}}) + "___DEBUG_JSON_END___")
gdb.execute("quit")

