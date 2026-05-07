class SubSection < ApplicationRecord
  belongs_to :section
  has_one_attached :video_content
end
