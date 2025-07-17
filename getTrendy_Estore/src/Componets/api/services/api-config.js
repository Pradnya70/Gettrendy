import { BASEURL } from "../../Client/Comman/CommanConstans";

const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || BASEURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

export default API_CONFIG;
