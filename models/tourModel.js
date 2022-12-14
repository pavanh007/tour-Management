// eslint-disable-next-line import/newline-after-import
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `A tour must have a name`],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less or equal to 40 characters'],
      minlength: [3, 'A tour name must be greater or equal to 3 characters'],
      // validate: [validator.isAlpha, 'Tour name only contains alpha characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, `A tour must have a duration`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `A tour must have a max group size`],
    },
    difficulty: {
      type: String,
      required: [true, `A tour must have a difficulty`],
      enum: {
        values: ['medium', 'difficult', 'easy'],
        message: 'A tour must have a difficulty',
      },
    },
    ratingsAvgerage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `A tour must have a price`],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //NOTE - [this] only points to current doc on NEW document creation
          return val < this.price;
        },
        message:
          'A tour must have a price ({VALUE}) and a priceDiscount should less than price!',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `A tour must have a summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `A tour must have a cover image`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secreteTour: {
      type: Boolean,
      default: false,
    },
    startLocation:{
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },

);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//NOTE - DOCUMENT MIDDLEWARE: runs before the .save() and .create()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//NOTE - for embeding the user data with tour data
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises)
//   next();
// })


//NOTE -QUERY MIDDLEWARE: runs after

//Here .this keyword point to the current query
tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  //NOTE - In query middleware [this] always refers to current query
  this.populate({
    path: 'guides',
    //stop showing the these 2 data into the tout details
    select: '-__v -passwordChangedAt',
  });
  next();
})

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//NOTE - AGGREGATATION MIDDLEWARE:

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
