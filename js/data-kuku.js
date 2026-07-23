var DataKuku = (function () {
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 数字入力(numpad)形式の問題を生成する
  function getQuestions(count) {
    count = count || 10;
    var pool = [];
    for (var a = 1; a <= 9; a++) {
      for (var b = 1; b <= 9; b++) {
        pool.push({ a: a, b: b });
      }
    }
    pool = shuffle(pool).slice(0, count);
    return pool.map(function (p) {
      return {
        type: "numpad",
        prompt: p.a + " × " + p.b,
        answer: String(p.a * p.b)
      };
    });
  }

  return { getQuestions: getQuestions };
})();
