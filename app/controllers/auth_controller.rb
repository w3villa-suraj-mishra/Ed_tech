class AuthController < ApplicationController

  def signup
    existing_user = User.find_by(email: params[:email], account_type: params[:account_type])

    if existing_user
      render json: {
        success: false,
        message: "This account already exists for the selected role. Please log in."
      }, status: :unprocessable_entity
      return
    end

    # Check if OTP was verified for this email
    otp = Otp.find_by(email: params[:email], verified: true)
    if otp.nil?
      render json: {
        success: false,
        message: "Please verify your email with OTP first."
      }, status: :forbidden
      return
    end

    user = User.new(user_params)

    if user.save
      # Clean up the OTP after successful signup
      otp.destroy

      render json: {
        success: true,
        message: "Signup successful"
      }, status: :created
    else
      render json: {
        success: false,
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email], account_type: params[:account_type])

    if user && user.authenticate(params[:password])

      token = JWT.encode(
        { user_id: user.id, email: user.email, account_type: user.account_type },
        Rails.application.config.jwt_secret
      )

      render json: {
        success: true,
        message: "Login successful",
        token: token,
        user: user
      }, status: :ok

    else
      render json: {
        success: false,
        message: "Invalid email, password or role"
      }, status: :unauthorized
    end
  end

  def send_otp
    email = params[:email]
    account_type = params[:account_type]

    if User.exists?(email: email, account_type: account_type)
      render json: {
        success: false,
        message: "An account with this email and role is already registered. Please log in."
      }, status: :conflict
      return
    end

    # Reset any previous unverified OTPs
    Otp.where(email: email).destroy_all

    code = rand(100000..999999).to_s

    Otp.create(
      email: email,
      code: code,
      expires_at: 10.minutes.from_now,
      verified: false
    )

    OtpMailer.send_otp(email, code).deliver_now

    render json: {
      success: true,
      message: "OTP sent successfully"
    }
  end


  def verify_otp
    otp = Otp.where(email: params[:email], code: params[:code], verified: false)
             .where("expires_at > ?", Time.current)
             .last

    if otp
      otp.update(verified: true)

      render json: {
        success: true,
        message: "OTP Verified"
      }
    else
      render json: {
        success: false,
        message: "Invalid or Expired OTP"
      }, status: :unprocessable_entity
    end
  end

  def logout
    reset_session
    render json: {
      success: true,
      message: "Logged out successfully"
    }
  end

  private

  def user_params
    params.permit(
      :first_name,
      :last_name,
      :email,
      :password,
      :password_confirmation,
      :account_type,
      :image
    )
  end
end