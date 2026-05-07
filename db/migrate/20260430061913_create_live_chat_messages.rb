class CreateLiveChatMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :live_chat_messages do |t|
      t.references :live_session, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :message

      t.timestamps
    end
  end
end
