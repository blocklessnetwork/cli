import open from "open";
import { getNodeMajorVersion } from "typescript";

export async function openInBrowser(url: string): Promise<void> {
    try {
        await timeout()
        console.log('node version', process.version)

        const childProcess = await open(url);
        childProcess.on("error", () => {
            console.warn("Failed to open browser.");
        });
    } catch { }
}

const timeout = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, 50)
    })
}