<template>
  <div class="top">
    <h1>Subscriber</h1>
    <p v-if="isConnection">参加中</p>
    <div id="video_wrapper">
      <div id="videos"></div>
    </div>
    <div v-if="!isLoading">
      <p v-if="!isBroadcast">
        セミナーはまだ開催されていません。しばらくお待ちください
      </p>
      <button
        v-if="!isConnection"
        :disabled="!isBroadcast"
        @click="connectSubscriber()"
      >
        参加
      </button>
      <button v-else @click="disconnectSubscriber">退出</button>
    </div>
    <div v-else>
      <vue-loading
        type="spiningDubbles"
        color="#008080"
        :size="{ width: '100px', height: '100px' }"
      ></vue-loading>
    </div>
  </div>
</template>

<script>
const OT = require("@opentok/client");
import { VueLoading } from "vue-loading-template";

export default {
  name: "SubscriberCom",
  data() {
    return {
      opentok: OT,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      subscriberToken: process.env.VUE_APP_SUBSCRIBER_TOKEN,
      signalSessionId: process.env.VUE_APP_SIGNAL_SESSION_ID,
      signalToken: process.env.VUE_APP_SIGNAL_MODERATOR_TOKEN,
      videoId: "videos",
      sessionObj: null,
      isConnection: false,
      isBroadcast: false,
      isLoading: true,
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
  components: {
    VueLoading,
  },
  mounted() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);

    this.sessionObj = this.opentok
      .initSession(this.apiKey, this.sessionId)
      .on("streamCreated", (event) => {
        this.sessionObj.subscribe(
          event.stream,
          this.videoId,
          this.subscribeOpt
        );
      });

    this.onlySignalSessionObj = this.opentok
      .initSession(this.apiKey, this.signalSessionId)
      .on("signal:startBroadcast", () => {
        this.isBroadcast = true;
        console.log("startBroadcast");
      })
      .on("signal:stopBroadcast", () => {
        this.isBroadcast = false;
        console.log("stopBroadcast");
      })
      .on("signal:receiveStatus", (event) => {
        this.isBroadcast = event.data;
        console.log("receiveStatus");
      });

    this.onlySignalSessionObj.connect(this.signalToken, (error) => {
      if (error) {
        alert("error");
      } else {
        console.log("signalで接続しました");
        this.onlySignalSessionObj.signal(
          {
            type: "requestStatus",
          },
          (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("send type: requestStatus");
            }
          }
        );
      }
    });
  },
  methods: {
    connectSubscriber() {
      this.sessionObj.connect(this.subscriberToken, (error) => {
        if (error) {
          alert("error");
        } else {
          this.isConnection = true;
          console.log("subscriberとして参加しました");
        }
      });
    },

    disconnectSubscriber() {
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
#videos {
  display: flex;
}
#videos.div {
  aspect-ratio: 16 / 9;
}
</style>
