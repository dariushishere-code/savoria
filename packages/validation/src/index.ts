import { z } from 'zod';
import { Difficulty, MealType, RecipeStatus, UserRole, UserStatus } from '@savoria/types';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/[0-9]/, 'Must include a number'),
  name: z.string().min(2).max(80),
  captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: registerSchema.shape.password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: registerSchema.shape.password,
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const recipeSearchSchema = z.object({
  q: z.string().optional(),
  cuisine: z.union([z.string(), z.array(z.string())]).optional(),
  country: z.union([z.string(), z.array(z.string())]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  difficulty: z.union([z.nativeEnum(Difficulty), z.array(z.nativeEnum(Difficulty))]).optional(),
  mealType: z.union([z.nativeEnum(MealType), z.array(z.nativeEnum(MealType))]).optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
  diet: z.union([z.string(), z.array(z.string())]).optional(),
  ingredient: z.union([z.string(), z.array(z.string())]).optional(),
  maxPrepTime: z.coerce.number().optional(),
  maxCookTime: z.coerce.number().optional(),
  maxCalories: z.coerce.number().optional(),
  minProtein: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  sort: z.enum(['relevance', 'popular', 'newest', 'rating', 'fastest']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type RecipeSearchInput = z.infer<typeof recipeSearchSchema>;

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
});

const ingredientLine = z.object({
  ingredientId: z.string().optional(),
  name: z.string().optional(),
  amount: z.number().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
  group: z.string().optional(),
  sortOrder: z.number().optional(),
  optional: z.boolean().optional(),
});

const instructionLine = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  timerSeconds: z.number().optional(),
  tip: z.string().optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(RecipeStatus).optional(),
  difficulty: z.nativeEnum(Difficulty),
  mealType: z.nativeEnum(MealType).optional(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  totalTimeMinutes: z.number().optional(),
  servings: z.number().int().min(1).default(4),
  calories: z.number().optional(),
  cuisineId: z.string().optional(),
  countryId: z.string().optional(),
  categoryId: z.string().optional(),
  heroImageUrl: z.string().optional(),
  tips: z.string().optional(),
  chefNotes: z.string().optional(),
  substitutions: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  storage: z.string().optional(),
  reheating: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  scheduledAt: z.string().optional(),
  ingredients: z.array(ingredientLine).min(1),
  instructions: z.array(instructionLine).min(1),
  nutrition: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
      fiber: z.number().optional(),
      sugar: z.number().optional(),
      sodium: z.number().optional(),
      servingSize: z.string().optional(),
    })
    .optional(),
  tagIds: z.array(z.string()).optional(),
  dietIds: z.array(z.string()).optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export const updateRecipeSchema = createRecipeSchema.partial();
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;

export const createCuisineSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  region: z.string().optional(),
  heroImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type CreateCuisineInput = z.infer<typeof createCuisineSchema>;

export const createCountrySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  isoCode: z.string().length(2),
  flagEmoji: z.string().optional(),
  region: z.string().optional(),
  description: z.string().optional(),
  foodCulture: z.string().optional(),
  heroImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});
export type CreateCountryInput = z.infer<typeof createCountrySchema>;

export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createIngredientSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  unit: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  seasonality: z.string().optional(),
});
export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;

export const createTagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export const createDietSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().optional(),
});

export const siteSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.string().default('string'),
});
