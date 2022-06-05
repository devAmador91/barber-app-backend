const { response, request } = require("express")
const { PagoModel, PurchaseOrder, ProductsModel, UserModel } = require("../models")
const {sendMail} = require('../helpers/functionSendMail');
const fetch = require('node-fetch');


//ESTO ES SI POR EL FRONT (PERFIL ADMIN NECESITA SABER INFO DEL PAGO, RELACIONADO CON LA ORDEN DE COMPRA)

const getPago = async (req = request, res = response) => {

  try {
    const pago = await PagoModel.findAll({
      where: {
        pagado
      },
      attributes: ["formaPago", "idPurchaseOrder", "id", "pagado"]
    });

    res.status(200).json({
      ok: true,
      pago
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getPagoId = async (req = request, res = response) => {
  const {idUser} = req.params

  try {
    const dataPurchase = await PurchaseOrder.findAll({
      where: {
        idUser
      }
    });

    let listPayments = [];

    for(let i = 0; i < dataPurchase.length; i++){

        listPayments = [...listPayments, await PagoModel.findOne({
        where:{
          idPurchaseOrder: dataPurchase[i].id
        }
      })]

      console.log(listPayments);

    }

    

    res.status(200).json({
      ok: true,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};



const confirmarPago = async (req = request, res = response) => {

  let pruebaData = {
    "id": 4877016187,
    "status": "closed",
    "external_reference": "",
    "preference_id": "1127725912-de653ff7-7e5a-4628-b003-9cd2fb7fa390",
    "payments": [
        {
            "id": 22819489769,
            "transaction_amount": 1000,
            "total_paid_amount": 1000,
            "shipping_cost": 0,
            "currency_id": "MXN",
            "status": "approved",
            "status_detail": "accredited",
            "operation_type": "regular_payment",
            "date_approved": "2022-06-01T19:21:31.000-04:00",
            "date_created": "2022-06-01T19:21:30.000-04:00",
            "last_modified": "2022-06-01T19:21:31.000-04:00",
            "amount_refunded": 0
        }
    ],
    "shipments": [],
    "payouts": [],
    "collector": {
        "id": 1127725912,
        "email": "",
        "nickname": "TESTWKNQUAMG"
    },
    "marketplace": "NONE",
    "notification_url": "https://barber-app-henry.herokuapp.com/api/pago/confirmation",
    "date_created": "2022-06-01T19:21:29.864-04:00",
    "last_updated": "2022-06-01T19:21:31.565-04:00",
    "sponsor_id": null,
    "shipping_cost": 0,
    "total_amount": 1000,
    "site_id": "MLM",
    "paid_amount": 1000,
    "refunded_amount": 0,
    "payer": {
        "id": 1127730130,
        "email": ""
    },
    "items": [
        
        {
            "id": "f527ca1f-4db8-49a6-a819-20a31b9f8c18",
            "category_id": "f4abe336-f086-4428-81b6-49227cc8a3c3",
            "currency_id": "MXN",
            "description": "pelo",
            "picture_url": null,
            "title": "crema bigotes",
            "quantity": 15,
            "unit_price": 50
        },
        {
          "id": "9f02c36b-eb9f-4964-88a1-47a411d5e537",
          "category_id": "f4abe336-f086-4428-81b6-49227cc8a3c3",
          "currency_id": "MXN",
          "description": "pelo",
          "picture_url": null,
          "title": "shampoo",
          "quantity": 15,
          "unit_price": 50
      },
      {
        "id": "56911ed2-7731-419d-9374-cffd27f942f0",
        "category_id": "f4abe336-f086-4428-81b6-49227cc8a3c3",
        "currency_id": "MXN",
        "description": "pelo",
        "picture_url": null,
        "title": "gel",
        "quantity": 15,
        "unit_price": 50
    }
    ],
    "cancelled": false,
    "additional_info": "",
    "application_id": null,
    "order_status": "paid"
}


try {
  
  /*if (pruebaData.topic === 'merchant_order') {
    const { id } = req.query;
    const baseUrl = `https://api.mercadolibre.com/merchant_orders/${id}?access_token=APP_USR-4436905275905541-052102-a7820d5ba3ecf53131dc3c6b5f912b59-1127725912`
    */
    /*
    const resp = await fetch(baseUrl)
    const data = await resp.json();
    
    console.log('resp de data', data);
    */

    const { transaction_amount, shipping_cost, currency_id, status, date_approved, operation_type } = pruebaData.payments[0]
    const idPurchaseOrder  = pruebaData.items[0].category_id
  
    
      //Generar Pago en la base de datos

      if (!pruebaData.cancelled && status === 'approved') {
        const newPago = await PagoModel.create({
          transaction_amount,
          shipping_cost,
          currency_id,
          status,
          date_approved,
          operation_type,
          idPurchaseOrder
        })

        // Modificar Stock

        let foundProduct = []
        let actualizacion = [];

        for (let i = 0; i < pruebaData.items.length; i++) {
          foundProduct = [...foundProduct, await ProductsModel.findOne({ where: { id: pruebaData.items[i].id } })];
          actualizacion = [...actualizacion, await ProductsModel.update({ stock: foundProduct[i].stock - pruebaData.items[i].quantity }, {
            where: {
              id: pruebaData.items[i].id
            }
          })];
        }

        //Actualizar estado de la orden de compra
        const updateStatus = await PurchaseOrder.update({status: true},{
          where:{
            id: idPurchaseOrder
          }
        });

        //Notificar al usuario por email con toda la informacion

        //Busca el id del usuario en el modelo de PurchseOrder
        const datosOrden = await PurchaseOrder.findByPk(idPurchaseOrder);
        
        // extraemos al usuario con el id dentro de datosOrden
        const findUser = await UserModel.findByPk(datosOrden.idUser);

        const {email, name} = findUser;
        
        
       
        sendMail(name.toUpperCase(), email,idPurchaseOrder, date_approved, transaction_amount, pruebaData);


        //Mandar Notificacion ---> Sockets --> perfil


        const json = await response.json();

        return res.json({
          ok: true
        });

      }
    
    } catch (error) {
      console.log(error)
      res.status(500).json({
        ok: false,
        msg: 'Hable con el administrador'
      })
    }
  }


module.exports = {
    getPago,
    confirmarPago,
    getPagoId
  }
