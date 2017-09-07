const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply and address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Here we define our indexes

storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) {
    next(); //skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have the same slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx});
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1} }},
    { $sort: { count: -1}}
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
      //Lookup stores and populate their reviews. For some reason mongoDB changes the Review model's name to lowercase "'r'eview + s"
      { $lookup: {from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'}},
      //filter for only items that have 2 or more reviews. In mongo.DB, indexes are chosen with '.i' (reviews.1). One can use them to filter limit by looking up whether a specific amount/an item at a certain index exists (with $exists: true)
      { $match: {'reviews.1': { $exists: true}}},
      //Add the average reviews field. If you are on a newer version of mongoDB, $addFields can be used. On the other hand, if your version of mongoDB is 3.2 or older, you have to use $project and then add the needed fields again
      { $addFields: {
        averageRating: {$avg: '$reviews.rating' }
      }}, 
      //Sort it by our new fields.
      { $sort: {averageRating: -1}},
      //Limit to 10
      { $limit: 10}
    ]);
};

//it finds reviews where the store's ID property is equal to the review's store property

storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
};

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
