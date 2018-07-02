const { assert } = require('chai');

const { getDescription, getRatePlans,
  getAvailability } = require('./utils/fixtures');

const { validateDescription, validateRatePlans,
  validateAvailability } = require('../src/validators');


describe('validators', function () {
  describe('validateDescription', () => {
    it('should pass when the data is correct', () => {
      validateDescription(getDescription());
    });

    it('should fail when a required attribute is missing', () => {
      let desc = getDescription();
      delete desc.name;
      assert.throws(() => validateDescription(desc), /Missing required property: name/);
    });

    it('should fail when an unknown attribute is provided', () => {
      let desc = getDescription();
      desc.period = 'Middle Ages';
      assert.throws(() => validateDescription(desc), /Unknown property/);
    });
  });

  describe('validateRatePlans', () => {
    it('should pass when the data is correct', () => {
      validateRatePlans(getRatePlans());
    });

    it('should fail when a required attribute is missing', () => {
      let plans = getRatePlans();
      delete plans.basic.name;
      assert.throws(() => validateRatePlans(plans), /Missing required property: name/);
    });

    it('should fail when an unknown attribute is provided', () => {
      let plans = getRatePlans();
      plans.basic.colour = 'green';
      assert.throws(() => validateRatePlans(plans), /Unknown property/);
    });
  });

  describe('validateAvailability', () => {
    it('should pass when the data is correct', () => {
      validateAvailability(getAvailability());
    });

    it('should fail when a required attribute is missing', () => {
      let availability = getAvailability();
      delete availability.latestSnapshot.availability.ourOnlyRoom[0].day;
      assert.throws(() => validateAvailability(availability), /Missing required property: day/);
    });

    it('should fail when an unknown attribute is provided', () => {
      let availability = getAvailability();
      availability.certainty = 'maybe';
      assert.throws(() => validateAvailability(availability), /Unknown property/);
    });
  });
});
