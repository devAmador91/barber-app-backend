const {Router}= require ("express")
const {validarCampos, validarJWT} = require('../middlewares');
const {getPago, confirmarPago}= require("../controllers/pago")

const router= Router()

router.get("/", [
   validarJWT
], getPago)

router.post("/confirmation", confirmarPago)

module.exports = router;