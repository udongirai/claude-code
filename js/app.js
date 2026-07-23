(function () {
  var app = document.getElementById("app");

  // ボタンを押すたびに共通のタップ音を鳴らす（個々のハンドラーで鳴らす必要はない）
  app.addEventListener("click", function (e) {
    if (e.target.closest("button")) {
      Sound.tap();
    }
  });

  var UNITS = {
    "kuku-study": {
      title: "九九をおぼえる",
      subject: "sansu",
      isStudy: true,
      studyType: "kuku"
    },
    kuku: {
      title: "九九のれんしゅう",
      subject: "sansu",
      getQuestions: function () { return DataKuku.getQuestions(10); }
    },
    keisan: {
      title: "たしざん・ひきざん",
      subject: "sansu",
      getQuestions: function () { return DataKeisan.getQuestions(10); }
    },
    "kanji-stroke-practice": {
      title: "書き順のれんしゅう",
      subject: "kokugo",
      isStudy: true,
      studyType: "kanji-stroke-practice"
    },
    "kanji-reading": {
      title: "漢字の読み",
      subject: "kokugo",
      getQuestions: function () { return DataKanji.getQuestions(10, "reading"); }
    },
    "kanji-writing": {
      title: "漢字の書き",
      subject: "kokugo",
      getQuestions: function () { return DataKanji.getQuestions(10, "writing"); }
    },
    dokkai: {
      title: "文章読解",
      subject: "kokugo",
      getQuestions: function () { return DataDokkai.getQuestions(5); }
    }
  };

  var SUBJECTS = {
    sansu: { title: "さんすう", units: ["kuku-study", "kuku", "keisan"] },
    kokugo: { title: "こくご", units: ["kanji-stroke-practice", "kanji-reading", "kanji-writing", "dokkai"] }
  };

  var TITLES = {
    kuku: "くくマスター",
    keisan: "けいさんヒーロー",
    "kanji-reading": "かんじレンジャー（よみ）",
    "kanji-writing": "かんじレンジャー（かき）",
    dokkai: "どっかいたんてい"
  };

  function bestScoreKey(unitId) {
    return "gakushu_best_" + unitId;
  }

  function getBestScore(unitId) {
    return Number(localStorage.getItem(bestScoreKey(unitId)) || 0);
  }

  function saveBestScore(unitId, score) {
    var best = getBestScore(unitId);
    if (score > best) {
      localStorage.setItem(bestScoreKey(unitId), String(score));
    }
  }

  function titleKey(unitId) {
    return "gakushu_title_" + unitId;
  }

  function hasTitle(unitId) {
    return localStorage.getItem(titleKey(unitId)) === "1";
  }

  // 新しく獲得したときだけ true を返す
  function unlockTitle(unitId) {
    if (hasTitle(unitId)) {
      return false;
    }
    localStorage.setItem(titleKey(unitId), "1");
    return true;
  }

  // 「せいせき」用：日付ごとの こくご/さんすう 正回数の記録
  function todayKey() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + "-" + (m.length < 2 ? "0" + m : m) + "-" + (day.length < 2 ? "0" + day : day);
  }

  function loadDailyStats() {
    try {
      return JSON.parse(localStorage.getItem("gakushu_daily_stats") || "{}");
    } catch (e) {
      return {};
    }
  }

  function recordDailyResult(subject, correctCount) {
    if (!correctCount) {
      return;
    }
    var stats = loadDailyStats();
    var key = todayKey();
    if (!stats[key]) {
      stats[key] = { sansu: 0, kokugo: 0 };
    }
    stats[key][subject] = (stats[key][subject] || 0) + correctCount;
    localStorage.setItem("gakushu_daily_stats", JSON.stringify(stats));
  }

  function formatDateLabel(key) {
    var parts = key.split("-");
    return Number(parts[1]) + "がつ" + Number(parts[2]) + "にち";
  }

  // 書き順れんしゅうの「ロボット組み立て」進捗（5問で1体完成）
  function addRobotPiece() {
    var progress = Number(localStorage.getItem("gakushu_robot_progress") || 0);
    var index = Number(localStorage.getItem("gakushu_robot_index") || 0);
    progress++;
    var result = { progress: progress, index: index, justCompleted: progress >= 5 };
    if (progress >= 5) {
      progress = 0;
      index++;
    }
    localStorage.setItem("gakushu_robot_progress", String(progress));
    localStorage.setItem("gakushu_robot_index", String(index));
    return result;
  }

  function showTitle() {
    app.innerHTML =
      '<div class="screen title-screen">' +
      '<div class="title-badge">GAKUSHU BATTLE</div>' +
      '<h1>がくしゅう バトル</h1>' +
      '<div class="title-sub">もんだいを たおして ミッションクリアだ！</div>' +
      '<button type="button" class="big-btn" id="startBtn">しゅつげき！</button>' +
      '</div>';
    document.getElementById("startBtn").addEventListener("click", showSubjectMenu);
  }

  function showSubjectMenu() {
    var html = '<div class="screen"><h2>きょうかを えらんでね</h2><div class="menu-list">';
    Object.keys(SUBJECTS).forEach(function (key) {
      html += '<button type="button" class="big-btn subject-btn" data-subject="' + key + '">' + SUBJECTS[key].title + '</button>';
    });
    html += '</div><button type="button" class="big-btn stats-btn" id="statsBtn">👑 せいせき' +
      '<span class="stats-btn-sub">きょうの きろくを みてみよう！</span></button>' +
      '<button type="button" class="back-btn" id="titlesBtn">しょうごうずかん</button></div>';
    app.innerHTML = html;
    app.querySelectorAll(".subject-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showUnitMenu(btn.getAttribute("data-subject"));
      });
    });
    document.getElementById("titlesBtn").addEventListener("click", showTitles);
    document.getElementById("statsBtn").addEventListener("click", showStats);
  }

  function showStats() {
    var stats = loadDailyStats();
    var dates = Object.keys(stats).sort().reverse();

    var bestKokugoDate = null;
    var bestKokugoVal = 0;
    var bestSansuDate = null;
    var bestSansuVal = 0;
    dates.forEach(function (key) {
      var s = stats[key];
      if ((s.kokugo || 0) > bestKokugoVal) {
        bestKokugoVal = s.kokugo || 0;
        bestKokugoDate = key;
      }
      if ((s.sansu || 0) > bestSansuVal) {
        bestSansuVal = s.sansu || 0;
        bestSansuDate = key;
      }
    });

    var html = '<div class="screen"><h2>せいせき</h2>';
    if (dates.length === 0) {
      html += '<div class="stats-empty">まだ きろくが ないよ。もんだいを といてみよう！</div>';
    } else {
      html += '<div class="stats-list">';
      dates.forEach(function (key) {
        var s = stats[key];
        var kokugoCrown = key === bestKokugoDate && bestKokugoVal > 0;
        var sansuCrown = key === bestSansuDate && bestSansuVal > 0;
        html += '<div class="stats-row">';
        html += '<div class="stats-date">' + formatDateLabel(key) + '</div>';
        html += '<div class="stats-subject-score">こくご ' + (s.kokugo || 0) + 'もん' +
          (kokugoCrown ? ' <span class="stats-crown">👑</span>' : '') + '</div>';
        html += '<div class="stats-subject-score">さんすう ' + (s.sansu || 0) + 'もん' +
          (sansuCrown ? ' <span class="stats-crown">👑</span>' : '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '<button type="button" class="back-btn" id="backBtn">もどる</button></div>';
    app.innerHTML = html;
    document.getElementById("backBtn").addEventListener("click", showSubjectMenu);
  }

  function showTitles() {
    var html = '<div class="screen"><h2>しょうごうずかん</h2><div class="titles-list">';
    Object.keys(TITLES).forEach(function (unitId) {
      var obtained = hasTitle(unitId);
      html += '<div class="title-card' + (obtained ? " unlocked" : "") + '">' +
        '<div class="title-card-unit">' + UNITS[unitId].title + '</div>' +
        '<div class="title-card-name">' + (obtained ? TITLES[unitId] : "？？？？？") + '</div>' +
        '</div>';
    });
    html += '</div><button type="button" class="back-btn" id="backBtn">もどる</button></div>';
    app.innerHTML = html;
    document.getElementById("backBtn").addEventListener("click", showSubjectMenu);
  }

  function showUnitMenu(subjectKey) {
    var subject = SUBJECTS[subjectKey];
    var html = '<div class="screen"><h2>' + subject.title + '</h2><div class="menu-list">';
    subject.units.forEach(function (unitId) {
      var unit = UNITS[unitId];
      var best = getBestScore(unitId);
      html += '<button type="button" class="big-btn unit-btn" data-unit="' + unitId + '">' +
        unit.title + '<span class="best-score">さいこう ' + best + '</span></button>';
    });
    html += '</div><button type="button" class="back-btn" id="backBtn">もどる</button></div>';
    app.innerHTML = html;
    app.querySelectorAll(".unit-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        startQuiz(btn.getAttribute("data-unit"));
      });
    });
    document.getElementById("backBtn").addEventListener("click", showSubjectMenu);
  }

  function startQuiz(unitId) {
    var unit = UNITS[unitId];
    if (unit.isStudy) {
      if (unit.studyType === "kanji-stroke-practice") {
        showKanjiStrokePracticeRandom(unitId);
      } else {
        showKukuStudyDanList(unitId);
      }
      return;
    }
    var html = '<div class="screen">' +
      '<button type="button" class="back-btn quiz-exit-btn" id="quizBackBtn">メニューに もどる</button>' +
      '<div id="quizArea"></div></div>';
    app.innerHTML = html;
    document.getElementById("quizBackBtn").addEventListener("click", function () {
      showUnitMenu(unit.subject);
    });
    var quizArea = document.getElementById("quizArea");
    var questions = unit.getQuestions();
    Quiz.start(quizArea, questions, function (score, total, maxCombo, monsterHp) {
      saveBestScore(unitId, score);
      recordDailyResult(unit.subject, score);
      showResult(unitId, score, total, maxCombo, monsterHp);
    });
  }

  function showKukuStudyDanList(unitId) {
    var html = '<div class="screen"><h2>なんの だんを おぼえる？</h2><div class="menu-list dan-grid">';
    for (var d = 1; d <= 9; d++) {
      html += '<button type="button" class="big-btn dan-btn" data-dan="' + d + '">' + d + 'の だん</button>';
    }
    html += '</div><button type="button" class="back-btn" id="backBtn">メニューに もどる</button></div>';
    app.innerHTML = html;
    app.querySelectorAll(".dan-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showKukuStudyDan(unitId, Number(btn.getAttribute("data-dan")));
      });
    });
    document.getElementById("backBtn").addEventListener("click", function () {
      showUnitMenu(UNITS[unitId].subject);
    });
  }

  function showKukuStudyDan(unitId, dan) {
    var i = 1;
    var revealed = false;

    function render() {
      var yomi = DataKukuYomi.get(dan, i);
      var ans = dan * i;
      var html = '<div class="screen">';
      html += '<div class="quiz-progress">' + i + ' / 9</div>';
      html += '<div class="flashcard' + (revealed ? " is-revealed" : "") + '" id="flashcard">';
      html += '<div class="flash-math">' + dan + ' × ' + i + ' = ' +
        (revealed ? '<span class="flash-fill">' + ans + '</span>' : '<span class="flash-blank">？</span>') + '</div>';
      html += '<div class="flash-yomi">' + yomi.pre + ' ' +
        (revealed ? '<span class="flash-fill">' + yomi.ans + '</span>' : '<span class="flash-blank">？</span>') + '</div>';
      html += '<div class="flash-hint">' + (revealed ? (i < 9 ? "タップで つぎへ" : "タップで おわり") : "タップして こたえをみよう") + '</div>';
      html += '</div>';
      html += '<button type="button" class="back-btn" id="backBtn">だんを えらびなおす</button>';
      html += '</div>';
      app.innerHTML = html;

      document.getElementById("flashcard").addEventListener("click", function () {
        if (!revealed) {
          revealed = true;
          Sound.pikon();
          render();
        } else if (i < 9) {
          i++;
          revealed = false;
          render();
        } else {
          showKukuStudyDanList(unitId);
        }
      });
      document.getElementById("backBtn").addEventListener("click", function () {
        showKukuStudyDanList(unitId);
      });
    }

    render();
  }

  function pickRandomKanji(exclude) {
    var all = DataKanji.getAll();
    var item = all[Math.floor(Math.random() * all.length)];
    if (item.kanji === exclude && all.length > 1) {
      return pickRandomKanji(exclude);
    }
    return item.kanji;
  }

  function getKanjiReading(kanji) {
    var found = DataKanji.getAll().filter(function (item) {
      return item.kanji === kanji;
    })[0];
    return found ? found.reading : "";
  }

  function runStrokePractice(unitId, kanji, opts) {
    var strokes = DataKanjiStrokes.get(kanji);
    if (!strokes) {
      opts.onExit();
      return;
    }
    var html = '<div class="screen">';
    if (opts.showPickerLink) {
      html += '<button type="button" class="back-btn quiz-exit-btn" id="pickSpecificBtn">' +
        'れんしゅうしたい かんじが あるときは ここから えらんでね</button>';
    }
    html += '<div id="strokePracticeArea"></div></div>';
    app.innerHTML = html;
    if (opts.showPickerLink) {
      document.getElementById("pickSpecificBtn").addEventListener("click", function () {
        showKanjiStrokePicker(unitId);
      });
    }
    var area = document.getElementById("strokePracticeArea");
    StrokePractice.start(area, kanji, getKanjiReading(kanji), strokes, opts);
  }

  function showKanjiStrokePracticeRandom(unitId, excludeKanji) {
    var kanji = pickRandomKanji(excludeKanji);
    runStrokePractice(unitId, kanji, {
      showPickerLink: true,
      exitLabel: "メニューに もどる",
      onExit: function () {
        showUnitMenu(UNITS[unitId].subject);
      },
      onNext: function () {
        showKanjiStrokePracticeRandom(unitId, kanji);
      },
      onComplete: function () {
        recordDailyResult("kokugo", 1);
        return addRobotPiece();
      }
    });
  }

  function showKanjiStrokePicker(unitId) {
    var all = DataKanji.getAll();
    var html = '<div class="screen"><h2>かんじを えらんでね</h2>' +
      '<div class="kanji-picker-grid">';
    all.forEach(function (item) {
      html += '<button type="button" class="kanji-picker-btn" data-kanji="' + item.kanji + '">' +
        '<span class="kanji-picker-char">' + item.kanji + '</span>' +
        '<span class="kanji-picker-reading">' + item.reading + '</span>' +
        '</button>';
    });
    html += '</div><button type="button" class="back-btn" id="backBtn">メニューに もどる</button></div>';
    app.innerHTML = html;
    app.querySelectorAll(".kanji-picker-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        runStrokePractice(unitId, btn.getAttribute("data-kanji"), {
          showPickerLink: false,
          exitLabel: "かんじを えらびなおす",
          onExit: function () {
            showKanjiStrokePicker(unitId);
          }
        });
      });
    });
    document.getElementById("backBtn").addEventListener("click", function () {
      showUnitMenu(UNITS[unitId].subject);
    });
  }

  function showResult(unitId, score, total, maxCombo, monsterHp) {
    var unit = UNITS[unitId];
    var best = getBestScore(unitId);
    var rank = score === total ? "パーフェクト！" : (score >= total * 0.7 ? "よくできました！" : "ナイスチャレンジ！");
    var defeated = monsterHp <= 0;
    var monsterLine = defeated ? "てきを たおした！" : "てきに おおきな ダメージを あたえた！";
    var newTitle = TITLES[unitId] && score === total && unlockTitle(unitId);

    var html = '<div class="screen result-screen">' +
      '<div class="monster' + (defeated ? " monster-defeated" : "") + '">' +
      '<div class="monster-horn monster-horn-l"></div>' +
      '<div class="monster-horn monster-horn-r"></div>' +
      '<div class="monster-body"><div class="monster-eye monster-eye-l"></div><div class="monster-eye monster-eye-r"></div></div>' +
      '</div>' +
      '<div class="result-monster">' + monsterLine + '</div>' +
      '<div class="result-rank">' + rank + '</div>' +
      '<h2>' + unit.title + ' ミッションクリア</h2>' +
      '<div class="result-score">' + score + ' / ' + total + ' もん せいかい</div>' +
      (maxCombo >= 3 ? '<div class="result-combo">さいだいコンボ ' + maxCombo + '！</div>' : '') +
      '<div class="result-best">さいこうきろく： ' + best + ' / ' + total + '</div>' +
      (newTitle ? '<div class="title-earned"><div class="title-earned-label">しょうごうを かくとく！</div><div class="title-earned-name">' + TITLES[unitId] + '</div></div>' : '') +
      '<button type="button" class="big-btn" id="retryBtn">もういちど</button>' +
      '<button type="button" class="back-btn" id="menuBtn">メニューに もどる</button>' +
      '</div>';
    app.innerHTML = html;
    if (newTitle) {
      Sound.titleGet();
    }
    document.getElementById("retryBtn").addEventListener("click", function () {
      startQuiz(unitId);
    });
    document.getElementById("menuBtn").addEventListener("click", function () {
      showUnitMenu(unit.subject);
    });
  }

  showTitle();
})();
