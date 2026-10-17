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
  const renderPrompt = document.querySelector("#render-prompt");
  const renderStyle = document.querySelector("#render-style");
  const renderRatio = document.querySelector("#render-ratio");
  const confettiLayer = document.querySelector("#confetti-layer");
  const sharePanel = document.querySelector("#share-panel");
  const nativeShareButton = document.querySelector("#native-share-button");
  const shareFeedback = document.querySelector("#share-feedback");
  const shareUrl = "https://victoria396.github.io/image-generate/";
  const shareText = "Смотри, что получилось! ✨ Я проверила PixelForge AI — он превращает идеи в картинки. Теперь твоя очередь: попробуй создать что-нибудь своё!";

  const victorySound = new Audio("./assets/tada.mp3");
  victorySound.preload = "auto";
  victorySound.volume = 0.85;

  const videos = [
    { src: "./assets/mem.mp4", title: "Твоя генерация", description: "Готовим результат по твоему запросу…" },
    { src: "./assets/mem2.mp4", title: "Финальные штрихи", description: "Продолжаем обработку результата…" }
  ];

  // Когда подготовишь мемы, положи их в папку mems/ с такими именами
  // или замени пути ниже на свои реальные имена файлов.
  const memes = Array.from({ length: 14 }, (_, index) => `./mem/${index + 1}.jpg`);

  const progressStages = [
    { at: 0, text: "Анализируем промпт…" },
    { at: 18, text: "Подбираем визуальную композицию…" },
    { at: 39, text: "Создаём базовое изображение…" },
    { at: 62, text: "Улучшаем детали и освещение…" },
    { at: 82, text: "Рендерим финальную версию…" },
    { at: 96, text: "Подготавливаем файл…" }
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
      ? "Подготавливаем визуальную основу…"
      : "Применяем последние улучшения…";
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

    result.classList.add("result-final");
    resultTitle.textContent = "Изображение успешно сгенерировано";
    resultDescription.textContent = "Финальный результат готов.";
    videoHintText.textContent = "Результат готов.";
    replayButton.hidden = false;
    sharePanel.hidden = true;
    shareFeedback.textContent = "";
    clearPlaybackError();

    // Avoid repeating the same meme twice in a row when possible.
    let memePath = memes[Math.floor(Math.random() * memes.length)];
    if (memes.length > 1 && memePath === window.lastMemePath) {
      const alternatives = memes.filter((path) => path !== window.lastMemePath);
      memePath = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    window.lastMemePath = memePath;
    memeImage.hidden = false;
    memeImage.alt = "Сгенерированный мем";
    memeImage.onload = () => {
      clearPlaybackError();
      launchConfetti();
      sharePanel.hidden = false;
      // Sound is attempted at the exact moment the final meme appears.
      // Some browsers may block delayed audio playback; the meme still displays.
      victorySound.currentTime = 0;
      victorySound.play().catch(() => {
        videoHintText.textContent = "Результат готов. Если звук не прозвучал, проверь настройки звука браузера.";
      });
    };
    memeImage.onerror = () => {
      memeImage.hidden = true;
      showPlaybackError("Не удалось загрузить мем. Проверь, что файлы 1.jpg–14.jpg находятся в папке mem/.");
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

  async function startGeneration() {
    if (generationStarted) return;
    generationStarted = true;
    showPlayer();
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
    memeImage.hidden = true;
    confettiLayer.hidden = true;
    confettiLayer.replaceChildren();
    clearPlaybackError();
    result.classList.remove("result-final");
    progressPanel.hidden = false;
    resultTitle.textContent = "Создаём твоё изображение";
    resultDescription.textContent = "Подготавливаем композицию и финальный рендер.";
    renderPrompt.textContent = prompt.value.trim();
    renderStyle.textContent = "Стиль: " + document.querySelector("#style").selectedOptions[0].textContent;
    renderRatio.textContent = "Формат: " + document.querySelector("#ratio").selectedOptions[0].textContent;
    replayButton.hidden = true;
    await runFakeProgress();
    progressPanel.hidden = true;
    isPlayingSequence = true;
    setVideo(0);
    await playCurrentVideo();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await startGeneration();
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
    sharePanel.hidden = true;
    shareFeedback.textContent = "";
    confettiLayer.hidden = true;
    confettiLayer.replaceChildren();
    if (progressTimer) window.clearInterval(progressTimer);
    progressTimer = null;
    isPlayingSequence = false;
    generationStarted = false;
    progressPanel.hidden = true;
    clearPlaybackError();
    result.classList.remove("result-final");
    result.hidden = true;
    generator.hidden = false;
    prompt.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  async function getMemeFile() {
    const response = await fetch(memeImage.src);
    if (!response.ok) throw new Error("Не удалось загрузить картинку.");
    const blob = await response.blob();
    const extension = blob.type.includes("png") ? "png" : "jpg";
    return new File([blob], "pixelforge-result." + extension, { type: blob.type || "image/jpeg" });
  }

  nativeShareButton.addEventListener("click", async () => {
    try {
      const file = await getMemeFile();
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Мой результат в PixelForge AI", text: shareText + String.fromCharCode(10) + shareUrl });
      } else {
        await downloadMemeFile(file);
        shareFeedback.textContent = "Картинка скачана. Открой нужный мессенджер, прикрепи файл pixelforge-result.jpg и вставь подготовленный текст.";
      }
    } catch (error) {
      if (error.name !== "AbortError") shareFeedback.textContent = "Не получилось отправить файл автоматически. Нажми «Скачать картинку», затем прикрепи её к сообщению вручную.";
    }
  });

  async function downloadMemeFile(existingFile) {
    const file = existingFile || await getMemeFile();
    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  replayButton.addEventListener("click", async () => {
    generationStarted = false;
    await startGeneration();
  });
})();