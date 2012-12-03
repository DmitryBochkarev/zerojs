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
        command: 'mocha-phantomjs -R dot test/runner.html',
        stdout: true
      }
    }
  });

  grunt.registerTask('default', 'lint exec:test concat:dist min:dist');
  grunt.loadNpmTasks('grunt-exec');
};
