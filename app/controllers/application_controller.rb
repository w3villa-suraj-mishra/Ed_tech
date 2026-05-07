class ApplicationController < ActionController::API
  def authenticate_user
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    if token.nil?
      render json: { success: false, message: "Token missing" }, status: :unauthorized
      return
    end

    begin
      decoded = JWT.decode(token, Rails.application.config.jwt_secret, true, { algorithm: 'HS256' })[0]
      @current_user = User.find_by(id: decoded['user_id'])

      if @current_user.nil?
        render json: { success: false, message: "User no longer exists" }, status: :unauthorized
      end
    rescue JWT::DecodeError => e
      render json: { success: false, message: "Invalid token" }, status: :unauthorized
    rescue => e
      render json: { success: false, message: "Authentication error" }, status: :unauthorized
    end
  end

  def is_instructor
    unless @current_user&.account_type == "Instructor"
      render json: { success: false, message: "This is a protected route for Instructors" }, status: :forbidden
    end
  end

  def is_admin
    unless @current_user&.account_type == "Admin"
      render json: { success: false, message: "This is a protected route for Admins" }, status: :forbidden
    end
  end
end
