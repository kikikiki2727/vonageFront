<template>
  <div class="top">
    <h1>Publisher</h1>
    <p v-if="isConnection">参加中</p>
    <div id="video_wrapper">
      <div id="videos"></div>
    </div>
    <div>
      <div id="audio">
        <button @click="changeAudio">{{ audioText }}</button>
      </div>
      <div id="video">
        <button @click="changeVideo">{{ videoText }}</button>
      </div>
    </div>
    <div id="devices">
      <div>
        マイク：
        <select v-model="selectAudio">
          <option
            v-for="audio in audioList"
            :key="audio.deviceId"
            :value="audio.deviceId"
          >
            {{ audio.label }}
          </option>
        </select>
      </div>
      <div>
        カメラ：
        <select v-model="selectVideo">
          <option
            v-for="video in videoList"
            :key="video.deviceId"
            :value="video.deviceId"
          >
            {{ video.label }}
          </option>
        </select>
      </div>
    </div>
    <input v-model="name" />
    <button v-if="!isConnection" @click="sendRequest">
      参加リクエストを送る
    </button>
    <button v-else @click="disconnectPublisher">退出</button>
    <modal ref="modal">
      <template v-slot:modalContents>
        <p>ホストからの入室許可がおりませんでした</p>
      </template>
    </modal>
  </div>
</template>

<script>
import Modal from "./shared/ModalCom.vue";
const OT = require("@opentok/client");

export default {
  name: "PublisherCom",
  components: {
    Modal,
  },
  data() {
    return {
      opentok: OT,
      name: "",
      apiKey: process.env.VUE_APP_VONAGE_API_KEY,
      sessionId: process.env.VUE_APP_SESSION_ID,
      signalSessionId: process.env.VUE_APP_SIGNAL_SESSION_ID,
      publisherToken: process.env.VUE_APP_PUBLISHER_TOKEN,
      signalToken: process.env.VUE_APP_SIGNAL_MODERATOR_TOKEN,
      videoId: "videos",
      isConnection: false,
      activateAudio: true,
      activateVideo: true,
      selectAudio: "",
      audioList: [],
      selectVideo: "",
      videoList: [],
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
  watch: {
    selectAudio: function () {
      this.publisherObj.setAudioSource(this.selectAudio);
    },

    selectVideo: function () {
      this.publisherObj.setVideoSource(this.selectVideo);
    },
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
    this.sessionObj = this.opentok
      .initSession(this.apiKey, this.sessionId)
      .on("streamCreated", (event) => {
        this.sessionObj.subscribe(
          event.stream,
          this.videoId,
          this.subscribeOpt
        );
      });
    this.publisherObj = this.opentok
      .initPublisher(this.videoId, this.publisherOpt)
      .on("accessAllowed", (event) => this.getDevices(event));

    this.onlySignalSessionObj = this.opentok
      .initSession(this.apiKey, this.signalSessionId)
      .on("signal:allowedRequest", (event) => {
        this.sessionObj.connect(this.publisherToken, (error) => {
          if (error) {
            alert("error");
          } else {
            this.publisherObj.destroy();
            this.publisherOpt.name = event.data;
            this.publisherObj = this.opentok
              .initPublisher(this.videoId, this.publisherOpt)
              .on("accessAllowed", (event) => this.getDevices(event));
            this.sessionObj.publish(this.publisherObj, this.videoId);
            this.isConnection = true;
            console.log("signal:allowedRequest :", event);
          }
        });
      })
      .on("signal:rejectRequest", () => {
        this.$refs.modal.toggleModal();
        console.log("入室許可がおりませんでした");
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
      this.onlySignalSessionObj.disconnect();
      this.isConnection = false;
      console.log("退出しました");
      location.reload();
    },

    changeAudio() {
      this.publisherObj.publishAudio(!this.activateAudio);
      this.activateAudio = !this.activateAudio;
    },
    changeVideo() {
      this.publisherObj.publishVideo(!this.activateVideo);
      this.activateVideo = !this.activateVideo;
    },

    getDevices(event) {
      return this.opentok.getDevices((error, devices) => {
        if (error) {
          console.log("devices error :", error);
          return;
        }

        this.audioList = devices.filter((device) => {
          return device.kind === "audioInput" && device.deviceId !== "default";
        });
        this.selectAudio = this.audioList[0].deviceId;

        this.videoList = devices.filter((device) => {
          return device.kind === "videoInput" && device.deviceId !== "default";
        });
        this.selectVideo = this.videoList[0].deviceId;

        console.log("accessAllowed :", event);
      });
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
