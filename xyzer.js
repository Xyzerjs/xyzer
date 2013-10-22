var domain = require('domain');
var path = require('path');

// 定义伪常量的函数
function def(obj, name, value) {
  if (!obj || !name) return;
  var d = domain.create();

  d.on('error', function (err) {
    if (err) {
      err = err.toString() || err.stack || err;
      if (~err.indexOf('TypeError: Cannot redefine property'))
        console.log(err);
    }
  });

  d.run(function() {
     Object.defineProperty(obj, name, {
      value: value
      , writable: false
      , enumerable: true
      , configurable: false
    });
  });
}

// 创建全局命名空间xyzer，不继承Object.prototype
def(global, 'xyzer', Object.create(null));

// 生产伪常量的函数
def(xyzer, 'define', function (name, value) {
  def(global, name, value);
});

// 判断伪常量是否被定义
def(xyzer, 'defined', function (name) {
  if (Object.prototype.hasOwnProperty.call(global, name))
    return !Object.getOwnPropertyDescriptor(global, name).writable;

  return false;
});

// xyzer的私有方法，为xyzer创建不可被删除和重写的方法或者属性
def(xyzer, '__def', function (name, value) {
  if (typeof name == 'object')
    for (var method in name)
      def(this, method, name[method]);

  else def(this, name, value);
});

// 系统常量
xyzer.define('DIR_XYZER_ROOT', __dirname);
xyzer.define('DIR_XYZER_ETC', __dirname + '/etc');
xyzer.define('DIR_XYZER_LIB', __dirname + '/lib');
xyzer.define('DIR_XYZER_MODULE', __dirname + '/modules');

// 加载xyzer模块
xyzer.__def('load', function (file) {
  if (typeof file == 'object')
    forEach(function (f) {
      xyzer.load(f);
    });
  else xyzer.__def(
    path.basename(file, '.js')
    , require(DIR_XYZER_MODULE + '/' + file));
});
