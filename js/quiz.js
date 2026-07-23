var Quiz = (function () {
  var CATCHPHRASES = ["やったー！", "その ちょうし！", "ナイス こうげき！", "さすが！", "きまったー！", "いいぞ！"];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function start(container, questions, onFinish) {
    var index = 0;
    var score = 0;
    var locked = false;
    var combo = 0;
    var maxCombo = 0;
    var monsterHp = questions.length;

    function renderProgress() {
      return '<div class="quiz-progress">もんだい ' + (index + 1) + ' / ' + questions.length +
        '　　せいかい ' + score +
        (combo >= 2 ? '　　<span class="combo-count">コンボ ' + combo + '</span>' : '') +
        '</div>';
    }

    function renderMonster() {
      var pct = Math.max(0, Math.round((monsterHp / questions.length) * 100));
      return '<div class="monster-arena">' +
        '<div class="monster-hp-wrap">' +
        '<div class="monster-hp-label">てきの HP</div>' +
        '<div class="monster-hp-bar"><div class="monster-hp-fill" id="monsterHpFill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="monster" id="monsterSprite">' +
        '<div class="monster-horn monster-horn-l"></div>' +
        '<div class="monster-horn monster-horn-r"></div>' +
        '<div class="monster-body">' +
        '<div class="monster-eye monster-eye-l"></div>' +
        '<div class="monster-eye monster-eye-r"></div>' +
        '</div>' +
        '</div>' +
        '</div>';
    }

    function hitMonster() {
      var fill = container.querySelector("#monsterHpFill");
      if (fill) {
        var pct = Math.max(0, Math.round((monsterHp / questions.length) * 100));
        fill.style.width = pct + "%";
      }
      var sprite = container.querySelector("#monsterSprite");
      if (sprite) {
        sprite.classList.remove("monster-hit");
        void sprite.offsetWidth;
        sprite.classList.add("monster-hit");
      }
    }

    function next() {
      index++;
      if (index >= questions.length) {
        onFinish(score, questions.length, maxCombo, monsterHp);
      } else {
        render();
      }
    }

    function showFeedback(isCorrect, correctAnswer) {
      locked = true;
      var box = container.querySelector(".quiz-feedback");
      if (isCorrect) {
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        score++;
        monsterHp = Math.max(0, monsterHp - 1);
        hitMonster();
        if (combo >= 3) {
          Sound.combo(combo);
          box.textContent = combo + "れんぞく せいかい！！";
          box.className = "quiz-feedback correct combo-burst";
        } else {
          Sound.correct();
          box.textContent = pick(CATCHPHRASES);
          box.className = "quiz-feedback correct";
        }
      } else {
        combo = 0;
        Sound.incorrect();
        box.textContent = "✕ おしい！ こたえは " + correctAnswer;
        box.className = "quiz-feedback incorrect";
      }
      setTimeout(next, 1200);
    }

    function render() {
      locked = false;
      var q = questions[index];
      var html = renderMonster();
      html += renderProgress();
      html += '<div class="quiz-card">';
      if (q.subPrompt) {
        html += '<div class="quiz-passage">' + q.prompt + '</div>';
        html += '<div class="quiz-prompt">' + q.subPrompt + '</div>';
      } else {
        html += '<div class="quiz-prompt quiz-prompt-large">' + q.prompt + '</div>';
      }
      html += '<div class="quiz-feedback"></div>';

      if (q.type === "choice") {
        html += '<div class="quiz-choices">';
        q.choices.forEach(function (choice) {
          html += '<button type="button" class="choice-btn" data-choice="' + escapeAttr(choice) + '">' + choice + '</button>';
        });
        html += '</div>';
      } else if (q.type === "numpad") {
        html += '<div class="numpad-display" id="numpadDisplay"></div>';
        html += '<div class="numpad-grid">';
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) {
          html += '<button type="button" class="numpad-btn" data-num="' + n + '">' + n + '</button>';
        });
        html += '<button type="button" class="numpad-btn numpad-clear" data-action="clear">けす</button>';
        html += '<button type="button" class="numpad-btn" data-num="0">0</button>';
        html += '<button type="button" class="numpad-btn numpad-ok" data-action="submit">こたえる</button>';
        html += '</div>';
      }
      html += '</div>';
      container.innerHTML = html;

      if (q.type === "choice") {
        container.querySelectorAll(".choice-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (locked) return;
            showFeedback(btn.getAttribute("data-choice") === q.answer, q.answer);
          });
        });
      } else if (q.type === "numpad") {
        var entered = "";
        var display = container.querySelector("#numpadDisplay");
        display.textContent = "＿";
        container.querySelectorAll(".numpad-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (locked) return;
            var action = btn.getAttribute("data-action");
            if (action === "clear") {
              entered = "";
            } else if (action === "submit") {
              if (entered === "") return;
              showFeedback(entered === q.answer, q.answer);
              return;
            } else if (entered.length < 4) {
              entered += btn.getAttribute("data-num");
            }
            display.textContent = entered === "" ? "＿" : entered;
          });
        });
      }
    }

    function escapeAttr(str) {
      return String(str).replace(/"/g, "&quot;");
    }

    render();
  }

  return { start: start };
})();
