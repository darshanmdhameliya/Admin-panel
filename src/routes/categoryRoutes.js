import expres from "express"
import { createCategory, deleteCategoryById, getAllCategory, getCategory, updateCategoryById } from "../controllers/categoryController.js"
import upload, { convertJfifToJpeg } from "../middlerware/imageupload.js";

const categoryRoutes = expres.Router();

//category Routes
categoryRoutes.post("/createCategory",upload.single("categoryImage"),convertJfifToJpeg,createCategory);
categoryRoutes.get("/getCategory/:id", getCategory)
categoryRoutes.get("/getAllCategory", getAllCategory)
categoryRoutes.put("/updateCategoryById/:id",upload.single('categoryImage'),updateCategoryById);
categoryRoutes.delete("/deleteCategoryById/:id", deleteCategoryById)

export default categoryRoutes;
