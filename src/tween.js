var Easing = require('./easing.js');
var Color = require('color');
var now = Date.now;

module.exports = function (startColorString, endColorString) {
  var startColor = Color(startColorString).rgb().array();
  var endColor = Color(endColorString).rgb().array();
  var tween = this;
  tween.params = {
    updater: function(){},
    ender: function(){},
    length: 1000,
    startTime: undefined,
    easing: Easing('linear')
  }

// Public API
  tween.onUpdate = overwrite('updater');
  tween.onEnd = overwrite('ender');
  tween.start = start;
  tween.duration = overwrite('length');
  tween.stop = stop;
  tween.update = update;
  tween.easing = setEasing;

  return tween;

/* --------------- */

  function setEasing(name) {
    tween.params.easing = Easing(name) || Easing('linear');
    return tween;
  }

  function start(cb) {
    tween.params.startTime = now();
    if (typeof(cb) === 'function'){
      setTimeout(cb);
    }
    return tween;
  }

  function update() {
    if (tween.params.startTime) {
      var frame = renderFrame();
      if (frame.progress > 1) {
        done();
      } else {
        tween.params.updater(frame.frame);
      }
      return frame.frame;
    }
    return null;
  }

  function renderFrame() {
    var pos = now() - tween.params.startTime
    var percent = pos / tween.params.length;

    var frame = endColor.map(function(val, i) {
      return startColor[i] + (val - startColor[i]) * tween.params.easing(percent);
    });

    return {
      frame: Color.rgb(frame),
      progress: percent
    }
  }

  function done() {
    tween.params.updater(Color.rgb(endColor));
    stop();
    return tween;
  }

  function stop() {
    tween.params.startTime = undefined;
    tween.params.ender(Color.rgb(endColor));
    return tween;
  }

  function overwrite(key) {
    return function(val) {
      tween.params[key] = val;
      return tween;
    }
  }
}
