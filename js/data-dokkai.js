var DataDokkai = (function () {
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var pool = [
    {
      passage: "たろうくんは あさ、こうえんへ いきました。こうえんには おおきな いぬが いました。たろうくんは いぬと あそんで、とても たのしかったです。",
      question: "たろうくんは どこへ いきましたか。",
      answer: "こうえん",
      choices: ["がっこう", "こうえん", "うみ", "としょかん"]
    },
    {
      passage: "きょうは あめが ふっています。はなこさんは あかい かさを もって がっこうに いきました。かさから ぽつぽつと おとが しました。",
      question: "きょうの てんきは どれですか。",
      answer: "あめ",
      choices: ["はれ", "ゆき", "あめ", "くもり"]
    },
    {
      passage: "ねこの ミミは くろい けと しろい けが あります。まいあさ、まどの そばで ひなたぼっこを するのが すきです。",
      question: "ねこの ミミが すきなことは なんですか。",
      answer: "ひなたぼっこ",
      choices: ["さかな つり", "ひなたぼっこ", "みずあそび", "かけっこ"]
    },
    {
      passage: "きょう、じろうくんの たんじょうびでした。かぞくみんなで ケーキを たべました。じろうくんは とても うれしそうでした。",
      question: "きょうは だれの たんじょうびですか。",
      answer: "じろうくん",
      choices: ["たろうくん", "じろうくん", "はなこさん", "おかあさん"]
    },
    {
      passage: "うさぎの ぴょんは にんじんが だいすきです。でも、きゃべつは あまり たべません。まいにち げんきに とびはねています。",
      question: "うさぎの ぴょんが すきな たべものは なんですか。",
      answer: "にんじん",
      choices: ["にんじん", "きゃべつ", "りんご", "パン"]
    },
    {
      passage: "なつやすみに、かぞくで うみへ いきました。すなはまで さかなを つったり、およいだり しました。ゆうがた、みんなで はなびを しました。",
      question: "なつやすみに いった ばしょは どこですか。",
      answer: "うみ",
      choices: ["やま", "うみ", "こうえん", "どうぶつえん"]
    }
  ];

  function getQuestions(count) {
    count = count || 5;
    var picked = shuffle(pool).slice(0, count);
    return picked.map(function (q) {
      return {
        type: "choice",
        prompt: q.passage,
        subPrompt: q.question,
        answer: q.answer,
        choices: shuffle(q.choices)
      };
    });
  }

  return { getQuestions: getQuestions };
})();
