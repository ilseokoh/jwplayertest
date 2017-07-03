var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyhtml = require('gulp-minify-html');
var cleanCSS = require('gulp-clean-css');
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');
var util = require('gulp-util');
var azure = require('gulp-azure-storage');
var gzip = require('gulp-gzip');

console.log('Production build? : ' + util.env.production);

var config = {
	js: 'src/js/**/*.js',
	css: 'src/css/**/*.css',
	img: 'src/img/*.*',
	html: 'src/*.html',
	dist: 'dist/',
	production: !!util.env.production,
	azureStorageAccountName: 'blobwebapp1',
	azureStorageKey: 'uS7lkWaTb+515uR6MsrwSymQNMIPc4nGBnsWIvL8RE4I0uXWDPJJ4UNxoNJ4Wu8oPZ8O+w4V0CffnsxEW0RhKQ=='
};

// 개발용 웹서버 실행 localhost:8000 
gulp.task('server', function () {
	return gulp.src(config.dist)
		.pipe(webserver());
});

// 변경 감지 및 업데이트 
gulp.task('watch', function () {
	livereload.listen();
	gulp.watch(config.js, ['combine-js']);
	gulp.watch(config.html, ['compress-html']);
	gulp.watch(config.img, ['copy-img']);
	gulp.watch(config.css, ['minify-css']);
	gulp.watch('dist/**').on('change', livereload.changed);
});

// js 파일을 합치고 uglify, gzip
gulp.task('combine-js', function () {
	return gulp.src(config.js)
		.pipe(concat('main.js'))
		.pipe(config.production ? uglify() : util.noop())
		.pipe(config.production ? gzip({
			append: false,
			threshold: false,
			gzipOptions: {
				level: 9,
				memLevel: 9
			}
		}) : util.noop())
		.pipe(gulp.dest(config.dist + 'js/'));
});

// HTML 파일 압축 , gzip
gulp.task('compress-html', function () {
	return gulp.src(config.html)
		.pipe(config.production ? minifyhtml() : util.noop())
		.pipe(config.production ? gzip({
			append: false,
			threshold: false,
			gzipOptions: {
				level: 9,
				memLevel: 9
			}
		}) : util.noop())
		.pipe(gulp.dest(config.dist));
});

// css minify, gzip
gulp.task('minify-css', () => {
  return gulp.src(config.css)
    .pipe(config.production ? cleanCSS({compatibility: 'ie8'}) : util.noop())
	.pipe(config.production ? gzip({
			append: false,
			threshold: false,
			gzipOptions: {
				level: 9,
				memLevel: 9
			}
		}) : util.noop())
    .pipe(gulp.dest(config.dist + 'css/'));
});

// img 폴더 복사 
gulp.task('copy-img', function () {
	return gulp.src(config.img)
		.pipe(gulp.dest(config.dist + 'img/'));
});

// jwplayer 폴더 복사 
gulp.task('copy-jwplayer', function () {
	return gulp.src('src/jwplayer/**/*')
		.pipe(gulp.dest(config.dist + 'jwplayer/'));
});

gulp.task('dev', function () { 
	return gulp.src(config.dist + "**/*.*")
			.pipe(azure.upload({
				account: config.azureStorageAccountName,
				key: config.azureStorageKey,
				container: 'dev',
			}));
});

gulp.task('prod', function () { 
	return gulp.src(config.dist + '**/*.*')
			.pipe(azure.upload({
				account: config.azureStorageAccountName,
				key: config.azureStorageKey,
				container: 'prod',
			}));
});

gulp.task('build', ['combine-js','compress-html','copy-img','minify-css', 'copy-jwplayer']);
gulp.task('deploy-dev', ['build','dev']);
gulp.task('deploy-prod', ['build','prod']);
gulp.task('default', ['build','watch','server']);