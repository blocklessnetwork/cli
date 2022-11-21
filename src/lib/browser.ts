import open from "open"

export async function openInBrowser(url: string): Promise<void> {
    try {
        await timeout()

        const childProcess = await open(url)
        childProcess.on("error", () => {
            console.warn("Failed to open browser.")
        })
    } catch { }
}

const timeout = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, 50)
    })
}