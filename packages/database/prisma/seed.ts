/**
 * Seed: admin user, taxonomy, sample published recipes.
 */
import { PrismaClient, UserRole, UserStatus, RecipeStatus, Difficulty, MealType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@savoria.app';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMeAdmin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      name: 'Savoria Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const persian = await prisma.cuisine.upsert({
    where: { slug: 'persian' },
    update: {},
    create: {
      name: 'Persian',
      slug: 'persian',
      description: 'Iranian cuisine rich in herbs, rice, and slow-cooked stews.',
      region: 'Middle East',
    },
  });

  const italian = await prisma.cuisine.upsert({
    where: { slug: 'italian' },
    update: {},
    create: {
      name: 'Italian',
      slug: 'italian',
      description: 'Regional Italian cooking from pasta to pizza.',
      region: 'Europe',
    },
  });

  const indian = await prisma.cuisine.upsert({ where: { slug: 'indian' }, update: {}, create: { name: 'Indian', slug: 'indian', description: 'Layered spice, bright herbs, and comforting regional cooking.', region: 'South Asia' } });
  const mexican = await prisma.cuisine.upsert({ where: { slug: 'mexican' }, update: {}, create: { name: 'Mexican', slug: 'mexican', description: 'Corn, chiles, citrus, and deeply seasoned home cooking.', region: 'North America' } });
  const thai = await prisma.cuisine.upsert({ where: { slug: 'thai' }, update: {}, create: { name: 'Thai', slug: 'thai', description: 'A balance of sweet, sour, salty, spicy, and aromatic.', region: 'Southeast Asia' } });
  const french = await prisma.cuisine.upsert({ where: { slug: 'french' }, update: {}, create: { name: 'French', slug: 'french', description: 'Classic technique and generous, ingredient-led cooking.', region: 'Europe' } });

  const japan = await prisma.country.upsert({
    where: { slug: 'japan' },
    update: {},
    create: {
      name: 'Japan',
      slug: 'japan',
      isoCode: 'JP',
      flagEmoji: '🇯🇵',
      region: 'Asia',
    },
  });

  const iran = await prisma.country.upsert({
    where: { slug: 'iran' },
    update: {},
    create: {
      name: 'Iran',
      slug: 'iran',
      isoCode: 'IR',
      flagEmoji: '🇮🇷',
      region: 'Middle East',
    },
  });
  const italy = await prisma.country.upsert({ where: { slug: 'italy' }, update: {}, create: { name: 'Italy', slug: 'italy', isoCode: 'IT', flagEmoji: '🇮🇹', region: 'Europe' } });
  const india = await prisma.country.upsert({ where: { slug: 'india' }, update: {}, create: { name: 'India', slug: 'india', isoCode: 'IN', flagEmoji: '🇮🇳', region: 'South Asia' } });
  const mexico = await prisma.country.upsert({ where: { slug: 'mexico' }, update: {}, create: { name: 'Mexico', slug: 'mexico', isoCode: 'MX', flagEmoji: '🇲🇽', region: 'North America' } });
  const thailand = await prisma.country.upsert({ where: { slug: 'thailand' }, update: {}, create: { name: 'Thailand', slug: 'thailand', isoCode: 'TH', flagEmoji: '🇹🇭', region: 'Southeast Asia' } });
  const france = await prisma.country.upsert({ where: { slug: 'france' }, update: {}, create: { name: 'France', slug: 'france', isoCode: 'FR', flagEmoji: '🇫🇷', region: 'Europe' } });

  const mains = await prisma.category.upsert({
    where: { slug: 'main-courses' },
    update: {},
    create: { name: 'Main courses', slug: 'main-courses', sortOrder: 1 },
  });
  const breakfasts = await prisma.category.upsert({ where: { slug: 'breakfast' }, update: {}, create: { name: 'Breakfast', slug: 'breakfast', sortOrder: 2 } });
  const desserts = await prisma.category.upsert({ where: { slug: 'desserts' }, update: {}, create: { name: 'Desserts', slug: 'desserts', sortOrder: 3 } });
  const soups = await prisma.category.upsert({ where: { slug: 'soups' }, update: {}, create: { name: 'Soups', slug: 'soups', sortOrder: 4 } });

  const vegetarian = await prisma.diet.upsert({
    where: { slug: 'vegetarian' },
    update: {},
    create: { name: 'Vegetarian', slug: 'vegetarian' },
  });

  const comfort = await prisma.tag.upsert({
    where: { slug: 'comfort-food' },
    update: {},
    create: { name: 'Comfort food', slug: 'comfort-food' },
  });
  const quick = await prisma.tag.upsert({ where: { slug: 'quick-and-easy' }, update: {}, create: { name: 'Quick and easy', slug: 'quick-and-easy' } });
  const weeknight = await prisma.tag.upsert({ where: { slug: 'weeknight' }, update: {}, create: { name: 'Weeknight', slug: 'weeknight' } });
  const streetFood = await prisma.tag.upsert({ where: { slug: 'street-food' }, update: {}, create: { name: 'Street food', slug: 'street-food' } });

  const rice = await prisma.ingredient.upsert({
    where: { slug: 'basmati-rice' },
    update: {},
    create: {
      name: 'Basmati rice',
      slug: 'basmati-rice',
      unit: 'g',
      aliases: ['rice'],
    },
  });

  // Sample recipes
  const recipes = [
    {
      title: 'Ghormeh Sabzi',
      slug: 'ghormeh-sabzi',
      description:
        'Classic Persian herb stew with tender beef, kidney beans, and dried limes.',
      cuisineId: persian.id,
      countryId: iran.id,
      categoryId: mains.id,
      difficulty: Difficulty.MEDIUM,
      mealType: MealType.DINNER,
      prepTimeMinutes: 30,
      cookTimeMinutes: 150,
      totalTimeMinutes: 180,
      servings: 6,
      calories: 420,
      tips: 'Fry the herbs well for deep color and aroma.',
      heroImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
      ingredients: [['beef chuck', 700, 'g'], ['kidney beans', 240, 'g'], ['fresh parsley', 100, 'g'], ['dried limes', 3, ''], ['yellow onion', 1, ''], ['basmati rice', 360, 'g']],
      instructions: ['Brown the beef and onion in a heavy pot.', 'Fry the chopped herbs until deeply fragrant, then add them to the pot with beans and dried limes.', 'Cover and simmer gently until the beef is tender. Serve with steamed rice.'],
      tagIds: [comfort.id],
    },
    {
      title: 'Cacio e Pepe',
      slug: 'cacio-e-pepe',
      description: 'Roman pasta with pecorino and black pepper.',
      cuisineId: italian.id,
      categoryId: mains.id,
      difficulty: Difficulty.EASY,
      mealType: MealType.DINNER,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      servings: 2,
      calories: 520,
      countryId: italy.id,
      heroImageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=85',
      ingredients: [['spaghetti', 200, 'g'], ['pecorino romano', 90, 'g'], ['black pepper', 2, 'tsp'], ['pasta water', 120, 'ml']],
      instructions: ['Boil spaghetti in well-salted water until just al dente.', 'Toast black pepper, then whisk with pecorino and a splash of pasta water.', 'Toss the pasta through the sauce until glossy and serve immediately.'],
      tagIds: [quick.id, weeknight.id],
    },
    {
      title: 'Simple Miso Soup',
      slug: 'simple-miso-soup',
      description: 'Everyday Japanese miso soup with tofu and wakame.',
      countryId: japan.id,
      categoryId: soups.id,
      difficulty: Difficulty.EASY,
      mealType: MealType.BREAKFAST,
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      servings: 2,
      calories: 90,
      heroImageUrl: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?auto=format&fit=crop&w=1200&q=85',
      ingredients: [['dashi stock', 500, 'ml'], ['white miso', 45, 'g'], ['silken tofu', 150, 'g'], ['wakame', 5, 'g'], ['spring onion', 2, '']],
      instructions: ['Warm the dashi without boiling.', 'Whisk miso with a ladle of warm stock, then return it to the pot.', 'Add tofu and wakame, warm through, and finish with spring onion.'],
      tagIds: [quick.id],
    },
    {
      title: 'Butter Chicken', slug: 'butter-chicken', description: 'Tender chicken in a velvety tomato sauce with toasted spices and cream.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 25, cookTimeMinutes: 35, totalTimeMinutes: 60, servings: 4, calories: 540, heroImageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=85', ingredients: [['chicken thighs', 700, 'g'], ['Greek yogurt', 120, 'g'], ['tomato passata', 400, 'ml'], ['garam masala', 2, 'tbsp'], ['butter', 45, 'g'], ['heavy cream', 120, 'ml']], instructions: ['Marinate chicken with yogurt and garam masala for at least 20 minutes.', 'Sear the chicken until browned, then set aside.', 'Cook passata with spices and butter, return the chicken, and simmer until tender. Finish with cream.'], tagIds: [comfort.id, weeknight.id],
    },
    {
      title: 'Chilaquiles Verdes', slug: 'chilaquiles-verdes', description: 'Crisp tortilla chips folded through bright tomatillo salsa with eggs and crema.', cuisineId: mexican.id, countryId: mexico.id, categoryId: breakfasts.id, difficulty: Difficulty.EASY, mealType: MealType.BREAKFAST, prepTimeMinutes: 15, cookTimeMinutes: 20, totalTimeMinutes: 35, servings: 2, calories: 430, heroImageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=1200&q=85', ingredients: [['corn tortilla chips', 180, 'g'], ['tomatillos', 500, 'g'], ['jalapeno', 1, ''], ['eggs', 4, ''], ['Mexican crema', 60, 'g'], ['cotija cheese', 50, 'g']], instructions: ['Roast tomatillos and jalapeno until blistered, then blend with cilantro and salt.', 'Simmer the salsa and fold in tortilla chips until lightly softened.', 'Top with fried eggs, crema, cotija, and fresh onion.'], tagIds: [streetFood],
    },
    {
      title: 'Pad Thai', slug: 'pad-thai', description: 'Rice noodles tossed with tamarind, prawns, bean sprouts, and roasted peanuts.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 15, totalTimeMinutes: 35, servings: 3, calories: 480, heroImageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=85', ingredients: [['rice noodles', 250, 'g'], ['prawns', 300, 'g'], ['tamarind paste', 45, 'g'], ['fish sauce', 30, 'ml'], ['bean sprouts', 120, 'g'], ['roasted peanuts', 60, 'g']], instructions: ['Soak noodles until pliable and mix tamarind, fish sauce, and palm sugar.', 'Stir-fry prawns, then add noodles and sauce.', 'Fold through bean sprouts and serve with peanuts and lime.'], tagIds: [streetFood, quick.id],
    },
    {
      title: 'Ratatouille', slug: 'ratatouille', description: 'Slow-roasted Provençal vegetables layered with garlic, herbs, and olive oil.', cuisineId: french.id, countryId: france.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 25, cookTimeMinutes: 55, totalTimeMinutes: 80, servings: 4, calories: 260, heroImageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=1200&q=85', ingredients: [['eggplant', 1, 'large'], ['zucchini', 2, ''], ['bell pepper', 2, ''], ['tomatoes', 500, 'g'], ['garlic', 3, 'cloves'], ['olive oil', 45, 'ml']], instructions: ['Slice the vegetables into even rounds.', 'Layer them over garlicky tomato sauce with olive oil and herbs.', 'Bake until tender and caramelized. Rest briefly before serving.'], tagIds: [comfort.id],
    },
    {
      title: 'Mango Sticky Rice', slug: 'mango-sticky-rice', description: 'Sweet coconut sticky rice served with ripe mango and toasted sesame.', cuisineId: thai.id, countryId: thailand.id, categoryId: desserts.id, difficulty: Difficulty.EASY, mealType: MealType.DESSERT, prepTimeMinutes: 10, cookTimeMinutes: 25, totalTimeMinutes: 35, servings: 4, calories: 360, heroImageUrl: 'https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=1200&q=85', ingredients: [['glutinous rice', 250, 'g'], ['coconut milk', 400, 'ml'], ['mango', 2, 'ripe'], ['palm sugar', 70, 'g'], ['sesame seeds', 1, 'tbsp']], instructions: ['Steam soaked sticky rice until tender.', 'Warm coconut milk with palm sugar and salt, then fold half through the rice.', 'Serve with mango, remaining coconut sauce, and toasted sesame.'], tagIds: [quick.id],
    },
  ];

  for (const r of recipes) {
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {
        status: RecipeStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        title: r.title,
        slug: r.slug,
        description: r.description,
        cuisineId: r.cuisineId,
        countryId: r.countryId,
        categoryId: r.categoryId,
        difficulty: r.difficulty,
        mealType: r.mealType,
        prepTimeMinutes: r.prepTimeMinutes,
        cookTimeMinutes: r.cookTimeMinutes,
        totalTimeMinutes: r.totalTimeMinutes,
        servings: r.servings,
        calories: r.calories,
        tips: r.tips,
        heroImageUrl: r.heroImageUrl,
        status: RecipeStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: admin.id,
        ingredients: {
          create: (r.ingredients ?? [['basmati rice', 1, 'batch']]).map(([name, amount, unit], i) => ({ name: name as string, amount: amount as number, unit: unit as string, sortOrder: i })),
        },
        instructions: {
          create: (r.instructions ?? ['Prepare the ingredients.', 'Cook until flavors meld; season to taste and serve.']).map((content, i) => ({ stepNumber: i + 1, content })),
        },
        nutrition: {
          create: {
            calories: r.calories ?? 300,
            protein: 15,
            carbs: 40,
            fat: 12,
          },
        },
        tags: { create: (r.tagIds ?? [comfort.id]).map((tagId) => ({ tag: { connect: { id: typeof tagId === 'string' ? tagId : tagId.id } } })) },
        diets: r.slug === 'cacio-e-pepe' ? undefined : { create: [{ dietId: vegetarian.id }] },
      },
    });
  }

  await prisma.featureFlag.upsert({
    where: { key: 'ai_chat' },
    update: {},
    create: {
      key: 'ai_chat',
      enabled: true,
      description: 'Enable AI Chef chat',
    },
  });

  console.log('Seed complete. Admin:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
