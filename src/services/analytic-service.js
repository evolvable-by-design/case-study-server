const Errors = require('../utils/errors');
const Analytic = require('../models/Analytic');

class AnalyticService {

  constructor(analyticRepository) {
    this.analyticRepository = analyticRepository
  }

  create(resourceId) {
    this.analyticRepository.save(Analytic.of(resourceId))
  }

  findByResourceId(resourceId) {
    const analytic = this.analyticRepository.findBy('resourceId', resourceId)
    if (analytic) return analytic

    throw new Errors.NotFound('Resource with id ' + resourceId)
  }

  update(resourceId) {
    const analytic = this.findByResourceId(resourceId)
    this.analyticRepository.save(analytic.update())
  }

}

module.exports = AnalyticService;
