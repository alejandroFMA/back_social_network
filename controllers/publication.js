const Publication = require("../models/Publication");

const prueba = (req,res) => {
    return res.status(200).json({
        message: "user controller"
    })

}

const createPublication = async (req, res) => {
    let parameters = req.body;
  
    try {
      validatePublication(parameters);
  
      const Publication = new Publication(parameters);
  
      await Publication.save();
  
      return res.status(201).json({
        status: "success",
        message: "Publication saved successfully",
        Publication: Publication,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  };
  
  const getPublications = async (req, res) => {
    try {
      let query = Publication.find({}).sort({ date: -1 });
  
      if (req.params.last) {
        const limitNumber = parseInt(req.params.last, 10);
        if (!isNaN(limitNumber)) {
          query = query.limit(limitNumber);
        }
      }
  
      let Publications = await query.exec();
  
      return res.status(200).json({
        status: "success",
        counter: Publications.length,
        Publications,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(404).json({
        status: "error",
        message: "Publications not found",
      });
    }
  };
  
  const getPublicationById = async (req, res) => {
    try {
      let id = req.params.id;
  
      let Publication = await Publication.findById(id);
  
      if (Publication) {
        return res.status(200).json({
          status: "success",
          Publication,
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
    let id = req.params.id;
  
    let Publication = await Publication.findOneAndDelete({ _id: id });
  
    try {
      if (Publication) {
        return res.status(200).json({
          status: "success",
          Publication,
          message: "Publication removed succesfully",
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
  
  const editPublication = async (req, res) => {
    let id = req.params.id;
    let parameters = req.body;
  
    try {
      validatePublication(parameters);
      let Publication = await Publication.findOneAndUpdate({ _id: id }, parameters, {
        new: true,
      });
  
      if (Publication) {
        return res.status(200).json({
          status: "success",
          Publication,
          message: "Publication updated succesfully",
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
        message: "Error updating the Publication",
      });
    }
  };
  
  const uploadFile = async (req, res) => {
    //configurar multer
    //recoger fichero de imagen
    if (!req.file && !req.files) {
      return res.status(404).json({
        status: "Error",
        message: "Peticion invalida",
      });
    } //nombre del archivo
    let nameFile = req.file.originalname;
    //extension archivo
    let fileSplit = nameFile.split(".");
    let fileExtension = fileSplit[1];
  
    try {
      if (
        fileExtension != "png" &&
        fileExtension != "jpg" &&
        fileExtension != "jpeg" &&
        fileExtension != "gif"
      ) {
        fs.unlink(req.file.path, (error) => {
          return res.status(400).json({
            status: "Error",
            message: "Invalid image",
          });
        });
      } else {
        let id = req.params.id;
        let Publication = await Publication.findOneAndUpdate(
          { _id: id },
          { image: req.file.filename },
          {
            new: true,
          }
        );
  
        if (Publication) {
          return res.status(200).json({
            status: "success",
            Publication,
            message: "Publication Image updated succesfully",
            file: req.file,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        status: "error",
        message: "Error updating the Publication image",
      });
    }
  };
  
  const getImage = async (req, res) => {
    let file = req.params.file;
    let dir = "./images/Publications/" + file;
    fs.access(dir, (error) => {
      if (!error) {
        return res.sendFile(path.resolve(dir));
      } else {
        return res.status(404).jsdon({
          status: "error",
          messsage: "Image does not exist",
        });
      }
    });
  };
  
  const search = async (req, res) => {
  
      let query = req.params.query
  try{
      let Publications = await Publication.find({"$or": [
          {title:{"$regex": query, "$options": "i"}},
          {content:{"$regex": query, "$options": "i"}}
      ]})
      .sort({ date: -1 })
      .exec();
  
      
      if (Publications.length === 0) {
          return res.status(404).json({
              status: "error",
              message: "No Publications found matching the query",
          });
      }
  
      return res.status(200).json({
        status: "success",
        counter: Publications.length,
        Publications,
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
getImage,
uploadFile,
editPublication,
deletePublication,
getPublications,
getPublicationById,
createPublication

    
}