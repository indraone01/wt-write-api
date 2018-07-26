const WTLibs = require('@windingtree/wt-js-libs');
const knex = require('knex');

module.exports = {
  port: 8100,
  wtLibs: WTLibs.createInstance({
    dataModelOptions: {
      provider: 'http://localhost:8645',
    },
    offChainDataOptions: {
      adapters: {
        dummy: {
          options: {},
          create: () => {
            return {
              download: () => { return { dummy: 'content' }; },
            };
          },
        },
      },
    },
  }),
  wtIndexAddress: '0xdummy',
  logHttpTraffic: false,
  db: knex({
    client: 'sqlite3',
    connection: {
      filename: './.test.sqlite',
    },
    useNullAsDefault: true,
  }),
};
