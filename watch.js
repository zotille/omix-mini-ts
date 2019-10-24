const exec = require('child_process').exec;
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const less = require('less')

function convertExt(fpath) {
  return fpath.replace(/src\//, '').replace(/(.css|.less)$/, '.wxss')
}

function writeFile(fpath) {
  logger(`Style changed due to ${fpath}`, 'warn')
  let content = fs.readFileSync(fpath, 'utf-8')
  less.render(content, {
    filename: path.resolve(fpath)
  }).then(({ css }) => {
    fs.writeFileSync(convertExt(fpath), css)
  }).catch(error => {
    logger(error, 'error')
  })
  logger('Compiled successfully in ' + (Date.now() - lessTimer) + 'ms', 'done')
}



let logger = (msg, type, time) => {
  switch (type) {
    case 'start': {
      console.log('\033[44;31m START \033[40;30m \033[46;30m' + time + ' \033[40;32m ' + msg + '\033[0m')
      break
    }
    case 'error': {
      console.log('\033[41;37m ERROR\033[40;30m \033[46;30m' + time + '  \033[40;31m ' + msg + '\033[0m')
      break
    }
    case 'warn': {
      console.log('\033[43;30m WARN \033[40;30m \033[46;30m' + time + ' \033[40;33m ' + msg + '\033[0m')
      break
    }
    case 'done': {
      console.log('\033[42;30m DONE \033[40;30m \033[46;30m' + time + '  \033[40;32m ' + msg + '\033[0m')
      break
    }
    default: {
      console.log('\033[45;30m MESSAGE \033[40;30m \033[46;30m' + time + ' \033[40;35m ' + msg + '\033[0m')
    }
  }
}

// 监听TS文件，自动编译JS
let tsTimer, lessTimer;
let tsWatchCallback = function (error, stdout, stderr) {
  console.log(error, stdout, stderr, "<<<<<<")
  if (stderr) {
    console.log(stdout)
    console.log(stderr);
    logger("Compile interruptted with error occured. Check errors above ..", 'error')
  } else {
    let interval = Date.now() - tsTimer;
    logger('Compiled successfully in ' + interval + 'ms', 'done')
  }
};

const watch = chokidar.watch('./src')
watch.on('all', (evt, fpath) => {
  let split = fpath.split('.')
  if (split.length === 2) {
    let ext = split.pop();
    switch (ext) {
      case 'ts': {
        break;
      }
      case 'less': {
        lessTimer = Date.now()
        writeFile(fpath);
        break;
      }
      case 'json':
      case 'wxml': {
        fs.writeFileSync(fpath.replace('src/', ''), fs.readFileSync(fpath))
        break;
      }
    }
  }
})

logger('Start Compile ...', 'start')
tsTimer = Date.now();
var x = exec('tsc -watch', tsWatchCallback);
x.stdout.on('data', _data => {
  let data = JSON.stringify(String(_data).split('\n')[0]);
  let [time, data_] = data.split('\\u001b[0m] ');
  time = time.split('[\\u001b[90m')[1]
  if (!time || !data_) {
    console.log(_data);
    return
  }

  if (/File change detected/.exec(data)) {
    logger(data_, 'warn', time)
  } else if (/Starting compilation/.exec(data)) {
    logger(data_, 'start', time)
  } else if (/Found 0 errors/.exec(data)) {
    logger(data_, 'done', time)
  } else if (/Found .+ error/.exec(data)) {
    logger(data_, 'error', time)
  } else if (/error/.exec(data)) {
    logger(data_, 'error', time)
  } else {
    console.log(data)
  }
})
// x.stdout.on('data', data => { console.log(data)})

