import Table from "cli-table"
import { consoleClient } from "../../lib/http"

export const run = async () => {
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})

    var table = new Table({
      head: ["Name", "CID", "Status"],
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
