const { response, request } = require("express");
const bcryptjs = require("bcryptjs");
const { generarJWT } = require('../helpers');
const { UserModel, Rolmodel, DateModel, EmployeeModel } = require("../models");

const addUser = async (req = request, res = response) => {
  const { email, password, name, phone, avatar, rol } = req.body;

  try {

    // buscamos el rol en la base de datos y extraemos el id
    const queryRol = rol.toUpperCase();
    const rolModel = await Rolmodel.findOne({
      where: { rol: queryRol }
    })

    // encriptamos el password
    const hash = bcryptjs.hashSync(password, 10);

    // armamos el body
    const data = {
      email,
      password: hash,
      name,
      phone,
      avatar,
      idRol: rolModel.id
    }

    // insertamos en la base de datos el user
    const user = await UserModel.create(data);

    const token = await generarJWT(user.id);

    res.json({
      ok: true,
      name: user.name,
      id: user.id,
      email: user.email,
      phone: user.phone,
      rol: rolModel.rol,
      img: user.avatar,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getUsers = async (req = request, res = response) => {
  try {
    const users = await UserModel.findAll({
      attributes: ["id", "name", "email", "phone", 'state', 'google'],
      include: [
        {
          model: Rolmodel,
          attributes: ["id", "rol"],
        },
        {
          model: DateModel,
          include: [
            {
              model: EmployeeModel,
            },
          ],
        },
        // {
        //   model: EmployeeModel,
        // },
      ],
    });

    res.status(200).json({
      ok: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const getUser = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findByPk(id, {
      include: {
        model: Rolmodel,
        attributes: ["rol"],
      },
    });

    res.status(200).json({
      ok: true,
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      img: user.avatar,
      rol: user.rol.rol
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const putUser = async (req = request, res = response) => {
  const { idUser } = req.params;
  const { id, state, google, password, ...resto } = req.body;
  try {
    if (password) {
      resto.password = bcryptjs.hashSync(password, 10);
    }

    // verificamos si mandan otro rol
    if (resto.rol) {
      const data = resto.rol.toUpperCase();
      const rolModel = await Rolmodel.findOne({
        where: { rol: data }
      })

      if (rolModel) {
        return res.status(400).json({
          ok: false,
          msg: `El ${resto.rol} ya existe`
        })
      }
    }

    await UserModel.update(resto, {
      where: {
        id: idUser
      }
    });

    const user = await UserModel.findByPk(idUser, {
      include: {
        model: Rolmodel,
        attributes: ["rol"],
      },
    });

    res.status(201).json({
      ok: true,
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      rol: user.rol.rol,
      img: user.avatar
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteUser = async (req = request, res = response) => {
  const { idUser } = req.params;
  try {
    await UserModel.update({ state: false }, {
      where: {
        id: idUser
      }
    })

    const user = await UserModel.findByPk(idUser, {
      attributes: ["id", "name", "email", "phone", 'state', 'google'],
      include: [
        {
          model: Rolmodel,
          attributes: ["id", "rol"],
        },
        {
          model: DateModel,
          include: [
            {
              model: EmployeeModel,
            },
          ],
        },
        // {
        //   model: EmployeeModel,
        // },
      ],
    });

    res.status(200).json({
      ok: true,
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const pathUser = async (req = request, res = response) => {
  const { idUser } = req.params;
  try {
    await UserModel.update({ state: true }, {
      where: {
        id: idUser
      }
    })

    const user = await UserModel.findByPk(idUser, {
      attributes: ["id", "name", "email", "phone", 'state', 'google'],
      include: [
        {
          model: Rolmodel,
          attributes: ["id", "rol"],
        },
        {
          model: DateModel,
          include: [
            {
              model: EmployeeModel,
            },
          ],
        },
        // {
        //   model: EmployeeModel,
        // },
      ],
    });

    res.status(200).json({
      ok: true,
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  addUser,
  getUsers,
  getUser,
  putUser,
  deleteUser,
  pathUser
};
