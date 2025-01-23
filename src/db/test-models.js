const { User, Message } = require('./models');
const sequelize = require('./config');

async function testModels() {
  try {
    // Force sync all tables (this will drop existing tables)
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Test user creation
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword',
      provider: 'local'
    });
    console.log('Test user created:', testUser.toJSON());

    // Test message creation
    const testMessage = await Message.create({
      content: 'Hello, this is a test message',
      sender: 'user',
      userId: testUser.id
    });
    console.log('Test message created:', testMessage.toJSON());

    // Test fetching messages for user
    const userMessages = await Message.findAll({
      where: { userId: testUser.id },
      include: [User]
    });
    console.log('User messages:', userMessages.map(m => m.toJSON()));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up test data
    await Message.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  }
}

testModels();
