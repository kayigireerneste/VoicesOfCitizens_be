import express from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import complaintRoutes from "./complaintRoutes.js";
import trackingRoutes from "./trackingRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/complaints", complaintRoutes);
router.use("/tracking", trackingRoutes);

export default router;