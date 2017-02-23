var fs = require('fs')
var path = require('path')
var gulp = require('gulp')
var mustache = require('gulp-mustache')
var rename = require('gulp-rename')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var wrap = require('gulp-wrap')
var runSequence = require('run-sequence')

var srcPath = './src/index.js'
var builtFileName = 'web-audio-boilerplate.js'
var builtPath = './dist/web-audio-boilerplate.js'
var builtUglifiedPath = './dist/web-audio-boilerplate-min.js'


gulp.task('loadFormatFiles', function() {
  return gulp.src(srcPath)
    .pipe(rename(builtFileName))
    .pipe(mustache({
      wavFile: JSON.stringify(fs.readFileSync('src/format-support-samples/sample.wav').toJSON().data),
      mp3File: JSON.stringify(fs.readFileSync('src/format-support-samples/sample.mp3').toJSON().data),
      oggFile: JSON.stringify(fs.readFileSync('src/format-support-samples/sample.ogg').toJSON().data)
    }))
    .pipe(gulp.dest('.'))
})

gulp.task('browser', function() {
  return gulp.src(builtFileName)
    .pipe(wrap(';(function(exports){<%= contents %>})(window.webAudioBoilerplate = {})', {}, { parse: false }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('concatDeps', function() {
  return gulp.src([ './src/deps/*.js', builtPath ])
    .pipe(concat(builtFileName))
    .pipe(gulp.dest('./dist'))
})

gulp.task('uglify', function() {
  return gulp.src(builtPath)
    .pipe(uglify())
    .pipe(rename(builtUglifiedPath))
    .pipe(gulp.dest('.'))
})

gulp.task('default', function(callback) {
  runSequence('loadFormatFiles', 'browser', 'concatDeps', 'uglify', callback)
})