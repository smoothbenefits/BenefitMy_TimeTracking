var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**', '!public/**', '!data_migration/**'])
          .pipe(eslint({
            "fix": true
          }))
          .pipe(eslint.format())
          .pipe(eslint.failAfterError());
});

gulp.task('default', ['lint'], function() {
  // place code for your default task here
});
