<template>
  <div class="top">
    <h1>Publisher</h1>
    <div id="videos"></div>
    <button @click="sendRequest()">参加リクエストを送る</button>
  </div>
</template>

<script>
const OT = require("@opentok/client");

export default {
  name: "PublisherCom",
  data() {
    return {
      opentok: OT,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      publisherToken: process.env.VUE_APP_PUBLISHER_TOKEN,
      videoId: "videos",
      sessionObj: null,
      authRequests: [],
    };
  },
  created() {
    this.sessionObj = this.opentok
      .initSession(this.apiKey, this.sessionId)
      .on("streamCreated", (event) => {
        this.sessionObj.subscribe(event.stream, this.videoId);
      });
  },
  mounted() {
    this.publishObj = this.opentok.initPublisher(this.videoId);
  },
  methods: {
    sendRequest() {
      this.sessionObj.signal();
    },

    connectPublisher() {
      this.sessionObj.connect(this.publisherToken, (error) => {
        if (error) {
          alert("error");
        } else {
          this.sessionObj.publish(this.publishObj, this.videoId);
          console.log("publisherとして参加しました");
        }
      });
    },
  },
};
</script>

<style>
#videos {
  display: flex;
}
#videos.div {
  aspect-ratio: 16 / 9;
}
</style>
