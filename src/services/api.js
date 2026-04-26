import axios from "axios";
import { API_URL_PRODUCTION } from "../constants/apiConstants";
import { API_URL_DEVELOP } from "../constants/apiConstants";

axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: API_URL_DEVELOP,
    withCredentials: true
});

// const api = axios.create({
//     baseURL: API_URL_DEVELOP,
//     withCredentials: true, 
// });

export default api;


