var Sound = (function () {
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function beep(freq, start, duration, type, gainValue) {
    var audio = getCtx();
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = gainValue || 0.15;
    osc.connect(gain);
    gain.connect(audio.destination);
    var t = audio.currentTime + start;
    osc.start(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.stop(t + duration + 0.02);
  }

  return {
    correct: function () {
      beep(880, 0, 0.12, "sine", 0.18);
      beep(1318.5, 0.1, 0.18, "sine", 0.18);
    },
    incorrect: function () {
      beep(220, 0, 0.25, "sawtooth", 0.12);
    },
    tap: function () {
      beep(440, 0, 0.05, "sine", 0.08);
    },
    pikon: function () {
      beep(1200, 0, 0.07, "sine", 0.16);
      beep(1800, 0.05, 0.12, "sine", 0.14);
    },
    combo: function (comboCount) {
      var steps = Math.min(comboCount, 6);
      for (var i = 0; i < steps; i++) {
        beep(660 + i * 110, i * 0.06, 0.14, "square", 0.12);
      }
    },
    titleGet: function () {
      beep(523.25, 0, 0.16, "square", 0.15);
      beep(659.25, 0.12, 0.16, "square", 0.15);
      beep(783.99, 0.24, 0.28, "square", 0.17);
    },
    robotComplete: function () {
      beep(392.0, 0, 0.14, "square", 0.14);
      beep(523.25, 0.1, 0.14, "square", 0.14);
      beep(659.25, 0.2, 0.14, "square", 0.15);
      beep(783.99, 0.3, 0.14, "square", 0.16);
      beep(1046.5, 0.4, 0.4, "square", 0.2);
      beep(523.25, 0.4, 0.4, "sine", 0.12);
      beep(659.25, 0.4, 0.4, "sine", 0.1);
    }
  };
})();
