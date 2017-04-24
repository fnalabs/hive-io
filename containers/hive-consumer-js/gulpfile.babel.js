import 'babel-polyfill';

import BUILD_CONFIG from './conf/buildConfig';

import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';

import del from 'del';
import { Instrumenter } from 'isparta';

/*******************************************************************************
 * Contants
 ******************************************************************************/

// Tasks (prefixes and types)
const BUILD = 'build:';
const CLEAN = 'clean:';
const INSTRUMENT = 'instrument:';
const LINT = 'lint:';
const RUN = 'run:';
const TEST = 'test:';

const ALL = 'all';
const GULPFILE = 'gulpfile';
const SCRIPTS = 'scripts';

// Gulp + Plugins, etc.
const $ = loadPlugins();
const envCheck = process.env.NODE_ENV === 'production';

/*******************************************************************************
* Clean method(s)
 ******************************************************************************/
function clean(path) {
    return del(path);
}

/*******************************************************************************
 * Lint method(s)
 ******************************************************************************/
function lintJS(src, cacheKey) {
    return gulp.src(src)
        .pipe($.cached(cacheKey))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.if(envCheck, $.eslint.failOnError()))
        .pipe($.remember(cacheKey));
}

/*******************************************************************************
 * Test method(s)
 ******************************************************************************/
function instrumentScripts() {
    return gulp.src(BUILD_CONFIG.SRC_SCRIPTS)
        .pipe($.istanbul({
            ...BUILD_CONFIG.ISTANBUL.INIT,
            instrumenter: Instrumenter
        }))
        .pipe($.istanbul.hookRequire());
}

function testScripts() {
    return gulp.src(BUILD_CONFIG.TST_UNIT)
        .pipe($.babel())
        .pipe($.mocha(BUILD_CONFIG.MOCHA))
        .pipe($.istanbul.writeReports(BUILD_CONFIG.ISTANBUL.WRITE))
        .on('error', () => $.util.log('unit tests failed...'));
}

/*******************************************************************************
 * Build method(s)
 ******************************************************************************/
function buildScripts() {
    return gulp.src(BUILD_CONFIG.SRC_SCRIPTS)
        .pipe($.changed(BUILD_CONFIG.OUTPUT_SCRIPTS))
        .pipe($.if(!envCheck, $.sourcemaps.init()))
        .pipe($.babel(BUILD_CONFIG.BABEL))
        .pipe($.uglify())
        .pipe($.if(!envCheck, $.sourcemaps.write('maps')))
        .pipe(gulp.dest(BUILD_CONFIG.OUTPUT_SCRIPTS));
}

/*******************************************************************************
 * Runner(s)
 ******************************************************************************/
function runWatch() {
    gulp.watch(BUILD_CONFIG.SRC_GULPFILE, [`${LINT}${GULPFILE}`]);
    gulp.watch(BUILD_CONFIG.SRC_SCRIPTS, [`${RUN}${SCRIPTS}`]);
    gulp.watch(BUILD_CONFIG.TST_UNIT, [`${TEST}${SCRIPTS}`]);

    return $.nodemon(BUILD_CONFIG.NODEMON);
}

function runZip() {
    return gulp.src(BUILD_CONFIG.OUTPUT_ZIP, { base: './' })
        .pipe($.tar('app.tar'))
        .pipe($.gzip())
        .pipe(gulp.dest('.'))
        .once('error', function () {
            process.exit(1);
        })
        .once('end', function () {
            process.exit();
        });
}

/*******************************************************************************
 * Tasks
 ******************************************************************************/

// main task runners
gulp.task('default', [
    `${LINT}${GULPFILE}`,
    `${RUN}${SCRIPTS}`
], runWatch);
gulp.task('zip', [
    `${CLEAN}${ALL}`,
    `${LINT}${GULPFILE}`,
    `${RUN}${SCRIPTS}`
], runZip);

// run sequences
gulp.task(`${RUN}${SCRIPTS}`, [
    `${CLEAN}${SCRIPTS}`,
    `${LINT}${SCRIPTS}`,
    `${INSTRUMENT}${SCRIPTS}`,
    `${TEST}${SCRIPTS}`,
    `${BUILD}${SCRIPTS}`
]);

// clean-specific tasks
gulp.task(`${CLEAN}${ALL}`, clean.bind(null, BUILD_CONFIG.OUTPUT_DEL));
gulp.task(`${CLEAN}${SCRIPTS}`, clean.bind(null, BUILD_CONFIG.OUTPUT_SCRIPTS));

// lint-specific tasks
gulp.task(`${LINT}${GULPFILE}`, lintJS.bind(null, BUILD_CONFIG.SRC_GULPFILE, GULPFILE));
gulp.task(`${LINT}${SCRIPTS}`, [`${CLEAN}${SCRIPTS}`], lintJS.bind(null, BUILD_CONFIG.SRC_SCRIPTS, SCRIPTS));

// test-specific tasks
gulp.task(`${INSTRUMENT}${SCRIPTS}`, [`${LINT}${SCRIPTS}`], instrumentScripts);
gulp.task(`${TEST}${SCRIPTS}`, [`${INSTRUMENT}${SCRIPTS}`], testScripts);

// build-specific tasks
gulp.task(`${BUILD}${SCRIPTS}`, [`${TEST}${SCRIPTS}`], buildScripts);
