#!/bin/sh
set -e

LANG="$1"
FILE="$2"
BPS="$3"

if [ -z "$LANG" ] || [ -z "$FILE" ]; then
    echo '{"success":false,"error":{"message":"Language and file path required"}}'
    exit 1
fi

case "$LANG" in
    python)
        python3 /debugger/adapters/python_adapter.py "$FILE" "$BPS"
        ;;
    javascript|js)
        node /debugger/adapters/javascript_adapter.js "$FILE" "$BPS"
        ;;
    c)
        python3 /debugger/adapters/c_cpp_adapter.py "$FILE" "c" "$BPS"
        ;;
    cpp|c++)
        python3 /debugger/adapters/c_cpp_adapter.py "$FILE" "cpp" "$BPS"
        ;;
    java)
        python3 /debugger/adapters/java_adapter.py "$FILE" "$BPS"
        ;;
    *)
        echo "{\"success\":false,\"error\":{\"message\":\"Unsupported language: $LANG\"}}"
        exit 1
        ;;
esac

