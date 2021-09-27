<template>
  <div class="navbar" @dblclick.stop="headerDbclick">
    <el-menu
      :default-active="$route.path"
      :unique-opened="true" 
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
      <el-menu-item index="/">七牛云图片上传</el-menu-item>
      <el-menu-item index="/fileUpload">七牛云文件上传</el-menu-item>
      <el-menu-item index="/aes">AES加解密</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: "navbar",
  data(){
    return {
      defaultActive: '/'
    }
  },
  methods: {
    ...mapMutations(['CHANGE_THEME']),
    headerDbclick() {
      this.CHANGE_THEME()
    }
  }
};
</script>

<style>
@import url('./style/index.min.css');
</style>