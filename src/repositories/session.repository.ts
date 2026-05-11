// Session repository — stores refresh tokens so they can be validated and revoked.
// Each login creates a session; logout deletes it; token refresh rotates it.
import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

function parseExpiry(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    const multipliers: Record<string, number> = {
        s: 1_000,
        m: 60_000,
        h: 3_600_000,
        d: 86_400_000,
    };

    return new Date(Date.now() + value * (multipliers[unit] ?? 86_400_000));
}

class SessionRepository {

    private tables: any;

    constructor() {
        this.tables = {
            sequelize: db.Session,
        };
    }

    async create(userCode: string, refreshToken: string): Promise<any> {
        const expiresAt = parseExpiry(
            process.env.JWT_REFRESH_TOKEN_EXPIRES ?? "7d"
        );

        return dbHelper.create(this.tables, {
            userCode,
            refreshToken,
            expiresAt,
        });
    }

    async findByToken(refreshToken: string): Promise<any> {
        return dbHelper.findByField(
            this.tables,
            "refreshToken",
            refreshToken
        );
    }

    async updateToken(id: number, newToken: string): Promise<any> {
        const expiresAt = parseExpiry(
            process.env.JWT_REFRESH_TOKEN_EXPIRES ?? "7d"
        );

        return dbHelper.update(this.tables, id, {
            refreshToken: newToken,
            expiresAt,
        });
    }

    async deleteByUserCode(userCode: string): Promise<void> {
        return dbHelper.deleteByField(
            this.tables,
            "userCode",
            userCode
        );
    }
}

export default new SessionRepository();