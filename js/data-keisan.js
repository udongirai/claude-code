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

  // 繰り上がりのある足し算の筆算（2桁+2桁、答えは2桁におさまるものだけ）
  function makeAddition() {
    var a, b;
    do {
      a = randInt(10, 89);
      b = randInt(2, 89);
    } while ((a % 10) + (b % 10) < 10 || a + b >= 100);
    var sum = a + b;
    return {
      type: "hissan",
      op: "add",
      prompt: "ひっさんで けいさんしよう",
      tensA: Math.floor(a / 10),
      onesA: a % 10,
      tensB: Math.floor(b / 10),
      onesB: b % 10,
      carry: 1,
      answerTens: Math.floor(sum / 10),
      answerOnes: sum % 10,
      answer: String(sum)
    };
  }

  // 繰り下がりのある引き算の筆算（2桁 - 2桁、一の位で借りが必要なもの）
  function makeSubtraction() {
    var a, b;
    do {
      a = randInt(11, 99);
      b = randInt(10, a - 1);
    } while ((a % 10) >= (b % 10));
    var diff = a - b;
    return {
      type: "hissan",
      op: "sub",
      prompt: "ひっさんで けいさんしよう",
      tensA: Math.floor(a / 10),
      onesA: a % 10,
      tensB: Math.floor(b / 10),
      onesB: b % 10,
      borrow: Math.floor(a / 10) - 1,
      answerTens: Math.floor(diff / 10),
      answerOnes: diff % 10,
      answer: String(diff)
    };
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
