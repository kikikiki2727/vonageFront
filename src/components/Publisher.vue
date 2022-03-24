<template>
  <div class="top">
    <h1>Publisher</h1>
    <p v-if="isConnection">参加中</p>
    <div id="video_wrapper">
      <div id="videos"></div>
    </div>
    <input v-model="name" />
    <button v-if="!isConnection" @click="sendRequest">
      参加リクエストを送る
    </button>
    <button v-else @click="disconnectPublisher">退出</button>
  </div>
</template>

<script>
const OT = require("@opentok/client");

export default {
  name: "PublisherCom",
  data() {
    return {
      opentok: OT,
      name: "",
      isConnection: false,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      signalSessionId: process.env.VUE_APP_SIGNAL_SESSION_ID,
      publisherToken: process.env.VUE_APP_PUBLISHER_TOKEN,
      signalToken: process.env.VUE_APP_SIGNAL_MODERATOR_TOKEN,
      videoId: "videos",
      sessionObj: null,
      onlySignalSessionObj: null,
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
      });
    this.publisherObj = this.opentok.initPublisher(
      this.videoId,
      this.publisherOpt
    );

    this.onlySignalSessionObj = this.opentok
      .initSession(this.apiKey, this.signalSessionId)
      .on("signal:allowedRequest", (event) => {
        this.sessionObj.connect(this.publisherToken, (error) => {
          if (error) {
            alert("error");
          } else {
            this.publisherObj.destroy();
            this.publisherOpt.name = event.data;
            this.publisherObj = this.opentok.initPublisher(
              this.videoId,
              this.publisherOpt
            );
            this.sessionObj.publish(this.publisherObj, this.videoId);
            this.isConnection = true;
            console.log(event);
          }
        });
      });

    this.onlySignalSessionObj.connect(this.signalToken, (error) => {
      if (error) {
        alert("error");
      } else {
        console.log("signalで接続しました");
      }
    });
  },
  methods: {
    sendRequest() {
      this.onlySignalSessionObj.signal(
        {
          type: "authRequest",
          data: this.name,
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`send type: authRequest, data: ${this.name}`);
            this.name = "";
          }
        }
      );
    },
    disconnectPublisher() {
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
