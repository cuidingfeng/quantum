var chokidar = require('chokidar');
var util = require('util');
var path = require('path');

var patterns, root;

function isMaster() {
  var argv = process.argv;
  return !~argv.indexOf('--child-flag');
}

var child_process = require('child_process');

function respawn() {
  var argv = process.argv
  var child = child_process.spawn(argv[0], argv.slice(1).concat('--child-flag'));
  child.stderr.pipe(process.stderr);
  child.stdout.on('data', function(data) {
    if (~data.toString('utf-8').indexOf('Currently running fis3')) {
      return;
    }
    process.stdout.write(data);
  });
  child.on('exit', function(code, signal) {
    process.on('exit', function() {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code);
      }
    });
  });
  return child;
}

var watcher;

function watch(watchPath) {
  // 用子进程去 watch.
/*  if (isMaster()) {
    return (function() {
      var damen = arguments.callee;
      var child = respawn();

      child.on('exit', function(code) {
        code || damen();
      });
    })();
  }*/
console.log("**************************************"+123);
  root = watchPath;

  var opts = {
    usePolling: false,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: false,
    ignored: function(filepath) {

      // normalize filepath
      filepath = filepath.replace(/\\/g, '/');
      filepath.indexOf(root) === 0 && (filepath = filepath.substring(root.length));
      //忽略的文件
      return false;
    }
  };

  watcher = chokidar
    .watch(root, opts)
    .on('add', function(path){
      console.log("add:"+path);
    })
    .on('change', function(path){
      console.log("change:"+path);
    })
    .on('unlink', function(path){
      console.log("unlink:"+path);
    })
    .on('unlinkDir', function(path){
      console.log("unlinkDir:"+path);
    })
    .on('error', function(err) {
      console.log(err);
    });

}

module.exports = watch;
