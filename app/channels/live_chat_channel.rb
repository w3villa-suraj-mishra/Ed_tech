class LiveChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "live_chat_#{params[:session_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def speak(data)
    message = LiveChatMessage.create!(
      live_session_id: params[:session_id],
      user_id: current_user.id,
      message: data['message']
    )

    ActionCable.server.broadcast("live_chat_#{params[:session_id]}", {
      message: message.message,
      user_id: message.user_id,
      user_name: "#{message.user.first_name} #{message.user.last_name}",
      created_at: message.created_at
    })
  end
end
