const knex = require('knex');

module.exports = {
  port: 8000,
  wtIndexAddress: '0x933198455e38925bccb4bfe9fb59bac31d00b4d3',
  ethereumProvider: 'https://ropsten.infura.io/WKNyJ0kClh8Ao5LdmO7z',
  swarmProvider: 'https://swarm-gateways.net/',
  db: knex({
    client: 'sqlite3',
    connection: {
      filename: './.ropsten.sqlite',
    },
    useNullAsDefault: true,
  }),
};
