module.exports = class Player {
  #connection;
  account;

  constructor(connection) {
    this.#connection = connection;
    this.account = this.#connection.account;
  }

  stair = 0
  chosen = 0;

  write = (...messages) => {
    (messages.reduceRight((callable, message) => () => this.#connection.write(
      typeof message === 'string' ? message : message.toString(),
      'utf8',
      function() { callable(); }
    ), function() {}))();
  };
}
