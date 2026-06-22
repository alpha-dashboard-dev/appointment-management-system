// Generates unique 8-character codes used as identifiers across all models<

import crypto from "crypto";
export function generateCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}
