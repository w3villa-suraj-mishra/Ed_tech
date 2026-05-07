class CreateProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :profiles do |t|
      t.string :gender
      t.string :date_of_birth
      t.text :about
      t.string :contact_number
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
