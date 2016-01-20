var watch = require('../lib/watch.js');
module.exports = function(req, res){
  var path = "E:/work/test";
  if(req.query.method === "add"){
    watch.add(path);
  }
  if(req.query.method === "clear"){
    watch.clear(path);
  }
  res.send('ok');
};
