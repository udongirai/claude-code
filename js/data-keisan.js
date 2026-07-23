var DataKeisan = (function () {
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

  // 繰り上がりのある足し算（答えは100まで）
  function makeAddition() {
    var a, b;
    do {
      a = randInt(10, 89);
      b = randInt(2, 89);
    } while ((a % 10) + (b % 10) < 10 || a + b > 100);
    return { type: "numpad", prompt: a + " + " + b, answer: String(a + b) };
  }

  // 繰り下がりのある引き算（2桁 - 2桁、借りが必要なもの）
  function makeSubtraction() {
    var a, b;
    do {
      a = randInt(11, 99);
      b = randInt(10, a - 1);
    } while ((a % 10) >= (b % 10));
    return { type: "numpad", prompt: a + " - " + b, answer: String(a - b) };
  }

  function getQuestions(count) {
    count = count || 10;
    var list = [];
    for (var i = 0; i < count; i++) {
      list.push(i % 2 === 0 ? makeAddition() : makeSubtraction());
    }
    return shuffle(list);
  }

  return { getQuestions: getQuestions };
})();
