class OtpMailer < ApplicationMailer
  default from: "your_email@gmail.com"

  def send_otp(email, code)
    @code = code
    mail(to: email, subject: "Your OTP Code")
  end
end