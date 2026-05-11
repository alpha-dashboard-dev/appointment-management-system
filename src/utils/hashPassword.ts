import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12; // Higher = slower hash (more brute-force resistant)

/** Hashes a plain-text password. Always await this — it is async. */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/** Returns true if plain-text password matches the stored bcrypt hash. */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
}