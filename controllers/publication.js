const Publication = require("../models/Publication");
const User = require("../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { validatePublication } = require("../services/validation");
const { followUsersId, followThisUser} = require("../services/followUsersId");


const prueba = (req, res) => {
  return res.status(200).json({
    message: "user controller",
  });
};

const createPublication = async (req, res) => {
  let parameters = req.body;

  try {
    validatePublication(parameters);

    const newPublication = new Publication({
      text: parameters.text,
      user: req.user.id,
    });

    await newPublication.save();

    return res.status(201).json({
      status: "success",
      message: "Publication saved successfully",
      user: req.user.id,
      username: req.user.nick,
      Publication: parameters.text,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const feed = async (req, res) => {
  try {
    let userId = req.user.id;

    let page = parseInt(req.query.page, 10) || 1;
    let itemsPerPage = 5;

    const options = {
      page,
      limit: itemsPerPage,
      sort: { _id: -1 },
      populate: {
        path: "user",
        select: "-password -__v -created_at -role -email",
      },
    };
    const myFollows = await followUsersId(userId)


    let result = await Publication.paginate({ user: myFollows.following }, options);
    // let user = await User.findById(userId).select('-password -__v -created_at -role')

    if (!result.docs.length) {
      return res.status(404).json({
        status: "error",
        message: "No publications found",
        
      });
    }

    return res.status(200).json({
      status: "success",
      itemsPerPage,
      total: result.totalDocs,
      totalPages: result.totalPages,
      user: req.user.nick,
      page,
      following: myFollows.following,
      publications: result.docs
      
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching info users " + error.message,
    });
  }
};

const getPublicationById = async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    let result = await Publication.findById(id);

    if (result) {
      return res.status(200).json({
        status: "success",
        result,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Publication not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the Publication",
    });
  }
};

const deletePublication = async (req, res) => {
  try {
    let id = req.params.id;

    let publicationToDelete = await Publication.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!publicationToDelete) {
      return res.status(404).json({
        status: "error",
        message: "Publication not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Publication removed succesfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving the Publication " + error.message,
    });
  }
};

// const editPublication = async (req, res) => {
//   let id = req.params.id;
//   let parameters = req.body;

//   try {
//     validatePublication(parameters);
//     let publicationToUpdate = await Publication.findOneAndUpdate(
//       { _id: id },
//       parameters,
//       {
//         new: true,
//       }
//     );

//     if (publicationToUpdate) {
//       return res.status(200).json({
//         status: "success",
//         publication: publicationToUpdate,
//         message: "Publication updated succesfully",
//       });
//     } else {
//       return res.status(404).json({
//         status: "error",
//         message: "Publication not found",
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Error updating the Publication",
//     });
//   }
// };

const uploadFile = async (req, res) => {
  //configurar multer
  //recoger fichero de imagen
  const publicationId = req.params.id;

  if (!req.file && !req.files) {
    return res.status(404).json({
      status: "Error",
      message: "Peticion invalida",
    });
  } //nombre del archivo
  let nameFile = req.file.originalname;
  //extension archivo
  let fileSplit = nameFile.split(".");
  let fileExtension = fileSplit[1].toLowerCase();

  try {
    if (
      fileExtension != "png" &&
      fileExtension != "jpg" &&
      fileExtension != "jpeg" &&
      fileExtension != "gif"
    ) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({
        status: "Error",
        message: "Invalid image extension.",
      });
    }
    let publicationToUpdate = await Publication.findOneAndUpdate(
      { _id: publicationId, user: req.user.id }, // Filtro para asegurar que la publicación pertenezca al usuario.
      { file: req.file.filename }, // Actualización para añadir/modificar el archivo de la publicación.
      { new: true } // Opciones para devolver el documento modificado.
    );

    if (!publicationToUpdate) {
      return res.status(404).json({
        status: "error",
        message: "Publication not found or permission denied.",
      });
    }

    return res.status(200).json({
      status: "success",
      publication: publicationToUpdate,
      file: req.file,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error updating the Publication image",
    });
  }
};

const getMedia = async (req, res) => {
  let file = req.params.file;
  let dir = "./uploads/images/" + file;
  fs.access(dir, (error) => {
    if (!error) {
      return res.sendFile(path.resolve(dir));
    } else {
      return res.status(404).json({
        status: "error",
        messsage: "File does not exist",
      });
    }
  });
};

const search = async (req, res) => {
  let query = req.params.query;
  try {
    let results = await Publication.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ date: -1 })
      .exec();

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No Publications found matching the query",
      });
    }

    return res.status(200).json({
      status: "success",
      counter: results.length,
      results,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching Publications",
    });
  }
};

module.exports = {
  prueba,
  createPublication,
  search,
  getMedia,
  uploadFile,
  // editPublication,
  deletePublication,
  feed,
  getPublicationById,
};
