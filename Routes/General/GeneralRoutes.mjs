import express from "express";
let router = express.Router();

import ServiceApi from "../../API/General/ServicesG/Service.mjs";
import ConsultantAPI from "../../API/General/Consultant/Consultant.mjs";
import Party from "../../API/General/Party/Party.mjs";

router.use(ServiceApi);
router.use(ConsultantAPI);
router.use(Party);
export default router;
