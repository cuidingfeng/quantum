var chokidar = require('chokidar');
var deploy = require('deploy');
var path = require('path');

var patterns, root, watchPaths = [];

function setWatchPath(path, watcher){
  if(!getWatchPath(path)){
    watchPaths.push({
      path: path,
      watcher: watcher
    });
  }
}

function getWatchPath(path){
  for (var o of watchPaths) {
    if(o.path === path){
      return o;
    }
  }
}

function clearWatchPath(path){
  var i=0;
  for (var o of watchPaths) {
    if(o.path === path){
      o.watcher.close();
      watchPaths.splice(i, 1);
      console.log("断开："+ o.path);
    }
    i++;
  }
}

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

  //如果当前要监听的目录已经在监听，则返回。
  if(getWatchPath(root)){
    return;
  }
  console.log("监听："+ root);
  watcher = chokidar
    .watch(root, opts)
    .on('add', function(path){
      console.log("add:"+path);
      deploy(root, path);
    })
    .on('change', function(path){
      console.log("change:"+path);
      deploy(root, path);
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
    setWatchPath(root, watcher);

}

module.exports = {
  add: watch,
  clear: clearWatchPath,
  get: getWatchPath,
};
