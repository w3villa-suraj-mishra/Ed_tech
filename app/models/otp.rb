class Otp < ApplicationRecord
  validates :email, :code, :expires_at, presence: true
end