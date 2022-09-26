import crypto from "crypto"

/**
 * 
 * @returns 
 */
export const generateChecksum = (archive: Buffer): string => {
    return crypto.createHash("md5").update(archive).digest("hex")
}
