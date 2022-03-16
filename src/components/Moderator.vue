<template>
  <div class="top">
    <h1>Moderator</h1>
    <p v-if="isConnection">参加中</p>
    <div id="video_wrapper">
      <div id="videos"></div>
    </div>
    <input v-model="name" />
    <button @click="connectModerator()">参加</button>
    <button @click="disconnectModerator()">退出</button>
  </div>
</template>

<script>
// import VonageHelper from "../service/vonage_helper";
const OT = require("@opentok/client");

export default {
  name: "ModeratorCom",
  data() {
    return {
      opentok: OT,
      isConnection: false,
      moderatorToken: process.env.VUE_APP_MODERATOR_TOKEN,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      videoId: "videos",
      name: "",
      sessionObj: null,
      publisherObj: null,
      publisherOpt: {
        fitMode: "contain",
        insertMode: "append",
        name: "",
        style: {
          audioLevelDisplayMode: "off",
          archiveStatusDisplayMode: "off",
          buttonDisplayMode: "off",
          nameDisplayMode: "on",
        },
      },
      subscribeOpt: {
        fitMode: "contain",
        insertMode: "append",
        style: {
          audioBlockedDisplayMode: "off",
          audioLevelDisplayMode: "off",
          buttonDisplayMode: "off",
          nameDisplayMode: "on",
          videoDisabledDisplayMode: "off",
        },
      },
    };
  },
  mounted() {
    this.sessionObj = this.opentok
      .initSession(this.apiKey, this.sessionId)
      .on("streamCreated", (event) => {
        this.sessionObj.subscribe(
          event.stream,
          this.videoId,
          this.subscribeOpt
        );
        console.log(`streamCreated: ${JSON.stringify(event)}`);
      });
    // .on("signal:authRequest", (event) => {});

    this.publisherObj = this.opentok.initPublisher(
      this.videoId,
      this.publisherOpt
    );
  },
  methods: {
    connectModerator() {
      this.sessionObj.connect(this.moderatorToken, (error) => {
        if (error) {
          alert("error");
        } else {
          this.publisherObj.destroy();
          this.publisherOpt.name = this.name;
          this.publisherObj = this.opentok.initPublisher(
            this.videoId,
            this.publisherOpt
          );
          this.sessionObj.publish(this.publisherObj, this.videoId);
          this.isConnection = true;
          this.name = "";
          console.log("moderatorとして参加しました");
        }
      });
      // console.log(`${JSON.stringify(this.sessionObj)}`);
    },
    disconnectModerator() {
      this.sessionObj.disconnect();
      this.isConnection = false;
      console.log("退出しました");
      location.reload();
      // console.log(`${JSON.stringify(event)}`);
    },
  },
};
</script>

<style>
#videos,
#video_wrapper {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
#videos > div {
  aspect-ratio: 16 / 9;
}
</style>
