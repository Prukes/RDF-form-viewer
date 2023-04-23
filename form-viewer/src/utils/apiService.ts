import axios from "axios";


const defaultHeaders = {
    'Content-Type': 'application/json',
}
export let apiService = axios.create({
    withCredentials: true,
    headers: defaultHeaders
});