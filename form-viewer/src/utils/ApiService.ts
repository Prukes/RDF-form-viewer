import axios from "axios";


export let apiService = axios.create({
    withCredentials: true,
});