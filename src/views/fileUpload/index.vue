<template>
  <div class="uploadFile">
    <div class="title">bucket</div>
    <template>
      <el-select v-model="domain" placeholder="请选择" :loading="domainLoading" style="width: 100%;">
        <el-option
          v-for="item in bucketList"
          :key="item.name"
          :label="item.label"
          :value="item.name"
        ></el-option>
      </el-select>
    </template>
    <div class="title">
      path
      <el-button-group style="margin-left: 15px;">
        <el-button type="primary" size="mini" plain @click="addFileKey('filename')">filename</el-button>
        <el-button type="primary" size="mini" plain @click="addFileKey('uuid')">uuid</el-button>
        <el-button type="primary" size="mini" plain @click="addFileKey('suffix')">suffix</el-button>
      </el-button-group>
    </div>
    <el-input
      ref="fileKeyInput"
      placeholder="file/upload/{uuid}{suffix}"
      v-model="fileKey"
      clearable
    ></el-input>
    <div class="title">upload</div>
    <template>
      <el-upload
        class="upload-control"
        drag
        action=""
        :before-upload="beforeUpload"
        :show-file-list="false"
        :disabled="uploadLoading"
      >
        <template v-if="uploadLoading">
          <div class="upload-loading-box">
            <el-progress type="circle" :percentage="uploadPercentage"></el-progress>
          </div>
        </template>
        <template v-else>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
        </template>
      </el-upload>
    </template>
    <template v-if="result">
      <div class="title">result</div>
      <el-input disabled :value="result" class="input-with-select">
        <el-button slot="append" @click="copy(result)">复 制</el-button>
      </el-input>
    </template>
  </div>
</template>

<script>
import VueClipboard from "vue-clipboard2";
import * as qiniu from "qiniu-js";
import uuidV4 from "uuid/v4";

export default {
  name: "UploadFile",
  data() {
    return {
      bucketList: {},
      domain: "",
      domainLoading: true,
      result: '',
      fileKey: "",
      uploadLoading: false,
      uploadPercentage: 0
    };
  },
  mounted() {
    this.getBucketHandle();
  },
  methods: {
    addFileKey(type) {
      let fileKey = this.fileKey;
      if (fileKey.indexOf(`{${type}}`) == "-1") {
        fileKey += `{${type}}`;
      }
      this.fileKey = fileKey;
      this.$refs.fileKeyInput.focus();
    },
    getBucketHandle() {
      this.$api.qiniu
        .getBucket()
        .then(res => {
          if (res.data.code === 0) {
            let items = res.data.data.items;
            let bucketList = [];
            for (let item in items) {
              let obj = {
                name: item,
                label: `${item} (${items[item].domain})`,
                value: items[item].domain,
                region: items[item].region,
                server: items[item].uploadDomain.server,
                client: items[item].uploadDomain.client
              };
              bucketList.push(obj);
            }
            this.bucketList = bucketList;
            this.domain = res.data.data.default;
          } else {
            this.$message.warning(res.data.message);
          }
          this.domainLoading = false;
        })
        .catch(err => {
          this.domainLoading = false;
        });
    },
    beforeUpload(file) {
      this.uploadValidate(file);
      return false;
    },
    getToken() {
      return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append("bucket", this.domain);
        this.$api.qiniu
          .getToken(formData)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    getFileType(filePath) {
      let startIndex = filePath.lastIndexOf(".");
      if (startIndex != -1) {
        return filePath
          .substring(startIndex + 1, filePath.length)
          .toLowerCase();
      } else {
        return "";
      }
    },
    uploadValidate(file) {
      let suffix = `.${this.getFileType(file.name)}`;
      let fileName = file.name.replace(suffix, "");
      let uuid = uuidV4();

      if (file.type.indexOf("html") != "-1") {
        this.$message.warning(`不支持 ${file.type} 文件上传!`);
        return false;
      };

      if (!this.domain) {
        this.$message.warning("请选择储存空间！");
        return;
      };

      let fileKey = this.fileKey;
      if (fileKey.indexOf("{filename}") != "-1") {
        fileKey = fileKey.replace(/{filename}/, fileName);
      };
      if (fileKey.indexOf("{uuid}") != "-1") {
        fileKey = fileKey.replace(/{uuid}/, uuid);
      };
      if (fileKey.indexOf("{suffix}") != "-1") {
        fileKey = fileKey.replace(/{suffix}/, suffix);
      };
      if(fileKey == 'favicon.ico') {
        this.$message.warning('文件名不能为 favicon.ico');
        return;
      };
      if(!fileKey) {
        fileKey = uuid;
      };

      this.getToken().then(res => {
        if (res.data.code === 0) {
          let tokenData = res.data.data;
          this.upload(tokenData.uptoken, tokenData.domain, fileKey, file);
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    upload(uptoken, domain, key, file) {
      const self = this;
      let config = {
        useCdnDomain: true,
        region: null
      };
      let putExtra = {
        fname: file.name,
        params: {}
      };
      let observe = {
        next(res) {
          // next: 接收上传进度信息，res 参数是一个带有 total 字段的 object，包含loaded、total、percent三个属性，提供上传进度信息。
          // console.log('next')
          // console.log("已上传大小，单位为字节：" + res.total.loaded);
          // console.log("本次上传的总量控制信息，单位为字节：" + res.total.size);
          // console.log("当前上传进度，范围：0～100：" + res.total.percent);
          self.uploadPercentage = parseInt(res.total.percent);
        },
        error(err) {
          // error: 上传错误后触发，当不是 xhr 请求错误时，会把当前错误产生原因直接抛出，诸如 JSON 解析异常等；当产生 xhr 请求错误时，参数 err 为一个包含 code、message、isRequestError 三个属性的 object：
          // console.log('error')
          // console.log(err.code);
          // console.log(err.message);
          // console.log(err.isRequestError);
          // console.log(err.reqId);
          self.$message.error(err.message);
          self.uploadLoading = false;
        },
        complete(res) {
          //完成后的操作
          //上传成功以后会返回key 和 hash  key就是文件名了！
          console.log("complete");
          console.log(res);
          self.result = res.domain + res.truekey;
          self.$message.success("上传成功！");
          self.uploadLoading = false;
        }
      };
      self.uploadLoading = true;
      self.uploadPercentage = 0;
      self.result = '';
      let observable = qiniu.upload(file, key, uptoken, putExtra, config);
      let subscription = observable.subscribe(observe);
    },
    onCopySuccess() {
      this.$message.success("复制成功！");
    },
    onCopyError() {
      this.$message.warning("复制失败！");
    },
    copy(url) {
      this.$copyText(url).then(
        e => {
          this.$message.success("复制成功！");
        },
        e => {
          this.$message.warning("复制失败！");
        }
      );
    }
  }
};
</script>

<style>
@import url("./style/index.min.css");
</style>
