const { HttpValidationError } = require('./errors');
const { validateDescription, validateRatePlans,
  validateAvailability } = require('./validators');

const DATA_INDEX_FIELDS = [
  { name: 'description', required: true, validator: validateDescription },
  { name: 'ratePlans', required: false, validator: validateRatePlans },
  { name: 'availability', required: false, validator: validateAvailability },
];

module.exports.createHotel = async (req, res, next) => {
  try {
    // 1. Validate request.
    for (let field of DATA_INDEX_FIELDS) {
      let data = req.body[field.name];
      if (field.required && !data) {
        throw new HttpValidationError('validationFailed', `Missing field: ${field.name}`);
      }
      if (data) {
        field.validator(data);
      }
    }
    // 2. Upload the actual data parts.
    let dataIndex = {};
    for (let field of DATA_INDEX_FIELDS) {
      let data = req.body[field.name];
      if (!data) {
        continue;
      }
      let uploader = req.uploaders.getUploader(field.name);
      dataIndex[`${field.name}Uri`] = await uploader.upload(data);
    }
    // 3. Upload the data index.
    const dataIndexUri = await req.uploaders.getUploader('root').upload(dataIndex);
    // 4. Upload the resulting data to ethereum.
    await req.uploaders.onChain.upload(dataIndexUri);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
