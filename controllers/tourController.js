/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require(`./../models/tourModel`);
const APIFeatues = require(`./../utils/apiFeatures`);
const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);
//NOTE -  ROUTES
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,description,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatues(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //.populate helps to show the details instead of _id of the user
  const tour = await Tour.findOne({ _id: req.params.id });
  if (!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`), 404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`), 404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOneAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`), 404);
  }
  res.status(200).json({
    status: 'deleted successfully',
    data: {
      tour: tour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAvgerage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAvgerage',
        numTours: { $sum: 1 }, // 1 because every document has passed in pipeline once and increment
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAvgerage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      //converting array elements to separate elements
      $unwind: '$startDates',
    },
    {
      $match: {
        //finding the startDates
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      //grouping the documents based on startDates
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      //giving name as month to _id
      $addFields: { month: '$_id' },
    },
    {
      //hide _id field
      $project: {
        _id: 0,
      },
    },
    {
      // reverse the order
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
