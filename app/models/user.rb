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

  before_save :set_default_image

  private

  def set_default_image
    placeholders = ["default.jpg", "null", "undefined", ""]
    if self.image.blank? || placeholders.include?(self.image) || self.image.include?("dicebear.com/5.x")
      self.image = "https://api.dicebear.com/9.x/initials/svg?seed=#{self.first_name}#{self.last_name}"
    end
  end
end