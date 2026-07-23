var StrokePractice = (function () {
  var ROBOT_PARTS = ["legs", "body", "arm-l", "arm-r", "head"];
  var ROBOT_THEMES = [
    { main: "#3a8bff", accent: "#1b5fd9" },
    { main: "#ff5a5a", accent: "#d7263d" },
    { main: "#4ee08a", accent: "#1f9d55" },
    { main: "#ffd23f", accent: "#e0a91c" },
    { main: "#c17bff", accent: "#7c3fd9" }
  ];

  var CONFETTI_COLORS = ["#ffd23f", "#ff5a5a", "#3a8bff", "#4ee08a", "#c17bff", "#ff9f4a", "#4adede"];

  function renderConfetti() {
    var html = "";
    for (var c = 0; c < 18; c++) {
      var left = Math.round(Math.random() * 100);
      var delay = (Math.random() * 0.5).toFixed(2);
      var duration = (1 + Math.random() * 0.7).toFixed(2);
      var color = CONFETTI_COLORS[c % CONFETTI_COLORS.length];
      html += '<span class="confetti-piece" style="left:' + left + '%;' +
        'animation-delay:' + delay + 's;animation-duration:' + duration + 's;' +
        'background:' + color + '"></span>';
    }
    return html;
  }

  function renderRobot(robotState) {
    if (!robotState) {
      return "";
    }
    var theme = ROBOT_THEMES[robotState.index % ROBOT_THEMES.length];
    var partsHtml = ROBOT_PARTS.slice(0, robotState.progress).map(function (part) {
      return '<div class="robot-part robot-' + part + '" style="background:' + theme.main + ';border-color:' + theme.accent + '"></div>';
    }).join("");
    var celebrate = robotState.justCompleted;
    var html = '<div class="robot-reward' + (celebrate ? " robot-complete" : "") + '">';
    if (celebrate) {
      html += '<div class="robot-burst"></div>';
      html += '<div class="confetti">' + renderConfetti() + '</div>';
    }
    html += '<div class="robot-wrap">' + partsHtml + '</div>';
    html += '<div class="robot-caption' + (celebrate ? " robot-caption-complete" : "") + '">' +
      (celebrate ? "ロボット かんせい！！" : "ロボット くみたてちゅう " + robotState.progress + " / 5") +
      '</div>';
    if (celebrate) {
      html += '<div class="robot-complete-sub">つぎは あたらしい ロボットが やってくる！</div>';
    }
    html += '</div>';
    return html;
  }

  // opts: { onExit, exitLabel, onNext(省略可), onComplete(省略可) }
  function start(container, kanji, reading, strokes, opts) {
    var exitLabel = opts.exitLabel || "かんじを えらびなおす";
    var total = strokes.length;
    var expected = 0; // 次にタップすべき画（0-indexed）
    var mistakes = 0;
    var finished = false;
    var robotState = null;

    function renderGuidePaths() {
      return strokes.map(function (d) {
        return '<path class="stroke-guide" d="' + d + '"/>';
      }).join("");
    }

    function renderCompletedPaths() {
      return strokes.slice(0, expected).map(function (d, i) {
        return '<path class="stroke-active" data-i="' + i + '" d="' + d + '"/>';
      }).join("");
    }

    function renderHitPaths() {
      if (finished) {
        return "";
      }
      // 完了済みの画は当たり判定から外す。「次にタップすべき画」は近くの画と
      // 重なっても優先してタップできるよう、DOM上で一番手前（最後）に描く
      var order = [];
      for (var i = total - 1; i > expected; i--) {
        order.push(i);
      }
      order.push(expected);
      return order.map(function (i) {
        return '<path class="stroke-hit" data-hit-index="' + i + '" d="' + strokes[i] + '"/>';
      }).join("");
    }

    function animateNewestStroke() {
      var paths = container.querySelectorAll(".stroke-active");
      paths.forEach(function (path, i) {
        var len = path.getTotalLength();
        if (i === paths.length - 1) {
          path.style.transition = "none";
          path.style.strokeDasharray = len;
          path.style.strokeDashoffset = len;
          void path.getBoundingClientRect();
          path.style.transition = "stroke-dashoffset 0.4s ease";
          path.style.strokeDashoffset = "0";
        } else {
          path.style.transition = "none";
          path.style.strokeDasharray = len;
          path.style.strokeDashoffset = "0";
        }
      });
    }

    function resetPractice() {
      expected = 0;
      mistakes = 0;
      finished = false;
      render();
    }

    function render() {
      var html = '<div class="stroke-header">' + kanji +
        (reading ? '<span class="stroke-reading">（' + reading + '）</span>' : '') + '</div>';
      html += '<div class="stroke-progress">' + total + '画中 ' + expected + '画目</div>';
      html += '<div class="stroke-svg-wrap"><svg viewBox="0 0 109 109" class="stroke-svg">' +
        renderGuidePaths() + renderCompletedPaths() + renderHitPaths() + '</svg></div>';
      html += '<div class="stroke-feedback" id="strokeFeedback"></div>';
      if (finished) {
        html += '<div class="stroke-clear' + (mistakes === 0 ? " perfect" : "") + '">' +
          (mistakes === 0 ? "パーフェクト！ ノーミスで かけたね！" : "かんせい！（まちがえた かず: " + mistakes + "）") +
          '</div>';
        html += renderRobot(robotState);
        if (opts.onNext) {
          html += '<div class="stroke-controls">';
          html += '<button type="button" class="big-btn stroke-nav-btn" id="nextQBtn">つぎの もんだい</button>';
          html += '<button type="button" class="back-btn stroke-nav-btn" id="retryBtn">もういちど</button>';
          html += '</div>';
        } else {
          html += '<button type="button" class="big-btn" id="retryBtn">もういちど</button>';
        }
      }
      html += '<button type="button" class="back-btn" id="exitBtn">' + exitLabel + '</button>';
      container.innerHTML = html;
      animateNewestStroke();

      if (!finished) {
        container.querySelectorAll(".stroke-hit").forEach(function (path) {
          path.addEventListener("click", function () {
            var tapped = Number(path.getAttribute("data-hit-index"));
            if (tapped === expected) {
              expected++;
              Sound.pikon();
              if (expected >= total) {
                finished = true;
                robotState = opts.onComplete ? opts.onComplete() : null;
                if (robotState && robotState.justCompleted) {
                  Sound.robotComplete();
                } else {
                  Sound.combo(4);
                }
              }
              render();
            } else {
              mistakes++;
              Sound.incorrect();
              var box = document.getElementById("strokeFeedback");
              if (box) {
                box.textContent = "ちがうよ、もういちど！";
              }
            }
          });
        });
      }

      document.getElementById("exitBtn").addEventListener("click", function () {
        opts.onExit();
      });
      if (finished) {
        document.getElementById("retryBtn").addEventListener("click", resetPractice);
        if (opts.onNext) {
          document.getElementById("nextQBtn").addEventListener("click", function () {
            opts.onNext();
          });
        }
      }
    }

    render();
  }

  return { start: start };
})();
