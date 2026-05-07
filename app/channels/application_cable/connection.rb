module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      begin
        decoded = JWT.decode(token, Rails.application.config.jwt_secret, true, { algorithm: 'HS256' })[0]
        if (verified_user = User.find_by(id: decoded['user_id']))
          verified_user
        else
          reject_unauthorized_connection
        end
      rescue
        reject_unauthorized_connection
      end
    end
  end
end
