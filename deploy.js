const args = process.argv.splice(2);
const config = require('./config/deploy.config');
const ftpInfo = (args[0] && config.envs[args[0]]) || config.envs['nois'];
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const Client = require('ftp');
const Promise = require('promise');
const path = require('path');
const localDist = __dirname + '/dist';
const ftpClient = require('ftp-client');
const vinylFtp = require('vinyl-ftp');
const vfs = require('vinyl-fs');
const log = require('fancy-log');

const ftpConfig = {
  username: ftpInfo.user,
  password: ftpInfo.password, // optional, prompted if none given
  host: ftpInfo.host,
  port: ftpInfo.port,
  localRoot: localDist,
  remoteRoot: ftpInfo.dir,
  continueOnError: true
  // exclude: ['.git', '.idea', 'tmp/*']
};

function currentDateTimeStamp() {
  var date = new Date();
  return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
}

function clearOldFiles() {
  console.log('Deleting old files...Please wait~');
  return new Promise((resolve) => {
    let c = new Client();
    c.on('ready', () => {
      // get root files
      c.list(ftpInfo.dir, (err, list) => {
        if (err) throw err;
        // get needed files for delete only (front-end files)
        let deleteFiles = list.filter((f)=> {
          return /^(vendor|main|lib|\d+)\..*\.(bundle|chunk)/gi.test(f.name) || f.name === 'index.html';
        }).map((f)=> {
          return [ftpInfo.dir, f.name].join('/');
        });

        let deletePromises = [];

        // Delete js files
        deleteFiles.forEach((fp)=> {
          deletePromises.push(new Promise((r)=> {
            c.delete(fp, (error)=> {
              r();
            })
          }));
        });

        // delete assets templates/json
        let assetsCssFolderPath = [ftpInfo.dir, 'assets', 'css'].join('/');

        deletePromises.push(new Promise((r)=> {
          c.rmdir(assetsCssFolderPath, true, (error)=> {
            r();
          })
        }));

        // delete assets templates
        let assetsTemplatesFolderPath = [ftpInfo.dir, 'assets', 'templates'].join('/');

        deletePromises.push(new Promise((r)=> {
          c.rmdir(assetsTemplatesFolderPath, true, (error)=> {
            r();
          })
        }));

        // delete assets json
        let assetsJsonFolderPath = [ftpInfo.dir, 'assets', 'json'].join('/');
        deletePromises.push(new Promise((r)=> {
          c.rmdir(assetsJsonFolderPath, true, (error)=> {
            r();
          })
        }));

        // delete language files
        let languageFolderPath = [ftpInfo.dir, 'assets', 'languages'].join('/');
        deletePromises.push(new Promise((r)=> {
          c.rmdir(languageFolderPath, true, (error)=> {
            r();
          })
        }));

        Promise.all(deletePromises)
          .then(() => {
            console.log('Deleting old files...Done!');
            c.end();
            c.destroy();
            resolve();
          });
      });
    });
    c.connect({
      host: ftpInfo.host,
      port: ftpInfo.port,
      user: ftpInfo.user,
      password: ftpInfo.password,
      secure: ftpInfo.secure
    });
  })
}

function upload2() {
  console.log('Start uploading progress...');
  let client = new ftpClient({
    host: ftpInfo.host,
    port: ftpInfo.port,
    user: ftpInfo.user,
    password: ftpInfo.password
  }, {
    logging: 'basic',
    overwrite: 'older'
  });

  client.connect(()=> {
    client.upload(['dist/**'], ftpInfo.dir, {
      baseDir: 'dist',
      overwrite: 'older'
    }, function (result) {
      console.log(result);
    });
  });
}

function upload() {
  console.log('Start uploading progress...');
  ftpDeploy.deploy(ftpConfig, function (err) {
    if (err) console.log(err);
    else console.log('Upload successful!!!');
  });

  ftpDeploy.on('upload-error', function (data) {
    console.log(data.err); // data will also include filename, relativePath, and other goodies
  });

  ftpDeploy.on('uploading', function (data) {
    // data.totalFileCount;       // total file count being transferred
    // data.transferredFileCount; // number of files transferred
    // data.percentComplete;      // percent as a number 1 - 100
    // data.filename;             // partial path with filename being uploaded
    var fileName = data.filename.replace(/\\/g, '/');
    fileName = /^\//.test(fileName) ? ftpInfo.dir + fileName : ftpInfo.dir + '/' + fileName;
    console.log(`[${currentDateTimeStamp()}] [UPLOAD] ${fileName}`);
  });

  // ftpDeploy.on('uploaded', function (data) {
  //   console.log(data);         // same data as uploading event
  // });
}

function upload3() {
  console.log('Start uploading progress...');
  var conn = vinylFtp.create({
    host: ftpConfig.host,
    port: ftpConfig.port,
    user: ftpConfig.username,
    pass: ftpConfig.password,
    log: log,
    parallel: 3,
    maxConnections: 5,
    reload: false, // Clear caches before (each) stream, default is false
    idleTimeout: 360,
    secure: ftpConfig.secure
  });

  var globs = [
    'dist/**'
  ];

  vfs.src(globs, {buffer: false})
    // .pipe(conn.newer(ftpConfig.remoteRoot))
    .pipe(conn.dest(ftpConfig.remoteRoot))
    .on('finish', function () {
      console.log('Upload DONE!');
    })
}

// Delete previous version files first then upload new ones
clearOldFiles()
  .then(upload3);

