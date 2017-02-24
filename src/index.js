// Test for support of sound formats. Calls `done(err, results)` where result is an object :
// `{wav: <trueOrFalse>, ogg: <trueOrFalse>, mp3: <trueOrFalse>}`
exports.getSupportedFormats = function(audioContext, done) {
  var results = {}
  var formatList = [
      ['aac', new Uint8Array({{ aacFile }})],
      ['flac', new Uint8Array({{ flacFile }})],
      ['mp3', new Uint8Array({{ mp3File }})],
      ['ogg', new Uint8Array({{ oggFile }})],
      ['s16le', new Uint8Array({{ s16leFile }})],
      ['s24le', new Uint8Array({{ s24leFile }})],
      ['u8', new Uint8Array({{ u8File }})]
    ]
  var format

  var decodedCallback = function(fileType, err, buffer) {
    var supported = true

    // If no decoding error we consider the format is supported
    if (err)
      supported = false 
    //else if (buffer.numberOfChannels !== 1 || Math.round(buffer.duration * 10000) / 100 !== 1)
      //supported = false
    
    // Add format to `results` if supported, then move on to next format
    results[fileType] = supported
    if (formatList.length > 0)
      nextFormat()
    else {
      results.wav = results.s16le
      done(null, results)
    }
  }

  var nextFormat = function() {
    format = formatList.pop()
    audioContext.decodeAudioData(format[1].buffer, function(buffer) {
      decodedCallback(format[0], null, buffer)
    }, function(err) {
      decodedCallback(format[0], err || new Error('decoding error'), null)
    })
  }
  nextFormat()
}

// When `elem` is clicked, `handler(err, audioContext)` is called with an unmuted 
// instance of `AudioContext`. This is really necessary only on iOS.
exports.getAudioContextOnClick = function(elem, handler) {
  // starting in iOS9, audio will only be unmuted if the context is created on "touchend".
  var is_iOS = /iPad|iPhone|iPod/.test(navigator.platform)
  var eventType = is_iOS ? 'touchend' : 'click'

  var _handler = function() {
    var audioContext
    elem.removeEventListener(eventType, _handler, false)
    try {
      audioContext = new AudioContext()
    } catch (err) {
      return handler(err, audioContext)
    }
    handler(null, audioContext)
  }

  elem.addEventListener(eventType, _handler, false)
}