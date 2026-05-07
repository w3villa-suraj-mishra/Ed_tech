class AddInstructionsToCourses < ActiveRecord::Migration[8.1]
  def change
    add_column :courses, :instructions, :text
  end
end
