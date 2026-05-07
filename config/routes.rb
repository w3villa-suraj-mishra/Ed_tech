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
  get "/profile/instructorDashboard", to: "profile#instructor_dashboard"
  put "/profile/updateProfile", to: "profile#update_profile"

  # Course Routes
  post "/course/createCourse", to: "course#create_course"
  post "/course/editCourse", to: "course#edit_course"
  get "/course/getInstructorCourses", to: "course#get_instructor_courses"
  get "/course/getAllCourses", to: "course#get_all_courses"
  get "/course/getCourseDetails", to: "course#get_course_details"
  get "/course/showAllCategories", to: "course#show_all_categories"
  post "/course/createCategory", to: "course#create_category"
  delete "/course/deleteCourse", to: "course#delete_course"
  
  # Section Routes
  post "/course/addSection", to: "course#add_section"
  post "/course/updateSection", to: "course#update_section"
  post "/course/deleteSection", to: "course#delete_section"
  
  # SubSection Routes
  post "/course/addSubSection", to: "course#add_sub_section"
  post "/course/updateSubSection", to: "course#update_sub_section"
  post "/course/updateLectureDuration", to: "course#update_lecture_duration"
  post "/course/deleteSubSection", to: "course#delete_sub_section"

  # Progress Routes
  post "/course/updateCourseProgress", to: "course#update_course_progress"
end