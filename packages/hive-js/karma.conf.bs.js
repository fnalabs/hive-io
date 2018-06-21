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
      bs_android: {
        base: 'BrowserStack',
        browser: 'Android',
        device: 'Google Pixel 2',
        os: 'Android',
        os_version: '8.0',
        real_mobile: true
      },
      bs_chrome_mac: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '67.0',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_chrome_win: {
        base: 'BrowserStack',
        browser: 'Chrome',
        browser_version: '67.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_edge_win: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '17.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_firefox_mac: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '60.0',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_firefox_win: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '60.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_iphone: {
        base: 'BrowserStack',
        browser: 'iPhone',
        device: 'iPhone 8',
        os: 'ios',
        os_version: '11.0'
      },
      bs_opera_mac: {
        base: 'BrowserStack',
        browser: 'Opera',
        browser_version: '12.15',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_safari_mac: {
        base: 'BrowserStack',
        browser: 'Safari',
        browser_version: '11.1',
        os: 'OS X',
        os_version: 'High Sierra'
      }
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'bs_android',
      'bs_chrome_mac', 'bs_chrome_win',
      'bs_edge_win',
      'bs_firefox_mac', 'bs_firefox_win',
      'bs_iphone',
      'bs_opera_mac',
      'bs_safari_mac'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserify: {
      transform: ['babelify'],
      debug: true
    }
  })
}
