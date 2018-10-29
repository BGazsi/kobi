const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const cleanCss = require('gulp-clean-css')

function styles () {
  return gulp.src('./public/src/scss/**/init.scss')
    .pipe(sass()).on('error', sass.logError)
    .pipe(rename({
      basename: 'style'
    }))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('./public/dist/css/'))
}

function scripts () {
  const customJs = './public/src/js/**/*.js'

  return gulp.src([customJs])
    .pipe(concat('script.js'))
    .pipe(babel())
    .pipe(rename({
      basename: 'script',
      extname: '.js'
    }))
    .pipe(gulp.dest('./public/dist/js/'))
}

function vendorJss () {
  let vendorJs = './public/src/vendor/js/**/*.js'

  return gulp.src([vendorJs])
    .pipe(gulp.dest('./public/dist/js/'))

}

function watch () {
  gulp.watch('./public/src/scss/**/*.scss', styles)
  gulp.watch('./public/src/js/**/*.js', scripts)
  gulp.watch('./public/src/img/**/*', img)
  gulp.watch('./public/src/img/**/*', vendorJss)
}

function img () {
  const images = './public/src/img/**/*'

  return gulp.src([images])
    .pipe(gulp.dest('./public/dist/img/'))
}

exports.scripts = scripts
exports.watch = watch
exports.styles = styles
exports.img = img
exports.vendor = vendorJss

const build = gulp.series(gulp.parallel(styles, scripts, img, vendorJss))
gulp.task('default', build)

