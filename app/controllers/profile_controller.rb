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
end
