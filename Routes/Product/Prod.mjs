import express from "express";

import Product from "../../API/Product/Product.mjs";

const router = express.Router();

router.use(Product);

export default router;
