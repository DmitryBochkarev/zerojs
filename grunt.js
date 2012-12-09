module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      src: ['src/*.js']
    },
    concat: {
      debug: {
        src: [
          'helpers/src/before.js',
          'src/base.js',
          'src/event_handler.js',
          'src/event_emitter.js',
          'src/observable.js',
          'src/computed.js',
          'src/subscriber.js',
          'src/isolation_call_context.js',
          'src/isolation.js',
          'helpers/src/after.js'
        ],
        dest: 'dist/zero-debug.js'
      }
    },
    min: {
      debug: {
        src: 'dist/zero-debug.js',
        dest: 'dist/zero-debug.min.js'
      },
      dist: {
        src: 'dist/zero.js',
        dest: 'dist/zero.min.js'
      }
    },
    watch: {
      files: ['<config:lint.src>', 'test/*'],
      tasks: 'lint exec:test'
    },
    exec: {
      'build-dist': {
        command: 'node helpers/removeDebug.js dist/zero-debug.js dist/zero.js',
        stdout: true
      },
      test: {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.html dot',
        stdout: true
      },
      "test-cov": {
        command: ' rm -rf src-cov && jscoverage src src-cov && phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner-cov.html json-cov | node helpers/cov/buildHTML.js > coverage.html',
        stdout: true
      },
      "test-debug": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.debug.html dot',
        stdout: true
      },
      "test-debug-min": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.debug.min.html dot',
        stdout: true
      },
      "test-dist": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.dist.html dot',
        stdout: true
      },
      "test-dist-min": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.dist.min.html dot',
        stdout: true
      }
    }
  });

  grunt.registerTask('default', 'lint exec:test concat:debug min:debug exec:test-debug exec:test-debug-min exec:build-dist min:dist exec:test-dist exec:test-dist-min');
  grunt.loadNpmTasks('grunt-exec');
};
