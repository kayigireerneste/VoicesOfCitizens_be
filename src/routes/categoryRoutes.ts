import express from "express"
import {
  getAllCategories,
  getSubcategoriesByCategoryId,
  getCategoriesWithSubcategories,
  createCategory,
  createSubcategory,
  updateCategory,
  updateSubcategory,
} from "../controllers/categoryController"
import { authenticate, isAdmin } from "../middlewares/auth"
import { validateRequest } from "../middlewares/validateRequest"
import { categorySchema, subcategorySchema } from "../validations/complaintValidation"

const router = express.Router()

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAllCategories)

/**
 * @swagger
 * /api/categories/{categoryId}/subcategories:
 *   get:
 *     summary: Get subcategories by category ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subcategories
 *       404:
 *         description: Category not found
 */
router.get("/:categoryId/subcategories", getSubcategoriesByCategoryId)

/**
 * @swagger
 * /api/categories/with-subcategories:
 *   get:
 *     summary: Get all categories with their subcategories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories with subcategories
 */
router.get("/with-subcategories", getCategoriesWithSubcategories)

// Admin routes
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, isAdmin, validateRequest(categorySchema), createCategory)

/**
 * @swagger
 * /api/categories/subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.post("/subcategories", authenticate, isAdmin, validateRequest(subcategorySchema), createSubcategory)

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */
router.patch("/:id", authenticate, isAdmin, updateCategory)

/**
 * @swagger
 * /api/categories/subcategories/{id}:
 *   patch:
 *     summary: Update a subcategory
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subcategory not found
 */
router.patch("/subcategories/:id", authenticate, isAdmin, updateSubcategory)

export default router
