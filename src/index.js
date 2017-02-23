// Test for support of sound formats. Calls `done(err, results)` where result is an object :
// `{wav: <trueOrFalse>, ogg: <trueOrFalse>, mp3: <trueOrFalse>}`
exports.getSupportedFormats = function(audioContext, done) {
  var results = {}
  var formatList = [
      ['wav', new Uint8Array({{ wavFile }})],
      ['mp3', new Uint8Array({{ mp3File }})],
      ['ogg', new Uint8Array({{ oggFile }})]
    ]
  var format

  var decodedCallback = function(fileType, err, buffer) {
    var supported = true

    // If no decoding error, we test that the buffer is decoded as expected
    if (err)
      supported = false 
    else if (buffer.numberOfChannels !== 1 || Math.round(buffer.duration * 1000) !== 50)
      supported = false
    
    // Add format to `results` if supported, then move on to next format
    results[fileType] = supported
    if (formatList.length > 0)
      nextFormat()
    else 
      done(null, results)
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