class ProfileController < ApplicationController
  before_action :authenticate_user

  def get_user_details
    render json: {
      success: true,
      message: "User data fetched successfully",
      data: @current_user
    }
  end
  def delete_account
    if @current_user.destroy
      reset_session
      render json: {
        success: true,
        message: "Account deleted successfully"
      }
    else
      render json: {
        success: false,
        message: "Failed to delete account"
      }, status: :unprocessable_entity
    end
  end

  def instructor_dashboard
    begin
      courses = Course.where(instructor_id: @current_user.id)
      
      course_data = courses.map do |course|
        total_students = Enrollment.where(course_id: course.id).count
        total_amount = total_students * course.price
        
        {
          _id: course.id,
          courseName: course.course_name,
          courseDescription: course.course_description,
          totalStudentsEnrolled: total_students,
          totalAmountGenerated: total_amount
        }
      end

      render json: {
        success: true,
        data: course_data
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def update_profile
    begin
      gender = params[:gender]
      date_of_birth = params[:dateOfBirth]
      about = params[:about]
      contact_number = params[:contactNumber]
      first_name = params[:firstName]
      last_name = params[:lastName]

      @current_user.update!(first_name: first_name, last_name: last_name) if first_name || last_name
      
      profile = @current_user.profile || @current_user.create_profile
      profile.update!(
        gender: gender,
        date_of_birth: date_of_birth,
        about: about,
        contact_number: contact_number
      )

      render json: {
        success: true,
        message: "Profile updated successfully",
        data: @current_user.as_json(include: :profile).merge("additionalDetails" => profile)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end
end
