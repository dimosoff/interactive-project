document.addEventListener("DOMContentLoaded", function () {
  // init elements
  const videoElement = document.querySelector(".video");
  const audioElement = document.querySelector(".audio");
  const startButton = document.querySelector("[name='b-start']");
  const leftButton = document.querySelector("[name='b-left']");
  const rightButton = document.querySelector("[name='b-right']");
  const finalScreen = document.querySelector(".final");
  let mainSource = videoElement.querySelector("[type='video/mp4']"),
    videosUrlsArray = [],
    step = 0,
    maxStep = 999;

  // temp video elements
  let source1 = document.createElement("source"),
    source2 = document.createElement("source");
  const sources = [source1, source2];

  // classes
  const btnHideClass = "_hidden",
    videoBlurClass = "_blurry",
    finalActiveClass = "_active";

  getVideos();

  // start app
  startButton.addEventListener("click", () => {
    videoElement.classList.remove(videoBlurClass);
    startButton.classList.add(btnHideClass);

    videoElement.play();

    audioElement.volume = 0.5;
    audioElement.play();
  });

  // end of video
  videoElement.addEventListener("ended", () => {
    console.log(step, maxStep);
    if (step === maxStep) {
      videoElement.classList.add(videoBlurClass);
      finalScreen.classList.add(finalActiveClass);
      leftButton.classList.add(btnHideClass);
      rightButton.classList.add(btnHideClass);
      audioElement.pause();
      return;
    }
    videoElement.classList.add(videoBlurClass);
    leftButton.classList.remove(btnHideClass);
    rightButton.classList.remove(btnHideClass);
  });

  // controls
  leftButton.addEventListener("click", () => playOption(0));
  rightButton.addEventListener("click", () => playOption(1));

  // functions
  function playOption(index) {
    switchVideoSource(index);

    videoElement.classList.remove(videoBlurClass);
    leftButton.classList.add(btnHideClass);
    rightButton.classList.add(btnHideClass);

    videoElement.play();
    setStepFiles();
  }
  function getVideos() {
    fetch("json/files.json")
      .then((response) => response.json())
      .then((files) => {
        videosUrlsArray = files;
        startButton.classList.remove(btnHideClass);
      });
  }
  function setStepFiles() {
    if (!videosUrlsArray[step]) return step++;
    sources[0].setAttribute("src", videosUrlsArray[step].left);
    sources[1].setAttribute("src", videosUrlsArray[step].right);
    step++;
    if (maxStep === 999) maxStep = videosUrlsArray.length;
  }
  function switchVideoSource(index) {
    console.log(sources);
    mainSource.remove();
    videoElement.appendChild(sources[index]);
    videoElement.load();
    mainSource = sources[index];
  }
});
