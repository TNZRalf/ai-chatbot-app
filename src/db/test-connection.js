const sequelize = require('./config');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Test database sync
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
