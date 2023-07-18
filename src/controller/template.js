
import puppeteer from "puppeteer";
import dtime from "time-formater";
import UserModel from "../models/user.js";
const fs = require("fs");
const path = require("path");
class Template {
  constructor() {
    this.signInTemplate = this.signInTemplate.bind(this);
  }

  async signInTemplate (req, res, next) {

    let { user_name, singinString, avatar } = req.query;
    // 生成日历
    const dateArrayFun = () => {
      const singinList = singinString.split(",");

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const firstDay = new Date(currentYear, currentMonth, 1); // 本月的第一天是星期几,计算机都是少一个月展示，从0开始
      const lastDay = new Date(currentYear, currentMonth + 1, 0); // 本月有多少天
      const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();// 上个月的有多少天
      // 数组中:date正常展示日期  type: -1--上个月与下个月的日期  0--没有签到  1--今天 2-已经签到
      let singinDateArray = [];
      let week = [];
      // 补充上个月的日期
      for (let i = firstDay.getDay(); i > 0; i--) {
        week.push({
          date: prevMonthLastDay - i + 1,
          type: -1
        });
      }

      // 当前月份有多少的日期
      for (let date = 1; date <= lastDay.getDate(); date++) {
        let type = 0; // 默认没有签到

        if (currentYear === currentDate.getFullYear() && currentMonth === currentDate.getMonth() && date === currentDate.getDate()) {
          type = 1; // 表示是今天
        }

        if (singinList[date - 1] == 1) {
          type = 2; // 表示签到
        }

        week.push({
          date: date,
          type: type
        });

        if (week.length === 7) {
          singinDateArray.push(week);
          week = [];
        }
      }

      // 补充下个月的日期
      let nextMonthDay = 1;
      while (week.length < 7) {
        week.push({
          date: nextMonthDay++,
          type: -1
        });
      }

      singinDateArray.push(week);

      return singinDateArray;
    };

    let dateArray = dateArrayFun();
    // 生成你的数据
    const data = {
      name: user_name,
      singinString: singinString,
      avatar: avatar,
      singinTime: dtime().format('YYYY MM DD HH:mm:ss'),
      dateArray: dateArray
    };
    res.render("singIn", data);
  }

  async captureScreenshot (req, res, next) {
    const { user_name, wx_id, avatar, type = 0 } = req.query;
    let view_url = "";
    if (type == 0) {
      // type=0 就是截取打卡图片
      console.log("wx_id", wx_id);
      try {
        const userinfo = await UserModel.findOne({ wx_id: wx_id }, "-_id -__v");
        if (!userinfo) {
          throw new Error("无该wx_id的用户，大概率是没有注册");
        }
        const singin_string = userinfo.sing_in_list.join(",");
        view_url = "http://localhost:8001/sign_in_template";
        view_url = `${view_url}?user_name=${user_name}&singinString=${singin_string}&avatar=${avatar}`;

      } catch (err) {
        console.log(err);
        res.send({
          code: 0,
          message: err.message
        });
      }

    }

    // 截取模板的图片
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });

    const page = await browser.newPage();
    // 设置视口大小为 375x667
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 1
    });
    // 导航到服务器生成的 HTML 页面
    await page.goto(view_url);
    // 等待一段时间以确保页面加载完成，或根据需要进行其他操作
    // 截取整个页面的截图
    const screenshot = await page.screenshot();

    // 保存运动截图到文件系统
    let encodeName = encodeURIComponent(user_name); //奇怪字符转一下编码
    let filePathName = `image/singinPhoto/${user_name}_singin_${(new Date()).getTime()}.png`;
    // 存储的效果是带字体图标的，发出的是带编码的，浏览器能解析，但是我们不能解析；
    let urlePathName = `image/singinPhoto/${encodeName}_singin_${(new Date()).getTime()}.png`;
    let AbsolutePath = path.join(__filename, `../../assets/${filePathName}`);
    fs.writeFileSync(AbsolutePath, screenshot, { encoding: 'binary' });
    // let baseurl = "http://lcoalhost:80001/"
    await browser.close();
    res.send({
      code: 200,
      message: "图片成功地址",
      result: {
        url: urlePathName,
      }
    });
  }
}


export default new Template();