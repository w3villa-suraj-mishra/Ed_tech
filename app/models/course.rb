class Course < ApplicationRecord
  belongs_to :instructor, class_name: "User"
  belongs_to :category
  has_many :sections, dependent: :destroy
  has_many :enrollments, dependent: :destroy
  has_many :rating_and_reviews, dependent: :destroy
  has_many :course_progresses, dependent: :destroy

  has_one_attached :thumbnail_image
end
