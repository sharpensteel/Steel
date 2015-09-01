"use strict";


function get_global_scope(){
	return (function(){
		return this || (0,eval)("this");
	})();
}


/**
 * makes series of tests of essential features of ES6 support in browser  ***all tests running in strict mode***
 * @param {boolean} enable_trace
 * @returns {boolean}
 */
function detect_es6_support(enable_trace){
	var g = get_global_scope();
	if(g.DETECT_ES6_SUPPORT_RESULT != undefined && !enable_trace)
		return g.DETECT_ES6_SUPPORT_RESULT;

	g.DETECT_ES6_SUPPORT_RESULT = false; // todo: actual detecting

	// tests taken from https://kangax.github.io/compat-table/es6/
	var tests = {
		'let:  for-loop statement scope': 'let baz = 1; for(let baz = 0; false; false) {} return baz === 1;',
		//'let:  for-loop iteration scope': 'let scopes = []; for(let i = 0; i < 2; i++) { scopes.push(function(){ return i; }); } let passed = (scopes[0]() === 0 && scopes[1]() === 1); scopes = []; for(let i in { a:1, b:1 }) { scopes.push(function(){ return i; }); } passed &= (scopes[0]() === "a" && scopes[1]() === "b"); return passed;' ,
		'class: constructor': 'class C { constructor() { this.x = 1; } } return C.prototype.constructor === C && new C().x === 1;',
		'class: static accessor properties': 'var baz = false; class C { static get foo() { return "foo"; } static set bar(x) { baz = x; } } C.bar = true; return C.foo === "foo" && baz;',
		'class: anonymous class': 'return typeof class {} === "function";'
	}

	var all_passed = true;
	for(var test_name in tests){
		var test_body = tests[test_name];
		var passed = false;
		try{
			if(enable_trace) console.log('ES6 test: `'+test_name+'` ...');
			var test_function = Function("'use strict'; "+test_body);
			passed = test_function();
			if(enable_trace) console.log('ES6 test `'+test_name+'` result: ',passed);
		}
		catch(e){
			if(enable_trace) console.error('error during ES6 test `'+test_name+'`: ', e, '  test_body:', test_body);
		}
		all_passed = all_passed && passed;

	}

	g.DETECT_ES6_SUPPORT_RESULT = all_passed;

	return g.DETECT_ES6_SUPPORT_RESULT;
}



/**
 * loads scripts written at ES6, one by one.
 *
 * detects whenever browser supports ES6 natively.
 * if ES6 supported, scripts will be loaded/executed via addind <script> tags to document
 * if ES6 not supported, compiler babel used to load scripts (https://babeljs.io/)
 *
 * 	@param {string} babel_browser_js_url babel compiler, https://babeljs.io/
 * 	@param {string[]} urls scripts  urls to load
 * 	@param {bool} enable_trace write in console wich files started/finished to load
 * 	@param {function} on_complete_all will be called when all scripts is loaded
 */
function load_scripts_es6(urls, babel_browser_js_url, enable_trace, on_complete_all){
	var g = get_global_scope();

	var default_context = { babel: g.babel, babel_is_loading: false, babel_urls_pending: [], on_babel_avaliable_arr: []};
	g.LOADER_SCRIPTS_ES6 = g.LOADER_SCRIPTS_ES6 || default_context;
	var _ = g.LOADER_SCRIPTS_ES6;


	var load_script_native = function load_script_native(url, callback){

		if(enable_trace) console.log('load_script_native start: ', url);

		var script = document.createElement('script');
		script.src = url;
		//script.setAttribute("type","text/babel");
		script.onload = function(){
			if(enable_trace) console.log('load_script_native complete: ', url);
			if(callback) callback();
		};
		document.head.appendChild(script);
	}

	var load_script_babel = function load_script_babel(url, callback){
		if(enable_trace) console.log('load_script_babel start: ', url);

		_.babel.load(url, function (err, result) {
			if(enable_trace) console.log('load_script_babel complete: ', url);
			//result; // => { code, map, ast }
			if(callback) callback();
		});
	}


	var load_scripts = function load_scripts(load_secript, urls, on_complete){
		var funcs=[];

		if(!urls.length) {
			if(on_complete) on_complete();
			return;
		}

		var func_last = on_complete;
		for(var i=urls.length-1; i>=0; i--){

			var func = (function(_url,_callback){
				return function(){ load_secript(_url, _callback) }
			})(urls[i], func_last);

			funcs[i] = func;
			func_last = func;
		}

		func_last(); // start chain of calls
	}

	if(!detect_es6_support()){
		if(_.babel){
			load_scripts(load_script_babel,urls, on_complete_all);
		}
		else{

			if(enable_trace) console.log('load_scripts_es6: scripts waiting for babel:',urls)

			var on_babel_avaliable = function on_babel_avaliable(){
				load_script_native(babel_browser_js_url, function(){
					_.babel = g.babel;
					load_scripts(load_script_babel, urls, on_complete_all);
				});
			}
			_.on_babel_avaliable_arr.push(on_babel_avaliable);

			if(!_.babel_is_loading){
				_.babel_is_loading = true;

				load_script_native(babel_browser_js_url, function(){
					_.babel = g.babel;
					if(enable_trace) console.log('load_scripts_es6: babel is loaded: ', !!_.babel);
					_.babel_is_loading = false;
					for(var i=0; i<_.on_babel_avaliable_arr.length; i++){
						_.on_babel_avaliable_arr[i]();
					}
				});
			}
		}
	}
	else{
		load_scripts(load_script_native,urls, on_complete_all);
	}

}
