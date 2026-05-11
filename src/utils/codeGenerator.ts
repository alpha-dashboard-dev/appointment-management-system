// Generates unique 8-character codes used as identifiers across all models
// (e.g. businessCode, appointmentCode). These act as foreign keys in queries
// without being enforced at the database level.
import crypto from "crypto";

/**
 * Returns a cryptographically random 8-char uppercase hex string (e.g. "A3F2C1B9").
 * 4 random bytes → 8 hex characters.
 */
export function generateCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}
