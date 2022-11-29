import crypto from "crypto";

/**
 *
 * @returns
 */
export const generateChecksum = (archive: Buffer): string => {
  return crypto.createHash("sha256").update(archive).digest("hex");
};


/**
 * A simple function to parse JWT from a given token 
 * 
 * @param token 
 * @returns 
 */
export const parseJwt = (token: string) => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}