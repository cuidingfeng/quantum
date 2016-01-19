var watch = require('../lib/watch.js');
module.exports = function(req, res){
    watch("E:/work/test");
    res.send('book index');
};
