class AddDurationToSubSections < ActiveRecord::Migration[8.1]
  def change
    add_column :sub_sections, :duration, :integer
  end
end
