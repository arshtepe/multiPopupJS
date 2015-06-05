module.exports = function (grunt) {
    grunt.initConfig({
        monic: {
            compile: {
                options: {
                    flags: {
                        ie: true
                    }
                },

                files: {
                    './dist/multiPopup.js': ['src/popup.js']
                }
            }
        },

        uglify: {
            build:{
                files: {
                    'dist/multiPopup.min.js': ['dist/multiPopup.js']
                }
            }
        },

        watch: {
            scripts: {
                files: ['src/*.js'],
                tasks: [ 'monic', 'uglify' ]
            }
        }
    });



    grunt.loadNpmTasks('grunt-monic');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['monic', 'uglify', "watch"]);
};