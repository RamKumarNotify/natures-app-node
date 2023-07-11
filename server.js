const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('Uncaught Exception !');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose.connect(process.env.DATABASE_LOCAL) .then(() => {
  // console.log(con.connections);
  console.log('DB Connected..||');
});
// console.log(process.env);

// const testTour = new tour({
//   name: 'circle mountain tou5',
//   price: 379
// });

// testTour.save().then(doc => {
//   console.log(doc);
// }).catch(err => {
//   console.log('Error : ',err);
// });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log("Listen on Port 3000...");
});

process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection !');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
