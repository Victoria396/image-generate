(() => {
  "use strict";

  const form = document.querySelector("#generator-form");
  const generator = document.querySelector("#generator");
  const result = document.querySelector("#result");
  const prompt = document.querySelector("#prompt");
  const promptCount = document.querySelector("#prompt-count");
  const video = document.querySelector("#result-video");
  const resultTitle = document.querySelector("#result-title");
  const resultDescription = document.querySelector("#result-description");
  const playbackError = document.querySelector("#playback-error");
  const playbackErrorText = document.querySelector("#playback-error-text");
  const continueButton = document.querySelector("#continue-button");
  const backButton = document.querySelector("#back-button");
  const replayButton = document.querySelector("#replay-button");
  const videoHintText = document.querySelector("#video-hint-text");

  const videos = [
    { src: "./assets/mem.mp4", title: "Твоя генерация", description: "Готовим результат по твоему запросу…" },
    { src: "./assets/mem2.mp4", title: "Финальные штрихи", description: "Продолжаем обработку результата…" }
  ];

  let currentIndex = 0;
  let isPlayingSequence = false;

  document.querySelector("#year").textContent = new Date().getFullYear();

  prompt.addEventListener("input", () => {
    promptCount.textContent = prompt.value.length + " / 500";
  });

  function showPlaybackError(message) {
    playbackErrorText.textContent = message;
    playbackError.hidden = false;
    continueButton.hidden = false;
  }

  function clearPlaybackError() {
    playbackError.hidden = true;
  }

  function showPlayer() {
    generator.hidden = true;
    result.hidden = false;
    replayButton.hidden = true;
    clearPlaybackError();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setVideo(index) {
    currentIndex = index;
    const item = videos[index];
    resultTitle.textContent = item.title;
    resultDescription.textContent = item.description;
    videoHintText.textContent = index === 0
      ? "Первое видео. Для паузы и управления звуком используй контролы плеера."
      : "Второе видео. Для паузы и управления звуком используй контролы плеера.";
    video.src = item.src;
    video.load();
  }

  async function playCurrentVideo() {
    clearPlaybackError();
    try {
      await video.play();
    } catch (error) {
      showPlaybackError(
        "Браузер не смог автоматически запустить видео. Нажми кнопку ниже или Play в плеере."
      );
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isPlayingSequence) return;
    isPlayingSequence = true;
    showPlayer();
    setVideo(0);
    await playCurrentVideo();
  });

  video.addEventListener("ended", async () => {
    if (!isPlayingSequence) return;
    if (currentIndex === 0) {
      setVideo(1);
      await playCurrentVideo();
    } else {
      isPlayingSequence = false;
      resultTitle.textContent = "Готово";
      resultDescription.textContent = "Последовательность завершена.";
      videoHintText.textContent = "Воспроизведение завершено.";
      replayButton.hidden = false;
    }
  });

  video.addEventListener("error", () => {
    if (!isPlayingSequence) return;
    isPlayingSequence = false;
    const file = videos[currentIndex].src.split("/").pop();
    showPlaybackError(
      "Не удалось загрузить " + file + ". Проверь, что файл находится в папке assets/ и имя совпадает."
    );
  });

  continueButton.addEventListener("click", async () => {
    if (video.error) {
      isPlayingSequence = true;
      setVideo(currentIndex);
    }
    await playCurrentVideo();
  });

  backButton.addEventListener("click", () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    isPlayingSequence = false;
    clearPlaybackError();
    result.hidden = true;
    generator.hidden = false;
    prompt.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  replayButton.addEventListener("click", async () => {
    isPlayingSequence = true;
    setVideo(0);
    await playCurrentVideo();
  });
})();
