// Artur Mustafin, (c) 2019, https://codepen.io/hack2root/pen/eYObdXv
// Eli Grey (c) http://purl.eligrey.com/github/FileSaver.js
// LCG Park & Miller (c) 1988,1993, s=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31

/**
 * Данные кроссворда.
 * Каждое слово описано координатами стартовой ячейки и направлением.
 * Ответы должны совпадать по пересекающимся буквам.
 */
const crosswordData = {
  words: [
    {
      id: "case",
      answer: "КЕЙС",
      clue: "Сценарий использования технологии, описанный в докладе",
      direction: "across",
      row: 0,
      col: 0,
    },
    {
      id: "code",
      answer: "КОД",
      clue: "Набор инструкций, который пишут разработчики",
      direction: "down",
      row: 0,
      col: 0,
    },
    {
      id: "data",
      answer: "ДАТА",
      clue: "Информация, на которой обучаются модели",
      direction: "across",
      row: 2,
      col: 0,
    },
  ],
};

const GRID_ROWS = 3;
const GRID_COLS = 4;

/**
 * Построение матрицы кроссворда.
 * Возвращает двумерный массив, где каждая ячейка — объект { letter, words } или null.
 */
function buildGrid() {
  const grid = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null)
  );

  crosswordData.words.forEach((word) => {
    const letters = word.answer.split("");
    letters.forEach((letter, i) => {
      let r = word.row;
      let c = word.col;
      if (word.direction === "across") c += i;
      else r += i;

      if (!grid[r][c]) {
        grid[r][c] = { letter, words: [] };
      }
      grid[r][c].words.push(word.id);
    });
  });

  return grid;
}

/**
 * Отрисовка сетки в DOM.
 */
function renderGrid(grid) {
  const container = document.getElementById("crossword-grid");
  if (!container) return;

  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${GRID_COLS}, 64px)`;
  container.style.gridTemplateRows = `repeat(${GRID_ROWS}, 64px)`;

  grid.forEach((row, r) => {
    row.forEach((cellData, c) => {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (!cellData) {
        cell.classList.add("empty");
      } else {
        cell.classList.add("editable");
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.dataset.words = cellData.words.join(",");
        input.autocomplete = "off";
        input.setAttribute("aria-label", `Ячейка ${r + 1}, ${c + 1}`);
        cell.appendChild(input);

        // Ввод буквы и автопереход
        input.addEventListener("input", (e) => {
          const val = e.target.value.toUpperCase().replace(/[^А-ЯЁA-Z]/g, "");
          e.target.value = val;
          if (val.length === 1) {
            moveToNext(r, c);
          }
        });

        // Возврат назад по Backspace
        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !e.target.value) {
            moveToPrev(r, c);
          }
        });
      }

      container.appendChild(cell);
    });
  });
}

/**
 * Переход к следующей ячейке.
 */
function moveToNext(r, c) {
  const next = document.querySelector(
    `input[data-row="${r}"][data-col="${c + 1}"]`
  );
  if (next) {
    next.focus();
  } else {
    const nextRow = document.querySelector(
      `input[data-row="${r + 1}"][data-col="0"]`
    );
    if (nextRow) nextRow.focus();
  }
}

/**
 * Переход к предыдущей ячейке.
 */
function moveToPrev(r, c) {
  const prev = document.querySelector(
    `input[data-row="${r}"][data-col="${c - 1}"]`
  );
  if (prev) {
    prev.focus();
  } else {
    const prevRow = document.querySelector(
      `input[data-row="${r - 1}"][data-col="${GRID_COLS - 1}"]`
    );
    if (prevRow) prevRow.focus();
  }
}

/**
 * Отрисовка подсказок.
 */
function renderClues() {
  const acrossList = document.getElementById("clues-across");
  const downList = document.getElementById("clues-down");
  if (!acrossList || !downList) return;

  acrossList.innerHTML = "";
  downList.innerHTML = "";

  let acrossNum = 1;
  let downNum = 1;

  crosswordData.words.forEach((word) => {
    const li = document.createElement("li");
    const num = word.direction === "across" ? acrossNum++ : downNum++;
    li.innerHTML = `<span class="clue-number">${num}.</span>${word.clue}`;
    li.dataset.wordId = word.id;

    li.addEventListener("click", () => {
      const input = document.querySelector(
        `input[data-row="${word.row}"][data-col="${word.col}"]`
      );
      if (input) input.focus();
    });

    if (word.direction === "across") {
      acrossList.appendChild(li);
    } else {
      downList.appendChild(li);
    }
  });
}

/**
 * Получение ожидаемой буквы для ячейки.
 */
function getExpectedLetter(r, c) {
  for (const word of crosswordData.words) {
    const letters = word.answer.split("");
    for (let i = 0; i < letters.length; i++) {
      let wr = word.row;
      let wc = word.col;
      if (word.direction === "across") wc += i;
      else wr += i;
      if (wr === r && wc === c) {
        return letters[i];
      }
    }
  }
  return "";
}

/**
 * Проверка ответов и подсветка.
 */
function checkAnswers() {
  const inputs = document.querySelectorAll(".cell.editable input");
  let allCorrect = true;

  inputs.forEach((input) => {
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    const expected = getExpectedLetter(r, c);
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

/**
 * Основной объект UI.
 */
const ux = {
  main: document.getElementById("main"),
  view2Btn: document.getElementById("view-2-btn"),
  view2Screen: document.getElementById("view-2-screen"),
  closeview2: document.getElementById("view-2-close"),

  init: function () {
    if (this.view2Btn) {
      this.view2Btn.addEventListener("click", () => {
        this.view2Screen.classList.add("active");
      });
    }
    if (this.closeview2) {
      this.closeview2.addEventListener("click", () => {
        this.view2Screen.classList.remove("active");
      });
    }

    this.initCrossword();

    if (this.main) {
      this.main.classList.add("active");
    }
  },

  initCrossword: function () {
    const grid = buildGrid();
    renderGrid(grid);
    renderClues();

    const checkBtn = document.getElementById("check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", checkAnswers);
    }
  },
};

export function ui() {
  ux.init();
}

export { ux };