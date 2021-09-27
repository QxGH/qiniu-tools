<template>
  <div class="uploadImage">
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
    <div class="title">upload</div>
    <template>
      <el-upload
        class="upload-control"
        drag
        action="https://api.services.xingchen.cn/"
        :before-upload="beforeUpload"
        multiple
        :show-file-list="false"
        accept="image"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将图片拖到此处，或
          <em>点击上传</em>
        </div>
      </el-upload>
    </template>
    <template v-if="resultList.length > 0">
      <div class="title">result</div>
      <ul class="result-list">
        <template v-for="(item, index) in resultList">
          <li class="item clearfix" :key="index">
            <div class="img-box">
              <el-image class="img" :src="item.url" fit="contain"></el-image>
            </div>
            <div class="info">
              <div class="infoItem">
                <label class="resultTiele">文件名：</label>
                {{item.name}}
              </div>
              <div class="infoItem">
                <label class="resultTiele">文件大小：</label>
                {{item.size | getFileSize}}
              </div>
              <div class="infoItem">
                <label class="resultTiele">文件类型：</label>
                {{item.type}}
              </div>
              <div class="infoItem">
                <label class="resultTiele">分辨率：</label>
                {{item.pixel}}
              </div>
              <div class="infoItem clearfix" style="clear: none;">
                <label class="resultTiele pull-left">文件链接：</label>
                <div class="infoUrl">
                  <el-input disabled :value="item.url" class="input-with-select">
                    <el-button slot="append" @click="copy(item.url)">复 制</el-button>
                  </el-input>
                </div>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </template>
  </div>
</template>

<script>
import VueClipboard from "vue-clipboard2";

export default {
  name: "UploadImage",
  data() {
    return {
      bucketList: {},
      domain: "",
      domainLoading: true,
      resultList: []
    };
  },
  mounted() {
    this.getBucketHandle();
  },
  methods: {
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
      if (file.type.indexOf('image') == '-1') {
        this.$message.warning("只能上传图片!");
        return false;
      };
      this.uploadValidate(file);
      return false;
    },
    getToken(file) {
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
    getBase64(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        let imgResult = "";
        reader.readAsDataURL(file);
        reader.onload = () => {
          imgResult = reader.result;
        };
        reader.onerror = error => {
          reject(error);
        };
        reader.onloadend = () => {
          resolve(imgResult);
        };
      });
    },
    uploadValidate(file) {
      if (!this.domain) {
        this.$message.warning("请选择储存空间！");
        return;
      }
      let fileName = file.name;
      let getToken = this.getToken(file);
      let getBase64 = this.getBase64(file);
      Promise.all([getToken, getBase64]).then(res => {
        let tokenData = res[0].data.data;
        if (res[0].data.code === 0) {
          let base64 = res[1].replace(/^(data\:image\/)+(\S)+;base64\,/, "");
          this.upload(tokenData.uptoken, tokenData.domain, base64, fileName);
        } else {
          this.$message.warning(res.data.message);
        }
      });
    },
    upload(uptoken, domain, base64, fileName) {
      // console.log(this.domain)
      // console.log(this.bucketList)
      // debugger
      let uploadUrl = ''
      for(let item of this.bucketList) {
        if(item.name == this.domain) {
          uploadUrl = item.client;
          break
        }
      };
      axios
        .post(`${uploadUrl}putb64/-1/`, base64, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `UpToken ${uptoken}`
          }
        })
        .then(res => {
          let resData = res.data;
          let resultList = this.resultList;
          let obj = {
            url: resData.domain + resData.hash,
            size: resData.size,
            name: fileName,
            type: resData.type,
            pixel: `${resData.w}px * ${resData.h}px`
          };
          resultList.unshift(obj);
          this.resultList = resultList;
          this.$notify.success({
            message: `${fileName} 上传成功！`,
            duration: 2500
          });
        })
        .catch(err => {
          this.$message.error(`${fileName} 上传失败！`);
        });
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
  },
  filters: {
    getFileSize(fileByte) {
      var fileSizeByte = fileByte;
      var fileSizeMsg = "";
      if (fileSizeByte < 1048576) {
        fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
      } else if (fileSizeByte >= 1048576 && fileSizeByte < 1073741824) {
        fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
      } else {
        fileSizeMsg = "文件超过1G";
      }
      return fileSizeMsg;
    }
  }
};
</script>

<style lang="scss">
@import './style/index.scss';
</style>
