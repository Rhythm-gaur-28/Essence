require("dotenv").config();

const sequelize = require("../config/db");

const Category = require("../models/Category");

const seedCategories = async () => {
  try {
    console.log("Seeding categories...");

    await sequelize.authenticate();

    const categoryPayload = [
      { name: "Men", image_url: "" },
      { name: "Women", image_url: "" },
      { name: "Unisex", image_url: "" },
    ];

    let inserted = 0;
    for (const category of categoryPayload) {
      const [row, created] = await Category.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });

      if (!created && row.image_url !== category.image_url) {
        await row.update({ image_url: category.image_url });
      }

      if (created) inserted += 1;
    }

    console.log(`Categories processed: ${categoryPayload.length}, inserted: ${inserted}`);
  } catch (error) {
    console.error("Failed to seed categories:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedCategories();
