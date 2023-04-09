export const API_URL = "http://localhost:1235/vita-study/record-manager-server";
export const LOGIN_URL = `${API_URL}/j_spring_security_check`;
export const USER_CREDS_URL = `${API_URL}/rest/users/current`;
export const enum ROLES{
    'ADMIN' = "http://onto.fel.cvut.cz/ontologies/record-manager/administrator",
    'DOCTOR' = "http://onto.fel.cvut.cz/ontologies/record-manager/doctor"
}