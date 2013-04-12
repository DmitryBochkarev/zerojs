module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      src: ['src/*.js']
    },
    concat: {
      debug: {
        src: [
          'helpers/src/before.js',
          'src/base.js',
          'src/set.js',
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
    uglify: {
      debug: {
        src: ['dist/zero-debug.js'],
        dest: 'dist/zero-debug.min.js'
      },
      dist: {
        src: ['dist/zero.js'],
        dest: 'dist/zero.min.js'
      }
    },
    watch: {
      files: ['<%= jshint.src %>', 'test/*'],
      tasks: 'jshint exec:test'
    },
    exec: {
      'build-dist': {
        command: 'node helpers/removeDebug.js dist/zero-debug.js dist/zero.js',
        stdout: true
      }/*,
      "test-cov": {
        command: ' rm -rf src-cov && jscoverage src src-cov && phantomjs node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/runner-cov.html json-cov | node helpers/cov/buildHTML.js > coverage.html',
        stdout: true
      }  */
    },
    mocha_phantomjs: {
      options: {
        reporter: 'dot'
      },
      test: {
        src: ['./test/runner.html']
      },
      "test-debug": {
        src: ['./test/runner.debug.html']
      },
      "test-debug-min": {
        src: ['/test/runner.debug-min.html']
      },
      "test-dist": {
        src: ['./test/runner.dist.html']
      },
      "test-dist-min": {
        src: ['./test/runner.dist-min.html']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('dev', [
    'jshint',
    'mocha_phantomjs:test'
  ]);

  grunt.registerTask('default', [
    'jshint', 'mocha_phantomjs:test',
    'concat:debug', 'uglify:debug',
    'mocha_phantomjs:test-debug', 'mocha_phantomjs:test-debug-min', 'exec:build-dist',
    'uglify:dist', 'mocha_phantomjs:test-dist', 'mocha_phantomjs:test-dist-min'
  ]);
};
