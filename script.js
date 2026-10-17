(() => {
  "use strict";

  const form = document.querySelector("#generator-form");
  const generator = document.querySelector("#generator");
  const result = document.querySelector("#result");
  const prompt = document.querySelector("#prompt");
  const promptCount = document.querySelector("#prompt-count");
  const video = document.querySelector("#result-video");
  const memeImage = document.querySelector("#meme-image");
  const resultTitle = document.querySelector("#result-title");
  const resultDescription = document.querySelector("#result-description");
  const playbackError = document.querySelector("#playback-error");
  const playbackErrorText = document.querySelector("#playback-error-text");
  const continueButton = document.querySelector("#continue-button");
  const backButton = document.querySelector("#back-button");
  const replayButton = document.querySelector("#replay-button");
  const videoHintText = document.querySelector("#video-hint-text");
  const progressPanel = document.querySelector("#generation-progress");
  const progressBar = document.querySelector("#progress-bar");
  const progressPercent = document.querySelector("#progress-percent");
  const progressStatus = document.querySelector("#progress-status");
  const confettiLayer = document.querySelector("#confetti-layer");

  const videos = [
    { src: "./assets/mem.mp4", title: "Твоя генерация", description: "Готовим результат по твоему запросу…" },
    { src: "./assets/mem2.mp4", title: "Финальные штрихи", description: "Продолжаем обработку результата…" }
  ];

  // Когда подготовишь мемы, положи их в папку mems/ с такими именами
  // или замени пути ниже на свои реальные имена файлов.
  const memes = [
    "./mems/meme1.jpg",
    "./mems/meme2.jpg",
    "./mems/meme3.jpg",
    "./mems/meme4.png",
    "./mems/meme5.gif"
  ];

  const progressStages = [
    { at: 0, text: "Анализируем промпт…" },
    { at: 22, text: "Подбираем визуальную композицию…" },
    { at: 48, text: "Создаём изображение…" },
    { at: 73, text: "Улучшаем детали…" },
    { at: 91, text: "Применяем финальные настройки…" }
  ];

  let currentIndex = 0;
  let isPlayingSequence = false;
  let progressTimer = null;
  let generationStarted = false;

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
    memeImage.hidden = true;
    video.hidden = false;
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

  function runFakeProgress() {
    return new Promise((resolve) => {
      let progress = 0;
      progressPanel.hidden = false;
      progressBar.style.width = "0%";
      progressPercent.textContent = "0%";
      progressStatus.textContent = progressStages[0].text;

      progressTimer = window.setInterval(() => {
        // Slower near 90% to make the wait feel like a real render.
        const increment = progress < 55 ? 2 + Math.random() * 5
          : progress < 82 ? 1 + Math.random() * 3
          : 0.3 + Math.random() * 1.3;
        progress = Math.min(100, progress + increment);
        const shown = Math.floor(progress);
        progressBar.style.width = shown + "%";
        progressPercent.textContent = shown + "%";

        const stage = [...progressStages].reverse().find((item) => shown >= item.at);
        if (stage) progressStatus.textContent = stage.text;

        if (progress >= 100) {
          window.clearInterval(progressTimer);
          progressTimer = null;
          progressStatus.textContent = "Готово. Открываем результат…";
          window.setTimeout(resolve, 450);
        }
      }, 180);
    });
  }

  function showRandomMeme() {
    isPlayingSequence = false;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
    progressPanel.hidden = true;

    resultTitle.textContent = "Изображение успешно сгенерировано";
    resultDescription.textContent = "Твой результат готов. Спасибо за ожидание!";
    videoHintText.textContent = "Генерация завершена.";
    replayButton.hidden = false;

    const memePath = memes[Math.floor(Math.random() * memes.length)];
    memeImage.hidden = false;
    memeImage.alt = "Сгенерированный мем";
    memeImage.onload = () => launchConfetti();
    memeImage.onerror = () => {
      memeImage.hidden = true;
      showPlaybackError("Пока не нашёл файл мема. Добавь картинки в папку mems/ и проверь имена в script.js.");
    };
    memeImage.src = memePath;
    memeImage.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function launchConfetti() {
    confettiLayer.replaceChildren();
    confettiLayer.hidden = false;
    const pieces = 100;
    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = (Math.random() * 100) + "%";
      piece.style.setProperty("--fall-x", ((Math.random() - 0.5) * 260) + "px");
      piece.style.setProperty("--fall-rotation", ((Math.random() * 1080) - 540) + "deg");
      piece.style.animationDelay = (Math.random() * 450) + "ms";
      piece.style.animationDuration = (1800 + Math.random() * 1600) + "ms";
      piece.style.backgroundColor = ["#a78bfa", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb7185"][i % 6];
      if (Math.random() > 0.65) piece.classList.add("confetti-circle");
      confettiLayer.appendChild(piece);
    }
    window.setTimeout(() => {
      confettiLayer.hidden = true;
      confettiLayer.replaceChildren();
    }, 4200);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (generationStarted) return;
    generationStarted = true;
    showPlayer();
    video.pause();
    video.hidden = true;
    memeImage.hidden = true;
    progressPanel.hidden = false;
    resultTitle.textContent = "Генерируем изображение";
    resultDescription.textContent = "Это может занять несколько секунд…";
    replayButton.hidden = true;
    await runFakeProgress();
    progressPanel.hidden = true;
    isPlayingSequence = true;
    setVideo(0);
    await playCurrentVideo();
  });

  video.addEventListener("ended", async () => {
    if (!isPlayingSequence) return;
    if (currentIndex === 0) {
      setVideo(1);
      await playCurrentVideo();
    } else {
      showRandomMeme();
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
    memeImage.removeAttribute("src");
    memeImage.hidden = true;
    confettiLayer.hidden = true;
    confettiLayer.replaceChildren();
    if (progressTimer) window.clearInterval(progressTimer);
    progressTimer = null;
    isPlayingSequence = false;
    generationStarted = false;
    progressPanel.hidden = true;
    clearPlaybackError();
    result.hidden = true;
    generator.hidden = false;
    prompt.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  replayButton.addEventListener("click", () => {
    generationStarted = false;
    form.requestSubmit();
  });
})();