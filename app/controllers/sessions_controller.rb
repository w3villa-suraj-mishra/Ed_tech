class SessionsController < ApplicationController
  require "net/http"
  require "json"
  require "uri"

  def github_start
    mode = params[:mode] || "signup"
    role = params[:role] || "Student"
    reset_session
    redirect_to "http://localhost:3000/auth/github?mode=#{mode}&role=#{role}"
  end

  def create
    auth = request.env["omniauth.auth"]
    params_data = request.env["omniauth.params"] || {}

    mode = params_data["mode"]          # signup / login
    role = params_data["role"] || "Student"

    provider = auth.provider
    uid = auth.uid
    token_str = auth.credentials.token

    # 
    # GET EMAIL (Google + GitHub)
    # 
    email = auth.info.email

    # GitHub sometimes hides email
    if email.blank? && provider == "github" && token_str.present?
      email = fetch_github_primary_email(token_str)
    end

    # If no email found
    if email.blank?
      redirect_to "http://localhost:3001/login?error=no_email"
      return
    end

    # 
    # FIND USER BY EMAIL + ROLE (ACCOUNT MERGE)
    # 
    user = User.find_by(
      email: email,
      account_type: role
    )

    if user
      # -------------------------------------
      # EXPLICIT MERGE: Update social fields
      # -------------------------------------
      if provider == "github"
        user.update(github_uid: uid, github_token: token_str) if user.github_uid.blank?
      elsif provider == "google_oauth2"
        user.update(google_uid: uid, google_token: token_str) if user.google_uid.blank?
      end
      
      # Ensure image is set if missing
      user.update(image: auth.info.image) if user.image.blank? && auth.info.image.present?

    else
      # -------------------------------------
      # NEW SIGNUP FLOW
      # -------------------------------------
      if mode == "signup"
        first_name, last_name = split_name(auth)

        user = User.new(
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: SecureRandom.hex(10),
          account_type: role,
          image: auth.info.image.presence || "https://api.dicebear.com/5.x/initials/svg?seed=#{first_name} #{last_name}",
          active: true,
          approved: true
        )

        if provider == "github"
          user.github_uid = uid
          user.github_token = token_str
        elsif provider == "google_oauth2"
          user.google_uid = uid
          user.google_token = token_str
        end

        user.save!
      else
        # Login mode but user not found
        redirect_to "http://localhost:3001/login?error=not_registered"
        return
      end
    end

    # 
    # JWT TOKEN
    # 
    token = JWT.encode(
      {
        user_id: user.id,
        email: user.email,
        role: user.account_type
      },
      Rails.application.config.jwt_secret
    )

    # 
    # FRONTEND REDIRECT
    # 
    redirect_to "http://localhost:3001/oauth-success?token=#{token}&role=#{user.account_type}"
  end

  private

  # 
  # SPLIT NAME
  # 
  def split_name(auth)
    full_name = auth.info.name.to_s.strip

    if full_name.present?
      parts = full_name.split(" ")
      first_name = parts.first
      last_name = parts[1..]&.join(" ")
    else
      first_name = auth.info.first_name || "User"
      last_name = auth.info.last_name || "Profile"
    end

    [first_name, last_name.presence || "Profile"]
  end

  # 
  # GITHUB PRIVATE EMAIL SUPPORT
  # 
  def fetch_github_primary_email(access_token)
    uri = URI("https://api.github.com/user/emails")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "Bearer #{access_token}"
    request["Accept"] = "application/vnd.github+json"
    request["User-Agent"] = "EdTech"

    response = http.request(request)

    return nil unless response.code == "200"

    emails = JSON.parse(response.body)

    primary_email = emails.find do |item|
      item["primary"] == true && item["verified"] == true
    end

    primary_email&.dig("email")
  rescue
    nil
  end
end