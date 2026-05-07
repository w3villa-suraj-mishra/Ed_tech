class LiveChatMessage < ApplicationRecord
  belongs_to :live_session
  belongs_to :user
end
