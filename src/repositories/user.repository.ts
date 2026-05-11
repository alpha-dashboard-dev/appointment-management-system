import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class UserRepository {

  private tables: any;

  constructor() {
    this.tables = {
      sequelize: db.User,
    };
  }

  async create(data: any) {
    return dbHelper.create(this.tables, data);
  }

  async findByEmail(email: string) {
    return dbHelper.findOne(this.tables, {
      where: { email },
    });
  }

  async findByCode(userCode: string) {
    return dbHelper.findOne(this.tables, {
      where: { user_code: userCode },
    });
  }

  async findAll(filters: any = {}) {
    const where: any = {};

    if (filters.organization_code) {
      where.organization_code = filters.organization_code;
    }

    if (filters.business_code) {
      where.business_code = filters.business_code;
    }

    if (filters.user_type) {
      where.user_type = filters.user_type;
    }

    if (filters.is_active) {
      where.is_active = filters.is_active;
    }

    return dbHelper.findAll(this.tables, {
      where,
    });
  }

  async update(userCode: string, data: any) {
    return dbHelper.updateByCode(
        this.tables,
        "user_code",
        userCode,
        data
    );
  }

  async delete(userCode: string) {
    return dbHelper.updateByCode(
        this.tables,
        "user_code",
        userCode,
        { is_active: "inactive" }
    );
  }
}

export default new UserRepository();