const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const registerValidation = (data) => {
    const schema = Joi.object({
        FullName: Joi.string().min(6).required(),
        DayOfBirth: Joi.date().format('YYYY/MM/DD'),
        Email: Joi.string().email().max(256).required(),
        PhoneNumber: Joi.string().regex(/(09|01[2|6|8|9])+([0-9]{8})\b/),
        Description: Joi.string().required(),
        Password: Joi.string().min(6).required()
    })

    return schema.validate(data);
}
const loginValidation = (data) => {
    const schema = Joi.object({
        Email: Joi.string().min(6).required(),
        Password: Joi.string().min(6).required()
    })

    return schema.validate(data);
}
const validDocumentCategory = (data) => (data) => {
    const schema = Joi.object({
        Title: Joi.string().min(6).required(),
        Description: Joi.string().required()
    })

    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.validDocumentCategory = validDocumentCategory;