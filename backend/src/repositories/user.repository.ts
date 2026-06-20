import initModels from "../config/database/sequelize/models/index";
import { buildIncludes } from "../utils/includeBuilder";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class UserRepository {

  private tables: any;

  constructor() {
    // this.tables = { 
    //   sequelize: db.User,
    //   drizzle: users
    //  };

      this.tables = db.User;
  }

  async create(data: any, options?: any) {
    return dbHelper.create(this.tables, data, options);
  }

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
    
   async update(where: any, data: any, options: any = {}) {

    return dbHelper.update(
        this.tables,
        where,
        data,
        options
    );
  }

  async deactivate(where: any, data: any){
    return dbHelper.update(
      this.tables,
      where,
      data
    )
  }

  async delete(where: any) {
    return dbHelper.delete(
        this.tables,
        where
    );
  }
}

export default new UserRepository();