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
      var correctBtn = container.querySelector('.choice-btn[data-choice="' + escapeAttr(correctAnswer) + '"]');
      if (!isCorrect && correctBtn) {
        correctBtn.classList.add("reveal-correct");
      }
      setTimeout(next, isCorrect ? 1200 : 2400);
    }

    function renderHissan(q) {
      var topBox = q.op === "add" ? "carry" : "borrow";
      var topLabel = q.op === "add" ? "くりあがり" : "くりさがり";
      var html = '<div class="hissan-wrap">';
      html += '<div class="hissan-cell"></div>' +
        '<div class="hissan-top-cell">' +
        '<div class="hissan-top-label">' + topLabel + '</div>' +
        '<div class="hissan-carry-box" data-box="' + topBox + '"></div>' +
        '</div>' +
        '<div class="hissan-cell"></div>';
      html += '<div class="hissan-cell"></div>' +
        '<div class="hissan-digit-wrap">' +
        '<span class="hissan-digit">' + q.tensA + '</span>' +
        '<span class="hissan-strike" id="hissanStrike"></span>' +
        '</div>' +
        '<div class="hissan-digit-wrap">' +
        '<span class="hissan-borrowed-ten" id="hissanBorrowedTen"></span>' +
        '<span class="hissan-digit">' + q.onesA + '</span>' +
        '</div>';
      html += '<div class="hissan-op">' + (q.op === "add" ? "＋" : "－") + '</div>' +
        '<div class="hissan-digit">' + q.tensB + '</div>' +
        '<div class="hissan-digit">' + q.onesB + '</div>';
      html += '<div class="hissan-line"></div>';
      html += '<div class="hissan-cell"></div>' +
        '<div class="hissan-box" data-box="answerTens"></div>' +
        '<div class="hissan-box" data-box="answerOnes"></div>';
      html += '</div>';
      return html;
    }

    function renderDigitPad(withDisplay) {
      var html = "";
      if (withDisplay) {
        html += '<div class="numpad-display" id="numpadDisplay"></div>';
      }
      html += '<div class="numpad-grid">';
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) {
        html += '<button type="button" class="numpad-btn" data-num="' + n + '">' + n + '</button>';
      });
      html += '<button type="button" class="numpad-btn numpad-clear" data-action="clear">けす</button>';
      html += '<button type="button" class="numpad-btn" data-num="0">0</button>';
      html += '<button type="button" class="numpad-btn numpad-ok" data-action="submit">こたえる</button>';
      html += '</div>';
      return html;
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
      } else if (q.type === "hissan") {
        html += '<div class="quiz-prompt">' + q.prompt + '</div>';
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
        html += renderDigitPad(true);
      } else if (q.type === "hissan") {
        html += renderHissan(q);
        html += renderDigitPad(false);
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
      } else if (q.type === "hissan") {
        var boxOrder = q.op === "add"
          ? ["answerOnes", "answerTens"]
          : ["borrow", "answerOnes", "answerTens"];
        var values = {};
        var selected = boxOrder[0];

        function boxEl(name) {
          return container.querySelector('[data-box="' + name + '"]');
        }

        function refreshBoxes() {
          boxOrder.forEach(function (name) {
            var el = boxEl(name);
            if (!el) return;
            el.textContent = values[name] || "";
            el.classList.toggle("selected", name === selected);
          });
          if (q.op === "add") {
            var carryEl = boxEl("carry");
            if (carryEl) {
              carryEl.textContent = values.carry || "";
            }
          }
          if (q.op === "sub") {
            var hasBorrow = values.borrow !== undefined && values.borrow !== "";
            var strike = document.getElementById("hissanStrike");
            var borrowedTen = document.getElementById("hissanBorrowedTen");
            if (strike) {
              strike.classList.toggle("show", hasBorrow);
            }
            if (borrowedTen) {
              // ボックスには「かりたあとの十の位」を入れる想定なので、
              // もとの十の位との差が「一の位に くりさがってきた かず」になる
              borrowedTen.textContent = hasBorrow ? String(q.tensA - Number(values.borrow)) : "";
              borrowedTen.classList.toggle("show", hasBorrow);
            }
          }
        }

        refreshBoxes();

        boxOrder.forEach(function (name) {
          var el = boxEl(name);
          if (el) {
            el.addEventListener("click", function () {
              if (locked) return;
              selected = name;
              refreshBoxes();
            });
          }
        });

        container.querySelectorAll(".numpad-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (locked) return;
            var action = btn.getAttribute("data-action");
            if (action === "clear") {
              values[selected] = "";
              if (q.op === "add" && selected === "answerOnes") {
                values.carry = "";
              }
              refreshBoxes();
            } else if (action === "submit") {
              var allFilled = boxOrder.every(function (name) {
                return values[name];
              });
              if (!allFilled) return;
              var correct = boxOrder.every(function (name) {
                return values[name] === String(q[name]);
              });
              showFeedback(correct, q.answer);
            } else {
              values[selected] = btn.getAttribute("data-num");
              if (q.op === "add" && selected === "answerOnes") {
                values.carry = String(q.carry);
              }
              var idx = boxOrder.indexOf(selected);
              if (idx !== -1 && idx < boxOrder.length - 1) {
                selected = boxOrder[idx + 1];
              }
              refreshBoxes();
            }
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
