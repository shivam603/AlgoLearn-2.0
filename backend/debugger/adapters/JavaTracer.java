import com.sun.jdi.*;
import com.sun.jdi.connect.*;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class JavaTracer {

    public static void main(String[] args) {
        if (args.length < 3) {
            System.err.println("Usage: java JavaTracer <classPath> <mainClass> <sourceFileName> [breakpointsCommaSeparated]");
            System.exit(1);
        }

        String classPath = args[0];
        String mainClass = args[1];
        String sourceFileName = args[2];
        Set<Integer> breakpoints = new HashSet<>();
        if (args.length >= 4 && !args[3].isEmpty()) {
            for (String b : args[3].split(",")) {
                try {
                    breakpoints.add(Integer.parseInt(b.trim()));
                } catch (Exception ignored) {}
            }
        }

        VirtualMachineManager vmm = Bootstrap.virtualMachineManager();
        LaunchingConnector connector = vmm.defaultConnector();
        Map<String, Connector.Argument> connArgs = connector.defaultArguments();

        Connector.Argument mainArg = connArgs.get("main");
        Connector.Argument optionsArg = connArgs.get("options");

        if (mainArg != null) {
            mainArg.setValue(mainClass);
        }
        if (optionsArg != null) {
            optionsArg.setValue("-classpath \"" + classPath + "\"");
        }

        VirtualMachine vm = null;
        try {
            vm = connector.launch(connArgs);
        } catch (Exception e) {
            System.out.println("___DEBUG_JSON_START___{\"success\":false,\"error\":{\"type\":\"LaunchError\",\"message\":\"" + escapeJson(e.getMessage()) + "\"}}___DEBUG_JSON_END___");
            return;
        }

        // Start reading process output in background
        StringBuilder stdoutBuf = new StringBuilder();
        StringBuilder stderrBuf = new StringBuilder();
        Process proc = vm.process();

        Thread outReader = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(proc.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    stdoutBuf.append(line).append("\n");
                }
            } catch (IOException ignored) {}
        });
        Thread errReader = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(proc.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = r.readLine()) != null) {
                    stderrBuf.append(line).append("\n");
                }
            } catch (IOException ignored) {}
        });
        outReader.start();
        errReader.start();

        EventRequestManager erm = vm.eventRequestManager();
        ClassPrepareRequest cpr = erm.createClassPrepareRequest();
        cpr.addClassFilter(mainClass);
        cpr.enable();

        List<Map<String, Object>> steps = new ArrayList<>();
        int maxSteps = 5000;
        int stepCount = 0;
        boolean isRunning = true;
        StepRequest activeStepReq = null;

        EventQueue queue = vm.eventQueue();
        vm.resume();

        while (isRunning && stepCount < maxSteps) {
            EventSet eventSet = null;
            try {
                eventSet = queue.remove(2000);
            } catch (Exception e) {
                break;
            }

            if (eventSet == null) {
                break;
            }

            for (Event event : eventSet) {
                if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) {
                    isRunning = false;
                    break;
                } else if (event instanceof ClassPrepareEvent) {
                    ClassPrepareEvent cpe = (ClassPrepareEvent) event;
                    ThreadReference thread = cpe.thread();

                    // Create step request on thread
                    activeStepReq = erm.createStepRequest(thread, StepRequest.STEP_LINE, StepRequest.STEP_INTO);
                    activeStepReq.addClassFilter(mainClass);
                    activeStepReq.enable();
                } else if (event instanceof StepEvent) {
                    StepEvent se = (StepEvent) event;
                    Location loc = se.location();
                    int line = loc.lineNumber();
                    String method = loc.method().name();

                    ThreadReference thread = se.thread();
                    List<Map<String, Object>> stack = new ArrayList<>();
                    Map<String, Object> variables = new LinkedHashMap<>();
                    Map<String, String> variableTypes = new LinkedHashMap<>();

                    try {
                        List<StackFrame> frames = thread.frames();
                        int depth = 0;
                        for (StackFrame f : frames) {
                            if (f.location().declaringType().name().equals(mainClass)) {
                                Map<String, Object> fmap = new LinkedHashMap<>();
                                fmap.put("name", f.location().method().name());
                                fmap.put("line", f.location().lineNumber());
                                fmap.put("depth", depth++);
                                stack.add(fmap);
                            }
                        }

                        if (!frames.isEmpty()) {
                            StackFrame top = frames.get(0);
                            for (LocalVariable var : top.visibleVariables()) {
                                Value val = top.getValue(var);
                                variables.put(var.name(), serializeValToObject(val));
                                variableTypes.put(var.name(), var.typeName());
                            }
                        }
                    } catch (Exception ignored) {}

                    Map<String, Object> stepData = new LinkedHashMap<>();
                    stepData.put("step", stepCount + 1);
                    stepData.put("line", line);
                    stepData.put("function", method);
                    stepData.put("eventType", "step");
                    stepData.put("isBreakpoint", breakpoints.contains(line));
                    stepData.put("description", "Executing line " + line + " in " + method + "()");
                    stepData.put("callStack", stack);
                    stepData.put("variables", variables);
                    stepData.put("variableTypes", variableTypes);
                    stepData.put("output", "");

                    steps.add(stepData);
                    stepCount++;
                }
            }

            try {
                eventSet.resume();
            } catch (Exception e) {
                break;
            }
        }

        try {
            outReader.join(1000);
            errReader.join(1000);
        } catch (Exception ignored) {}

        // Build output JSON
        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":true,\"language\":\"java\",\"totalSteps\":").append(steps.size())
          .append(",\"steps\":[");
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(mapToJson(steps.get(i)));
        }
        sb.append("],\"stdout\":\"").append(escapeJson(stdoutBuf.toString()))
          .append("\",\"stderr\":\"").append(escapeJson(stderrBuf.toString())).append("\"}");

        System.out.println("___DEBUG_JSON_START___" + sb.toString() + "___DEBUG_JSON_END___");
    }

    private static Object serializeValToObject(Value val) {
        return serializeValToObject(val, 0, new HashSet<>());
    }

    private static Object serializeValToObject(Value val, int depth, Set<Long> visitedObjIds) {
        if (val == null) return null;
        if (val instanceof BooleanValue) {
            return ((BooleanValue) val).value();
        }
        if (val instanceof IntegerValue) {
            return ((IntegerValue) val).value();
        }
        if (val instanceof LongValue) {
            return ((LongValue) val).value();
        }
        if (val instanceof ShortValue) {
            return ((ShortValue) val).value();
        }
        if (val instanceof ByteValue) {
            return ((ByteValue) val).value();
        }
        if (val instanceof FloatValue) {
            return ((FloatValue) val).value();
        }
        if (val instanceof DoubleValue) {
            return ((DoubleValue) val).value();
        }
        if (val instanceof CharValue) {
            return String.valueOf(((CharValue) val).value());
        }
        if (val instanceof StringReference) {
            return ((StringReference) val).value();
        }
        if (val instanceof ArrayReference) {
            ArrayReference arr = (ArrayReference) val;
            int len = arr.length();
            int limit = Math.min(len, 50);
            List<Object> list = new ArrayList<>();
            for (int i = 0; i < limit; i++) {
                list.add(serializeValToObject(arr.getValue(i), depth + 1, visitedObjIds));
            }
            return list;
        }
        if (val instanceof ObjectReference) {
            ObjectReference obj = (ObjectReference) val;
            long uniqueId = obj.uniqueID();
            String typeName = obj.referenceType().name();

            // Do not inspect internal Java libraries to avoid performance degradation
            if (typeName.startsWith("java.") || typeName.startsWith("javax.") || typeName.startsWith("sun.")) {
                return typeName + "@" + Integer.toHexString((int) (uniqueId & 0xffff));
            }

            // Guard against infinite cycles or excessively deep chains
            if (depth >= 6 || visitedObjIds.contains(uniqueId)) {
                return typeName + "@" + Integer.toHexString((int) (uniqueId & 0xffff));
            }

            visitedObjIds.add(uniqueId);
            try {
                Map<String, Object> fieldMap = new LinkedHashMap<>();
                for (Field f : obj.referenceType().visibleFields()) {
                    if (!f.isStatic()) {
                        Value fVal = obj.getValue(f);
                        fieldMap.put(f.name(), serializeValToObject(fVal, depth + 1, new HashSet<>(visitedObjIds)));
                    }
                }
                if (!fieldMap.isEmpty()) {
                    fieldMap.put("__type__", typeName);
                    return fieldMap;
                }
            } catch (Exception ignored) {}

            return typeName + "@" + Integer.toHexString((int) (uniqueId & 0xffff));
        }
        return val.toString();
    }

    private static String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(escapeJson(entry.getKey())).append("\":");
            Object v = entry.getValue();
            if (v == null) {
                sb.append("null");
            } else if (v instanceof String) {
                sb.append("\"").append(escapeJson((String) v)).append("\"");
            } else if (v instanceof Number || v instanceof Boolean) {
                sb.append(v);
            } else if (v instanceof Map) {
                sb.append(mapToJson((Map<String, Object>) v));
            } else if (v instanceof List) {
                sb.append(listToJson((List<?>) v));
            } else {
                sb.append("\"").append(escapeJson(String.valueOf(v))).append("\"");
            }
        }
        sb.append("}");
        return sb.toString();
    }

    private static String listToJson(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (Object item : list) {
            if (!first) sb.append(",");
            first = false;
            if (item == null) {
                sb.append("null");
            } else if (item instanceof String) {
                sb.append("\"").append(escapeJson((String) item)).append("\"");
            } else if (item instanceof Number || item instanceof Boolean) {
                sb.append(item);
            } else if (item instanceof Map) {
                sb.append(mapToJson((Map<String, Object>) item));
            } else if (item instanceof List) {
                sb.append(listToJson((List<?>) item));
            } else {
                sb.append("\"").append(escapeJson(String.valueOf(item))).append("\"");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
