const router = require('express').Router()
const { check } = require('express-validator');
const { validarCampos, 
        validarJWT,
        esAdminRol } = require('../middlewares');
const { getCategories, addCategorie, patchCategories } = require('../controllers/categories.js');

router.post('/', [
    validarJWT,
    esAdminRol,
    check('categorie', 'Categorie is required').not().isEmpty().isString(),
    validarCampos
], addCategorie)

router.get('/', [
    check('categorie', 'Categorie is not valid').isString(),
], getCategories)

// router.get('/:id', [
//     check('id', 'Id is not valid').isUUID(),
// ], getCategorie)

router.patch('/:idCategorie', [
    check('categorie', 'Categorie is not valid').isString(),
], patchCategories)







module.exports = router;