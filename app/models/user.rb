class User < ApplicationRecord
  has_secure_password

  validates :first_name, :last_name, :email, :account_type, presence: true

  validates :account_type, inclusion: {
    in: %w[Admin Student Instructor]
  }

  validates :email, presence: true, uniqueness: { scope: :account_type }

  attribute :active, :boolean, default: true
  attribute :approved, :boolean, default: true
  attribute :github_uid, :string
  attribute :github_token, :string
  attribute :google_uid, :string
  attribute :google_token, :string

  has_one :profile, dependent: :destroy
  has_many :courses, foreign_key: :instructor_id, dependent: :destroy
  has_many :enrollments, dependent: :destroy
  has_many :enrolled_courses, through: :enrollments, source: :course
  has_many :course_progresses, dependent: :destroy
  has_many :rating_and_reviews, dependent: :destroy

  after_create :create_user_profile

  private

  def create_user_profile
    create_profile
  end

  before_save :set_default_image

  private

  def set_default_image
    placeholders = ["default.jpg", "null", "undefined", ""]
    if self.image.blank? || placeholders.include?(self.image) || self.image.include?("dicebear.com/5.x")
      self.image = "https://api.dicebear.com/9.x/initials/svg?seed=#{self.first_name}#{self.last_name}"
    end
  end
end