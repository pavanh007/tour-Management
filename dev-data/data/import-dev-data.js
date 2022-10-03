/* eslint-disable import/no-useless-path-segments */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB connection established`));

//reading the JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, `utf-8`)
);

//Import the tour into the database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log(`Data successfully imported`);
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(`Data deleted successfully 👋🏽👋🏽`);
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
