class CreateRatingAndReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :rating_and_reviews do |t|
      t.integer :rating
      t.text :review
      t.references :user, null: false, foreign_key: true
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end
  end
end
