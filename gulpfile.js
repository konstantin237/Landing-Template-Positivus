let gulp = require("gulp"),
  log = require("fancy-log"),
  pug = require("gulp-pug"),
  sass = require('gulp-sass')(require('sass')),
  browserSync = require("browser-sync"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  minify = require("gulp-minify"),
  autoprefixer = require("gulp-autoprefixer"),
  gcmq = require("gulp-group-css-media-queries"),
  webp = require("gulp-webp"),
  avif = require("gulp-avif"),
  deleteFile = require('gulp-delete-file'),
  debug = require('gulp-debug'),
  ignore = require('gulp-ignore'),
  ts = require('gulp-typescript'),
  sourcemaps = require('gulp-sourcemaps'),
  shell = require('gulp-shell'), //Для конвертации файла .ipynb в .py
  babel = require('gulp-babel'); // Add Babel


gulp.task("clean", async function () {
  del.sync("dist");
});

gulp.task('pug_to_html', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: true,
        basedir: 'dev', // <------ ВАЖНО!
      })
    )
    .pipe(rename({ extname: '.html' })) // 
    .pipe(gulp.dest('dev/'))

        //.on('end', function() {
      //gulp.src(['prod/assets/*.html'])
         // .pipe(deleteFile());
  //});
});

gulp.task('pug_to_minimized_html', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: false,
        basedir: 'dev', // <------ ВАЖНО!
      })
    )
    .pipe(rename({ extname: '.html' })) // 
    .pipe(gulp.dest('prod/'))

});


gulp.task('pug_to_php', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: true,
        basedir: 'dev', // <------ ВАЖНО!
      })
    )
    .pipe(rename({ extname: '.php' })) // 
    .pipe(gulp.dest('dev/'))

        //.on('end', function() {
      //gulp.src(['prod/assets/*.html'])
         // .pipe(deleteFile());
  //});
});

gulp.task('pug_to_minimized_php', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: false,
        basedir: 'dev', // <------ ВАЖНО!
      })
    )
    .pipe(rename({ extname: '.php' })) // 
    .pipe(gulp.dest('prod/'))

});





gulp.task("scss", function () {
  return gulp
    //в папке scss -> папка blocks - это стили для каждого html-блока 
    //discrete папка - содержит firstStyles - в ней стили для первого блока и изначального вида сайта ->
    //secondStyles - всё остальное
    .src("dev/assets/scss/3_merged_styles/*.scss")
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    .pipe(
      autoprefixer({
        cascade: false,
      })
    )

    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gcmq())


    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    //и в Dev и в Production отдаём сжатые css-файлы (firstStyles, secondStyles),
    //т.к. всё равно их редактировать не буду.
    //для редактирования и существет sass/scss

    .pipe(gulp.dest("dev/assets/css"))

    .pipe(gulp.dest("prod/assets/css"));

  //        .pipe(browserSync.reload({
  //            stream: true
  //        }))
});

gulp.task("gcmq", function () {
  return gulp
    .src("prod/assets/css/*.css")
    .pipe(gcmq())
    .pipe(gulp.dest("prod/assets/css/dist/"));
});

gulp.task("to-webp", () => {
  // Добавляем поддержку расширений в верхнем регистре
  return gulp.src('./dev/assets/img/**/*.{png,gif,jpg,PNG,GIF,JPG,jpeg,JPEG}')
    .pipe(webp())
    .pipe(rename({ prefix: 'webp/' }))
    .pipe(gulp.dest('./dev/assets/img'));
});

gulp.task("to-avif", () => {
  // Добавляем поддержку расширений в верхнем регистре
  return gulp.src('./dev/assets/img/**/*.{png,gif,jpg,PNG,GIF,JPG,jpeg,JPEG}')
    .pipe(avif())
    .pipe(rename({ prefix: 'avif/' }))
    .pipe(gulp.dest('./dev/assets/img'));
});


gulp.task("copy-images", function () {
  return gulp.src("dev/assets/img/**")
    .pipe(gulp.dest("prod/assets/img"));

  return;
});

gulp.task('copy-txtToJson', function() {
  return gulp.src('dev/python/*.ipynb')
    .pipe(shell([
      'jupyter nbconvert --to script <%= file.path %>'
    ]))
    .pipe(gulp.dest('S:/OpenServer/OSPanel/domains/pyhton-txtToJson'))
    .pipe(gulp.src('dev/python/**/*.{ipynb,py}'))
    .pipe(ignore('**/desktop.ini'))
    .pipe(gulp.dest('S:/OpenServer/OSPanel/domains/pyhton-txtToJson'));
});


gulp.task('copy-audio-folder', function() {
  return gulp.src('dev/audio/**/*')
    .pipe(ignore('**/desktop.ini'))
    .pipe(gulp.dest('C:/Users/Personal Computer/Desktop/Personal/AllForPrank/Плееры Нарезок/PrankPlayer/mp3'));
});


gulp.task("copy-fonts", function () {
  return gulp.src("dev/assets/fonts/**").pipe(gulp.dest("prod/assets/fonts"));
});


gulp.task("min-js", function () {
  return gulp
    .src("dev/assets/js/**")
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(uglify({
      mangle: true,
      compress: true,
      output: {
        comments: false
      }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("prod/assets/js"));
});

//gulp.task('browser-sync', function () {
//    browserSync.init({
//        server: {
//            baseDir: "dev/"
//        }
//    });
//});


gulp.task("export", function () {
  let buildHtml = gulp
  .src('prod/assets/*.html')
  .pipe(rename({ extname: '.php' })) // Rename index.html to index.php
  .pipe(gulp.dest('dist'))
  .on('end', function() {
    gulp.src(['prod/assets/*.html'])
        .pipe(deleteFile());
});


  let BuildCss = gulp.src("dev/assets/css/**/*.css").pipe(gulp.dest("dist/css"));

  let BuildJs = gulp.src("dev/assets/js/**/*.js").pipe(gulp.dest("dist/js"));

  let BuildFonts = gulp.src("dev/assets/fonts/**/*.*").pipe(gulp.dest("dist/fonts"));

  let BuildImg = gulp.src("dev/assets/img/**/*.*").pipe(gulp.dest("dist/img"));
});


// Также нужно обновить watch задачу для отслеживания файлов с расширениями в верхнем регистре
gulp.task("watch", function () {
  gulp.watch("dev/assets/pug_blocks/**", gulp.series(
    "pug_to_html",
    "pug_to_php",
    ...(fromDefault ? ["pug_to_minimized_html", "pug_to_minimized_php"] : [])
  ));

  gulp.watch("dev/index.pug", gulp.series(
    "pug_to_html",
    "pug_to_php",
    ...(fromDefault ? ["pug_to_minimized_html", "pug_to_minimized_php"] : [])
  ));

  gulp.watch("dev/assets/scss/**/*.scss", gulp.series("scss"));
  // Обновленный паттерн для отслеживания изображений с любым регистром расширений
  gulp.watch("dev/assets/img/**/*.{png,gif,jpg,PNG,GIF,JPG,jpeg,JPEG}", gulp.series("to-webp", "to-avif"));
  gulp.watch("dev/assets/img/**/*", gulp.series("copy-images"));
  gulp.watch("dev/assets/fonts/**", gulp.series("copy-fonts"));
  gulp.watch("dev/audio/**/*", gulp.series("copy-audio-folder"));
  gulp.watch("dev/python/**/*.{ipynb,py}", gulp.series("copy-txtToJson"));
  gulp.watch("dev/assets/js/**", gulp.series("min-js"));
});


gulp.task("build", gulp.series("clean", "export"));

let fromDefault = false;

//gulp.task('default', gulp.parallel('pug', 'scss', 'css', 'js', 'browser-sync', 'watch'));
gulp.task(
  "default",
  gulp.series(
    function setFlag(cb) {
      fromDefault = true;
      cb();
    },
    "pug_to_html",
    "pug_to_minimized_html",
    "pug_to_php",
    "pug_to_minimized_php",
    "scss",
    "to-webp",
    "to-avif",
    "copy-images",
    "copy-fonts",
    "copy-audio-folder",
    "copy-txtToJson",
    "min-js",
    "watch"
  )
);
