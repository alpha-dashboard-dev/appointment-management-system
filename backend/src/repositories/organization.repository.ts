import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();

class OrganizationRepository {

    private tables: any;

    constructor() {

        // this.tables = {
        //     sequelize: db.Organization,
        //     // drizzle: organizations
        // };
        this.tables = db.Organization
    }

    async createOrganization(data: any) {
        return dbHelper.create(
            this.tables,
            data
        );
    }

    async findAllOrganizations(options: any = {}){
        // console.log(options)

        const include = buildIncludes(
            this.tables,
            options.include || []
        )

        return dbHelper.findAll(
            this.tables,
            {
                ...options,
                include
            }
        );
    }

    async findOne(where: any = {}, options: any = {}){
        return dbHelper.findOne(
            this.tables,
            {
                where,
                include: buildIncludes(
                    this.tables,
                    options.include || []
                )
            }
        )
    }
        
    async updateOrganization(where: any, data: any, options: any = {}){

        return dbHelper.update(
            this.tables,
            where,
            data,
            options
        )

    }

    async deactivateOrganization(where: any, data: any){
        return dbHelper.update(
            this.tables,
            where,
            data
        )
    }

    async deleteOrganization(where: any){
        return dbHelper.delete(
            this.tables,
            where
        )
    }


}

export default new OrganizationRepository();
