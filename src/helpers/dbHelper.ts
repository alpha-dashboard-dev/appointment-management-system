// ORM abstraction helper (legacy / alternative).
// Mirrors newDBHelper but kept as a secondary implementation.
// Prefer newDBHelper.ts for all new code.
import { db as drizzleDb } from "../config/database/drizzle/client";
import { eq } from "drizzle-orm";

class DbHelper {

    // Returns the configured ORM name; throws if ORM env var is missing.
    get orm(): string {
        const active = process.env.ORM;
        if (!active) throw new Error("ORM is not configured. Set the ORM environment variable.");
        return active;
    }

   
    async create(table: any, data: any) {
        if (this.orm === "sequelize") {
            return await table.sequelize.create(data);
        }
        if (this.orm === "drizzle") {

            return await drizzleDb.insert(table.drizzle).values(data).returning();
        }
    }

    async findByEmail(table: any, email: string) {

        if (!email) throw new Error("Email is required");

        if (this.orm === "sequelize") {
            return await table.sequelize.findOne({ where: { email } });
        }
        if (this.orm === "drizzle") {
            const result = await drizzleDb.select().from(table.drizzle).where(eq(table.drizzle.email, email));
            return result[0];
        }
    }

    async findAll(table: any) {
        console.log(this.orm);
        if (this.orm === "sequelize") {
            return await table.sequelize.findAll();
        }
        if (this.orm === "drizzle") {
            return await drizzleDb.select().from(table.drizzle);
        }
    }

    
    async findById(table: any, id: number) {
        console.log(this.orm);
        if (this.orm === "sequelize") {
            return await table.sequelize.findByPk(id);
        }
        if (this.orm === "drizzle") {
            const result = await drizzleDb.select().from(table.drizzle).where(eq(table.drizzle.id, id));
            return result[0]
        }
    }

    async findByField(table: any, field: string, value: any){
        console.log(this.orm);
        if (this.orm === "sequelize") {
            return await table.sequelize.findOne({ where: { [field]: value } });
        }
        if (this.orm === "drizzle") {
            const result = await drizzleDb.select().from(table.drizzle).where(eq(table.drizzle[field], value));
            return result[0] || null;
        }
    }

    async findAllByField(table: any, field: string, value: any) {
        if (this.orm === "sequelize") {
            const records = await table.sequelize.findAll({where: {[field]: value}, raw: true});
            return records;
        }
        if (this.orm === "drizzle") {
            return await drizzleDb.select().from(table.drizzle).where(eq(table.drizzle[field], value));
        }
        return [];
    }


    async findByUser(table: any, user: any) {
        console.log(this.orm);
        if (!user) throw new Error("User is required");

        if (this.orm === "sequelize") {
            let where: any = {};
            if (user.role === "employee")
                where = { employeeId: user.id };
            else if (user.role === "client")
                where = { clientId: user.id };
            else if (user.role === "business_owner")
                where = { businessId: user.businessId };

            const records = await table.sequelize.findAll({ where });
            return records;
        }
        if (this.orm === "drizzle") {
            let condition: any;
            if (user.role === "employee")
                condition = eq(table.drizzle.employeeId, user.id);
            else if (user.role === "client")
                 condition = eq(table.drizzle.clientId, user.id);
            else if (user.role === "business_owner")
                condition = eq(table.drizzle.businessId, user.businessId);

            if (!condition) return await drizzleDb.select().from(table.drizzle);
            return await drizzleDb.select().from(table.drizzle).where(condition);
        }
        return [];
    }


    async update(table: any, id: number, data: any){
        console.log(this.orm)
        if (this.orm === "sequelize") {
            return await table.sequelize.update(data, { where: { id } });
        }
        if (this.orm === "drizzle") {
            return await drizzleDb.update(table.drizzle).set(data).where(eq(table.drizzle.id, id)).returning();
        }
    }

    
    async insertInto(subTable: any, data: any){
        if (!data || Object.keys(data).length === 0) throw new Error("Data is required");

        if (this.orm === "sequelize") {
            const record = await subTable.sequelize.create(data);
            return record.get({ plain: true });
        }
        if (this.orm === "drizzle") {
            const result = await drizzleDb.insert(subTable.drizzle).values(data).returning() as any[];
            return result[0] || null;
        }
    }

    
    async findAllInSubTable(subTable: any, field: string, value: any){
        if (this.orm === "sequelize") {
            return await subTable.sequelize.findAll({ where: { [field]: value }, raw: true });
        }
        if (this.orm === "drizzle") {
            return await drizzleDb.select().from(subTable.drizzle).where(eq(subTable.drizzle[field], value));
        }
        return [];
    }

    
    async delete(table: any, id: number){
        if (this.orm === "sequelize") {
            return await table.sequelize.destroy({ where: { id } });
        }
        if (this.orm === "drizzle") {
            return await drizzleDb.delete(table.drizzle).where(eq(table.drizzle.id, id));
        }
    }

    async deleteByField(table: any, field: string, value: any){
        if (this.orm === "sequelize") {
            await table.sequelize.destroy({ where: { [field]: value } });
        }
        if (this.orm === "drizzle") {
            await drizzleDb.delete(table.drizzle).where(eq(table.drizzle[field], value));
        }
    }
}

export default new DbHelper();