const path = require('path');
const express = require("express");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mangoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
//const cors = require('cors');

const AppError = require('./utils/appError');
const globalError = require('./controllers/errorController');
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

app.engine('pug', require('pug').__express)

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//app.use(cors());
//app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);

if(process.env.NODE_ENV === 'development') {
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 100 Request within 1 hour
    message: 'Too many Request from the same IP'
});
app.use('/api', limiter);

app.use(express.json( { limit: '10kb' } ));
app.use(express.urlencoded({ extended: true, limit: '10kb'}))
app.use(cookieParser());

app.use(mangoSanitize());
app.use(xss());

//app.use(express.static(`${__dirname}/public`));

app.use((req,res,next) => {
    console.log("Hello from middle Ware");
    next();
});

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// app.route('/api/v1/tours').get(getAllTours).post(createTours);
// app.route('/api/v1/tours/:id').get(getTour);

app.all('*', (req,res,next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server !`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server !`);
    // err.statusCode = 404;
    // err.status = 'fail';

    next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404));
});

app.use(globalError);

module.exports = app;