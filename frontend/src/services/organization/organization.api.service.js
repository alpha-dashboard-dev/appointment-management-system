import api from '@/utils/api'

export default {
    getAll(params) {
        return api.get('/organizations/get-all-organizations')
    },

    create(data) {
        return api.post('/organizations/create-organization', data)
    },



    update(organization_code, data) {
        return api.put(`/organizations/update-organization/${organization_code}`, data)
    },

    deactivate(organization_code) {
        return api.patch(`/organizations/update-organization-status/${organization_code}`,
            { status: 'inactive' }
        )
    },

    remove(organization_code) {
        return api.delete(`/organizations/delete-organization/${organization_code}`)
    }
}

/*

let test={
    "organization":{
        "create_organization":{
            "endpoint":"http://localhost:8080/api/create_organization",
            "method":"POST",
            "body":{
                "tile":"org_title",
            },
            "response":{
                "org_title":"title"

            },
            "callback":(function (response){
                if(response.status(200)){

                }
                else{

                }
            }),

        }
    }
};

function apiHandler(section="organizartion",action="create_organoization",data){

}


 */