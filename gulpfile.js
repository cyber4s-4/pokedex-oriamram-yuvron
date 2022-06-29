const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass"));
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const webpack = require("gulp-webpack");
const webpackConfig = require("./webpack.config");

const tsProject = ts.createProject("tsconfig.json");

// Removes previous dist
gulp.task("start", () => gulp.src("dist", { allowEmpty: true }).pipe(clean()));

// Copy Images task
gulp.task("copy-images", () => gulp.src("src/images/*/*").pipe(gulp.dest("dist/images")));

// HTML task
gulp.task("html", () => gulp.src("src/*.html").pipe(gulp.dest("dist")));

// Sass task
gulp.task("sass", () => gulp.src("src/styles/*.scss").pipe(sass()).pipe(gulp.dest("dist/styles")).pipe(browsersync.stream()));

// Typescript task
gulp.task("ts", () => gulp.src("src/scripts/*.ts").pipe(tsProject()).pipe(gulp.dest("dist/js")));

// Webpack task
gulp.task("webpack", () => webpack(webpackConfig).pipe(gulp.dest("dist")));

// Watch task
gulp.task("watch", () => {
	gulp.watch("src/images", gulp.series("copy-images", "browsersyncReload"));
	gulp.watch("src/*.html", gulp.series("html", "browsersyncReload"));
	gulp.watch("src/styles/*.scss", gulp.series("sass"));
	gulp.watch("src/scripts/*.ts", gulp.series("ts", "webpack", "browsersyncReload"));
});

// Browser sync tasks
gulp.task("browsersyncServe", (cb) => {
	browsersync.init({
		port: 5500,
		server: { baseDir: "dist" },
	});
	cb();
});

gulp.task("browsersyncReload", (cb) => {
	browsersync.reload();
	cb();
});

// Default task
gulp.task("default", gulp.series("start", "copy-images", "ts", "webpack", "sass", "html", "browsersyncServe", "watch"));
