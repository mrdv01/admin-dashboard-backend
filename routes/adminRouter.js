import express from "express";
import { createBlog, deleteBlog, getBlogs, getSingleBlog, updateBlog } from "../controllers/adminCtrl.js";

const adminRouter = express.Router();

//routes
adminRouter.post('/blogs', createBlog);
adminRouter.get('/blogs', getBlogs);
adminRouter.get('/blogs/:id', getSingleBlog);
adminRouter.put('/blogs/:id', updateBlog);
adminRouter.delete('/blogs/:id', deleteBlog);

export default adminRouter;