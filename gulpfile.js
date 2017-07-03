var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyhtml = require('gulp-minify-html');
var cleanCSS = require('gulp-clean-css');
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function () {
	return gulp.src('public/dist/')
		.pipe(webserver());
});

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function () {
	livereload.listen();
	gulp.watch('public/src/js/*.js', ['combine-js']);
	gulp.watch('public/src/*.html', ['compress-html']);
	gulp.watch('public/src/img/*', ['copy-img']);
	gulp.watch('public/src/css/*.css*', ['minify-css']);
	gulp.watch('public/dist/**').on('change', livereload.changed);
});

// 자바스크립트 파일을 하나로 합치고 압축한다.
gulp.task('combine-js', function () {
	return gulp.src('public/src/js/*.js')
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/dist/js'));
});

// HTML 파일을 압축한다.
gulp.task('compress-html', function () {
	return gulp.src('public/src/*.html')
		.pipe(minifyhtml())
		.pipe(gulp.dest('public/dist/'));
});

// img 폴더 복사 
gulp.task('copy-img', function () {
	return gulp.src('public/src/img/*')
		.pipe(gulp.dest('public/dist/img/'));
});

// css minify
gulp.task('minify-css', () => {
  return gulp.src('public/src/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/dist/css/'));
});

gulp.task('default', ['combine-js','compress-html','copy-img','minify-css','watch','server']);

gulp.task('build', ['combine-js','compress-html','copy-img','minify-css']);