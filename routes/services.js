const router = require('express').Router()
const {check} = require('express-validator');
const validarCampos = require('../middlewares/validar-campos.js');
const {validarHora, validarImg} = require('../helpers/customValidators.js');
const {addService,getServices, getService} = require('../controllers/service.js');

router.post('/', [
    check('name', 'name is required').not().isEmpty().isString(),
    check('detail', 'detail is required').not().isEmpty().isString(),
    check('price', 'price is required' ).not().isEmpty().isFloat(),
    check('time').custom(validarHora),
    check('img').custom(validarImg),
    validarCampos
], addService)

router.get('/', [
    check('name', 'Name is not valid').isString(),
], getServices)

router.get('/:id', [
    check('id', 'Id is not valid').isUUID(),
], getService)






module.exports = router;