class ApiFeatures {
  constructor(query, querystr) {
    this.query = query;
    this.querystr = querystr;
  }

  search() {
    const keyword = this.querystr.keyword
      ? {
          name: {
            $regex: this.querystr.keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const querycopy = { ...this.querystr };

    const queryFieldToBeRemoved = ['keyword', 'page', 'limit', 'category'];

    queryFieldToBeRemoved.forEach((key) => {
        if (key === 'category') {
          if (!querycopy[key] || querycopy[key] === '' || querycopy[key] === 'All') {
            delete querycopy[key];
          }
        } else {
          delete querycopy[key];
        }
      }
    );

    let queryCopyString = JSON.stringify(querycopy);

    queryCopyString = queryCopyString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );

    this.query = this.query.find(JSON.parse(queryCopyString));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.querystr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
