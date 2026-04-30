class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :password_digest
      t.string :account_type
      t.boolean :active
      t.boolean :approved
      t.string :image
      t.string :token
      t.datetime :reset_password_expires

      t.timestamps
    end
  end
end
