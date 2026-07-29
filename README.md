# 🧠 Máquina Ensinável

Aplicação web interativa desenvolvida para demonstrar o conceito de **Machine Learning no client-side** através de **Transfer Learning** (aprendizado por transferência). 

O projeto permite cadastrar classes customizadas, coletar amostras de imagem, treinar uma rede neural em tempo real diretamente no navegador e testar novas predições.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Machine Learning / IA:** [ml5.js](https://ml5js.org/) (baseado em TensorFlow.js)
- **Modelo Base:** [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) (utilizado para extração de recursos / *feature extraction*)

---

## 🚀 Funcionalidades

- **Coleta de Exemplos:** Cadastro de classes com suporte a múltiplos uploads de imagens em área estilizada (*dropzone*).
- **Treinamento Local:** Treinamento da camada de classificação no próprio navegador sem necessidade de envio de dados para servidores externos.
- **Predição em Tempo Real:** Classificação de novas imagens com exibição da taxa de confiança (%).
- **Interface Intuitiva:**
  - Navbar compacta com navegação rápida.
  - Modais centrados e estilizados para o guia *"Como funciona?"* e o *"Guia de Apresentação"* interativo passo a passo.
  - Design responsivo em dashboard com paleta de cores corporativa.

---

## 💻 Como Executar o Projeto

1. **Clone o repositório:**
   git clone [https://github.com/anaclaratc3/maquina-ensinavel.git](https://github.com/anaclaratc3/maquina-ensinavel.git)

2. **Abra o projeto:**
   Como a aplicação é 100% client-side, basta abrir o arquivo `index.html` diretamente em seu navegador (ou utilizar a extensão *Live Server* do VS Code).

---

## 📌 Como Funciona por Baixo dos Panos

1. **Extração de Recursos (Feature Extraction):** A biblioteca `ml5.js` carrega o modelo **MobileNet**, que já possui o conhecimento necessário para identificar padrões visuais genéricos.
2. **Transfer Learning:** Ao adicionar imagens para cada classe criada, o classificador armazena esses vetores de características.
3. **Ajuste Fino:** No momento do treinamento, apenas as camadas finais da rede neural são ajustadas aos novos dados fornecidos pelo usuário.

---

## 🌐 Demonstração ao Vivo

Acesse a aplicação rodando no GitHub Pages:
👉 [https://anaclaratc3.github.io/maquina-ensinavel/](https://anaclaratc3.github.io/maquina-ensinavel/)