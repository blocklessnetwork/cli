import Table from "cli-table3"
import { consoleClient } from "../../lib/http"

export const run = async () => {
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})

    const maxWidth = Math.min(process.stdout.columns, 120) || 120;
    var table = new Table({
      head: ["Name", "CID", "Status"],
      colWidths: [28, maxWidth - 50, 15],
      wordWrap: true,
      wrapOnWordBoundary: false
    })

    data && data.forEach && data.forEach((f: any) => {
      table.push([f.functionName, f.functionId, f.status])
    })

    console.log(table.toString())
  } catch (error) {
    console.log('Failed to retrieve function list')
    return
  }
}
