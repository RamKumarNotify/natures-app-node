const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModels');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

mongoose.connect('mongodb://localhost:27017/natours') .then(() => {
    console.log('DB Connected..||');
});

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importTours = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("Data Saved..!");
    } catch(err) {
        console.log(err);
    }
    process.exit();
};

const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Deleted..!");
    } catch(err) {
        console.log(err);
    }
    process.exit();
};

// console.log(process.argv);
if(process.argv[2] === '--import') {
    importTours();
} else if(process.argv[2] === '--delete') {
    deleteTours();
}