/*
 * @Author: wangwendie
 * @Date: 2023-06-20 09:57:24
 * @LastEditors: wangwendie
 * @Description: id的模块
 */

import fs from 'fs';
import path from 'path';
import Ids from "../models/ids.js";

class BaseComponent {
  constructor() {
    this.idlist = ["user_id"];
    this.getId = this.getId.bind(this);
    this.getPath = this.getPath.bind(this);
  }

  async getId (type) {

    if (!this.idlist.includes(type)) {
      console.log('id类型错误');
      throw new Error('id类型错误');
      return;
    }

    try {
      const idData = await Ids.findOne();
      // 得到对象,自增
      idData[type]++;
      await idData.save();
      return idData[type];
    } catch (err) {
      console.log('获取ID数据失败');
      throw new Error(err);
    }
  }

  async getPath (uploadPath, file) {
    return new Promise(async (resolve, reject) => {
      // let img_id;

      try {
        // img_id = await this.getId("img_id");
      } catch (error) {
        console.log("获取图片id失败");
        // 文件不对， 用于同步删除文件
        fs.unlinkSync(file.filepath);
        reject('获取图片id失败');
      }

      // const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16) + img_id;
      const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16);
      // 获取后缀
      const extname = path.extname(file.originalFilename);

      if (!['.jpg', '.jpeg', '.png'].includes(extname)) {
        fs.unlinkSync(file.filepath);
        res.send({
          status: 0,
          type: 'ERROR_EXTNAME',
          message: '文件格式错误'
        });
        reject('上传失败');
        return;
      }

      const fullName = hashName + extname; // 带上后缀
      const repath = uploadPath + '/' + fullName; // 带上地址

      try {

        // 重命名文件是一种上传
        fs.renameSync(file.filepath, repath);
        // 返回promise的结果
        resolve(fullName);
        return;
      } catch (err) {
        console.log('保存图片失败', err);
        if (fs.existsSync(repath)) {
          fs.unlinkSync(repath);
        } else {
          fs.unlinkSync(file.filepath);
        }
        reject('保存图片失败');
      }


    });
  }

  async saveBufferAsFile (buffer, filePath) {

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          // 成功返回临时路径文件
          resolve(filePath);
        }
      });
    });
  }

}

export default BaseComponent;