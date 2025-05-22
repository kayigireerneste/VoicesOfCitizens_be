import type { Request, Response, NextFunction } from "express"
import { Category, Subcategory } from "../database/models"
import { AppError } from "../utils/appError"

// Get all categories
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    })

    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get subcategories by category ID
export const getSubcategoriesByCategoryId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params

    // Check if category exists
    const category = await Category.findByPk(categoryId)
    if (!category) {
      return next(new AppError("Category not found", 404))
    }

    const subcategories = await Subcategory.findAll({
      where: { categoryId, isActive: true },
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    })

    res.status(200).json({
      status: "success",
      data: {
        subcategories,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get all categories with subcategories
export const getCategoriesWithSubcategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "description"],
      include: [
        {
          model: Subcategory,
          as: "subcategories",
          where: { isActive: true },
          attributes: ["id", "name", "description"],
          required: false,
        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: Subcategory, as: "subcategories" }, "name", "ASC"],
      ],
    })

    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Create a new category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } })
    if (existingCategory) {
      return next(new AppError("Category with this name already exists", 400))
    }

    const category = await Category.create({
      name,
      description,
      isActive: true,
    })

    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Create a new subcategory
export const createSubcategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, categoryId } = req.body

    // Check if category exists
    const category = await Category.findByPk(categoryId)
    if (!category) {
      return next(new AppError("Category not found", 404))
    }

    // Check if subcategory already exists in this category
    const existingSubcategory = await Subcategory.findOne({
      where: { name, categoryId },
    })
    if (existingSubcategory) {
      return next(new AppError("Subcategory with this name already exists in this category", 400))
    }

    const subcategory = await Subcategory.create({
      name,
      description,
      categoryId,
      isActive: true,
    })

    res.status(201).json({
      status: "success",
      data: {
        subcategory,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Update a category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, isActive } = req.body

    const category = await Category.findByPk(id)
    if (!category) {
      return next(new AppError("Category not found", 404))
    }

    // If name is being changed, check if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } })
      if (existingCategory) {
        return next(new AppError("Category with this name already exists", 400))
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive,
    })

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Update a subcategory
export const updateSubcategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, isActive, categoryId } = req.body

    const subcategory = await Subcategory.findByPk(id)
    if (!subcategory) {
      return next(new AppError("Subcategory not found", 404))
    }

    // If categoryId is being changed, check if it exists
    if (categoryId && categoryId !== subcategory.categoryId) {
      const category = await Category.findByPk(categoryId)
      if (!category) {
        return next(new AppError("Category not found", 404))
      }
    }

    // If name or categoryId is being changed, check if it already exists
    if ((name && name !== subcategory.name) || (categoryId && categoryId !== subcategory.categoryId)) {
      const existingSubcategory = await Subcategory.findOne({
        where: {
          name: name || subcategory.name,
          categoryId: categoryId || subcategory.categoryId,
        },
      })
      if (existingSubcategory && existingSubcategory.id !== id) {
        return next(new AppError("Subcategory with this name already exists in this category", 400))
      }
    }

    await subcategory.update({
      name: name || subcategory.name,
      description: description !== undefined ? description : subcategory.description,
      categoryId: categoryId || subcategory.categoryId,
      isActive: isActive !== undefined ? isActive : subcategory.isActive,
    })

    res.status(200).json({
      status: "success",
      data: {
        subcategory,
      },
    })
  } catch (error) {
    next(error)
  }
}
