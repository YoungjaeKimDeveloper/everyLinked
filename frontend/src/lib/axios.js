/*

    Axios Configuration

    By allowing WithCrendentail: user can send the cookie= Authentication
*/

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});
