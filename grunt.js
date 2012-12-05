module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      src: ['src/*.js']
    },
    concat: {
      dist: {
        src: [
          'src/base.js',
          'src/event_handler.js',
          'src/event_emitter.js',
          'src/observable.js',
          'src/computed.js',
          'src/subscriber.js',
          'src/isolation_call_context.js',
          'src/isolation.js'
        ],
        dest: 'dist/zero.js'
      }
    },
    min: {
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
      test: {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.html dot',
        stdout: true
      },
      "test-cov": {
        command: ' rm -rf src-cov && jscoverage src src-cov && phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner-cov.html json-cov | node helpers/cov/buildHTML.js > coverage.html',
        stdout: true
      },
      "test-dist": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.dist.html dot',
        stdout: true
      },
      "test-min": {
        command: 'phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner.dist.min.html dot',
        stdout: true
      }
    }
  });

  grunt.registerTask('default', 'lint exec:test concat:dist min:dist exec:test-dist exec:test-min');
  grunt.loadNpmTasks('grunt-exec');
};
