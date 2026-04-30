class AddCompositeIndexToUsers < ActiveRecord::Migration[8.1]
  def change
    add_index :users, [:email, :account_type], unique: true
  end
end
