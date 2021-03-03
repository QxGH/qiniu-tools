<template>
  <div class="layout">
    <el-container>
      <el-header>
        <NavBar></NavBar>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import NavBar from "./components/navBar";
export default {
  name: "layout",
  components: {
    NavBar
  }
};
</script>

<style>
@import url("./style/index.min.css");
</style>