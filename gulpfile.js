var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyhtml = require('gulp-minify-html');
var cleanCSS = require('gulp-clean-css');
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');

// 개발용 웹서버 실행 localhost:8000 
gulp.task('server', function () {
	return gulp.src('public/dist/')
		.pipe(webserver());
});

// 변경 감지 및 업데이트 
gulp.task('watch', function () {
	livereload.listen();
	gulp.watch('public/src/js/*.js', ['combine-js']);
	gulp.watch('public/src/*.html', ['compress-html']);
	gulp.watch('public/src/img/*', ['copy-img']);
	gulp.watch('public/src/css/*.css*', ['minify-css']);
	gulp.watch('public/dist/**').on('change', livereload.changed);
});

// js 파일을 합치고 uglify
gulp.task('combine-js', function () {
	return gulp.src('public/src/js/*.js')
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/dist/js'));
});

// HTML 파일 압축 
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