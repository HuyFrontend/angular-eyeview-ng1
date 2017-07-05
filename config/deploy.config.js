module.exports = {
  envs:{
    nois: {
      domain: 'http://nois.newoceaninfosys.com:14116',
      host: '192.168.1.224',
      port: '21',
      user: 'nois_ims',
      password: '123456987',
      dir: '/',
      secure: false, // local
      cdnBaseUrl: '',
      azureBlob: ''
    },
    production: {
      domain: 'https://eyeview.city',
      host: 'waws-prod-sy3-015.ftp.azurewebsites.windows.net',
      port: 21,
      user: 'wowzacctv',
      password: 'AHqPPk6S6v80ZLpsuKPXb01gfeYFLhpDt1LgunXcRlmeZMpzDPEofxgnPNwT',
      dir: '/site/wwwroot',
      secure: true,
      cdnBaseUrl: '',
      azureBlob: '',
      socketioNamespace:'/eyeview'
    },
    staging: {
      domain: 'https://staging.eyeview.city',
      host: 'waws-prod-sy3-015.ftp.azurewebsites.windows.net',
      port: 21,
      user: 'eyeviewstaging',
      password: 'TdrX5iXSmqcRzxhD3Xup07aPJMcXqEn5XpLGuCou1nT8qGCW5M7zlzdTYkwu',
      dir: '/site/wwwroot',
      secure: true,
      cdnBaseUrl: '',
      azureBlob: '',
      socketioNamespace:'/eyeviewstaging'
    }
  },
};
