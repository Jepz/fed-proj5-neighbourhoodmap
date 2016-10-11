var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    csso = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    browserSync = require('browser-sync').create();

//BrowserSync
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });

  
});

// HTML
gulp.task('html', function() {
    return gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true,removeComments: true, preserveLineBreaks: true, minifyCSS: true}))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'HTML task complete' }))
});



// Styles
gulp.task('styles', function() {
  return gulp.src('app/styles/*.css', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(csso({compress: true}))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('app/scripts/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(uglify({compress: true}))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Scripts task complete' }));
});
gulp.task('libs', function() {
  return gulp.src('app/libs/*.js')
    .pipe(uglify({compress: true}))
    .pipe(gulp.dest('dist/libs'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Libs task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('app/img/*')
    .pipe(cache(imagemin({ interlaced: true })))
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Images task complete' }));
});



// Clean
gulp.task('clean', function() {
  return del(['dist/styles','dist/scripts', 'dist/libs','dist/img', 'dist']);
});

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts','libs','images','html');
});

// Watch
gulp.task('watch', ['browserSync'], function() {

    // Watch .html files
    gulp.watch('app/*.html', ['html']); 

  // Watch .css files
  gulp.watch('app/styles/*.css', ['styles']);

  // Watch .js files
  gulp.watch('app/scripts/*.js', ['scripts']);

  // Watch libs files, .js
    gulp.watch('app/libs/*.js', ['libs']);

  // Watch image files
  gulp.watch('app/img/*', ['images']);
 

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['app/**']).on('change', livereload.changed);
  gulp.watch(['app/**']).on('change', browserSync.reload);

});