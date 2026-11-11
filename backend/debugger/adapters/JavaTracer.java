import com.sun.jdi.*;
import com.sun.jdi.connect.spi.*;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

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

        StringBuilder stdoutBuf = new StringBuilder();
        StringBuilder stderrBuf = new StringBuilder();
        Process proc = null;
        Thread outReader = null;
        Thread errReader = null;
        ServerSocket serverSocket = null;
        Connection jdwpConn = null;
        VirtualMachine vm = null;
        List<String> handshakeDiagnostics = new ArrayList<>();

        try {
            InetAddress loopback = InetAddress.getByAddress("127.0.0.1", new byte[]{127, 0, 0, 1});
            serverSocket = new ServerSocket();
            serverSocket.setReuseAddress(true);
            serverSocket.bind(new InetSocketAddress(loopback, 0), 50);
            String listenAddr = "127.0.0.1:" + serverSocket.getLocalPort();

            ProcessBuilder pb = new ProcessBuilder(
                "java",
                "-Xms4m",
                "-Xmx32m",
                "-Xint",
                "-XX:+UseSerialGC",
                "-Xss256k",
                "-Djava.net.preferIPv4Stack=true",
                "-agentlib:jdwp=transport=dt_socket,server=n,suspend=y,address=" + listenAddr,
                "-classpath",
                classPath,
                mainClass
            );
            proc = pb.start();
            final Process targetProc = proc;
            outReader = new Thread(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(targetProc.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = r.readLine()) != null) {
                        stdoutBuf.append(line).append("\n");
                    }
                } catch (IOException ignored) {}
            });
            errReader = new Thread(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(targetProc.getErrorStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = r.readLine()) != null) {
                        stderrBuf.append(line).append("\n");
                    }
                } catch (IOException ignored) {}
            });
            outReader.start();
            errReader.start();

            jdwpConn = acceptJdwpConnection(serverSocket, proc, 20000L, handshakeDiagnostics);
            try { serverSocket.close(); } catch (IOException ignored) {}
            serverSocket = null;

            vm = vmm.createVirtualMachine(jdwpConn);
        } catch (Exception e) {
            if (serverSocket != null) {
                try { serverSocket.close(); } catch (IOException ignored) {}
            }
            if (jdwpConn != null) {
                try { jdwpConn.close(); } catch (IOException ignored) {}
            }
            if (proc != null) {
                try { proc.destroyForcibly(); } catch (Exception ignored) {}
            }
            if (outReader != null) {
                try { outReader.join(300); } catch (Exception ignored) {}
            }
            if (errReader != null) {
                try { errReader.join(300); } catch (Exception ignored) {}
            }
            String extra = stderrBuf.toString().trim();
            String diagStr = handshakeDiagnostics.isEmpty() ? "" : (" [diag: " + String.join("; ", handshakeDiagnostics) + "]");
            String msg = e.getMessage() + (extra.isEmpty() ? "" : (" (" + extra + ")")) + diagStr;
            System.out.println("___DEBUG_JSON_START___{\"success\":false,\"error\":{\"type\":\"LaunchError\",\"message\":\"" + escapeJson(msg) + "\"}}___DEBUG_JSON_END___");
            return;
        }

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
        // Target VM launches with suspend=y and emits VMStartEvent (SUSPEND_ALL);
        // let eventSet.resume() handle VMStartEvent cleanly instead of pre-resuming vm.resume()

        while (isRunning && stepCount < maxSteps) {
            EventSet eventSet = null;
            try {
                eventSet = queue.remove(8000);
            } catch (Exception e) {
                break;
            }

            if (eventSet == null) {
                break;
            }

            try {
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

                if (isRunning) {
                    eventSet.resume();
                }
            } catch (VMDisconnectedException e) {
                isRunning = false;
                break;
            } catch (Exception e) {
                break;
            }
        }

        try {
            if (proc != null) {
                proc.waitFor(2, TimeUnit.SECONDS);
            }
            if (outReader != null) outReader.join(1000);
            if (errReader != null) errReader.join(1000);
        } catch (Exception ignored) {}
        if (proc != null && proc.isAlive()) {
            try { proc.destroyForcibly(); } catch (Exception ignored) {}
        }
        if (jdwpConn != null) {
            try { jdwpConn.close(); } catch (IOException ignored) {}
        }

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

    private static Connection acceptJdwpConnection(ServerSocket ss, Process proc, long timeoutMs, List<String> diagnostics) throws IOException {
        final byte[] expected = "JDWP-Handshake".getBytes(StandardCharsets.US_ASCII);
        long deadline = System.currentTimeMillis() + timeoutMs;

        while (true) {
            long remaining = deadline - System.currentTimeMillis();
            if (remaining <= 0) {
                throw new IOException("Timed out waiting for JDWP handshake from target VM");
            }

            ss.setSoTimeout(proc.isAlive() ? (int) Math.min(remaining, 400L) : 50);

            Socket sock;
            try {
                sock = ss.accept();
            } catch (SocketTimeoutException ste) {
                if (!proc.isAlive()) {
                    throw new IOException("Target VM exited before JDWP handshake (exitCode=" + proc.exitValue() + ")");
                }
                continue;
            }

            boolean accepted = false;
            try {
                sock.setTcpNoDelay(true);
                int readTimeout = (int) Math.max(500L, Math.min(remaining, 3000L));
                sock.setSoTimeout(readTimeout);
                OutputStream out = sock.getOutputStream();
                InputStream in = sock.getInputStream();

                // JDWP server=n target waits for debugger to initiate JDWP-Handshake
                out.write(expected);
                out.flush();

                byte[] reply = new byte[expected.length];
                int total = 0;
                boolean eof = false;
                while (total < reply.length) {
                    int n = in.read(reply, total, reply.length - total);
                    if (n < 0) {
                        eof = true;
                        break;
                    }
                    total += n;
                }

                if (total == expected.length && Arrays.equals(reply, expected)) {
                    sock.setSoTimeout(0);
                    accepted = true;
                    return new JdwpSocketConnection(sock);
                }

                diagnostics.add(
                    "Rejected " + sock.getRemoteSocketAddress()
                    + (eof ? " EOF" : "")
                    + " len=" + total
                    + " data=" + formatPreview(reply, total)
                );
            } catch (IOException ioe) {
                diagnostics.add(
                    "Rejected " + sock.getRemoteSocketAddress()
                    + " err=" + ioe.getClass().getSimpleName() + ":" + ioe.getMessage()
                );
            } finally {
                if (!accepted) {
                    try { sock.close(); } catch (IOException ignored) {}
                }
            }

            if (diagnostics.size() > 12) {
                diagnostics.remove(0);
            }
        }
    }

    private static String formatPreview(byte[] data, int len) {
        if (len <= 0) return "<empty>";
        StringBuilder hex = new StringBuilder();
        StringBuilder ascii = new StringBuilder();
        int cap = Math.min(len, 14);
        for (int i = 0; i < cap; i++) {
            int b = data[i] & 0xff;
            if (i > 0) hex.append(' ');
            hex.append(String.format("%02x", b));
            ascii.append((b >= 32 && b < 127) ? (char) b : '.');
        }
        return hex + " ('" + ascii + "')";
    }

    private static final class JdwpSocketConnection extends Connection {
        private final Socket socket;
        private final InputStream in;
        private final OutputStream out;
        private final Object receiveLock = new Object();
        private final Object sendLock = new Object();
        private final Object closeLock = new Object();
        private boolean closed = false;

        JdwpSocketConnection(Socket socket) throws IOException {
            this.socket = socket;
            this.socket.setTcpNoDelay(true);
            this.in = socket.getInputStream();
            this.out = socket.getOutputStream();
        }

        @Override
        public void close() throws IOException {
            synchronized (closeLock) {
                if (closed) return;
                closed = true;
                try { out.close(); } catch (IOException ignored) {}
                try { in.close(); } catch (IOException ignored) {}
                socket.close();
            }
        }

        @Override
        public boolean isOpen() {
            synchronized (closeLock) {
                return !closed;
            }
        }

        @Override
        public byte[] readPacket() throws IOException {
            if (!isOpen()) {
                throw new ClosedConnectionException("connection is closed");
            }
            synchronized (receiveLock) {
                int b1, b2, b3, b4;
                try {
                    b1 = in.read();
                    if (b1 < 0) {
                        return new byte[0];
                    }
                    b2 = in.read();
                    b3 = in.read();
                    b4 = in.read();
                } catch (IOException e) {
                    if (!isOpen()) {
                        throw new ClosedConnectionException("connection is closed");
                    }
                    throw e;
                }

                if (b2 < 0 || b3 < 0 || b4 < 0) {
                    throw new IOException("protocol error - premature EOF");
                }

                int len = ((b1 & 0xff) << 24) | ((b2 & 0xff) << 16) | ((b3 & 0xff) << 8) | (b4 & 0xff);
                if (len < 11) {
                    throw new IOException("protocol error - invalid length: " + len);
                }

                byte[] pkt = new byte[len];
                pkt[0] = (byte) b1;
                pkt[1] = (byte) b2;
                pkt[2] = (byte) b3;
                pkt[3] = (byte) b4;

                int off = 4;
                while (off < len) {
                    int n;
                    try {
                        n = in.read(pkt, off, len - off);
                    } catch (IOException e) {
                        if (!isOpen()) {
                            throw new ClosedConnectionException("connection is closed");
                        }
                        throw e;
                    }
                    if (n < 0) {
                        throw new IOException("protocol error - premature EOF");
                    }
                    off += n;
                }
                return pkt;
            }
        }

        @Override
        public void writePacket(byte[] pkt) throws IOException {
            if (!isOpen()) {
                throw new ClosedConnectionException("connection is closed");
            }
            if (pkt == null || pkt.length < 11) {
                throw new IllegalArgumentException("packet is insufficient size");
            }
            int len = ((pkt[0] & 0xff) << 24) | ((pkt[1] & 0xff) << 16) | ((pkt[2] & 0xff) << 8) | (pkt[3] & 0xff);
            if (len < 11) {
                throw new IllegalArgumentException("packet is insufficient size");
            }
            if (len > pkt.length) {
                throw new IllegalArgumentException("length mis-match");
            }
            synchronized (sendLock) {
                try {
                    out.write(pkt, 0, len);
                    out.flush();
                } catch (IOException e) {
                    if (!isOpen()) {
                        throw new ClosedConnectionException("connection is closed");
                    }
                    throw e;
                }
            }
        }
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
