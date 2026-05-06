import subprocess
import tempfile
import os
import uuid

def handler(event, context):
    code       = event.get("code", "")
    timeout_ms = event.get("timeoutMs", 5000)
    timeout_s  = timeout_ms / 1000

    # Same pattern as Node — write to /tmp, execute, cleanup
    file_path = f"/tmp/exec_{uuid.uuid4()}.py"

    try:
        with open(file_path, "w") as f:
            f.write(code)

        result = subprocess.run(
            ["python3", file_path],
            capture_output=True,    # captures stdout + stderr separately
            text=True,              # returns strings not bytes (same as encoding utf-8)
            timeout=timeout_s
        )

        return {
            "statusCode": 200,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "timedOut": False
        }

    except subprocess.TimeoutExpired:
        return {
            "statusCode": 200,
            "stdout": "",
            "stderr": "Execution timed out",
            "timedOut": True
        }

    except Exception as e:
        return {
            "statusCode": 200,
            "stdout": "",
            "stderr": str(e),
            "timedOut": False
        }

    finally:
        try:
            os.unlink(file_path)   # same as unlinkSync — cleanup temp file
        except:
            pass