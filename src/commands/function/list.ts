import axios from "axios";
import Table from "cli-table";
import { getToken } from "../../store/db";
import { getConsoleServer } from "../../lib/urls";

export const run = (options: any) => {
  const token = getToken();
  const serverHost = getConsoleServer();
  axios
    .post(
      `${serverHost}/api/modules/mine`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      // instantiate
      var table = new Table({
        head: ["Name", "CID", "Status"],
      });

      res.data &&
        res.data.forEach &&
        res.data.forEach((f: any) => {
          table.push([f.functionName, f.functionId, f.status]);
        });

      console.log(table.toString());
    });
};
