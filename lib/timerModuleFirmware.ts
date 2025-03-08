import { createHash } from "sha256-uint8array";
import { Asset } from "expo-asset";
import { readAsStringAsync } from "expo-file-system";

const version = 1.3
const filename = `oneUpTimer_v${version}.py`

export const sendUpdate = async (ws: WebSocket) => {
    const [{ localUri }] = await Asset.loadAsync(require("../assets/firmware/pythonScript.py"));
    if (!localUri) return
    const pythonScriptSource = await readAsStringAsync(localUri)
    const encoder = new TextEncoder();
    const pythonScriptSourceBinary = encoder.encode(pythonScriptSource);
    const pythonScriptSourceHash = createHash().update(pythonScriptSourceBinary).digest("hex");

    ws.send(JSON.stringify({
        filename,
        size: pythonScriptSourceBinary.length,
        checksum: pythonScriptSourceHash,
        version: version,
    }))

    const chunkSize = 4096;
    for (let offset = 0; offset < pythonScriptSourceBinary.length; offset += chunkSize) {
        let end = Math.min(pythonScriptSourceBinary.length, offset + chunkSize);
        const chunk = pythonScriptSourceBinary.slice(offset, end);

        ws.send(chunk);
    }

    ws.send(JSON.stringify({
        EOF: true
    }))
}