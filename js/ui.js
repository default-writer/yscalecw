/**
 * Данные двух кроссвордов.
 *  - RU: русские ответы, базовая сетка с КЕЙС / КОД / ДАТА + расширение
 *  - EN: английские ответы, аналогичная по духу сетка
 * Подсказки — всегда на русском.
 */
const crosswords = {
  ru: {
    rows: 9,
    cols: 6,
    words: [
      // --- базовая сетка (сохранена из прототипа) ---
      { id: "case", answer: "КЕЙС", clue: "Сценарий использования технологии, описанный в докладе",
        direction: "across", row: 0, col: 0 },
      { id: "code", answer: "КОД",  clue: "Набор инструкций, который пишут разработчики",
        direction: "down",   row: 0, col: 0 },
      { id: "data", answer: "ДАТА", clue: "Информация, на которой обучаются модели",
        direction: "across", row: 2, col: 0 },

      // --- расширение по материалам трека ---
      { id: "shadow", answer: "ТЕНЬ",  clue: "Скрытая копия данных или слабое место в системе",
        direction: "down",   row: 2, col: 2 },
      { id: "note",   answer: "НОТА",  clue: "Уведомление или сообщение в информационной системе",
        direction: "across", row: 4, col: 2 },
      { id: "token",  answer: "ТОКЕН", clue: "Единица текста для LLM или ключ доступа",
        direction: "down",   row: 4, col: 4 },
      { id: "agent",  answer: "АГЕНТ", clue: "Автономная программа, выполняющая задачи с помощью LLM",
        direction: "down",   row: 4, col: 5 },
      { id: "net",    answer: "СЕТЬ",  clue: "Инфраструктура для связи сервисов и пользователей",
        direction: "across", row: 6, col: 0 },
    ],
  },

  en: {
    rows: 9,
    cols: 6,
    words: [
      { id: "case", answer: "CASE", clue: "Сценарий использования технологии, описанный в докладе",
        direction: "across", row: 0, col: 0 },
      { id: "code", answer: "CODE", clue: "Набор инструкций, который пишут разработчики",
        direction: "down",   row: 0, col: 0 },
      { id: "data", answer: "DATA", clue: "Информация, на которой обучаются модели",
        direction: "across", row: 2, col: 0 },
      { id: "test", answer: "TEST", clue: "Проверка работы системы перед выпуском",
        direction: "down",   row: 2, col: 2 },
      { id: "scan", answer: "SCAN", clue: "Автоматический анализ данных или кода",
        direction: "across", row: 4, col: 2 },
      { id: "logs", answer: "LOGS", clue: "Записи событий для отладки и расследований",
        direction: "across", row: 6, col: 0 },
      { id: "git",  answer: "GIT",  clue: "Система контроля версий, с которой работают агенты",
        direction: "down",   row: 6, col: 2 },
    ],
  },
};

const state = {
  lang: "ru",
  answers: { ru: {}, en: {} },
};

/* ============================================================
 *  Построение матрицы кроссворда
 * ============================================================ */

function buildGrid(data) {
  const grid = Array.from({ length: data.rows }, () =>
    Array.from({ length: data.cols }, () => null)
  );

  // Определяем уникальные стартовые ячейки и нумеруем их
  const starts = new Map(); // key "r-c" -> number
  const sortedStarts = [];
  data.words.forEach((w) => {
    const key = `${w.row}-${w.col}`;
    if (!starts.has(key)) {
      starts.set(key, null);
      sortedStarts.push({ key, row: w.row, col: w.col });
    }
  });
  sortedStarts.sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row
  );
  sortedStarts.forEach((s, i) => starts.set(s.key, i + 1));

  // Раскладываем буквы
  data.words.forEach((word) => {
    const letters = word.answer.split("");
    letters.forEach((letter, i) => {
      let r = word.row;
      let c = word.col;
      if (word.direction === "across") c += i;
      else r += i;

      if (!grid[r][c]) {
        grid[r][c] = { letter, words: [], number: null };
      }
      grid[r][c].words.push(word.id);

      // Номер ставим только в стартовую ячейку
      if (i === 0) {
        grid[r][c].number = starts.get(`${word.row}-${word.col}`);
      }
    });
  });

  return grid;
}

/* ============================================================
 *  Отрисовка сетки
 * ============================================================ */

function renderGrid(grid, data) {
  const container = document.getElementById("crossword-grid");
  if (!container) return;

  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${data.cols}, 56px)`;
  container.style.gridTemplateRows = `repeat(${data.rows}, 56px)`;

  grid.forEach((row, r) => {
    row.forEach((cellData, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (!cellData) {
        cell.classList.add("empty");
      } else {
        cell.classList.add("editable");
        if (cellData.number) {
          const num = document.createElement("span");
          num.className = "cell-number";
          num.textContent = cellData.number;
          cell.appendChild(num);
        }

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.dataset.words = cellData.words.join(",");
        input.autocomplete = "off";
        input.setAttribute("aria-label", `Ячейка ${r + 1}, ${c + 1}`);
        cell.appendChild(input);

        input.addEventListener("input", (e) => {
          const val = e.target.value
            .toUpperCase()
            .replace(/[^А-ЯЁA-Z0-9]/g, "");
          e.target.value = val;
          if (val.length === 1) moveToNext(r, c, data);
        });

        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !e.target.value) {
            moveToPrev(r, c, data);
          }
        });
      }

      container.appendChild(cell);
    });
  });

  restoreAnswers();
}

function moveToNext(r, c, data) {
  const next = document.querySelector(
    `input[data-row="${r}"][data-col="${c + 1}"]`
  );
  if (next) return next.focus();
  const nextRow = document.querySelector(
    `input[data-row="${r + 1}"][data-col="0"]`
  );
  if (nextRow) nextRow.focus();
}

function moveToPrev(r, c, data) {
  const prev = document.querySelector(
    `input[data-row="${r}"][data-col="${c - 1}"]`
  );
  if (prev) return prev.focus();
  const prevRow = document.querySelector(
    `input[data-row="${r - 1}"][data-col="${data.cols - 1}"]`
  );
  if (prevRow) prevRow.focus();
}

/* ============================================================
 *  Отрисовка подсказок
 * ============================================================ */

function renderClues(data) {
  const acrossList = document.getElementById("clues-across");
  const downList = document.getElementById("clues-down");
  if (!acrossList || !downList) return;

  acrossList.innerHTML = "";
  downList.innerHTML = "";

  // Нумерация стартовых ячеек (та же, что в buildGrid)
  const starts = new Map();
  const sortedStarts = [];
  data.words.forEach((w) => {
    const key = `${w.row}-${w.col}`;
    if (!starts.has(key)) {
      starts.set(key, null);
      sortedStarts.push({ key, row: w.row, col: w.col });
    }
  });
  sortedStarts.sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row
  );
  sortedStarts.forEach((s, i) => starts.set(s.key, i + 1));

  data.words.forEach((word) => {
    const li = document.createElement("li");
    const num = starts.get(`${word.row}-${word.col}`);
    li.innerHTML = `<span class="clue-number">${num}.</span>${word.clue}`;
    li.dataset.wordId = word.id;

    li.addEventListener("click", () => {
      const input = document.querySelector(
        `input[data-row="${word.row}"][data-col="${word.col}"]`
      );
      if (input) {
        closeOverlay();
        input.focus();
      }
    });

    (word.direction === "across" ? acrossList : downList).appendChild(li);
  });
}

/* ============================================================
 *  Проверка ответов
 * ============================================================ */

function getExpectedLetter(data, r, c) {
  for (const word of data.words) {
    const letters = word.answer.split("");
    for (let i = 0; i < letters.length; i++) {
      let wr = word.row;
      let wc = word.col;
      if (word.direction === "across") wc += i;
      else wr += i;
      if (wr === r && wc === c) return letters[i];
    }
  }
  return "";
}

function checkAnswers() {
  const data = crosswords[state.lang];
  const inputs = document.querySelectorAll(".cell.editable input");
  let allCorrect = true;

  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    const expected = getExpectedLetter(data, r, c);
    const actual = input.value.toUpperCase();
    const cell = input.parentElement;

    cell.classList.remove("correct", "incorrect");
    if (actual === expected) {
      cell.classList.add("correct");
    } else {
      cell.classList.add("incorrect");
      allCorrect = false;
    }
  });

  const msg = document.getElementById("result-message");
  if (!msg) return;

  if (allCorrect) {
    msg.textContent = "🎉 Все верно! Отличная работа!";
    msg.className = "result-message success";
  } else {
    msg.textContent = "❌ Есть ошибки. Попробуйте ещё раз.";
    msg.className = "result-message error";
  }
}

/* ============================================================
 *  Сохранение / восстановление введённых букв
 * ============================================================ */

function saveAnswers() {
  const inputs = document.querySelectorAll(".cell.editable input");
  const store = {};
  inputs.forEach((inp) => {
    const key = `${inp.dataset.row}-${inp.dataset.col}`;
    if (inp.value) store[key] = inp.value;
  });
  state.answers[state.lang] = store;
}

function restoreAnswers() {
  const store = state.answers[state.lang] || {};
  const inputs = document.querySelectorAll(".cell.editable input");
  inputs.forEach((inp) => {
    const key = `${inp.dataset.row}-${inp.dataset.col}`;
    inp.value = store[key] || "";
  });
}

/* ============================================================
 *  Смена языка
 * ============================================================ */

function setLanguage(lang) {
  if (lang === state.lang) return;
  saveAnswers();
  state.lang = lang;

  // подсветка кнопок
  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  const data = crosswords[lang];
  const grid = buildGrid(data);
  renderGrid(grid, data);
  renderClues(data);

  const msg = document.getElementById("result-message");
  if (msg) {
    msg.textContent = "";
    msg.className = "result-message";
  }
}

/* ============================================================
 *  Overlay для подсказок
 * ============================================================ */

function openOverlay() {
  const screen = document.getElementById("view-2-screen");
  if (screen) screen.classList.add("active");
}

function closeOverlay() {
  const screen = document.getElementById("view-2-screen");
  if (screen) screen.classList.remove("active");
}

/* ============================================================
 *  Основной объект UI
 * ============================================================ */

const ux = {
  main: null,
  view2Screen: null,
  closeview2: null,

  init() {
    this.main = document.getElementById("main");
    this.view2Screen = document.getElementById("view-2-screen");
    this.closeview2 = document.getElementById("view-2-close");

    // Закрытие overlay по клику на кнопку
    if (this.closeview2) {
      this.closeview2.addEventListener("click", closeOverlay);
    }
    // Закрытие overlay по клику на фон
    if (this.view2Screen) {
      this.view2Screen.addEventListener("click", (e) => {
        if (e.target === this.view2Screen) closeOverlay();
      });
    }
    // Закрытие по Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlay();
    });

    // Кнопка "Подсказки"
    const showClues = document.getElementById("show-clues");
    if (showClues) showClues.addEventListener("click", openOverlay);

    // Кнопка "Проверить"
    const checkBtn = document.getElementById("check-btn");
    if (checkBtn) checkBtn.addEventListener("click", checkAnswers);

    // Переключатель языка
    document.querySelectorAll(".lang-option").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    // Первичная отрисовка
    const data = crosswords[state.lang];
    renderGrid(buildGrid(data), data);
    renderClues(data);

    if (this.main) this.main.classList.add("active");
  },
};

export function ui() {
  ux.init();
}

export { ux };