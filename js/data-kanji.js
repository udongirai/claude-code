var DataKanji = (function () {
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // 小学2年生で習う漢字（読みは代表的なもの1つ）
  var pool = [
    { kanji: "兄", reading: "あに" },
    { kanji: "姉", reading: "あね" },
    { kanji: "弟", reading: "おとうと" },
    { kanji: "妹", reading: "いもうと" },
    { kanji: "父", reading: "ちち" },
    { kanji: "母", reading: "はは" },
    { kanji: "友", reading: "とも" },
    { kanji: "今", reading: "いま" },
    { kanji: "毎", reading: "まい" },
    { kanji: "朝", reading: "あさ" },
    { kanji: "昼", reading: "ひる" },
    { kanji: "夜", reading: "よる" },
    { kanji: "週", reading: "しゅう" },
    { kanji: "春", reading: "はる" },
    { kanji: "夏", reading: "なつ" },
    { kanji: "秋", reading: "あき" },
    { kanji: "冬", reading: "ふゆ" },
    { kanji: "晴", reading: "はれ" },
    { kanji: "雪", reading: "ゆき" },
    { kanji: "雲", reading: "くも" },
    { kanji: "風", reading: "かぜ" },
    { kanji: "声", reading: "こえ" },
    { kanji: "歌", reading: "うた" },
    { kanji: "話", reading: "はなし" },
    { kanji: "読", reading: "よ(む)" },
    { kanji: "書", reading: "か(く)" },
    { kanji: "計", reading: "けい" },
    { kanji: "算", reading: "さん" },
    { kanji: "数", reading: "かず" },
    { kanji: "多", reading: "おお(い)" },
    { kanji: "少", reading: "すく(ない)" },
    { kanji: "長", reading: "なが(い)" },
    { kanji: "強", reading: "つよ(い)" },
    { kanji: "弱", reading: "よわ(い)" },
    { kanji: "新", reading: "あたら(しい)" },
    { kanji: "古", reading: "ふる(い)" },
    { kanji: "北", reading: "きた" },
    { kanji: "南", reading: "みなみ" },
    { kanji: "東", reading: "ひがし" },
    { kanji: "西", reading: "にし" },
    { kanji: "引", reading: "ひ(く)" },
    { kanji: "羽", reading: "はね" },
    { kanji: "園", reading: "その" },
    { kanji: "遠", reading: "とお(い)" },
    { kanji: "何", reading: "なに" },
    { kanji: "科", reading: "か" },
    { kanji: "家", reading: "いえ" },
    { kanji: "画", reading: "が" },
    { kanji: "回", reading: "まわ(る)" },
    { kanji: "会", reading: "あ(う)" },
    { kanji: "海", reading: "うみ" },
    { kanji: "絵", reading: "え" },
    { kanji: "外", reading: "そと" },
    { kanji: "角", reading: "かど" },
    { kanji: "楽", reading: "たの(しい)" },
    { kanji: "活", reading: "かつ" },
    { kanji: "間", reading: "あいだ" },
    { kanji: "丸", reading: "まる" },
    { kanji: "岩", reading: "いわ" },
    { kanji: "顔", reading: "かお" },
    { kanji: "汽", reading: "きしゃ" },
    { kanji: "記", reading: "にっき" },
    { kanji: "帰", reading: "かえ(る)" },
    { kanji: "弓", reading: "ゆみ" },
    { kanji: "牛", reading: "うし" },
    { kanji: "魚", reading: "さかな" },
    { kanji: "京", reading: "きょう" },
    { kanji: "教", reading: "おし(える)" },
    { kanji: "近", reading: "ちか(い)" },
    { kanji: "形", reading: "かたち" },
    { kanji: "元", reading: "もと" },
    { kanji: "言", reading: "い(う)" },
    { kanji: "原", reading: "はら" },
    { kanji: "戸", reading: "と" },
    { kanji: "午", reading: "ごぜん" },
    { kanji: "後", reading: "あと" },
    { kanji: "語", reading: "たんご" },
    { kanji: "工", reading: "こうさく" },
    { kanji: "公", reading: "こうえん" },
    { kanji: "広", reading: "ひろ(い)" },
    { kanji: "交", reading: "こうつう" },
    { kanji: "光", reading: "ひかり" },
    { kanji: "考", reading: "かんが(える)" },
    { kanji: "行", reading: "い(く)" },
    { kanji: "高", reading: "たか(い)" },
    { kanji: "黄", reading: "きいろ" },
    { kanji: "合", reading: "あ(わせる)" },
    { kanji: "谷", reading: "たに" },
    { kanji: "国", reading: "くに" },
    { kanji: "黒", reading: "くろ" },
    { kanji: "才", reading: "さい" },
    { kanji: "細", reading: "ほそ(い)" },
    { kanji: "作", reading: "つく(る)" },
    { kanji: "止", reading: "と(まる)" },
    { kanji: "市", reading: "いち" },
    { kanji: "矢", reading: "や" },
    { kanji: "思", reading: "おも(う)" },
    { kanji: "紙", reading: "かみ" },
    { kanji: "寺", reading: "てら" },
    { kanji: "自", reading: "じ" },
    { kanji: "時", reading: "とき" },
    { kanji: "室", reading: "しつ" },
    { kanji: "社", reading: "しゃ" },
    { kanji: "首", reading: "くび" },
    { kanji: "場", reading: "ば" },
    { kanji: "色", reading: "いろ" },
    { kanji: "食", reading: "た(べる)" },
    { kanji: "心", reading: "こころ" },
    { kanji: "親", reading: "おや" },
    { kanji: "図", reading: "ず" },
    { kanji: "星", reading: "ほし" },
    { kanji: "切", reading: "き(る)" },
    { kanji: "船", reading: "ふね" },
    { kanji: "線", reading: "せん" },
    { kanji: "前", reading: "まえ" },
    { kanji: "組", reading: "くみ" },
    { kanji: "走", reading: "はし(る)" },
    { kanji: "太", reading: "ふと(い)" },
    { kanji: "体", reading: "からだ" },
    { kanji: "台", reading: "だい" },
    { kanji: "地", reading: "ち" },
    { kanji: "池", reading: "いけ" },
    { kanji: "知", reading: "し(る)" },
    { kanji: "茶", reading: "ちゃ" },
    { kanji: "鳥", reading: "とり" },
    { kanji: "直", reading: "なお(す)" },
    { kanji: "通", reading: "とお(る)" },
    { kanji: "店", reading: "みせ" },
    { kanji: "点", reading: "てん" },
    { kanji: "電", reading: "でん" },
    { kanji: "刀", reading: "かたな" },
    { kanji: "当", reading: "あ(たる)" },
    { kanji: "同", reading: "おな(じ)" },
    { kanji: "道", reading: "みち" },
    { kanji: "内", reading: "うち" },
    { kanji: "肉", reading: "にく" },
    { kanji: "馬", reading: "うま" },
    { kanji: "売", reading: "う(る)" },
    { kanji: "買", reading: "か(う)" },
    { kanji: "麦", reading: "むぎ" },
    { kanji: "半", reading: "はん" },
    { kanji: "番", reading: "ばん" },
    { kanji: "分", reading: "わ(ける)" },
    { kanji: "聞", reading: "き(く)" },
    { kanji: "米", reading: "こめ" },
    { kanji: "歩", reading: "ある(く)" },
    { kanji: "方", reading: "ほう" },
    { kanji: "万", reading: "まん" },
    { kanji: "明", reading: "あか(るい)" },
    { kanji: "鳴", reading: "な(く)" },
    { kanji: "毛", reading: "け" },
    { kanji: "門", reading: "もん" },
    { kanji: "野", reading: "の" },
    { kanji: "用", reading: "ようじ" },
    { kanji: "曜", reading: "よう" },
    { kanji: "来", reading: "く(る)" },
    { kanji: "里", reading: "さと" },
    { kanji: "理", reading: "り" },
  ];

  function pickDistractors(exclude, key, count) {
    var candidates = pool.filter(function (item) {
      return item[key] !== exclude;
    });
    return shuffle(candidates).slice(0, count).map(function (item) {
      return item[key];
    });
  }

  // mode: "reading" = 漢字を見て読みを選ぶ / "writing" = 読みを見て漢字を選ぶ
  function getQuestions(count, mode) {
    count = count || 10;
    mode = mode || "reading";
    var picked = shuffle(pool).slice(0, count);
    return picked.map(function (item) {
      if (mode === "writing") {
        var distractors = pickDistractors(item.kanji, "kanji", 3);
        return {
          type: "choice",
          prompt: "「" + item.reading + "」の 漢字は どれ？",
          answer: item.kanji,
          choices: shuffle(distractors.concat([item.kanji]))
        };
      }
      var readingDistractors = pickDistractors(item.reading, "reading", 3);
      return {
        type: "choice",
        prompt: item.kanji + " の読みは どれ？",
        answer: item.reading,
        choices: shuffle(readingDistractors.concat([item.reading]))
      };
    });
  }

  function getAll() {
    return pool.slice();
  }

  return { getQuestions: getQuestions, getAll: getAll };
})();
