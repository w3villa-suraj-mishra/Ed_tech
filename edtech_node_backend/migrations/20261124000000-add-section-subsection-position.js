'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sectionTable = await queryInterface.describeTable('sections');
    if (!sectionTable.position) {
      await queryInterface.addColumn('sections', 'position', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }

    const subSectionTable = await queryInterface.describeTable('sub_sections');
    if (!subSectionTable.position) {
      await queryInterface.addColumn('sub_sections', 'position', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sections', 'position');
    await queryInterface.removeColumn('sub_sections', 'position');
  }
};
