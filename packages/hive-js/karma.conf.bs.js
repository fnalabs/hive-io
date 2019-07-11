// Karma configuration
module.exports = function (config) {
  config.set({
    // global config of your BrowserStack account
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_KEY,
      project: 'hive-io'
    },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],

    // list of files / patterns to load in the browser
    files: [
      'tst/**/*.spec.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'tst/**/*.spec.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // define browsers
    customLaunchers: {
      bs_android_latest: {
        base: 'BrowserStack',
        browser: 'Android',
        device: 'Google Pixel 2',
        os: 'Android',
        os_version: '9.0',
        realMobile: true
      },
      'bs_android_latest-1': {
        base: 'BrowserStack',
        browser: 'Android',
        device: 'Google Pixel 2',
        os: 'Android',
        os_version: '8.0',
        realMobile: true
      },
      bs_chrome_mac_latest: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '75.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      'bs_chrome_mac_latest-1': {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '74.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      'bs_chrome_mac_latest-2': {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '73.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      bs_chrome_win_latest: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '75.0',
        os: 'Windows',
        os_version: '10'
      },
      'bs_chrome_win_latest-1': {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '74.0',
        os: 'Windows',
        os_version: '10'
      },
      'bs_chrome_win_latest-2': {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '73.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_edge_win_latest: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '18.0',
        os: 'Windows',
        os_version: '10'
      },
      'bs_edge_win_latest-1': {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '17.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_firefox_mac_latest: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '66.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      'bs_firefox_mac_latest-1': {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '65.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      'bs_firefox_mac_latest-2': {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '64.0',
        os: 'OS X',
        os_version: 'Mojave'
      },
      bs_firefox_win_latest: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '66.0',
        os: 'Windows',
        os_version: '10'
      },
      'bs_firefox_win_latest-1': {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '65.0',
        os: 'Windows',
        os_version: '10'
      },
      'bs_firefox_win_latest-2': {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '64.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_iphone: {
        base: 'BrowserStack',
        browser: 'iPhone',
        device: 'iPhone XS',
        os_version: '12',
        realMobile: true
      },
      bs_opera_mac: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: '60',
        os: 'OS X',
        os_version: 'Mojave'
      },
      bs_opera_win: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: '60',
        os: 'Windows',
        os_version: '10'
      },
      bs_safari_mac: {
        base: 'BrowserStack',
        browser: 'Safari',
        browser_version: '12',
        os: 'OS X',
        os_version: 'Mojave'
      }
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'bs_android_latest', 'bs_android_latest-1',
      'bs_chrome_mac_latest', 'bs_chrome_mac_latest-1', 'bs_chrome_mac_latest-2',
      'bs_chrome_win_latest', 'bs_chrome_win_latest-1', 'bs_chrome_win_latest-2',
      'bs_edge_win_latest', 'bs_edge_win_latest-1',
      'bs_firefox_mac_latest', 'bs_firefox_mac_latest-1', 'bs_firefox_mac_latest-2',
      'bs_firefox_win_latest', 'bs_firefox_win_latest-1', 'bs_firefox_win_latest-2',
      // 'bs_iphone',
      'bs_opera_mac', 'bs_opera_win',
      'bs_safari_mac'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5,

    browserify: {
      transform: ['babelify'],
      debug: true
    }
  })
}
