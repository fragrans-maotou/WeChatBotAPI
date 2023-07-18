/*
 * @Author: wangwendie
 * @Date: 2023-07-04 13:44:45
 * @LastEditors: wangwendie
 * @Description:
 */

import formidable from "formidable";
import dtime from "time-formater";
import UserModel from "../models/user.js";
import BaseComponent from "../prototype/baseComponent.js";


class User extends BaseComponent {

  constructor() {
    super();
    this.registerUser = this.registerUser.bind(this);
    this.updataIntegral = this.updataIntegral.bind(this);
    this.uploadUserProfile = this.uploadUserProfile.bind(this);
  }

  async registerUser (req, res, next) {
    const { user_name, wx_id } = req.body;
    const genSignInList = () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const endDate = new Date(currentYear, currentMonth + 1, 0).getDate();
      const arraySize = new Array(endDate).fill(0);
      return arraySize;
    };
    try {
      if (!user_name) {
        throw new Error('缺少参数：用户名不能为空');
      } else if (!wx_id) {
        throw new Error('缺少参数：微信ID不能为空');
      }
      const userinfo = await UserModel.findOne({ wx_id }, "-_id -__v");
      if (userinfo) {
        throw new Error('注册失败，用户已经被注册');
      }
      const user_id = await this.getId('user_id');
      let newUser = {
        user_name: user_name,
        id: user_id,
        integral: 0,
        sing_in_list: genSignInList(), // 以后要单独成表
        create_time: dtime().format('YYYY-MM-DD HH:mm:ss'),
        rank: -1,
        avatar: "image/userProfile/default.jpg",
        city: {
          name: "",
          longitude: 0,
          latitude: 0
        },
        wx_id: wx_id
      };
      await UserModel.create(newUser);
      res.send({
        code: 200,
        message: '注册成功'
      });

      // 更新排名
      await this.updataUserRank(req, res, next);

    } catch (err) {
      console.log("什么错误:", err);
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }


  }



  async userInfo (req, res, next) {
    const { wx_id } = req.query;
    try {
      const userinfo = await UserModel.findOne({ wx_id }, "-_id -__v");
      res.send({
        code: 200,
        result: userinfo
      });
    } catch (err) {
      console.log(err);
      res.send({
        code: 10001, // 用户查找失败或者请求失败
        message: err.message
      });
      return;
    }
  }

  async userRankingList (req, res, next) {
    try {
      const userList = await UserModel.find({}, "-_id -__v").sort({ integral: -1 });
      let userListString = "";
      userList.forEach((userItem, index) => {
        userListString += `${index + 1} 、${userItem.user_name} --- ${userItem.integral} \n`;
      });
      res.send({
        code: 200,
        message: '获取用户列表',
        result: userListString
      });
    } catch (err) {
      console.log(err);
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }
  }

  async updataUserRank (req, res, next) {

    try {
      const userList = await UserModel.find({}).sort({ integral: -1 });
      let updateStatus = true;
      userList.forEach(async (userItem, index) => {
        if (userItem.rank != index + 1) {
          await UserModel.updateOne({ _id: userItem._id }, { $set: { rank: index + 1 } })
            .then(() => {
              console.log(`更新排序 ${userItem._id}成功`);
            })
            .catch(err => {
              console.error(`更新 ${userItem._id} 失败`, err);
              updateStatus = false;
            });
        }
      });
      return updateStatus;
    } catch (err) {
      console.error(err);
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }
  }

  async updataIntegral (req, res, next) {
    // 默认：type：0 为加
    const { type = 0, wx_id } = req.query;
    let numSize = (type == 0 ? 1 : -1);
    try {
      const userInfo = await UserModel.updateOne({ wx_id: wx_id }, { $inc: { integral: numSize } });
      res.send({
        code: 200,
        message: "更新成功",
        result: userInfo
      });
      // 修改完，开始对排名进行排序
      if (userInfo.acknowledged) {
        // 更新排名
        await this.updataUserRank(req, res, next);
      }
    } catch (err) {
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }
  }

  async updataSinginList (req, res, next) {
    // 打卡签到修改数组
    const { wx_id, sing_in_string } = req.query;
    const sing_in_array = sing_in_string.split(",");
    const index = (new Date()).getDate() - 1;
    if (sing_in_array[index] == 1) {
      res.send({
        code: 200,
        message: "今天你已经签到过了",
        result: false
      });
      return;
    }

    try {
      const updateSingin = {};
      updateSingin[`sing_in_list.${index}`] = 1;
      await UserModel.updateOne({ wx_id: wx_id }, { $set: updateSingin });
      res.send({
        code: 200,
        message: "签到成功",
        result: true
      });
    } catch (err) {
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }

  }

  async updataCity (req, res, next) {
    const { wx_id, area, location } = req.query;
    const [lon, lat] = location.split(",");
    try {
      const resultInfo = await UserModel.updateOne(
        { wx_id: wx_id },
        {
          $set: {
            city: {
              name: area,
              longitude: lon,
              latitude: lat,
            }
          }
        }, { multi: false });
      res.send({
        code: 200,
        message: "地址保存成功了耶",
        result: resultInfo
      });
    } catch (err) {
      res.send({
        code: 0,
        message: err.message
      });
      return;
    }
  }

  async uploadUserProfile (req, res, next) {
    const form = formidable({});
    const path = require("path");
    const uploadUserPath = path.join(__dirname, "../assets/image/userProfile");
    // 定义上传的路径位置
    form.uploadDir = uploadUserPath;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.send({
          code: 200,
          message: "表单信息错误"
        });
        return;
      }

      const { user_name, wx_id, file } = fields;
      // console.log(user_name, wx_id , files);
      try {
        if (!user_name) {
          // 引发报错，去catch中
          throw new Error("缺少参数：用户名参数错误");
        } else if (!wx_id) {
          throw new Error("缺少参数：微信id参数错误");
        }
      } catch (err) {
        console.log(err);
        res.send({
          code: 200,
          message: err.message
        });
      }

      try {

        // 先保存好图片，在获取图片的地址 ,给与上传路径
        const image_name = await this.getPath(uploadUserPath, files.files[0]);
        // 给图片起一个名字
        let image_path = "image/userProfile/" + image_name;
        await UserModel.findOneAndUpdate({ wx_id: wx_id }, { $set: { avatar: image_path } });
        res.send({
          status: 1,
          message: "保存成功",
          image_path: image_path,
        });
        return;
      } catch (err) {
        console.log('上传图片失败', err);
        res.send({
          status: 0,
          type: 'ERROR_UPLOAD_IMG',
          message: '上传图片失败'
        });
        return;
      }
    });
  }
}

export default new User();