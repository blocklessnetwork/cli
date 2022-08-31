import { getDb } from "../../store/db";

export const removeWallet = (options: any) => {
  console.log("disconnecting wallet");
  const db = getDb();
  db.set("config.token", null).write();
  console.log("user logged out");
};
