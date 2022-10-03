const express = require('express');
const morgan = require('morgan'); //logger
const rateLimit = require('express-rate-limit'); //limit the request
const helmet = require('helmet'); //add header to request
const mongoSanitize = require('express-mongo-sanitize'); //to remove the sql injection attack
const xss = require('xss-clean'); // for changing html content into diffrent form
const hpp = require('hpp'); //http parameter pollution

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//NOTE - middleware

//Security HTTP headers
app.use(helmet());

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent prameter pollution
app.use(hpp({
  whiteList: [
    'duration',
    'ratingsAvgerage',
    'ratingsQuantity',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

//serving static files
app.use(express.static(`${__dirname}/public/`));

//Development logging configuration
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Testting middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//Setting up the maximum request to server to do action
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100, // means 1 hour
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

//3. ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
