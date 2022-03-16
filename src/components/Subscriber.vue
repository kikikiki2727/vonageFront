<template>
  <div class="top">
    <h1>Subscriber</h1>
    <div id="videos"></div>
    <button @click="connectSubscriber()">参加</button>
  </div>
</template>

<script>
const OT = require("@opentok/client");

export default {
  name: "SubscriberCom",
  data() {
    return {
      opentok: OT,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      subscriberToken: process.env.VUE_APP_SUBSCRIBER_TOKEN,
      videoId: "videos",
      sessionObj: null,
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
    connectSubscriber() {
      this.sessionObj.connect(this.subscriberToken, (error) => {
        if (error) {
          alert("error");
        } else {
          this.sessionObj.publish(this.publishObj, this.videoId);
          console.log("subscriberとして参加しました");
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
