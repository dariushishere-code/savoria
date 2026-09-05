CREATE INDEX IF NOT EXISTS "Recipe_status_publishedAt_idx" ON "Recipe"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Recipe_status_ratingAverage_idx" ON "Recipe"("status", "ratingAverage");
CREATE INDEX IF NOT EXISTS "Recipe_status_totalTimeMinutes_idx" ON "Recipe"("status", "totalTimeMinutes");
CREATE INDEX IF NOT EXISTS "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");
CREATE INDEX IF NOT EXISTS "RecipeTag_tagId_idx" ON "RecipeTag"("tagId");
CREATE INDEX IF NOT EXISTS "RecipeDiet_dietId_idx" ON "RecipeDiet"("dietId");
CREATE INDEX IF NOT EXISTS "Favorite_recipeId_idx" ON "Favorite"("recipeId");
CREATE INDEX IF NOT EXISTS "Rating_recipeId_idx" ON "Rating"("recipeId");
CREATE INDEX IF NOT EXISTS "Comment_recipeId_status_createdAt_idx" ON "Comment"("recipeId", "status", "createdAt");