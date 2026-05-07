class Section < ApplicationRecord
  belongs_to :course
  has_many :sub_sections, dependent: :destroy
end
