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
  const salads = await prisma.category.upsert({ where: { slug: 'salads' }, update: {}, create: { name: 'Salads', slug: 'salads', sortOrder: 5 } });
  const appetizers = await prisma.category.upsert({ where: { slug: 'appetizers' }, update: {}, create: { name: 'Appetizers & Snacks', slug: 'appetizers', sortOrder: 6 } });


  const vegetarian = await prisma.diet.upsert({
    where: { slug: 'vegetarian' },
    update: {},
    create: { name: 'Vegetarian', slug: 'vegetarian' },
  });
  const vegan = await prisma.diet.upsert({ where: { slug: 'vegan' }, update: {}, create: { name: 'Vegan', slug: 'vegan' } });
  const glutenFree = await prisma.diet.upsert({ where: { slug: 'gluten-free' }, update: {}, create: { name: 'Gluten-free', slug: 'gluten-free' } });


  const comfort = await prisma.tag.upsert({
    where: { slug: 'comfort-food' },
    update: {},
    create: { name: 'Comfort food', slug: 'comfort-food' },
  });
  const quick = await prisma.tag.upsert({ where: { slug: 'quick-and-easy' }, update: {}, create: { name: 'Quick and easy', slug: 'quick-and-easy' } });
  const weeknight = await prisma.tag.upsert({ where: { slug: 'weeknight' }, update: {}, create: { name: 'Weeknight', slug: 'weeknight' } });
  const streetFood = await prisma.tag.upsert({ where: { slug: 'street-food' }, update: {}, create: { name: 'Street food', slug: 'street-food' } });
  const spicy = await prisma.tag.upsert({ where: { slug: 'spicy' }, update: {}, create: { name: 'Spicy', slug: 'spicy' } });
  const fresh = await prisma.tag.upsert({ where: { slug: 'fresh' }, update: {}, create: { name: 'Fresh & light', slug: 'fresh' } });
  const slowCooked = await prisma.tag.upsert({ where: { slug: 'slow-cooked' }, update: {}, create: { name: 'Slow-cooked', slug: 'slow-cooked' } });
  const grilled = await prisma.tag.upsert({ where: { slug: 'grilled' }, update: {}, create: { name: 'Grilled', slug: 'grilled' } });
  const classic = await prisma.tag.upsert({ where: { slug: 'classic' }, update: {}, create: { name: 'Classic', slug: 'classic' } });
  const onePot = await prisma.tag.upsert({ where: { slug: 'one-pot' }, update: {}, create: { name: 'One-pot', slug: 'one-pot' } });


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
      description: 'Classic Persian herb stew with tender beef, kidney beans, and dried limes.',
      cuisineId: persian.id, countryId: iran.id, categoryId: mains.id,
      difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER,
      prepTimeMinutes: 30, cookTimeMinutes: 150, totalTimeMinutes: 180, servings: 6, calories: 420,
      tips: 'Fry the herbs well for deep color and aroma.',
      heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ghormeh_Sabzi_with_rice.jpg?width=1000',
      ingredients: [['beef chuck', 700, 'g'], ['kidney beans', 240, 'g'], ['fresh parsley', 100, 'g'], ['dried limes', 3, ''], ['yellow onion', 1, ''], ['basmati rice', 360, 'g']],
      instructions: ['Brown the beef and onion in a heavy pot.', 'Fry the chopped herbs until deeply fragrant, then add them to the pot with beans and dried limes.', 'Cover and simmer gently until the beef is tender. Serve with steamed rice.'],
      tagIds: [comfort.id], dietIds: [],
    },
    {
      title: 'Cacio e Pepe',
      slug: 'cacio-e-pepe',
      description: 'Roman pasta with pecorino and black pepper.',
      cuisineId: italian.id, categoryId: mains.id,
      difficulty: Difficulty.EASY, mealType: MealType.DINNER,
      prepTimeMinutes: 10, cookTimeMinutes: 15, totalTimeMinutes: 25, servings: 2, calories: 520,
      countryId: italy.id,
      heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cacio_e_pepe.jpg?width=1000',
      ingredients: [['spaghetti', 200, 'g'], ['pecorino romano', 90, 'g'], ['black pepper', 2, 'tsp'], ['pasta water', 120, 'ml']],
      instructions: ['Boil spaghetti in well-salted water until just al dente.', 'Toast black pepper, then whisk with pecorino and a splash of pasta water.', 'Toss the pasta through the sauce until glossy and serve immediately.'],
      tagIds: [quick.id, weeknight.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Simple Miso Soup',
      slug: 'simple-miso-soup',
      description: 'Everyday Japanese miso soup with tofu and wakame.',
      countryId: japan.id, categoryId: soups.id,
      difficulty: Difficulty.EASY, mealType: MealType.BREAKFAST,
      prepTimeMinutes: 5, cookTimeMinutes: 10, totalTimeMinutes: 15, servings: 2, calories: 90,
      heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Miso_Soup_001.jpg?width=1000',
      ingredients: [['dashi stock', 500, 'ml'], ['white miso', 45, 'g'], ['silken tofu', 150, 'g'], ['wakame', 5, 'g'], ['spring onion', 2, '']],
      instructions: ['Warm the dashi without boiling.', 'Whisk miso with a ladle of warm stock, then return it to the pot.', 'Add tofu and wakame, warm through, and finish with spring onion.'],
      tagIds: [quick.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Butter Chicken', slug: 'butter-chicken', description: 'Tender chicken in a velvety tomato sauce with toasted spices and cream.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 25, cookTimeMinutes: 35, totalTimeMinutes: 60, servings: 4, calories: 540, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_makhani.jpg?width=1000', ingredients: [['chicken thighs', 700, 'g'], ['Greek yogurt', 120, 'g'], ['tomato passata', 400, 'ml'], ['garam masala', 2, 'tbsp'], ['butter', 45, 'g'], ['heavy cream', 120, 'ml']], instructions: ['Marinate chicken with yogurt and garam masala for at least 20 minutes.', 'Sear the chicken until browned, then set aside.', 'Cook passata with spices and butter, return the chicken, and simmer until tender. Finish with cream.'], tagIds: [comfort.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Chilaquiles Verdes', slug: 'chilaquiles-verdes', description: 'Crisp tortilla chips folded through bright tomatillo salsa with eggs and crema.', cuisineId: mexican.id, countryId: mexico.id, categoryId: breakfasts.id, difficulty: Difficulty.EASY, mealType: MealType.BREAKFAST, prepTimeMinutes: 15, cookTimeMinutes: 20, totalTimeMinutes: 35, servings: 2, calories: 430, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chilaquiles_at_the_Grand_Cantina%2C_Windsor%2C_Ontario%2C_2025-09-01_03.jpg?width=1000', ingredients: [['corn tortilla chips', 180, 'g'], ['tomatillos', 500, 'g'], ['jalapeno', 1, ''], ['eggs', 4, ''], ['Mexican crema', 60, 'g'], ['cotija cheese', 50, 'g']], instructions: ['Roast tomatillos and jalapeno until blistered, then blend with cilantro and salt.', 'Simmer the salsa and fold in tortilla chips until lightly softened.', 'Top with fried eggs, crema, cotija, and fresh onion.'], tagIds: [streetFood.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Pad Thai', slug: 'pad-thai', description: 'Rice noodles tossed with tamarind, prawns, bean sprouts, and roasted peanuts.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 15, totalTimeMinutes: 35, servings: 3, calories: 480, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thai-Pad-Thai_2023-06-04.jpg?width=1000', ingredients: [['rice noodles', 250, 'g'], ['prawns', 300, 'g'], ['tamarind paste', 45, 'g'], ['fish sauce', 30, 'ml'], ['bean sprouts', 120, 'g'], ['roasted peanuts', 60, 'g']], instructions: ['Soak noodles until pliable and mix tamarind, fish sauce, and palm sugar.', 'Stir-fry prawns, then add noodles and sauce.', 'Fold through bean sprouts and serve with peanuts and lime.'], tagIds: [streetFood.id, quick.id], dietIds: [],
    },
    {
      title: 'Ratatouille', slug: 'ratatouille', description: 'Slow-roasted Provençal vegetables layered with garlic, herbs, and olive oil.', cuisineId: french.id, countryId: france.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 25, cookTimeMinutes: 55, totalTimeMinutes: 80, servings: 4, calories: 260, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Confit_byaldi_1.jpg?width=1000', ingredients: [['eggplant', 1, 'large'], ['zucchini', 2, ''], ['bell pepper', 2, ''], ['tomatoes', 500, 'g'], ['garlic', 3, 'cloves'], ['olive oil', 45, 'ml']], instructions: ['Slice the vegetables into even rounds.', 'Layer them over garlicky tomato sauce with olive oil and herbs.', 'Bake until tender and caramelized. Rest briefly before serving.'], tagIds: [comfort.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Mango Sticky Rice', slug: 'mango-sticky-rice', description: 'Sweet coconut sticky rice served with ripe mango and toasted sesame.', cuisineId: thai.id, countryId: thailand.id, categoryId: desserts.id, difficulty: Difficulty.EASY, mealType: MealType.DESSERT, prepTimeMinutes: 10, cookTimeMinutes: 25, totalTimeMinutes: 35, servings: 4, calories: 360, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Khao_Niao_Ma_Muang.jpg?width=1000', ingredients: [['glutinous rice', 250, 'g'], ['coconut milk', 400, 'ml'], ['mango', 2, 'ripe'], ['palm sugar', 70, 'g'], ['sesame seeds', 1, 'tbsp']], instructions: ['Steam soaked sticky rice until tender.', 'Warm coconut milk with palm sugar and salt, then fold half through the rice.', 'Serve with mango, remaining coconut sauce, and toasted sesame.'], tagIds: [quick.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Zereshk Polo ba Morgh', slug: 'zereshk-polo-ba-morgh', description: 'Fragrant saffron rice with jewel-toned barberries and golden pan-seared chicken.', cuisineId: persian.id, countryId: iran.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.LUNCH, prepTimeMinutes: 30, cookTimeMinutes: 60, totalTimeMinutes: 90, servings: 4, calories: 610, tips: 'Soak the barberries in warm water to soften before folding them through the rice.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zereshk_polo.jpg?width=1000', ingredients: [['basmati rice', 400, 'g'], ['dried barberries', 80, 'g'], ['chicken thighs', 600, 'g'], ['saffron', 1, 'tsp'], ['butter', 60, 'g'], ['sugar', 1, 'tbsp']], instructions: ['Parboil the rice and steam it with saffron and butter until fluffy.', 'Sauté the chicken until golden and cooked through.', 'Toss barberries with a little sugar and butter, then fold through the rice and serve with the chicken.'], tagIds: [classic.id, comfort.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Koobideh Kebab', slug: 'koobideh-kebab', description: 'Charred, juicy Persian minced lamb kebabs grilled over flame with grilled tomatoes.', cuisineId: persian.id, countryId: iran.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 40, cookTimeMinutes: 15, totalTimeMinutes: 55, servings: 4, calories: 590, tips: 'Knead the meat mixture well so the kebab binds and stays moist on the skewer.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kabab_koobideh_2012.jpg?width=1000', ingredients: [['ground lamb', 800, 'g'], ['yellow onion', 1, 'grated'], ['baking soda', 1, 'tsp'], ['saffron', 1, 'tsp'], ['butter', 40, 'g'], ['tomatoes', 4, '']], instructions: ['Knead the ground lamb with grated onion, baking soda, salt, and saffron until sticky.', 'Mold the mixture onto flat skewers and grill over medium-high heat, turning once.', 'Brush with melted butter and serve with grilled tomatoes and basmati rice.'], tagIds: [grilled.id, streetFood.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Classic Lasagna', slug: 'classic-lasagna', description: 'Layered pasta sheets with slow-simmered ragù, béchamel, and melted parmesan.', cuisineId: italian.id, countryId: italy.id, categoryId: mains.id, difficulty: Difficulty.HARD, mealType: MealType.DINNER, prepTimeMinutes: 45, cookTimeMinutes: 90, totalTimeMinutes: 135, servings: 8, calories: 720, tips: 'Let the lasagna rest for at least 15 minutes before slicing so the layers hold.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lasagna_al_forno_%282%29.jpg?width=1000', ingredients: [['lasagna sheets', 400, 'g'], ['ground beef', 600, 'g'], ['tomato passata', 700, 'ml'], ['béchamel sauce', 800, 'ml'], ['parmesan', 120, 'g'], ['mozzarella', 250, 'g']], instructions: ['Simmer the ragù slowly with tomato passata until rich and thick.', 'Build layers of pasta, ragù, béchamel, mozzarella, and parmesan in a deep dish.', 'Bake until golden and bubbling, then rest before serving.'], tagIds: [comfort.id, classic.id], dietIds: [],
    },
    {
      title: 'Classic Tiramisu', slug: 'classic-tiramisu', description: 'Espresso-soaked ladyfingers layered with cloud-light mascarpone cream and cocoa.', cuisineId: italian.id, countryId: italy.id, categoryId: desserts.id, difficulty: Difficulty.EASY, mealType: MealType.DESSERT, prepTimeMinutes: 30, cookTimeMinutes: 0, totalTimeMinutes: 240, servings: 8, calories: 450, tips: 'Chill for at least 4 hours so the layers set and the flavors marry.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tiramisu_dessert.jpg?width=1000', ingredients: [['ladyfingers', 250, 'g'], ['mascarpone', 500, 'g'], ['eggs', 4, ''], ['espresso', 300, 'ml'], ['sugar', 100, 'g'], ['cocoa powder', 30, 'g']], instructions: ['Beat egg yolks with sugar, then fold in mascarpone; whip whites separately and fold to a soft cloud.', 'Dip ladyfingers briefly in espresso and layer with mascarpone cream.', 'Dust generously with cocoa and chill until set.'], tagIds: [classic.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Mushroom Risotto', slug: 'mushroom-risotto', description: 'Creamy arborio rice with golden mushrooms, white wine, and parmesan.', cuisineId: italian.id, countryId: italy.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 15, cookTimeMinutes: 35, totalTimeMinutes: 50, servings: 4, calories: 520, tips: 'Keep the stock hot and add it a ladle at a time, stirring until absorbed.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mushroom_Risotto_%284790048026%29.jpg?width=1000', ingredients: [['arborio rice', 320, 'g'], ['mixed mushrooms', 400, 'g'], ['vegetable stock', 1.2, 'l'], ['white wine', 120, 'ml'], ['shallots', 2, ''], ['parmesan', 80, 'g']], instructions: ['Sauté shallots and mushrooms until deeply golden.', 'Toast the rice, deglaze with wine, then add hot stock ladle by ladle, stirring.', 'Finish with parmesan and butter, and rest a minute before serving.'], tagIds: [comfort.id, onePot.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Margherita Pizza', slug: 'margherita-pizza', description: 'Neapolitan-style pizza topped with san marzano tomato, fresh mozzarella, and basil.', cuisineId: italian.id, countryId: italy.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 60, cookTimeMinutes: 15, totalTimeMinutes: 75, servings: 4, calories: 680, tips: 'A blistering-hot oven and a well-rested dough make all the difference.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Margherita_pizza_%285209912131%29.jpg?width=1000', ingredients: [['pizza flour', 500, 'g'], ['san marzano tomatoes', 400, 'g'], ['fresh mozzarella', 250, 'g'], ['fresh basil', 20, 'leaves'], ['olive oil', 30, 'ml'], ['instant yeast', 7, 'g']], instructions: ['Mix flour, water, yeast, and salt into a dough and prove until doubled.', 'Stretch the dough into rounds and top with crushed tomato, torn mozzarella, and basil.', 'Bake in a blazing oven until leopard-spotted and bubbling. Drizzle with olive oil.'], tagIds: [classic.id, weeknight.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Chicken Tikka Masala', slug: 'chicken-tikka-masala', description: 'Charred spiced chicken in a creamy tomato and garam masala sauce.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 30, cookTimeMinutes: 30, totalTimeMinutes: 60, servings: 4, calories: 560, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_tikka_masala.jpg?width=1000', ingredients: [['chicken breast', 700, 'g'], ['Greek yogurt', 150, 'g'], ['tomato passata', 400, 'ml'], ['garam masala', 3, 'tbsp'], ['ginger', 20, 'g'], ['heavy cream', 150, 'ml']], instructions: ['Marinate the chicken in spiced yogurt, then grill until charred at the edges.', 'Simmer onions, tomatoes, and ginger into a thick masala sauce.', 'Add the grilled chicken and cream, and simmer until silky.'], tagIds: [spicy.id, weeknight.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Chana Masala', slug: 'chana-masala', description: 'Chickpeas simmered in a warm, tangy tomato and onion masala with fresh ginger.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 15, cookTimeMinutes: 30, totalTimeMinutes: 45, servings: 4, calories: 340, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg?width=1000', ingredients: [['chickpeas', 800, 'g'], ['yellow onion', 1, ''], ['tomato passata', 400, 'ml'], ['garam masala', 2, 'tbsp'], ['ginger', 20, 'g'], ['cilantro', 20, 'g']], instructions: ['Sauté onion until soft, then add spices and cook until fragrant.', 'Add tomatoes, chickpeas, and a little water, and simmer until thickened.', 'Finish with ginger, cilantro, and a squeeze of lemon. Serve with rice or roti.'], tagIds: [spicy.id, onePot.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Palak Paneer', slug: 'palak-paneer', description: 'Soft paneer cubes in a silky spiced spinach sauce with garlic and cream.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 25, totalTimeMinutes: 45, servings: 4, calories: 420, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palak_Paneer_%28Cottage_cheese_in_spinach_gravy%29.jpg?width=1000', ingredients: [['paneer', 400, 'g'], ['fresh spinach', 500, 'g'], ['tomato', 2, ''], ['garam masala', 1, 'tbsp'], ['garlic', 4, 'cloves'], ['cream', 60, 'ml']], instructions: ['Blanch the spinach and blend with garlic and green chile.', 'Sauté tomato and spices, then add the spinach purée and simmer.', 'Fold in golden pan-seared paneer cubes and finish with cream.'], tagIds: [comfort.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Tacos al Pastor', slug: 'tacos-al-pastor', description: 'Marinated, slow-charred pork piled onto corn tortillas with pineapple and onion.', cuisineId: mexican.id, countryId: mexico.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 40, cookTimeMinutes: 45, totalTimeMinutes: 85, servings: 4, calories: 520, tips: 'Marinate overnight for the deepest achiote and pineapple flavor.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/%28El_Flaco%29_Al_Pastor_Tacos.jpg?width=1000', ingredients: [['pork shoulder', 900, 'g'], ['achiote paste', 60, 'g'], ['pineapple', 1, ''], ['dried guajillo chiles', 4, ''], ['corn tortillas', 12, ''], ['white onion', 1, '']], instructions: ['Blend achiote, guajillo, vinegar, and spices, and marinate the pork overnight.', 'Roast the pork until charred, then slice thinly.', 'Serve in warm tortillas with grilled pineapple, onion, and cilantro.'], tagIds: [streetFood.id, spicy.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Classic Guacamole', slug: 'classic-guacamole', description: 'Creamy mashed avocado with lime, jalapeño, onion, and cilantro.', cuisineId: mexican.id, countryId: mexico.id, categoryId: appetizers.id, difficulty: Difficulty.EASY, mealType: MealType.SNACK, prepTimeMinutes: 10, cookTimeMinutes: 0, totalTimeMinutes: 10, servings: 4, calories: 180, tips: 'Leave the avocado chunky for texture and keep the pit in the bowl to slow browning.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Guacamole_IMGP1271.jpg?width=1000', ingredients: [['ripe avocados', 3, ''], ['lime', 2, ''], ['jalapeño', 1, ''], ['red onion', 60, 'g'], ['cilantro', 15, 'g'], ['tomato', 1, '']], instructions: ['Mash the avocado with lime juice and salt.', 'Fold through finely diced jalapeño, onion, tomato, and cilantro.', 'Taste and adjust seasoning; serve immediately with tortilla chips.'], tagIds: [fresh.id, quick.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Mexican Flan', slug: 'mexican-flan', description: 'Silky vanilla custard baked over a pool of golden caramel.', cuisineId: mexican.id, countryId: mexico.id, categoryId: desserts.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DESSERT, prepTimeMinutes: 20, cookTimeMinutes: 60, totalTimeMinutes: 260, servings: 8, calories: 330, tips: 'Bake in a water bath and chill overnight for the most luscious texture.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Homemade_Flan.jpg?width=1000', ingredients: [['eggs', 6, ''], ['sweetened condensed milk', 400, 'ml'], ['whole milk', 300, 'ml'], ['sugar', 200, 'g'], ['vanilla extract', 2, 'tsp']], instructions: ['Caramelize the sugar in a flan mold until deep amber.', 'Blend eggs, condensed milk, milk, and vanilla, then pour over the caramel.', 'Bake in a water bath until just set, then chill and unmold.'], tagIds: [classic.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Thai Green Curry', slug: 'thai-green-curry', description: 'Aromatic green curry with chicken, coconut milk, eggplant, and thai basil.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 25, cookTimeMinutes: 25, totalTimeMinutes: 50, servings: 4, calories: 540, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thai_Green_Curry_with_Rice.jpg?width=1000', ingredients: [['chicken thighs', 600, 'g'], ['green curry paste', 60, 'g'], ['coconut milk', 800, 'ml'], ['thai eggplant', 200, 'g'], ['bamboo shoots', 150, 'g'], ['thai basil', 30, 'leaves']], instructions: ['Fry the curry paste in thick coconut cream until fragrant.', 'Add chicken, thin coconut milk, eggplant, and bamboo shoots, and simmer.', 'Finish with fish sauce, palm sugar, and fresh thai basil. Serve with rice.'], tagIds: [spicy.id, comfort.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Som Tam', slug: 'som-tam', description: 'Pounded Thai green papaya salad with lime, chile, peanuts, and dried shrimp.', cuisineId: thai.id, countryId: thailand.id, categoryId: salads.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 20, cookTimeMinutes: 0, totalTimeMinutes: 20, servings: 2, calories: 190, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Som_Tam_or_Thai_Green_Papaya_Salad.jpg?width=1000', ingredients: [['green papaya', 400, 'g'], ['cherry tomatoes', 150, 'g'], ['long beans', 100, 'g'], ['roasted peanuts', 50, 'g'], ['lime', 2, ''], ['palm sugar', 30, 'g']], instructions: ['Pound garlic and chiles in a mortar, then add palm sugar, fish sauce, and lime.', 'Add shredded papaya, tomatoes, and long beans, and pound until juicy.', 'Toss with peanuts and dried shrimp; serve immediately and cold.'], tagIds: [fresh.id, spicy.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Coq au Vin', slug: 'coq-au-vin', description: 'French braised chicken simmered in red wine with mushrooms, bacon, and pearl onions.', cuisineId: french.id, countryId: france.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 30, cookTimeMinutes: 90, totalTimeMinutes: 120, servings: 6, calories: 580, tips: 'Marinate the chicken in wine overnight for the deepest flavor.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Coq_au_Vin_6of7_%288735164745%29.jpg?width=1000', ingredients: [['chicken thighs', 1.2, 'kg'], ['red wine', 750, 'ml'], ['bacon lardons', 150, 'g'], ['button mushrooms', 300, 'g'], ['pearl onions', 250, 'g'], ['bay leaf', 2, '']], instructions: ['Brown the chicken and bacon, then deglaze with wine.', 'Add mushrooms, pearl onions, and herbs, then braise until the chicken is falling apart.', 'Reduce the sauce and finish with a knob of butter.'], tagIds: [comfort.id, slowCooked.id], dietIds: [glutenFree.id],
    },
    {
      title: 'French Onion Soup', slug: 'french-onion-soup', description: 'Dark caramelized onions in rich beef broth, capped with a toasty cheese crouton.', cuisineId: french.id, countryId: france.id, categoryId: soups.id, difficulty: Difficulty.MEDIUM, mealType: MealType.LUNCH, prepTimeMinutes: 20, cookTimeMinutes: 75, totalTimeMinutes: 95, servings: 4, calories: 380, tips: 'Take the time to caramelize the onions deeply — it is the whole flavor of the soup.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Soupe_%C3%A0_l%27oignon_01.JPG?width=1000', ingredients: [['yellow onions', 1.5, 'kg'], ['beef stock', 1.5, 'l'], ['butter', 60, 'g'], ['baguette', 4, 'slices'], ['gruyère', 150, 'g'], ['dry white wine', 150, 'ml']], instructions: ['Caramelize the onions slowly in butter until deep mahogany.', 'Deglaze with wine, add beef stock, and simmer for 30 minutes.', 'Ladle into bowls, top with toasted baguette and gruyère, and broil until molten.'], tagIds: [comfort.id, classic.id], dietIds: [],
    },
    {
      title: 'Crème Brûlée', slug: 'creme-brulee', description: 'Silky vanilla custard with a crisp, crackling caramelized sugar top.', cuisineId: french.id, countryId: france.id, categoryId: desserts.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DESSERT, prepTimeMinutes: 20, cookTimeMinutes: 40, totalTimeMinutes: 260, servings: 4, calories: 410, tips: 'Torch the sugar just before serving so the crust is warm and the custard stays cool.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cr%C3%A8me_br%C3%BBl%C3%A9e_w._whipped_cream.jpg?width=1000', ingredients: [['heavy cream', 500, 'ml'], ['egg yolks', 5, ''], ['vanilla bean', 1, ''], ['caster sugar', 60, 'g'], ['demerara sugar', 40, 'g']], instructions: ['Heat cream with vanilla, then whisk slowly into beaten yolks and sugar.', 'Strain into ramekins and bake in a water bath until just set.', 'Chill, then sprinkle with demerara and caramelize with a torch.'], tagIds: [classic.id, comfort.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Massaman Curry', slug: 'massaman-curry', description: 'Mild, fragrant Thai-Muslim curry with beef, potatoes, and roasted peanuts.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 90, totalTimeMinutes: 110, servings: 4, calories: 620, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Beef_Massaman_curry_with_brown_rice.jpg?width=1000', ingredients: [['beef chuck', 700, 'g'], ['massaman curry paste', 70, 'g'], ['coconut milk', 800, 'ml'], ['potatoes', 400, 'g'], ['roasted peanuts', 60, 'g'], ['cinnamon stick', 1, '']], instructions: ['Sear the beef, then simmer gently in coconut milk with massaman paste and spices.', 'Add potatoes and peanuts and cook until tender and the sauce is thick.', 'Correct with fish sauce, palm sugar, and tamarind; serve with rice.'], tagIds: [slowCooked.id, comfort.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Tom Yum Goong', slug: 'tom-yum-goong', description: 'Hot-and-sour Thai prawn soup with lemongrass, galangal, and mushrooms.', cuisineId: thai.id, countryId: thailand.id, categoryId: soups.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 15, cookTimeMinutes: 15, totalTimeMinutes: 30, servings: 4, calories: 250, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom_yum_goong-01.jpg?width=1000', ingredients: [['prawns', 400, 'g'], ['lemongrass', 2, 'stalks'], ['galangal', 30, 'g'], ['kaffir lime leaves', 6, ''], ['bird’s eye chiles', 5, ''], ['straw mushrooms', 200, 'g']], instructions: ['Simmer lemongrass, galangal, and lime leaves in stock to build the broth.', 'Add mushrooms and prawns and cook briefly.', 'Season with fish sauce, lime juice, and crushed chiles; serve bubbling hot.'], tagIds: [spicy.id, fresh.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Enchiladas de Mole', slug: 'enchiladas-de-mole', description: 'Corn tortillas rolled around spiced chicken and bathed in rich, dark mole sauce.', cuisineId: mexican.id, countryId: mexico.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 30, cookTimeMinutes: 40, totalTimeMinutes: 70, servings: 4, calories: 580, heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Enchiladas_de_mole_caseras.jpg?width=1000', ingredients: [['corn tortillas', 12, ''], ['shredded chicken', 500, 'g'], ['mole sauce', 600, 'ml'], ['cotija cheese', 80, 'g'], ['white onion', 1, ''], ['sour cream', 120, 'g']], instructions: ['Warm the tortillas and fill with seasoned shredded chicken.', 'Roll, seam-side down, and cover with warm mole sauce.', 'Top with cotija, onion, and sour cream, and bake until bubbling.'], tagIds: [classic.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Chicken Biryani', slug: 'chicken-biryani', description: 'Fragrant layered rice with marinated chicken, saffron, and fried onions.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.HARD, mealType: MealType.DINNER, prepTimeMinutes: 45, cookTimeMinutes: 60, totalTimeMinutes: 105, servings: 6, calories: 680, tips: 'Layer the rice and chicken and steam on the lowest heat so the flavors infuse.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Biryani_Home.jpg?width=1000', ingredients: [['basmati rice', 500, 'g'], ['chicken thighs', 800, 'g'], ['Greek yogurt', 150, 'g'], ['biryani masala', 3, 'tbsp'], ['saffron', 1, 'tsp'], ['fried onions', 100, 'g']], instructions: ['Marinate chicken in yogurt, masala, and ginger for at least an hour.', 'Parboil basmati rice with whole spices until two-thirds done.', 'Layer chicken and rice with saffron milk and fried onions, then seal and steam until tender.'], tagIds: [classic.id, onePot.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Fesenjan', slug: 'fesenjan', description: 'Rich Persian stew of duck or chicken simmered with ground walnuts and pomegranate molasses.', cuisineId: persian.id, countryId: iran.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 150, totalTimeMinutes: 170, servings: 6, calories: 640, tips: 'Let the sauce reduce until it glistens and coats the meat generously.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Khoresht-e_fesenjan.jpg?width=1000', ingredients: [['chicken thighs', 1.2, 'kg'], ['ground walnuts', 300, 'g'], ['pomegranate molasses', 120, 'ml'], ['yellow onion', 2, ''], ['saffron', 1, 'tsp'], ['chicken stock', 500, 'ml']], instructions: ['Sauter the onions until golden, then brown the chicken on all sides.', 'Stir in ground walnuts and pomegranate molasses, and add the stock.', 'Simmer gently, covered, until the chicken is tender and the sauce is deep and glossy. Serve with rice.'], tagIds: [comfort.id, slowCooked.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Mirza Ghasemi', slug: 'mirza-ghasemi', description: 'Smoky Persian aubergine dip with garlic, tomato, eggs, and turmeric.', cuisineId: persian.id, countryId: iran.id, categoryId: appetizers.id, difficulty: Difficulty.EASY, mealType: MealType.SNACK, prepTimeMinutes: 15, cookTimeMinutes: 45, totalTimeMinutes: 60, servings: 4, calories: 190, tips: 'Charring the aubergine over an open flame gives the dish its signature smokiness.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mirza-Qasemi_dish.jpg?width=1000', ingredients: [['aubergines', 3, 'large'], ['garlic', 5, 'cloves'], ['tomatoes', 3, ''], ['eggs', 2, ''], ['turmeric', 1, 'tsp'], ['olive oil', 60, 'ml']], instructions: ['Char the aubergines until the skins are black, then peel and mash the flesh.', 'Sauter garlic and tomato with turmeric, then fold in the aubergine.', 'Stir in the eggs until softly set, season, and serve warm with flatbread.'], tagIds: [grilled.id, fresh.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Kashke Bademjan', slug: 'kashke-bademjan', description: 'Velvety Persian aubergine dip topped with whey, mint oil, and fried onions.', cuisineId: persian.id, countryId: iran.id, categoryId: appetizers.id, difficulty: Difficulty.EASY, mealType: MealType.SNACK, prepTimeMinutes: 20, cookTimeMinutes: 50, totalTimeMinutes: 70, servings: 4, calories: 230, tips: 'Do not skimp on the fried garlic and mint oil on top - that is the flavor.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kashk_e_Badamjan.jpg?width=1000', ingredients: [['aubergines', 4, 'medium'], ['kashk', 200, 'g'], ['yellow onion', 2, ''], ['dried mint', 2, 'tbsp'], ['garlic', 4, 'cloves'], ['vegetable oil', 90, 'ml']], instructions: ['Fry the aubergines until golden and soft, then mash with garlic.', 'Swirl in the kashk and season with salt and pepper.', 'Top with crispy fried onions, mint oil, and extra kashk. Serve with warm bread.'], tagIds: [comfort.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Ash Reshteh', slug: 'ash-reshteh', description: 'Hearty Persian noodle soup with beans, herbs, and a tangy kashk swirl.', cuisineId: persian.id, countryId: iran.id, categoryId: soups.id, difficulty: Difficulty.MEDIUM, mealType: MealType.LUNCH, prepTimeMinutes: 30, cookTimeMinutes: 120, totalTimeMinutes: 150, servings: 8, calories: 380, tips: 'Add the noodles last and do not overcook them - they should keep a little bite.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ash_reshteh.jpg?width=1000', ingredients: [['reshteh noodles', 250, 'g'], ['kidney beans', 200, 'g'], ['chickpeas', 200, 'g'], ['fresh parsley', 100, 'g'], ['fresh cilantro', 100, 'g'], ['kashk', 150, 'g']], instructions: ['Simmer the beans until tender, then add the finely chopped herbs.', 'Add the noodles and cook until just tender, stirring often.', 'Season and serve in bowls, swirled with kashk and crispy mint oil.'], tagIds: [comfort.id, fresh.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Spaghetti Carbonara', slug: 'spaghetti-carbonara', description: 'Silky Roman pasta with guanciale, pecorino, eggs, and cracked black pepper.', cuisineId: italian.id, countryId: italy.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 10, cookTimeMinutes: 20, totalTimeMinutes: 30, servings: 4, calories: 610, tips: 'Work off the heat when adding the egg mixture so it turns creamy, not scrambled.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Spaghetti_alla_carbonara.jpg?width=1000', ingredients: [['spaghetti', 400, 'g'], ['guanciale', 150, 'g'], ['pecorino romano', 100, 'g'], ['egg yolks', 4, ''], ['black pepper', 2, 'tsp'], ['pasta water', 100, 'ml']], instructions: ['Cook the spaghetti in well-salted water; crisp the guanciale until golden.', 'Whisk yolks with pecorino and pepper, then loosen with pasta water.', 'Toss hot pasta with guanciale, remove from heat, and fold in the egg mixture until glossy.'], tagIds: [classic.id, weeknight.id], dietIds: [],
    },
    {
      title: 'Caprese Salad', slug: 'caprese-salad', description: 'Fresh mozzarella, ripe tomatoes, and basil dressed with olive oil and sea salt.', cuisineId: italian.id, countryId: italy.id, categoryId: salads.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 10, cookTimeMinutes: 0, totalTimeMinutes: 10, servings: 2, calories: 240, tips: 'Use the best tomatoes you can find and finish with flaky salt at the table.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Caprese-1.jpg?width=1000', ingredients: [['ripe tomatoes', 4, ''], ['fresh mozzarella', 250, 'g'], ['fresh basil', 20, 'leaves'], ['olive oil', 30, 'ml'], ['balsamic glaze', 1, 'tbsp'], ['flaky sea salt', 1, 'tsp']], instructions: ['Slice the tomatoes and mozzarella into even rounds.', 'Layer them with basil leaves and season with salt.', 'Finish with olive oil and a drizzle of balsamic glaze.'], tagIds: [fresh.id, quick.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Panna Cotta', slug: 'panna-cotta', description: 'Silky Italian vanilla cream set with gelatine and served with a berry coulis.', cuisineId: italian.id, countryId: italy.id, categoryId: desserts.id, difficulty: Difficulty.EASY, mealType: MealType.DESSERT, prepTimeMinutes: 15, cookTimeMinutes: 15, totalTimeMinutes: 270, servings: 6, calories: 410, tips: 'Warm the cream gently - do not boil - so the gelatine sets without a skin.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panna_cotta.jpg?width=1000', ingredients: [['heavy cream', 500, 'ml'], ['whole milk', 200, 'ml'], ['gelatine sheets', 6, ''], ['sugar', 90, 'g'], ['vanilla extract', 2, 'tsp'], ['mixed berries', 300, 'g']], instructions: ['Bloom the gelatine in cold water while the cream warms with sugar and vanilla.', 'Stir in the squeezed gelatine until dissolved, then pour into molds.', 'Chill for at least 4 hours, then unmold and serve with the berry coulis.'], tagIds: [classic.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Eggplant Parmigiana', slug: 'eggplant-parmigiana', description: 'Layers of golden fried aubergine, tomato sauce, mozzarella, and parmesan.', cuisineId: italian.id, countryId: italy.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 30, cookTimeMinutes: 60, totalTimeMinutes: 90, servings: 6, calories: 480, tips: 'Salt the aubergine slices first to draw out moisture and bitterness.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Melanzane_alla_parmigiana.jpg?width=1000', ingredients: [['aubergines', 3, 'large'], ['tomato passata', 700, 'ml'], ['mozzarella', 300, 'g'], ['parmesan', 100, 'g'], ['basil', 15, 'leaves'], ['olive oil', 100, 'ml']], instructions: ['Salt the aubergine slices, rest, then pat dry and fry until golden.', 'Layer aubergine, tomato sauce, mozzarella, and parmesan in a baking dish.', 'Bake until bubbling and molten on top, then rest before serving.'], tagIds: [comfort.id, classic.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Dal Tadka', slug: 'dal-tadka', description: 'Creamy yellow lentils topped with a sizzling tempering of garlic, cumin, and chile.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 10, cookTimeMinutes: 40, totalTimeMinutes: 50, servings: 4, calories: 320, tips: 'The tadka - hot ghee poured over the finished dal - is what makes it sing.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dal_Tadka-Delhi.jpg?width=1000', ingredients: [['yellow lentils', 300, 'g'], ['ghee', 60, 'g'], ['garlic', 5, 'cloves'], ['cumin seeds', 2, 'tsp'], ['dried red chiles', 2, ''], ['turmeric', 1, 'tsp']], instructions: ['Simmer the lentils with turmeric until completely soft, then season.', 'Fry the garlic, cumin, and chiles in hot ghee until fragrant.', 'Pour the sizzling tadka over the dal and serve with rice or roti.'], tagIds: [comfort.id, quick.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Aloo Gobi', slug: 'aloo-gobi', description: 'Dry-cooked Indian potato and cauliflower curry perfumed with ginger and turmeric.', cuisineId: indian.id, countryId: india.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 15, cookTimeMinutes: 30, totalTimeMinutes: 45, servings: 4, calories: 260, tips: 'Cook covered so the cauliflower steams and browns without burning.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aloo_gobi.jpg?width=1000', ingredients: [['potatoes', 500, 'g'], ['cauliflower', 1, 'head'], ['ginger', 30, 'g'], ['turmeric', 1, 'tsp'], ['cumin seeds', 2, 'tsp'], ['garam masala', 1, 'tbsp']], instructions: ['Fry the cumin seeds, then add ginger, turmeric, and potatoes.', 'Add the cauliflower, season, and cook covered until tender.', 'Finish with garam masala and cilantro, and serve hot.'], tagIds: [onePot.id, weeknight.id], dietIds: [vegetarian.id, vegan.id, glutenFree.id],
    },
    {
      title: 'Samosa', slug: 'samosa', description: 'Crisp golden pastry triangles stuffed with spiced potato and pea filling.', cuisineId: indian.id, countryId: india.id, categoryId: appetizers.id, difficulty: Difficulty.HARD, mealType: MealType.SNACK, prepTimeMinutes: 45, cookTimeMinutes: 30, totalTimeMinutes: 75, servings: 8, calories: 320, tips: 'Seal the pastry edges firmly so the samosas do not burst while frying.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Samosa_2.jpg?width=1000', ingredients: [['plain flour', 250, 'g'], ['potatoes', 400, 'g'], ['green peas', 100, 'g'], ['cumin seeds', 1, 'tsp'], ['garam masala', 1, 'tbsp'], ['vegetable oil', 500, 'ml']], instructions: ['Knead the flour, oil, salt, and water into a firm dough and rest it.', 'Cook a spiced potato and pea filling and let it cool completely.', 'Shape, fill, and fold the samosas, then deep-fry until golden and crisp.'], tagIds: [streetFood.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Gulab Jamun', slug: 'gulab-jamun', description: 'Soft milk-solid dumplings soaked in a fragrant rose and cardamom syrup.', cuisineId: indian.id, countryId: india.id, categoryId: desserts.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DESSERT, prepTimeMinutes: 20, cookTimeMinutes: 40, totalTimeMinutes: 90, servings: 6, calories: 420, tips: 'Fry on a gentle heat so the dumplings cook through without browning too fast.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gulab_jamun.jpg?width=1000', ingredients: [['khoya', 300, 'g'], ['plain flour', 60, 'g'], ['sugar', 250, 'g'], ['cardamom pods', 4, ''], ['rose water', 1, 'tbsp'], ['ghee', 300, 'g']], instructions: ['Knead khoya, flour, and a little cardamom into a soft dough.', 'Roll into small balls and deep-fry gently until deep golden.', 'Soak the warm dumplings in hot rose-cardamom syrup for at least an hour before serving.'], tagIds: [classic.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Pozole Rojo', slug: 'pozole-rojo', description: 'Slow-simmered Mexican hominy stew with pork, guajillo chiles, and crisp toppings.', cuisineId: mexican.id, countryId: mexico.id, categoryId: soups.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 30, cookTimeMinutes: 150, totalTimeMinutes: 180, servings: 8, calories: 520, tips: 'Serve family-style with lime, radish, cabbage, oregano, and chile at the table.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pozole_Rojo_Mexicano.jpg?width=1000', ingredients: [['hominy', 600, 'g'], ['pork shoulder', 1.2, 'kg'], ['guajillo chiles', 5, ''], ['garlic', 4, 'cloves'], ['dried oregano', 1, 'tbsp'], ['lime', 2, '']], instructions: ['Simmer the pork and hominy in water until both are tender.', 'Blend rehydrated guajillos with garlic and stir into the pot.', 'Season and simmer until rich, then serve with shredded cabbage, radish, and lime.'], tagIds: [comfort.id, slowCooked.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Elote', slug: 'elote', description: 'Grilled Mexican street corn slathered with crema, cotija, and chili powder.', cuisineId: mexican.id, countryId: mexico.id, categoryId: appetizers.id, difficulty: Difficulty.EASY, mealType: MealType.SNACK, prepTimeMinutes: 5, cookTimeMinutes: 15, totalTimeMinutes: 20, servings: 4, calories: 210, tips: 'Let the cobs char in patches; the smoky spots carry the flavor.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Elotes.jpg?width=1000', ingredients: [['corn on the cob', 4, ''], ['Mexican crema', 120, 'g'], ['cotija cheese', 80, 'g'], ['chili powder', 2, 'tsp'], ['lime', 1, ''], ['cilantro', 15, 'g']], instructions: ['Grill the corn over hot coals until charred in spots.', 'Brush generously with crema and roll in crumbled cotija.', 'Finish with chili powder, lime, and cilantro, and serve hot.'], tagIds: [streetFood.id, grilled.id], dietIds: [vegetarian.id, glutenFree.id],
    },
    {
      title: 'Churros', slug: 'churros', description: 'Crisp cinnamon-sugar churros with a rich dark chocolate dipping sauce.', cuisineId: mexican.id, countryId: mexico.id, categoryId: desserts.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DESSERT, prepTimeMinutes: 20, cookTimeMinutes: 30, totalTimeMinutes: 50, servings: 6, calories: 450, tips: 'Pipe the churros straight into hot oil and fry until deeply golden.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Churros_Madrid.jpg?width=1000', ingredients: [['plain flour', 250, 'g'], ['water', 350, 'ml'], ['butter', 60, 'g'], ['sugar', 100, 'g'], ['cinnamon', 2, 'tbsp'], ['dark chocolate', 200, 'g']], instructions: ['Bring water and butter to a boil, then beat in the flour to form a dough.', 'Pipe the dough into hot oil and fry until crisp and golden.', 'Dredge in cinnamon sugar and serve with melted chocolate.'], tagIds: [streetFood.id], dietIds: [vegetarian.id],
    },
    {
      title: 'Pad See Ew', slug: 'pad-see-ew', description: 'Stir-fried wide rice noodles with chicken, Chinese broccoli, and sweet soy.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DINNER, prepTimeMinutes: 20, cookTimeMinutes: 15, totalTimeMinutes: 35, servings: 2, calories: 520, tips: 'Cook over the highest heat and leave the noodles still so they develop smoky char marks.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pad_see_ew.jpg?width=1000', ingredients: [['wide rice noodles', 300, 'g'], ['chicken breast', 250, 'g'], ['chinese broccoli', 200, 'g'], ['sweet soy sauce', 45, 'ml'], ['oyster sauce', 30, 'ml'], ['eggs', 2, '']], instructions: ['Blanch the broccoli briefly, then stir-fry the chicken until cooked.', 'Add noodles and sauces, toss over high heat until charred.', 'Push to one side, scramble the eggs, then fold everything together and serve.'], tagIds: [quick.id, weeknight.id], dietIds: [],
    },
    {
      title: 'Tom Kha Gai', slug: 'tom-kha-gai', description: 'Coconut chicken soup with galangal, lemongrass, mushrooms, and lime leaves.', cuisineId: thai.id, countryId: thailand.id, categoryId: soups.id, difficulty: Difficulty.EASY, mealType: MealType.LUNCH, prepTimeMinutes: 15, cookTimeMinutes: 20, totalTimeMinutes: 35, servings: 4, calories: 360, tips: 'Do not boil the coconut milk hard - it should barely simmer to stay silky.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tom_kha_gai2.jpg?width=1000', ingredients: [['chicken thighs', 500, 'g'], ['coconut milk', 800, 'ml'], ['galangal', 40, 'g'], ['lemongrass', 2, 'stalks'], ['kaffir lime leaves', 6, ''], ['straw mushrooms', 200, 'g']], instructions: ['Bring coconut milk with galangal, lemongrass, and lime leaves to a gentle simmer.', 'Add chicken and mushrooms and cook until just done.', 'Season with fish sauce, lime juice, and chiles; serve hot.'], tagIds: [fresh.id, spicy.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Pad Krapow', slug: 'pad-krapow', description: 'Fiery Thai basil stir-fried pork with garlic, chiles, and a fried egg on rice.', cuisineId: thai.id, countryId: thailand.id, categoryId: mains.id, difficulty: Difficulty.EASY, mealType: MealType.DINNER, prepTimeMinutes: 10, cookTimeMinutes: 10, totalTimeMinutes: 20, servings: 2, calories: 580, tips: 'Use a wok over screaming heat and add the basil at the very end so it stays perfumed.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kraphao_mu_khai_dao.jpg?width=1000', ingredients: [['pork mince', 400, 'g'], ['thai basil', 40, 'g'], ['garlic', 5, 'cloves'], ['bird chiles', 6, ''], ['oyster sauce', 30, 'ml'], ['jasmine rice', 200, 'g']], instructions: ['Pound garlic and chiles, then fry in a hot wok until fragrant.', 'Add the pork and stir-fry, breaking it up until crisp at the edges.', 'Season with oyster sauce and fish sauce, throw in the basil, and serve over rice with a fried egg.'], tagIds: [spicy.id, quick.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Boeuf Bourguignon', slug: 'boeuf-bourguignon', description: 'Classic French beef stew braised in red wine with mushrooms, bacon, and pearl onions.', cuisineId: french.id, countryId: france.id, categoryId: mains.id, difficulty: Difficulty.HARD, mealType: MealType.DINNER, prepTimeMinutes: 40, cookTimeMinutes: 180, totalTimeMinutes: 220, servings: 6, calories: 690, tips: 'One bottle of red wine and a slow oven do the work; rest it overnight for the best flavor.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Boeuf_Bourguignon_Paris_Beaubourg.jpg?width=1000', ingredients: [['beef chuck', 1.5, 'kg'], ['red wine', 750, 'ml'], ['bacon lardons', 200, 'g'], ['mushrooms', 400, 'g'], ['pearl onions', 300, 'g'], ['beef stock', 500, 'ml']], instructions: ['Brown the beef and bacon in batches, then deglaze with wine.', 'Return everything to the pot with stock and aromatics, then braise in a low oven until meltingly tender.', 'Add mushrooms and onions, reduce the sauce, and serve with crusty bread or potatoes.'], tagIds: [comfort.id, slowCooked.id], dietIds: [glutenFree.id],
    },
    {
      title: 'Tarte Tatin', slug: 'tarte-tatin', description: 'Caramelized upside-down apple tart with a flaky pastry crust.', cuisineId: french.id, countryId: france.id, categoryId: desserts.id, difficulty: Difficulty.MEDIUM, mealType: MealType.DESSERT, prepTimeMinutes: 30, cookTimeMinutes: 45, totalTimeMinutes: 105, servings: 8, calories: 430, tips: 'Cook the caramel until deep amber and arrange the apples neatly for a beautiful top.', heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tarte_tatin_appletart.jpg?width=1000', ingredients: [['apples', 6, 'medium'], ['puff pastry', 320, 'g'], ['sugar', 180, 'g'], ['butter', 80, 'g'], ['vanilla bean', 1, ''], ['sea salt', 1, 'tsp']], instructions: ['Cook butter and sugar in a skillet until deep amber, then arrange the apples on top.', 'Cover with the pastry and bake until golden and crisp.', 'Rest for five minutes, then carefully invert onto a plate and serve warm.'], tagIds: [classic.id], dietIds: [vegetarian.id],
    },
  ];

  for (const r of recipes) {
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {
        title: r.title,
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
        tags: { create: ((r.tagIds as Array<{ id: string } | string> | undefined) ?? []).map((tagId) => ({ tag: { connect: { id: typeof tagId === 'string' ? tagId : tagId.id } } })) },
        diets: (r.dietIds ?? []).length ? { create: (r.dietIds as string[]).map((dietId) => ({ dietId })) } : undefined,
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
