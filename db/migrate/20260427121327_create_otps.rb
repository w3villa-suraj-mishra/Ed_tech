class CreateOtps < ActiveRecord::Migration[8.1]
  def change
    create_table :otps do |t|
      t.string :email
      t.string :code
      t.datetime :expires_at
      t.boolean :verified

      t.timestamps
    end
  end
end
