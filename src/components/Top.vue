<template>
  <div>
    <div class="top"></div>
    <div class="role_button">
      <div id="moderator_button">
        <button @click="openTab('moderator')">moderator</button>
      </div>
      <div id="publisher_button">
        <button @click="openTab('publisher')">publisher</button>
      </div>
      <div id="subscriber_button">
        <button @click="openTab('subscriber')">subscriber</button>
      </div>
    </div>
  </div>
</template>

<script>
import VonageHelper from "../service/vonage_helper";

export default {
  name: "TopComponent",
  data() {
    return {
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      videoId: "videos",
      vonageHelper: VonageHelper,
      isActive: false,
    };
  },
  mounted() {
    // window.addEventListener(
    //   "beforeunload",
    //   ((event) => {
    //     const isConfirm = confirm("本当にリロードしますか？");
    //     if (!isConfirm) {
    //       console.log("リロードされませんでした");
    //       event.preventDefault();
    //     }
    //   })()
    // );
    // window.addEventListener(
    //   "unload",
    //   (() => {
    //     console.log("リロードされました");
    //   })()
    // );
  },
  methods: {
    openTab(type) {
      const baseURL = "http://localhost:8081";
      switch (type) {
        case "moderator":
          window.open(`${baseURL}/moderator`);
          break;
        case "publisher":
          window.open(`${baseURL}/publisher`);
          break;
        case "subscriber":
          window.open(`${baseURL}/subscriber`);
          break;
      }
    },
  },
};
</script>

<style>
.role_button {
  text-align: center;
}
</style>
