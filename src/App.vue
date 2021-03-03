<template>
  <div id="app" :class="{'black': blackTheme}">
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "APP",
  computed: {
    ...mapState(['blackTheme'])
  }
};
</script>

<style>
@import url('./assets/style/common.css');
@import url('./assets/theme/index.min.css');
</style>
