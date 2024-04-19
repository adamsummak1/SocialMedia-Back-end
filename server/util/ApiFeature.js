class ApiFeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const queryObj = { ...this.queryStr };
    const limitIncluded = ["sort", "page", "limit", "fields"];
    limitIncluded.map((el) => delete queryObj[el]);

    const queryString = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte|ne|in)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join("");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFielde() {
    if (this.queryStr.fields) {
      const select = this.queryStr.fields.split(",").join("");
      this.query = this.query.select(select);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  pagintaion() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeature;
