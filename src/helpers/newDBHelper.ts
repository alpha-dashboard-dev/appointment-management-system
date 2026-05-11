// ORM abstraction helper (primary).
// All repository methods call this helper instead of touching Sequelize or Drizzle directly.
// The active ORM is selected via the ORM environment variable ("sequelize" or "drizzle").
import { db as drizzleDb } from "../config/database/drizzle/client";
import { eq } from "drizzle-orm";

class DbHelper {

    // Returns the configured ORM name; throws if ORM env var is missing.
    get orm(): string {
        const active = process.env.ORM;
        if (!active) throw new Error("ORM is not configured. Set ORM env variable.");
        return active;
    }

    async create(table: any, data: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.create(data);
        }

        if (this.orm === "drizzle") {
            const result = await drizzleDb
                .insert(table.drizzle)
                .values(data)
                .returning();

            return (result as any[])[0] || null;
        }
    }

    async findByEmail(table: any, email: string) {
        if (!email) throw new Error("Email is required");

        if (this.orm === "sequelize") {
            return await table.sequelize.findOne({ where: { email } });
        }

        if (this.orm === "drizzle") {
            const result = await drizzleDb
                .select()
                .from(table.drizzle)
                .where(eq(table.drizzle.email, email));

            return result[0] || null;
        }
    }

    async findOne(table: any, options: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.findOne(options);
        }

        if (this.orm === "drizzle") {
            const key = Object.keys(options.where)[0];
            const value = options.where[key];

            const result = await drizzleDb
                .select()
                .from(table.drizzle)
                .where(eq(table.drizzle[key], value));

            return result[0] || null;
        }
    }

    async findAll(table: any, options: any = {}) {
        if (this.orm === "sequelize") {
            return await table.sequelize.findAll(options);
        }

        if (this.orm === "drizzle") {
            return await drizzleDb.select().from(table.drizzle);
        }
    }

    async findById(table: any, id: number) {
        if (this.orm === "sequelize") {
            return await table.sequelize.findByPk(id);
        }

        if (this.orm === "drizzle") {
            const result = await drizzleDb
                .select()
                .from(table.drizzle)
                .where(eq(table.drizzle.id, id));

            return result[0] || null;
        }
    }

    async findByField(table: any, field: string, value: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.findOne({
                where: { [field]: value },
            });
        }

        if (this.orm === "drizzle") {
            const result = await drizzleDb
                .select()
                .from(table.drizzle)
                .where(eq((table.drizzle as any)[field], value));

            return result[0] || null;
        }
    }

    async findAllByField(table: any, field: string, value: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.findAll({
                where: { [field]: value },
                raw: true,
            });
        }

        if (this.orm === "drizzle") {
            return await drizzleDb
                .select()
                .from(table.drizzle)
                .where(eq((table.drizzle as any)[field], value));
        }

        return [];
    }

    async update(table: any, id: number, data: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.update(data, {
                where: { id },
            });
        }

        if (this.orm === "drizzle") {
            return await drizzleDb
                .update(table.drizzle)
                .set(data)
                .where(eq(table.drizzle.id, id))
                .returning();
        }
    }

    async updateByCode(table: any, codeField: string, code: string, data: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.update(data, {
                where: { [codeField]: code },
            });
        }

        if (this.orm === "drizzle") {
            return await drizzleDb
                .update(table.drizzle)
                .set(data)
                .where(eq((table.drizzle as any)[codeField], code))
                .returning();
        }
    }

    async findByUser(table: any, user: any) {
        if (!user) throw new Error("User is required");

        if (this.orm === "sequelize") {
            let where: any = {};

            if (user.user_type === "employee")
                where = { employeeId: user.user_code };

            else if (user.user_type === "client")
                where = { clientId: user.user_code };

            else if (user.user_type === "BUSINESS_OWNER")
                where = { businessCode: user.business_code };

            return await table.sequelize.findAll({ where });
        }

        if (this.orm === "drizzle") {
            let condition: any;

            if (user.user_type === "employee")
                condition = eq(table.drizzle.employeeId, user.user_code);

            else if (user.user_type === "client")
                condition = eq(table.drizzle.clientId, user.user_code);

            else if (user.user_type === "BUSINESS_OWNER")
                condition = eq(table.drizzle.businessCode, user.business_code);

            if (!condition) {
                return await drizzleDb.select().from(table.drizzle);
            }

            return await drizzleDb.select().from(table.drizzle).where(condition);
        }

        return [];
    }

    async insertInto(subTable: any, data: any) {
        if (!data || Object.keys(data).length === 0) {
            throw new Error("Data is required");
        }

        if (this.orm === "sequelize") {
            const record = await subTable.sequelize.create(data);
            return record.get({ plain: true });
        }

        if (this.orm === "drizzle") {
            const result = await drizzleDb
                .insert(subTable.drizzle)
                .values(data)
                .returning();

            return (result as any[])[0] || null;
        }
    }

    async delete(table: any, id: number) {
        if (this.orm === "sequelize") {
            return await table.sequelize.destroy({ where: { id } });
        }

        if (this.orm === "drizzle") {
            return await drizzleDb
                .delete(table.drizzle)
                .where(eq(table.drizzle.id, id));
        }
    }

    async deleteByField(table: any, field: string, value: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.destroy({
                where: { [field]: value },
            });
        }

        if (this.orm === "drizzle") {
            return await drizzleDb
                .delete(table.drizzle)
                .where(eq((table.drizzle as any)[field], value));
        }
    }
}

export default new DbHelper();