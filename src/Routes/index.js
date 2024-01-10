module.exports = (app) => {
  require('./UsersRouter')(app);
  require('./Pumps')(app);

};
