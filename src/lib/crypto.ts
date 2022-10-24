import crypto from "crypto";

/**
 *
 * @returns
 */
export const generateChecksum = (archive: Buffer): string => {
  return crypto.createHash("sha256").update(archive).digest("hex");
};
