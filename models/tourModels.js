const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');

const tourSchma = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a Name'],
    unique: true,
    maxlength: [40, 'A tour Name must have 40 Character'],
    minlength: [10, 'A tour Name must have 10 Character'],
    validate: {
      validator: function (val) {
        return validator.isAlpha(val, ['en-GB'], {
          ignore: ' ',
        });
      }
    }
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A Tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A Tour must have a Group Size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a Difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'A difficulty must have only - easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Average should have atleast 1.0'],
    max: [5, 'Average should have a maxium of 5.0'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a Price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return this.price > val;
      }
    },
    message: 'A Discount must have ({VALUES}) Greater the price'
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A Tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have ImageCover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    //GEO Location
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
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
      ref: 'User'
    }
  ]
},
// {
//   strictQuery: 'throw'
// }
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);

tourSchma.index({ price: 1, ratingsAverage: -1 });
tourSchma.index({ slug: 1 });
tourSchma.index({ startLocation: '2dsphere' });

tourSchma.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

tourSchma.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchma.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchma.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v'
  });

  next();
})

// This is for embedding the documents
// tourSchma.pre('save', async function(next) {
//   const guidePromise = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromise);
//   next();
// });

// tourSchma.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

tourSchma.pre(/^find/, function(next) {
  // this.secretTour = slugify(this.secretTour, { $ne: true });
  this.find({secretTour: { $ne: true }});

  this.start = Date.now();
  next();
});

tourSchma.post(/^find/, function(docs, next) {
  // this.secretTour = slugify(this.secretTour, { $ne: true });
  // this.find({secretTour: { $ne: true }});
  console.log(`Query took ${Date.now() - this.start} milliseconds.`)

  // console.log(docs);
  next();
});

// tourSchma.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } } );
//   console.log(this.pipeline());
//   next();
// });

const tour = mongoose.model('Tour', tourSchma);

module.exports = tour;