import initModels from "../config/database/sequelize/models/index";

import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class UserRepository {

  private tables: any;

  constructor() {

    this.tables = {
      sequelize: db.User,
    };
  }

  buildIncludes(include: string[] = []) {

    const associations =
      db.User.associations || {};

    return [...new Set(include)]
      .filter((alias) => associations[alias])
      .map((alias) => ({
        association: alias,
      }));
  }

  async create(data: any) {

    return dbHelper.create(
        this.tables,
        data
    );
  }

  async findAll(filters: any = {}, options: any = {}) {

    const where: any = {};

    if (filters.business_code) {
      where.business_code =
          filters.business_code;
    }

    if (filters.user_type) {
      where.user_type =
          filters.user_type;
    }

    if (filters.is_active) {
      where.is_active =
          filters.is_active;
    }

    if (filters.search) {

      const { Op } = require("sequelize");

      where[Op.or] = [
        {
          name: {
            [Op.like]:
                `%${filters.search}%`
          }
        },
        {
          email: {
            [Op.like]:
                `%${filters.search}%`
          }
        },
        {
          phone: {
            [Op.like]:
                `%${filters.search}%`
          }
        },
      ];
    }

    return dbHelper.findAll(
        this.tables,
        {
          where,

          include: this.buildIncludes(
              options.include || []
          ),

          limit: options.limit,

          offset: options.offset,

          order: options.order || [
            ["created_at", "DESC"]
          ],
        }
    );
  }

  async findByCode(
      userCode: string,
      options: any = {}
  ) {

    return dbHelper.findOne(
        this.tables,
        {
          where: {
            user_code: userCode,
          },

          include: this.buildIncludes(
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

  async update(
      userCode: string,
      data: any
  ) {

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