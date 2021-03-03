<template>
  <div class="aes">
    <el-form ref="form" class="aes-form" :model="form" :rules="rules" label-width="55px">
      <el-form-item label="key" prop="key">
        <el-input
          v-model="form.key"
          placeholder="加密算法的密钥(16位)"
          onKeyUp="value=value.replace(/[\W]/g,'')"
          maxlength="16"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="iv" prop="iv">
        <el-input
          v-model="form.iv"
          placeholder="加密算法的初始向量(16位)"
          onKeyUp="value=value.replace(/[\W]/g,'')"
          maxlength="16"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="data" prop="data">
        <el-input
          v-model="form.data"
          :autosize="{minRows: 4, maxRows: 20}"
          type="textarea"
          placeholder="需要加解密的数据"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="btn-group">
      <el-button-group>
        <el-button type="primary" size="small" plain @click="encrypt">加密</el-button>
        <el-button type="primary" size="small" plain @click="decrypt">解密</el-button>
        <el-button type="primary" size="small" plain @click="clear">清空</el-button>
        <el-button type="primary" size="small" plain @click="copy">复制</el-button>
      </el-button-group>
    </div>
    <template v-if="result">
      <el-form label-width="55px">
        <el-form-item label="result">
          <pre v-highlightjs="result" class="result-box"><code class="js"></code></pre>
        </el-form-item>
      </el-form>
    </template>
    <el-backtop target=".el-main"></el-backtop>
  </div>
</template>

<script>
import jsonFormat from "@/tools/json_format";
const CryptoJS = require("crypto-js");

export default {
  name: "aes",
  data() {
    return {
      form: {
        key: "",
        iv: "",
        data: ""
      },
      rules: {
        key: [
          { required: true, message: "请输入 key", trigger: "blur" },
          { min: 16, max: 16, message: "长度为16个字符", trigger: "blur" }
        ],
        iv: [
          { required: true, message: "请输入 iv", trigger: "blur" },
          { min: 16, max: 16, message: "长度为16个字符", trigger: "blur" }
        ],
        data: [{ required: true, message: "请输入 data", trigger: "blur" }]
      },
      result: ""
    };
  },
  methods: {
    copy() {
      if (this.result == "") {
        this.$message.warning("当前 result 为空！");
        return;
      }
      this.$copyText(this.result).then(
        e => {
          this.$message.success("复制成功！");
        },
        e => {
          this.$message.warning("复制失败！");
        }
      );
    },
    clear() {
      this.form = {
        key: "",
        iv: "",
        data: ""
      };
      this.result = "";
      this.$message.success("已清空！");
    },
    decrypt() {
      let str = this.form.data.replace(/[ ]/g, "").replace(/^\"|\"$/g,'');
      let word;
      if(this.isJSON(str)) {
        word = this.getValue(JSON.parse(str), 'encrypt')
      } else if(str.indexOf(':') != '-1') {
        word = str.split(':')[1].replace(/[ ]/g, "").replace(/^\"|\"$/g,'');
      } else {
        word = str;
      };
      // 解密方法
      this.$refs.form.validate(valid => {
        if (valid) {
          let key = CryptoJS.enc.Utf8.parse(this.form.key); // 密钥
          let iv = CryptoJS.enc.Utf8.parse(this.form.iv); // 密钥偏移量
          let decrypted = CryptoJS.AES.decrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC , padding: CryptoJS.pad.Pkcs7 });
          let decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
          let result = decryptedStr.toString();
          let json = jsonFormat(
            result,
            res => {
              this.result = res;
            },
            err => {
              this.result = result;
            }
          );
        } else {
          return false;
        }
      });
    },
    encrypt() {
      // 加密
      this.$refs.form.validate(valid => {
        if (valid) {
          let key = CryptoJS.enc.Utf8.parse(this.form.key); // 密钥
          let iv = CryptoJS.enc.Utf8.parse(this.form.iv); // 偏移量
          let srcs = CryptoJS.enc.Utf8.parse(this.form.data);
          let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });
          this.result = encrypted.ciphertext.toString().toUpperCase();
        } else {
          this.$message.warning("请输入必填项！");
          return false;
        }
      });
    },
    getValue(data, target) {
      for (const key of Object.keys(data)) {
        if (key === target) {
          return data[key];
        }
        if (this.isObject(data[key])) {
          const result = this.getValue(data[key], target);
          if (typeof result !== "undefined") {
            return result;
          }
        }
      }
    },
    isObject(obj) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    },
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return true;
          } else {
            return false;
          }

        } catch (e) {
          return false;
        }
      }
    }
  }
};
</script>

<style>
@import url("./style/index.min.css");
</style>