const { sequelize } = require('./database');

async function testDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // List all tables
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    // Test a query on the users table
    const userCount = await sequelize.query(`
      SELECT COUNT(*) as count FROM users
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`\n👥 Number of users in database: ${userCount[0].count}`);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
