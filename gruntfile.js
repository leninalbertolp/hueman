
module.exports = function(grunt) {
	var path = require('path');
  var _ = require('lodash');
	var global_config = {
		// path to task.js files, defaults to grunt dir
      configPath: path.join(process.cwd(), 'grunt-tasks-config/'),
      // auto grunt.initConfig
      init: true,
      // data passed into config ( => the basic grunt.initConfig(config) ). Can be used afterwards with < %= test % >
      data: {
      pkg: grunt.file.readJSON( 'package.json' ),
      paths : {
        front_css : 'assets/front/css/',
        front_js : 'assets/front/js/',
        global_js : 'assets/global/',
        admin_css : 'assets/back/css/',
        admin_js : 'assets/back/js/',
        lang : 'languages/'
      },
			//default less modifiers
			is_rtl: 'true',
			//https://www.npmjs.org/package/grunt-ssh
			//Check if the context var is set and == travis => avoid travis error with ftpauth no found
			credentials : 'travis' == grunt.option('context') ? {} : grunt.file.readJSON('.ftpauth'),
			hueman_tasks : {
				//DEV : clean the build and watch changes (see watch task)
				'hueman_dev': [ 'watch'],

				//PROD
        'prepare_front_css' : ['concat:front_css', 'concat:front_not_responsive_css', 'cssmin:front_css', 'cssmin:font_awesome_css'],
        'prepare_front_js' : ['jshint:front_js', 'uglify:front_js'],

				'prod_build':  ['prepare_front_css', 'prepare_front_js', 'cssmin:admin_css', 'replace', 'clean', 'copy', 'compress'],
				// //final build meta task
				// 'hueman_build' : ['prod_front_css', 'prod_front_js', 'prod_admin_css_js', 'prod_build'],

				//TRAVIS ci virtual machine build check on js @todo check other resources?
				'travis' : ['jshint'],
			},
			uglify_requested_paths : {
				src : '' || grunt.option('src'),
				dest : '' || grunt.option('dest')
			}
		}
	};

	// LOAD GRUNT PACKAGES AND CONFIGS
	// https://www.npmjs.org/package/load-grunt-config
	require( 'load-grunt-config' )( grunt , global_config );

	//http://www.thomasboyt.com/2013/09/01/maintainable-grunt.html
	//http://gruntjs.com/api/grunt.task#grunt.task.loadtasks
	//grunt.loadTasks('grunt-tasks');
	// REGISTER TASKS
  _.map( grunt.config('hueman_tasks'), function(task, name) {
    grunt.registerTask(name, task);
  });
	//DEV WATCH EVENT
	//watch is enabled only in dev mode
	grunt.event.on('watch', function(action, filepath, target) {
		var files = [
			{
				expand: true,
				cwd: '.',
				src: [
				filepath,
				]
			}
		];
		grunt.log.writeln( 'WATCH EVENT INFOS : ', grunt.task.current.name , action, filepath, target);

		if ( 'admin_customizer_control_js' == target || 'admin_js' == target ) {
			//if some js admin scripts have been changed in dev mode, jshint them dynamically
			grunt.config('jshint.those', [filepath]);
		}
	});
};