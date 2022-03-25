<template>
  <div class="top">
    <h1>Moderator</h1>
    <p v-if="isConnection">参加中</p>
    <label v-show="!isConnection"
      ><input type="checkbox" v-model="isMonitor" />モニターとして参加</label
    >
    <div id="video_wrapper">
      <div v-show="!isMonitor">
        <div id="videos"></div>
      </div>
    </div>
    <div v-show="!isMonitor">
      <div id="audio">
        <button @click="changeAudio">{{ audioText }}</button>
      </div>
      <div id="video">
        <button @click="changeVideo">{{ videoText }}</button>
      </div>
    </div>
    <input v-show="!isMonitor" v-model="name" />
    <button v-if="!isConnection" @click="connectModerator">参加</button>
    <button v-else @click="disconnectModerator">退出</button>
    <div v-if="isConnection">
      <button v-if="!isBroadcast" @click="startBroadcast">配信開始</button>
      <button v-else @click="stopBroadcast">配信停止</button>
    </div>
    <div class="request_wrapper">
      <p>リクエスト一覧</p>
      <div v-for="request in authRequests" :key="request.connectionId">
        <p>name: {{ request.name }}</p>
        <button @click="allowRequest(request)">承認</button>
        <button @click="rejectRequest(request)">拒否</button>
      </div>
    </div>
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
      moderatorToken: process.env.VUE_APP_MODERATOR_TOKEN,
      signalToken: process.env.VUE_APP_SIGNAL_MODERATOR_TOKEN,
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      signalSessionId: process.env.VUE_APP_SIGNAL_SESSION_ID,
      videoId: "videos",
      isConnection: false,
      isBroadcast: false,
      isMonitor: false,
      activateAudio: true,
      activateVideo: true,
      name: "",
      authRequests: [],
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
  computed: {
    audioText() {
      return this.activateAudio ? "マイクオフ" : "マイクオン";
    },
    videoText() {
      return this.activateVideo ? "カメラオフ" : "カメラオン";
    },
  },
  mounted() {
    this.sessionObj = this.opentok.initSession(this.apiKey, this.sessionId).on(
      "streamCreated",
      (event) => {
        this.sessionObj.subscribe(
          event.stream,
          this.videoId,
          this.subscribeOpt
        );
        console.log("streamCreated :", event);
      },
      this
    );

    this.publisherObj = this.opentok.initPublisher(
      this.videoId,
      this.publisherOpt
    );

    this.onlySignalSessionObj = this.opentok
      .initSession(this.apiKey, this.signalSessionId)
      .on(
        "connectionDestroyed",
        (event) => {
          this.authRequests = this.authRequests.filter((request) => {
            return event.connection.connectionId !== request.connectionId;
          });
          console.log("connectionDestroyed :", event);
        },
        this
      )
      .on(
        "signal:authRequest",
        (event) => {
          this.authRequests = this.authRequests.filter((request) => {
            return request.connectionId !== event.from.id;
          });
          this.authRequests.push({
            name: event.data,
            connectionId: event.from.id,
          });
          console.log("signal:authRequest :", event);
        },
        this
      )
      .on("signal:requestStatus", () => {
        this.onlySignalSessionObj.signal(
          {
            type: "receiveStatus",
            data: this.isBroadcast,
          },
          (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("send type: receiveStatus");
            }
          }
        );
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
    },
    disconnectModerator() {
      this.sessionObj.disconnect();
      this.isConnection = false;
      console.log("退出しました");
      location.reload();
    },
    allowRequest(request) {
      this.onlySignalSessionObj.signal(
        {
          type: "allowedRequest",
          data: request.name,
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`send type: allowedRequest`);
            this.authRequests = this.authRequests.filter((authRequest) => {
              return authRequest.connectionId !== request.connectionId;
            });
            console.log("リクエストが許可されました");
          }
        }
      );
    },

    rejectRequest(request) {
      this.onlySignalSessionObj.signal(
        {
          type: "rejectRequest",
          data: request.name,
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`send type: rejectRequest`);
            this.authRequests = this.authRequests.filter((authRequest) => {
              return authRequest.connectionId !== request.connectionId;
            });
            console.log("リクエストが許可されませんでした");
          }
        }
      );
    },

    startBroadcast() {
      this.onlySignalSessionObj.signal(
        {
          type: "startBroadcast",
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            this.isBroadcast = true;
            console.log(`send type: startBroadcast`);
          }
        }
      );
    },

    stopBroadcast() {
      this.onlySignalSessionObj.signal(
        {
          type: "stopBroadcast",
        },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            this.isBroadcast = false;
            console.log(`send type: stopBroadcast`);
          }
        }
      );
    },

    changeAudio() {
      this.publisherObj.publishAudio(!this.activateAudio);
      this.activateAudio = !this.activateAudio;
    },
    changeVideo() {
      this.publisherObj.publishVideo(!this.activateVideo);
      this.activateVideo = !this.activateVideo;
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
