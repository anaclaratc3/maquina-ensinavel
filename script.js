let featureExtractor;
let classifier;
let isModelReady = false;
let isTrained = false;
let classCounts = {};

let classNameInput;
let trainImageInput;
let testImageInput;
let addExampleBtn;
let trainBtn;
let predictBtn;
let trainStatusDiv;
let predictResultDiv;
let classSummaryDiv;
let trainPreviewImg;
let testPreviewImg;

const etapas = [
  {
    titulo: "Etapa 1 – Definir classes",
    texto: "No bloco 1, digite o nome da classe e selecione imagens para ela."
  },
  {
    titulo: "Etapa 2 – Adicionar exemplos",
    texto: "Repita para criar outras classes."
  },
  {
    titulo: "Etapa 3 – Treinar modelo",
    texto: "Clique em “Treinar modelo”."
  },
  {
    titulo: "Etapa 4 – Testar",
    texto: "Selecione uma imagem e clique em Prever."
  },
  {
    titulo: "Dica Extra",
    texto: "Explique como treinou e testou a máquina."
  }
];

let etapaAtual = 0;

function atualizarPainelModal() {
  const panelContent = document.getElementById("panel-content");
  const btnPrev = document.getElementById("panel-prev");
  const btnNext = document.getElementById("panel-next");
  const btnFinish = document.getElementById("panel-finish");

  const etapa = etapas[etapaAtual];
  panelContent.innerHTML = `
    <p><strong>${etapa.titulo}</strong></p>
    <p>${etapa.texto}</p>
  `;

  btnPrev.disabled = etapaAtual === 0;

  // Lógica da última etapa
  if (etapaAtual === etapas.length - 1) {
    btnNext.style.display = "none";      // Esconde o botão ▶
    btnFinish.style.display = "block";   // Exibe o botão Concluir
  } else {
    btnNext.style.display = "block";    // Exibe o botão ▶
    btnFinish.style.display = "none";    // Esconde o botão Concluir
  }
}

document.addEventListener("DOMContentLoaded", () => {
  classNameInput   = document.getElementById("className");
  trainImageInput  = document.getElementById("trainImage");
  testImageInput   = document.getElementById("testImage");
  addExampleBtn    = document.getElementById("addExampleBtn");
  trainBtn         = document.getElementById("trainBtn");
  predictBtn       = document.getElementById("predictBtn");
  trainStatusDiv   = document.getElementById("trainStatus");
  predictResultDiv = document.getElementById("predictResult");
  classSummaryDiv  = document.getElementById("classSummary");
  trainPreviewImg  = document.getElementById("trainPreview");
  testPreviewImg   = document.getElementById("testPreview");

  // Elementos dos Modais
  const howItWorksModal = document.getElementById("howItWorksModal");
  const guideModal      = document.getElementById("guideModal");

  const openHowItWorksBtn  = document.getElementById("openHowItWorksBtn");
  const closeHowItWorksBtn = document.getElementById("closeHowItWorksBtn");
  const openGuideBtn       = document.getElementById("openGuideBtn");

  const panelPrev   = document.getElementById("panel-prev");
  const panelNext   = document.getElementById("panel-next");
  const panelFinish = document.getElementById("panel-finish");

  // Eventos Modal "Como Funciona"
  openHowItWorksBtn.addEventListener("click", () => howItWorksModal.classList.remove("hidden"));
  closeHowItWorksBtn.addEventListener("click", () => howItWorksModal.classList.add("hidden"));

  // Eventos Modal "Guia Apresentação"
  openGuideBtn.addEventListener("click", () => {
    etapaAtual = 0;
    atualizarPainelModal();
    guideModal.classList.remove("hidden");
  });

  panelFinish.addEventListener("click", () => guideModal.classList.add("hidden"));

  panelPrev.addEventListener("click", () => {
    if (etapaAtual > 0) {
      etapaAtual--;
      atualizarPainelModal();
    }
  });

  panelNext.addEventListener("click", () => {
    if (etapaAtual < etapas.length - 1) {
      etapaAtual++;
      atualizarPainelModal();
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target === howItWorksModal) howItWorksModal.classList.add("hidden");
    if (e.target === guideModal) guideModal.classList.add("hidden");
  });

  inicializarModelo();
  configurarEventos();
});

function inicializarModelo() {
  trainStatusDiv.textContent = "Carregando modelo pré-treinado (MobileNet)...";

  featureExtractor = ml5.featureExtractor("MobileNet", () => {
    trainStatusDiv.textContent = "Modelo carregado. Adicione exemplos.";
    isModelReady = true;
    classifier = featureExtractor.classification();
    atualizarBotoes();
  });
}

function loadImageToImgTag(fileInput, imgTag, callback) {
  const file = fileInput.files[0];
  if (!file) {
    imgTag.removeAttribute("src");
    callback && callback(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    imgTag.src = e.target.result;
    imgTag.onload = function () {
      callback && callback(imgTag);
    };
  };
  reader.readAsDataURL(file);
}

function updateClassSummary() {
  const classes = Object.keys(classCounts);
  if (classes.length === 0) {
    classSummaryDiv.textContent = "Nenhum exemplo adicionado ainda.";
    return;
  }

  const parts = classes.map((c) => `${c}: ${classCounts[c]} exemplo(s)`);
  classSummaryDiv.textContent = "Exemplos por classe → " + parts.join(" | ");
}

function atualizarBotoes() {
  addExampleBtn.disabled = !(
    isModelReady &&
    classNameInput.value.trim() !== "" &&
    trainImageInput.files.length > 0
  );

  const numClasses = Object.keys(classCounts).length;
  const totalExamples = Object.values(classCounts).reduce((a, b) => a + b, 0);
  trainBtn.disabled = !(isModelReady && numClasses >= 1 && totalExamples >= 1);

  predictBtn.disabled = !(isTrained && testImageInput.files.length > 0);
}

function configurarEventos() {
  classNameInput.addEventListener("input", atualizarBotoes);

  trainImageInput.addEventListener("change", () => {
    loadImageToImgTag(trainImageInput, trainPreviewImg, () => {
      atualizarBotoes();
    });
  });

  testImageInput.addEventListener("change", () => {
    loadImageToImgTag(testImageInput, testPreviewImg, () => {
      atualizarBotoes();
    });
  });

  addExampleBtn.addEventListener("click", () => {
    const className = classNameInput.value.trim();
    if (!className || trainImageInput.files.length === 0) return;

    trainStatusDiv.textContent =
      `Adicionando ${trainImageInput.files.length} imagem(ns) à classe "${className}"...`;

    let loaded = 0;

    for (const file of trainImageInput.files) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
          classifier.addImage(img, className, () => {
            loaded++;
            if (!classCounts[className]) classCounts[className] = 0;
            classCounts[className]++;

            if (loaded === trainImageInput.files.length) {
              updateClassSummary();
              atualizarBotoes();
              trainStatusDiv.textContent =
                `✔ ${loaded} imagem(ns) adicionada(s) à classe "${className}".`;
            }
          });
        };
      };
      reader.readAsDataURL(file);
    }
  });

  trainBtn.addEventListener("click", () => {
    trainStatusDiv.textContent = "Treinando modelo...";
    classifier.train((loss) => {
      if (loss === null) {
        isTrained = true;
        trainStatusDiv.textContent =
          "✔ Treinamento concluído! Agora teste uma imagem.";
        atualizarBotoes();
      } else {
        try {
          trainStatusDiv.textContent = "Treinando... Loss: " + Number(loss).toFixed(5);
        } catch {
          trainStatusDiv.textContent = "Treinando...";
        }
      }
    });
  });

  predictBtn.addEventListener("click", () => {
    if (!isTrained || !testImageInput.files[0]) return;

    loadImageToImgTag(testImageInput, testPreviewImg, (imgElement) => {
      if (!imgElement) return;

      predictResultDiv.textContent = "Classificando...";

      classifier.classify(imgElement, (err, results) => {
        if (err || !results || results.length === 0) {
          predictResultDiv.textContent = "Erro ao classificar.";
          return;
        }

        const top = results[0];
        const label = top.label;
        const confidence = (top.confidence * 100).toFixed(2);

        predictResultDiv.textContent =
          `Classe prevista: "${label}" (confiança: ${confidence}%)`;
      });
    });
  });
}