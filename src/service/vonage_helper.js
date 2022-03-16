const OT = require("@opentok/client");

export default class VonageHelper {
  constructor(token, apiKey = process.env.VUE_APP_VONAGE_API_KEY, sessionId = process.env.VUE_APP_SESSION_ID) {
    this.apiKey = apiKey
    this.sessionId = sessionId
    this.token = token
    this.opentok = OT
    this.videoTag = "videos"
    this.sessionObj = null
    this.publisherObj = null
    this.publisherOpt = {
      fitMode: "contain",
      insertMode: "append",
      // width: "100%",
      // height: "100%",
      style: {
        audioLevelDisplayMode: "off",
        archiveStatusDisplayMode: "off",
        buttonDisplayMode: "off",
        nameDisplayMode: "on",
      },
    }
    this.subscribeOpt = {
      fitMode: "contain",
      insertMode: "append",
      width: "100%",
      height: "100%",
      style: {
        audioBlockedDisplayMode: "off",
        audioLevelDisplayMode: "off",
        buttonDisplayMode: "off",
        nameDisplayMode: "on",
        videoDisabledDisplayMode: "off",
      },
    }
  }

  initSession() {
    this.opentok.initSession(this.apiKey, this.sessionId)
      .on("streamCreated", (event) => {
        this.sessionObj.subscribe(
          event.stream,
          this.videoId,
          this.subscribeOpt
        );
        console.log(`streamCreated: ${JSON.stringify(event)}`);
      });
  }
}