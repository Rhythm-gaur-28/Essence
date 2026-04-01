require('dotenv').config();

const sequelize = require('../config/db');

const normalizeTableName = (table) => {
  if (typeof table === 'string') return table;
  if (table && typeof table === 'object') {
    if (table.tableName) return table.tableName;
    const firstValue = Object.values(table)[0];
    if (typeof firstValue === 'string') return firstValue;
  }
  return null;
};

const clearDatabase = async () => {
  let fkChecksDisabled = false;

  try {
    console.log('Starting database clear...');

    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();
    const rawTables = await queryInterface.showAllTables();
    const tables = rawTables
      .map(normalizeTableName)
      .filter(Boolean)
      .filter((name) => !['SequelizeMeta', 'SequelizeData'].includes(name));

    if (tables.length === 0) {
      console.log('No tables found to clear.');
      return;
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    fkChecksDisabled = true;

    for (const table of tables) {
      await sequelize.query(`TRUNCATE TABLE \`${table}\``);
      console.log(`Cleared table: ${table}`);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    fkChecksDisabled = false;

    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Failed to clear database:', error.message);
    process.exitCode = 1;
  } finally {
    if (fkChecksDisabled) {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (toggleError) {
        console.error('Warning: could not re-enable FOREIGN_KEY_CHECKS:', toggleError.message);
      }
    }

    await sequelize.close();
  }
};

clearDatabase();
