import Table from "cli-table3"
import { consoleClient } from "../../lib/http"
import { logger } from "../../lib/logger"

export const run = async () => {
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})

    const maxWidth = Math.min(process.stdout.columns, 120) || 120
    const tableOptions = {
      head: ["Name", "CID", "Status"],
      wordWrap: true,
      wrapOnWordBoundary: false
    } as Table.TableConstructorOptions

    if (maxWidth && maxWidth >= 40) {
      const colNameWidth = Math.floor(maxWidth * 0.24)
      const colStatusWidth = Math.floor(maxWidth * 0.24)
      const colCIDWidth = Math.floor(maxWidth * 0.44)
      tableOptions.colWidths = [colNameWidth, colCIDWidth, colStatusWidth]
    }

    const table = new Table(tableOptions)
    data && data.forEach && data.forEach((f: any) => {
      table.push([f.functionName, f.functionId, f.status])
    })

    logger.log(table.toString())
  } catch (error: any) {
    logger.error('Failed to retrieve function list.', error.message)
    return
  }
}
