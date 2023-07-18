/*
 * @Author: wangwendie
 * @Date: 2023-07-14 09:32:09
 * @LastEditors: wangwendie
 * @Description:
 */
import * as dotenv from "dotenv";
const path = require("path");
const envPath = path.resolve(__dirname, "../../", '.env');
console.log(envPath);
dotenv.config({ path: envPath });

console.log(process.env.OPENAI_API_KEY);
export default {
  openai: process.env.OPENAI_API_KEY,
  openai2d: process.env.OPENAI_API2D_KEY,
  openWeatherApi: process.env.OPENWEATHER_API_KEY,
  opengeodeWebService: process.env.OPENGAODE_WEB_SERVICE_API_KEY,
  baseurl: process.env.BASE_URL,
};