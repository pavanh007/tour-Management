/* eslint-disable node/no-unsupported-features/es-syntax */
// eslint-disable-next-line no-unused-vars
class APIFeatues {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A. Filtering the query means after the ? (question mark)
    const queryObj = { ...this.queryString };
    console.log(queryObj);
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B. advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|lte|gt|eq|lt)\b/g, //
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //2.  Sorting
    if (this.queryString.sort) {
      // console.log(this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; //means return entire object
  }

  limitFields() {
    //3. Field limiting filtering
    // Select pattern  .select("firstParam secondParam"), it will only show the selected field, add minus sign for excluding (include everything except the given params)
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // means : select everything except " __V"
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    //previous page - total no/- of documents
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1-10, page 1; 11-20, page 2; 21-30 page 3;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatues;
