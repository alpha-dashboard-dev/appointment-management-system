// new dbhelper
import { db as drizzleDb } from "../config/database/drizzle/client";

import {eq, and, desc, asc,} from "drizzle-orm";

class DbHelper {

    get orm(): string {

        const active = process.env.ORM;

        if (!active) {
            throw new Error("ORM is not configured");
        }

        return active;
    }

    buildDrizzleWhere(
        drizzleTable: any,
        where: any = {}
    ) {

        const conditions = Object.entries(where)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) =>
                eq(drizzleTable[key], value)
            );

        if (!conditions.length) {
            return undefined;
        }

        return and(...conditions);
    }

    async create(table: any, data: any, options?: any) {

        if (this.orm === "sequelize") {

            return await table.sequelize.create(data, options);
        }

        if (this.orm === "drizzle") {

            const result = await drizzleDb
                .insert(table.drizzle)
                .values(data)
                .returning();

            return result[0] || null;
        }
    }

    async findOne(
        table: any,
        options: any = {}
    ) {

        if (this.orm === "sequelize") {

            return await table.sequelize.findOne(options);
        }

        if (this.orm === "drizzle") {

            const whereClause =
                this.buildDrizzleWhere(
                    table.drizzle,
                    options.where
                );

            let query = drizzleDb
                .select()
                .from(table.drizzle);

            if (whereClause) {
                query = query.where(whereClause);
            }

            const result = await query.limit(1);

            return result[0] || null;
        }
    }

    async findAll(
        table: any,
        options: any = {}
    ) {

        if (this.orm === "sequelize") {

            return await table.sequelize.findAll(options);
        }

        if (this.orm === "drizzle") {

            // let query = drizzleDb
            //     .select()
            //     .from(table.drizzle);
            //
            // // WHERE
            // const whereClause =
            //     this.buildDrizzleWhere(
            //         table.drizzle,
            //         options.where
            //     );
            //
            // if (whereClause) {
            //     query = query.where(whereClause);
            // }
            //
            // // ORDER
            // if (options.order?.length) {
            //
            //     const [field, direction] =
            //         options.order[0];
            //
            //     query = query.orderBy(
            //         direction === "DESC"
            //             ? desc(table.drizzle[field])
            //             : asc(table.drizzle[field])
            //     );
            // }
            //
            // // LIMIT
            // if (options.limit) {
            //     query = query.limit(options.limit);
            // }
            //
            // // OFFSET
            // if (options.offset) {
            //     query = query.offset(options.offset);
            // }
            //
            // return await query;
        }
    }

    async update(table: any, where: any, data: any, options?: any) {
        // console.log(table, where, data);

        if (this.orm === "sequelize") {

            await table.sequelize.update(
                data,
                { 
                    where,
                    ...options
                }
            );

            return await table.sequelize.findOne({
                where,
            });
        }

        if (this.orm === "drizzle") {

            const whereClause =
                this.buildDrizzleWhere(
                    table.drizzle,
                    where
                );

            const result = await drizzleDb
                .update(table.drizzle)
                .set(data)
                .where(whereClause)
                .returning();

            return result[0] || null;
        }
    }

    async delete(
        table: any,
        where: any
    ) {

        if (this.orm === "sequelize") {

            return await table.sequelize.destroy({
                where,
            });
        }

        if (this.orm === "drizzle") {

            const whereClause =
                this.buildDrizzleWhere(
                    table.drizzle,
                    where
                );

            return await drizzleDb
                .delete(table.drizzle)
                .where(whereClause);
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