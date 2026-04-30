Rails.application.routes.draw do
  post "/signup", to: "auth#signup"
  post "/login", to: "auth#login"
  post "/send_otp", to: "auth#send_otp"
  post "/verify_otp", to: "auth#verify_otp"
  post "/logout", to: "auth#logout"
  # Authenticates user, creates JWT, redirects dashboard.
  get "/auth/:provider/callback", to: "sessions#create"
  get "/github-start", to: "sessions#github_start"
  # Handles failed GitHub login attempts.
  get "/auth/failure", to: redirect("http://localhost:3001/login?error=auth_failed")
  get "/profile/getUserDetails", to: "profile#get_user_details"
  delete "/profile/deleteAccount", to: "profile#delete_account"
end