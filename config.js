module.exports = {
  DEV_PORT: 14576,
  LIVERELOAD_PORT: 46874,
  envs:{
    testing: {
      domain: 'https://apptest.artgun.biz',
      ftp_host: 'waws-prod-ch1-013.ftp.azurewebsites.windows.net',
      ftp_user: 'artguntesting',
      ftp_password: 'Qap7vzuTPbnMzxCJijnT7u99roAojLBHpm1bxsF6aoF5wWLjxEXngfc2Ac15',
      dir: '/site/wwwroot',
      secure: true
    },
    dev: {
      domain: 'https://appdev.artgun.biz',
      ftp_host: 'waws-prod-ch1-013.ftp.azurewebsites.windows.net',
      ftp_user: 'artgundev',
      ftp_password: '1mxypn8kcJvlHMWthjTMDX2KwWHDbKG68WvEjY0hD64TXSdhou1PPdjGhi9X',
      dir: '/site/wwwroot',
      secure: true
    },
    production: {
      domain: 'https://app.artgun.biz',
      ftp_host: 'waws-prod-ch1-013.ftp.azurewebsites.windows.net',
      ftp_user: 'artgunapp',
      ftp_password: '728QJSSurztujckEDvR5j5kjA4Ytf1vrSoBq3T6XFjsR4XiPprrgygEXssLa',
      dir: '/site/wwwroot',
      secure: true
    },
    nois: {
      domain: '',
      ftp_host: '',
      ftp_user: '',
      ftp_password: '',
      dir: '/',
      secure: false
    }
  }
};
