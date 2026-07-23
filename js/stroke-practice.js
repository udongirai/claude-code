var StrokePractice = (function () {
  var ROBOT_PARTS = ["legs", "body", "arm-l", "arm-r", "head"];
  var ROBOT_DRAW_ORDER = ["legs", "arm-l", "arm-r", "body", "head"];
  var ROBOT_THEMES = [
    { main: "#3a8bff", accent: "#1b5fd9" },
    { main: "#ff5a5a", accent: "#d7263d" },
    { main: "#4ee08a", accent: "#1f9d55" },
    { main: "#ffd23f", accent: "#e0a91c" },
    { main: "#c17bff", accent: "#7c3fd9" }
  ];

  var ROBOT_GLOW = "#f4f8ff";

  var ROBOT_PART_SVG = {
    "legs":
      '<rect x="46" y="88" width="8" height="10" fill="var(--robot-accent)"/>' +
      '<path d="M28,92 L44,92 L44,104 L30,104 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M27,104 L47,104 L49,120 L25,120 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<rect x="26" y="112" width="22" height="3" fill="var(--robot-accent)"/>' +
      '<path d="M56,92 L72,92 L70,104 L56,104 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M53,104 L73,104 L75,120 L51,120 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<rect x="52" y="112" width="22" height="3" fill="var(--robot-accent)"/>',
    "arm-l":
      '<circle cx="12" cy="53" r="6" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M5,56 L18,56 L17,68 L6,68 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M6,70 L17,70 L16,84 L7,84 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<rect x="5" y="83" width="13" height="6" rx="1.5" fill="var(--robot-accent)"/>',
    "arm-r":
      '<g transform="translate(100,0) scale(-1,1)">' +
      '<circle cx="12" cy="53" r="6" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M5,56 L18,56 L17,68 L6,68 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M6,70 L17,70 L16,84 L7,84 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<rect x="5" y="83" width="13" height="6" rx="1.5" fill="var(--robot-accent)"/>' +
      '</g>',
    "body":
      '<path d="M25,46 L75,46 L73,60 L70,84 L60,88 L40,88 L30,84 L27,60 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<path d="M16,44 L32,44 L30,56 L17,58 Z" fill="var(--robot-accent)"/>' +
      '<path d="M84,44 L68,44 L70,56 L83,58 Z" fill="var(--robot-accent)"/>' +
      '<path d="M50,52 L56,60 L50,68 L44,60 Z" fill="' + ROBOT_GLOW + '"/>' +
      '<rect x="35" y="72" width="30" height="2.5" fill="var(--robot-accent)" opacity="0.8"/>' +
      '<rect x="37" y="78" width="26" height="2.5" fill="var(--robot-accent)" opacity="0.8"/>',
    "head":
      '<path d="M50,18 L48,1 L52,1 Z" fill="var(--robot-accent)"/>' +
      '<path d="M44,19 L34,5 L41,19 Z" fill="var(--robot-accent)"/>' +
      '<path d="M56,19 L66,5 L59,19 Z" fill="var(--robot-accent)"/>' +
      '<path d="M35,18 L65,18 L67,25 L67,34 L62,40 L38,40 L33,34 L33,25 Z" fill="var(--robot-main)" stroke="var(--robot-accent)" stroke-width="1.5"/>' +
      '<rect x="31" y="25" width="4" height="7" rx="1" fill="var(--robot-accent)"/>' +
      '<rect x="65" y="25" width="4" height="7" rx="1" fill="var(--robot-accent)"/>' +
      '<rect x="37" y="27" width="9" height="4" fill="' + ROBOT_GLOW + '"/>' +
      '<rect x="54" y="27" width="9" height="4" fill="' + ROBOT_GLOW + '"/>' +
      '<rect x="44" y="35" width="3" height="4" fill="var(--robot-accent)"/>' +
      '<rect x="48.5" y="35" width="3" height="4" fill="var(--robot-accent)"/>' +
      '<rect x="53" y="35" width="3" height="4" fill="var(--robot-accent)"/>'
  };

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
    var unlocked = ROBOT_PARTS.slice(0, robotState.progress);
    var partsHtml = ROBOT_DRAW_ORDER.filter(function (part) {
      return unlocked.indexOf(part) !== -1;
    }).map(function (part) {
      return '<g class="robot-part-svg robot-part-' + part + '">' + ROBOT_PART_SVG[part] + '</g>';
    }).join("");
    var svgHtml = '<svg class="robot-svg" viewBox="-15 0 130 130" style="--robot-main:' + theme.main + ';--robot-accent:' + theme.accent + '">' + partsHtml + '</svg>';
    var celebrate = robotState.justCompleted;
    var html = '<div class="robot-reward' + (celebrate ? " robot-complete" : "") + '">';
    if (celebrate) {
      html += '<div class="robot-burst"></div>';
      html += '<div class="confetti">' + renderConfetti() + '</div>';
    }
    html += '<div class="robot-wrap">' + svgHtml + '</div>';
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
