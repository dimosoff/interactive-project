document.addEventListener("DOMContentLoaded", function () {
  const app = {
    build: true,
    videoElement: document.querySelector(".video"),
    audioElement: document.querySelector(".audio"),
    interface: document.querySelector(".interface"),
    startButton: document.querySelector("[name='b-start']"),
    repeatButton: document.querySelector("[name='b-repeat']"),
    resumeButton: document.querySelector("[name='b-resume']"),
    firstButton: document.querySelector("[name='b-first']"),
    secondButton: document.querySelector("[name='b-second']"),
    filling: document.querySelector(".filling"),
    screensaver: document.querySelector(".screensaver"),
    finalScreen: document.querySelector(".final"),
    videosUrlsArray: [],
    step: 0,
    videoState: "init",
    maxStep: -1,
    classes: {
      hideClass: "_hidden",
      blurClass: "_blurry",
      activeClass: "_active",
    },
    init: function () {
      const _this = this;
      window.addEventListener(
        "resize",
        function () {
          if (window.innerHeight <= window.innerWidth) return;
          _this.pauseVideo();
          _this.log("wrong aspect ratio, video paused");
        },
        {
          passive: true,
        }
      );
      window.addEventListener(
        "mousemove",
        function (event) {
          if (_this.videoState !== "init") return;
          _this.screensaver.style = `transform: translate(-${
            event.pageX / 100
          }px, -${event.pageY / 100}px);`;
        },
        { passive: true }
      );
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          if (["init", "loaded", "ended", "paused"].includes(_this.videoState))
            return;
          _this.pauseVideo();
          _this.audioElement.pause();
        } else {
          _this.audioElement.play();
        }
      });
      this.interface.addEventListener("click", function () {
        if (["init", "loaded", "ended", "paused"].includes(_this.videoState))
          return;
        _this.pauseVideo();
      });
      this.startButton.addEventListener("click", function () {
        _this.fullScreen();
        _this.playAudio();
        _this.playVideo();
      });
      this.repeatButton.addEventListener("click", () => this.repeatVideo());
      this.resumeButton.addEventListener("click", () => this.playVideo());
      this.firstButton.addEventListener("click", () => this.playOption(0));
      this.secondButton.addEventListener("click", () => this.playOption(1));
      this.videoElement.addEventListener("ended", () => this.videoEnded(), {
        once: true,
      });
      this.videoElement.addEventListener("pause", () => {
        this.log("global pause");
        if (this.isAlmostEnds()) {
          this.log("fires ended on pause when video almost ends");
          this.videoEnded();
        }
      });
      this.getVideos();
    },
    playAudio: function () {
      this.audioElement.volume = 0.5;
      this.audioElement.play();
      this.log("audio start");
    },
    playVideo: function () {
      this.videoElement.play();
      this.videoState = "playing";
      this.log("video start");
      this.switchClasses();
    },
    repeatVideo: function () {
      this.videoElement.currentTime = 0;
      this.log("video repeat");
      this.playVideo();
    },
    pauseVideo: function () {
      if (this.isAlmostEnds()) return;
      this.videoElement.pause();
      this.videoState = "paused";
      this.log("video paused");
      this.switchClasses();
    },
    videoEnded: function () {
      this.log([this.step, this.maxStep]);
      if (this.step === this.maxStep) {
        this.videoState = "final";
        this.log("the end");
        this.audioElement.pause();
        this.switchClasses();
        return;
      }
      this.videoState = "ended";
      this.log("video ended");
      this.switchClasses();
    },
    playOption: function (index) {
      this.switchVideoSource(index);
      this.playVideo();
    },
    getVideos: function () {
      fetch("json/files.json")
        .then((response) => response.json())
        .then((files) => {
          this.videosUrlsArray = files;
          this.videoState = "loaded";
          this.log("files list loaded");
          this.switchClasses();
        });
    },
    switchVideoSource: function (index) {
      this.videoElement.setAttribute(
        "src",
        this.videosUrlsArray[this.step][`o${index + 1}`]
      );
      this.videoElement.load();
      this.videoElement.addEventListener("ended", () => this.videoEnded(), {
        once: true,
      });
      this.step++;
      if (this.maxStep < 0) this.maxStep = this.videosUrlsArray.length;
    },
    switchClasses: function () {
      this.log(["buttons switcher:", this.videoState]);
      switch (this.videoState) {
        case "init":
        case "paused":
          this.videoElement.classList.add(this.classes.blurClass);
          this.filling.classList.remove(this.classes.hideClass);
          this.repeatButton.classList.remove(this.classes.hideClass);
          this.resumeButton.classList.remove(this.classes.hideClass);
          break;
        case "playing":
          this.videoElement.classList.remove(this.classes.blurClass);
          this.filling.classList.add(this.classes.hideClass);
          this.screensaver.classList.add(this.classes.hideClass);
          this.startButton.classList.add(this.classes.hideClass);
          this.repeatButton.classList.add(this.classes.hideClass);
          this.resumeButton.classList.add(this.classes.hideClass);
          this.firstButton.classList.add(this.classes.hideClass);
          this.secondButton.classList.add(this.classes.hideClass);
          break;
        case "ended":
          this.videoElement.classList.add(this.classes.blurClass);
          this.filling.classList.remove(this.classes.hideClass);
          this.firstButton.classList.remove(this.classes.hideClass);
          this.secondButton.classList.remove(this.classes.hideClass);
          break;
        case "final":
          this.videoElement.classList.add(this.classes.blurClass);
          this.filling.classList.remove(this.classes.hideClass);
          this.screensaver.classList.remove(this.classes.hideClass);
          this.finalScreen.classList.add(this.classes.activeClass);
          this.repeatButton.classList.add(this.classes.hideClass);
          this.resumeButton.classList.add(this.classes.hideClass);
          break;
        case "loaded":
          this.startButton.classList.remove(this.classes.hideClass);
          break;
      }
    },
    fullScreen: function () {
      const html = document.documentElement;
      if (html.requestFullscreen) {
        html.requestFullscreen();
      } else if (html.webkitrequestFullscreen) {
        html.webkitRequestFullscreen();
      } else if (html.mozRequestFullscreen) {
        html.mozRequestFullScreen();
      }
    },
    isAlmostEnds: function () {
      this.log([
        "time",
        Math.floor(+this.videoElement.currentTime),
        Math.floor(+this.videoElement.duration),
      ]);
      return (
        Math.floor(+this.videoElement.currentTime) ===
        Math.floor(+this.videoElement.duration)
      );
    },
    log: function (data) {
      if (this.build) return;
      console.log(data);
    },
  };

  app.init();
});
