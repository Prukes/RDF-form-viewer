export const API_URL = process.env.REACT_APP_API_URL;
export const LOGIN_URL = `${API_URL}/j_spring_security_check`;
export const USER_CREDS_URL = `${API_URL}/rest/users/current`;
export const RECORDS_URL = `${API_URL}/rest/records`;
export const FORM_TEMPLATES_URL = `${API_URL}/rest/formGen/formTemplates`;
export const FORM_GEN_URL = `${API_URL}/rest/formGen`;
export const enum ROLES {
    'ADMIN' = "http://onto.fel.cvut.cz/ontologies/record-manager/administrator",
    'DOCTOR' = "http://onto.fel.cvut.cz/ontologies/record-manager/doctor"
}