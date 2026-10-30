const Conversation = require('./Conversation');
const Message = require('./Message');
const User = require('../../../models/User');
const Course = require('../../../models/Course');

// Define associations
User.hasMany(Conversation, { as: 'conversations', foreignKey: 'userId', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo', onDelete: 'SET NULL' });
Conversation.belongsTo(Course, { as: 'course', foreignKey: 'courseId', onDelete: 'SET NULL' });
Conversation.hasMany(Message, { as: 'messages', foreignKey: 'conversationId', onDelete: 'CASCADE' });

Message.belongsTo(Conversation, { as: 'conversation', foreignKey: 'conversationId', onDelete: 'CASCADE' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId', onDelete: 'SET NULL' });

module.exports = {
  Conversation,
  Message
};
