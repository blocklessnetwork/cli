import { getDb } from "../../store/db";

export const removeWallet = () => {
  console.log("disconnecting wallet");
  const db = getDb();
  db.set("config.token", null).write();
  db.set("config.authUrl", null).write();
  db.set("config.authPort", null).write();
  console.log("user logged out");
};
