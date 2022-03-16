<template>
  <div id="app">
    <!-- ヘッダー -->
    <h1>VONAGE SAMPLE</h1>
    <router-view />
    <!-- フッター -->
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
