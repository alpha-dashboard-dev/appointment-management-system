import initModels from "../config/database/sequelize/models/index";
import { buildIncludes } from "../utils/includeBuilder";

import dbHelper from "../helpers/newDBHelper";
import {buildWhere} from "../utils/buildWhere";

const db = initModels();

class UserRepository {

  private tables: any;

  constructor() {
    // this.tables = { sequelize: db.User };
      this.tables = db.User;
  }

  async create(data: any, options?: any) {
    return dbHelper.create(this.tables, data, options);
  }

  // async findAll(filters: any = {}, options: any = {}) {
  //
  //   const where: any = {};
  //
  //   if (filters.business_code) {
  //     where.business_code = filters.business_code;
  //   }
  //
  //   if (filters.user_type) {
  //     where.user_type = filters.user_type;
  //   }
  //
  //   if (filters.is_active) {
  //     where.is_active = filters.is_active;
  //   }
  //
  //   if (filters.search) {
  //
  //     const { Op } = require("sequelize");
  //
  //     where[Op.or] = [
  //       {
  //         name: {
  //           [Op.like]: `%${filters.search}%`
  //         }
  //       },
  //       {
  //         email: {
  //           [Op.like]: `%${filters.search}%`
  //         }
  //       },
  //       {
  //         phone: {
  //           [Op.like]: `%${filters.search}%`
  //         }
  //       },
  //     ];
  //   }
  //
  //   return dbHelper.findAll(
  //       this.tables,
  //       {
  //         where,
  //         include: this.buildIncludes(options.include || []),
  //         limit: options.limit,
  //         offset: options.offset,
  //         order: options.order || [
  //           ["created_at", "DESC"]
  //         ],
  //       }
  //   );
  // }


    async findAll(options: any = {}) {
      // console.log(options);

        const include = buildIncludes(
            this.tables,
            options.include || []
        );

        return dbHelper.findAll(
            this.tables,
            {
                ...options,
                include
            }
        );

    }
  // async findByCode(userCode: string, options: any = {}) {
  //
  //   return dbHelper.findOne(
  //       this.tables,
  //       {
  //         where: {
  //           user_code: userCode,
  //         },
  //
  //         include: buildIncludes(
  //             options.include || []
  //         ),
  //       }
  //   );
  // }

    async findOne(where: any = {}, options: any = {})
    {
        return dbHelper.findOne(
            this.tables,
            {
                where,
                include: buildIncludes(
                    this.tables,
                    options.include || []
                ),
            }
        );
    }

  async findByEmail(email: string) {

    return dbHelper.findOne(
        this.tables,
        {
          where: {
            email,
          },
        }
    );
  }

  async update(userCode: string, data: any) {

    return dbHelper.update(
        this.tables,
        {
          user_code: userCode,
        },
        data
    );
  }

  async delete(userCode: string) {

    return dbHelper.update(
        this.tables,
        {
          user_code: userCode,
        },
        {
          is_active: "inactive",
        }
    );
  }
}

export default new UserRepository();