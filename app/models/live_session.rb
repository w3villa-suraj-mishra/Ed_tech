class LiveSession < ApplicationRecord
  belongs_to :course
  has_many :live_chat_messages, dependent: :destroy
end
