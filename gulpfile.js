var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("trans", function () {
  return gulp.src("script.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});