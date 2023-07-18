/*
 * @Author: wangwendie
 * @Date: 2023-07-17 13:04:26
 * @LastEditors: wangwendie
 * @Description: 模块图片生成
 */
import express from "express";
import Template from "../controller/template.js";

const router = express.Router();


router.get('/get_template_capture', Template.captureScreenshot);
router.get('/sign_in_template', Template.signInTemplate);


export default router;