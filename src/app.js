/*
 * @Author: wangwendie
 * @Date: 2023-07-04 13:20:45
 * @LastEditors: wangwendie
 * @Description:
 */
import express from "express";
import db from "./mongodb/db.js";
import router from "./routes/index.js";
const path = require("path");
const app = express();
// 安排请求头
app.all("*", (req, res, next) => {
  const { origin, Origin, referer, Referer } = req.headers;
  const allowOrigin = origin || Origin || referer || Referer || "*";
  res.header("Access-Control-Allow-Origin", allowOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);

  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const config = {
  port: 8001,
  url: 'mongodb://localhost:27017/weChat',
};

//  可以解析json
app.use(express.json());

// 配置模板引擎
app.set('view engine', 'ejs');
// 设置模板文件的存储位置为 'templates'
const viewsPath = path.resolve(__dirname, "./assets/templates");
console.log(viewsPath);
app.set('views', viewsPath);

// 給router路由送去app参数对象
router(app);

// 使用static
const staticPath = path.resolve(__dirname, "./assets");
console.log(staticPath);
app.use(express.static(staticPath));

db(config);

app.listen(config.port, () => {
  console.log(`${config.port}端口：监听打开了`);
});