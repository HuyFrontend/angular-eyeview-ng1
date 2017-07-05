Requirements
```
NODE
node >= 6.2.2
npm >= 3.9.5
(https://nodejs.org/en/)

PYTHON
(http://www.activestate.com/activepython/downloads)
```

How to run
```
$ npm install -g webpack webpack-dev-server
$ npm install
```

DEVELOPMENT
```
// Run dev server
$ npm run server

// Open broswer and go to localhost:3001
```



BUILD
```
// Build
// profile is: production, staging or nois, please change profile config in config/deploy.config.js
$ npm run build:<profile>
```

DEPLOYMENT
```
// profile is: production, staging or nois, please change profile config in config/deploy.config.js

// Build and deploy
$ npm run build:deploy:<profile>

// Deploy only
$ npm run deploy:<profile>
```

ENABLE CONTENT COMPRESSION (.NET)
```
<system.webServer>
  <httpCompression directory="%SystemDrive%\inetpub\temp\IIS Temporary Compressed Files">
    <scheme name="gzip" dll="%Windir%\system32\inetsrv\gzip.dll" staticCompressionLevel="9" />
    <dynamicTypes>
      <add mimeType="text/*" enabled="true" />
      <add mimeType="message/*" enabled="true" />
      <add mimeType="application/x-javascript" enabled="true" />
      <add mimeType="application/json" enabled="true" />
      <add mimeType="application/json; charset=utf-8" enabled="true" />   
      <add mimeType="*/*" enabled="false" />
    </dynamicTypes>
    <staticTypes>
      <add mimeType="text/*" enabled="true" />
      <add mimeType="message/*" enabled="true" />
      <add mimeType="application/x-javascript" enabled="true" />
      <add mimeType="application/atom+xml" enabled="true" />
      <add mimeType="application/xaml+xml" enabled="true" />
      <add mimeType="application/json" enabled="true" />
      <add mimeType="*/*" enabled="false" />
    </staticTypes>
  </httpCompression>

  <urlCompression doStaticCompression="true" doDynamicCompression="true" />
</system.webServer>
```

ENABLE STATIC FILE CACHING - 7 Days (.NET)
```
<system.webServer>
  <staticContent>    
     <remove fileExtension=".json" />
     <mimeMap fileExtension=".json" mimeType="application/json" />
	 <remove fileExtension=".woff2" />
     <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
	 <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="7.24:00:00" />
  </staticContent>
</system.webServer>
```


Trouble Shooting:
Running
1. Fix npm version: install npm version 3.9.5 by `$ npm install -g npm@3.9.5`
2. [$injector:unpr] Unknown provider: eProvider <- e => missing /*ngInject*/



Error while building:
1. ModuleNotFoundError: Module not found: Error: Can't resolve 'abc' in 'E:\...\webapp-starter-angular-bootstrap'
 - module 'abc' never be used, remove 'abc' module from entry (webpack.common.js)
