class CourseController < ApplicationController
  before_action :authenticate_user, except: [:get_all_courses, :get_course_details, :show_all_categories, :create_category]
  before_action :is_instructor, only: [:create_course, :edit_course, :get_instructor_courses, :delete_course, :add_section, :update_section, :delete_section, :add_sub_section, :update_sub_section, :delete_sub_section]
  before_action :is_admin, only: [] # Temporarily disabled for bulk creation

  def create_course
    begin
      course_name = params[:courseName]
      course_description = params[:courseDescription]
      what_you_will_learn = params[:whatYouWillLearn]
      price = params[:price]
      tag = params[:tag]
      category_id = params[:category]
      status = params[:status] || "Draft"
      thumbnail = params[:thumbnailImage]
      instructions = params[:instructions]

      category = Category.find_by(id: category_id)
      if !category
        return render json: { success: false, message: "Category not found" }, status: :not_found
      end

      # Proactively check file size for Cloudinary free tier (10MB limit)
      if thumbnail && thumbnail.size > 10.megabytes
        return render json: { success: false, message: "File size too large. Maximum allowed size is 10MB." }, status: :bad_request
      end

      course = Course.create!(
        course_name: course_name,
        course_description: course_description,
        what_you_will_learn: what_you_will_learn,
        price: price,
        tag: tag,
        instructions: instructions,
        category_id: category.id,
        status: status,
        instructor_id: @current_user.id
      )

      if thumbnail
        course.thumbnail_image.attach(thumbnail)
      end

      render json: {
        success: true,
        message: "Course created successfully",
        data: format_course(course)
      }
    rescue => e
      Rails.logger.error "CREATE COURSE FAILED: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def get_course_details
    begin
      course_id = params[:courseId]
      course = Course.find_by(id: course_id)

      if !course
        return render json: { success: false, message: "Course not found" }, status: :not_found
      end

      render json: {
        success: true,
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def get_instructor_courses
    begin
      courses = Course.where(instructor_id: @current_user.id).order(created_at: :desc)
      formatted_courses = courses.map { |c| format_course(c) }
      render json: {
        success: true,
        data: formatted_courses
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def edit_course
    begin
      course_id = params[:courseId]
      course = Course.find_by(id: course_id)

      unless course
        return render json: { success: false, message: "Course not found" }, status: :not_found
      end

      unless course.instructor_id == @current_user.id
        return render json: { success: false, message: "Unauthorized" }, status: :unauthorized
      end

      # Update only the fields that are provided
      update_params = {}
      update_params[:course_name]        = params[:courseName]        if params[:courseName].present?
      update_params[:course_description] = params[:courseDescription] if params[:courseDescription].present?
      update_params[:what_you_will_learn] = params[:whatYouWillLearn] if params[:whatYouWillLearn].present?
      update_params[:price]              = params[:price]             if params[:price].present?
      update_params[:tag]                = params[:tag]               if params[:tag].present?
      update_params[:status]             = params[:status]            if params[:status].present?
      update_params[:category_id]        = params[:category]          if params[:category].present?
      update_params[:instructions]       = params[:instructions]      if params[:instructions].present?

      course.update!(update_params)

      # Update thumbnail if a new one is provided
      if params[:thumbnailImage].present?
        course.thumbnail_image.purge if course.thumbnail_image.attached?
        course.thumbnail_image.attach(params[:thumbnailImage])
      end

      render json: {
        success: true,
        message: "Course updated successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def delete_course
    begin
      course_id = params[:courseId]
      course = Course.find(course_id)
      
      # Ensure only the instructor who created it can delete it
      if course.instructor_id == @current_user.id
        course.destroy!
        render json: { success: true, message: "Course deleted successfully" }
      else
        render json: { success: false, message: "Unauthorized to delete this course" }, status: :unauthorized
      end
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def get_all_courses
    begin
      courses = Course.all.order(created_at: :desc)
      formatted_courses = courses.map { |c| format_course(c) }
      render json: {
        success: true,
        data: formatted_courses
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def show_all_categories
    begin
      all_categories = Category.all.map do |cat|
        cat.as_json.merge("_id" => cat.id)
      end
      render json: {
        success: true,
        data: all_categories
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

 def create_category
  begin
    categories_data = params[:_json]

    if categories_data.blank?
      return render json: { success: false, message: "No category data provided" }, status: :bad_request
    end

    created = categories_data.map do |cat|
      Category.create!(
        name: cat["name"],
        description: cat["description"]
      )
    end

    render json: {
      success: true,
      message: "Categories created successfully",
      data: created.map { |c| c.as_json.merge("_id" => c.id) }
    }

  rescue => e
    render json: {
      success: false,
      message: e.message
    }, status: :internal_server_error
  end
end

  # ==========================================
  # SECTION MANAGEMENT
  # ==========================================

  def add_section
    begin
      section_name = params[:sectionName]
      course_id = params[:courseId]

      course = Course.find(course_id)
      section = course.sections.create!(section_name: section_name)

      render json: {
        success: true,
        message: "Section created successfully",
        updatedCourse: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def update_section
    begin
      section_name = params[:sectionName]
      section_id = params[:sectionId]
      course_id = params[:courseId]

      section = Section.find(section_id)
      section.update!(section_name: section_name)

      course = Course.find(course_id)
      render json: {
        success: true,
        message: "Section updated successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def delete_section
    begin
      section_id = params[:sectionId]
      course_id = params[:courseId]

      section = Section.find(section_id)
      section.destroy!

      course = Course.find(course_id)
      render json: {
        success: true,
        message: "Section deleted successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  # ==========================================
  # SUB-SECTION MANAGEMENT
  # ==========================================

  def add_sub_section
    begin
      section_id = params[:sectionId]
      title = params[:title]
      description = params[:description]
      video = params[:video]

      section = Section.find(section_id)
      sub_section = section.sub_sections.create!(
        title: title,
        description: description,
        duration: params[:duration].to_i
      )

      if video
        sub_section.video_content.attach(video)
      end

      course = section.course
      render json: {
        success: true,
        message: "Lecture added successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def update_sub_section
    begin
      sub_section_id = params[:subSectionId]
      title = params[:title]
      description = params[:description]
      video = params[:videoFile]

      sub_section = SubSection.find(sub_section_id)
      
      sub_section.update!(
        title: title || sub_section.title,
        description: description || sub_section.description,
        duration: params[:duration] ? params[:duration].to_i : sub_section.duration
      )

      if video
        sub_section.video_content.purge if sub_section.video_content.attached?
        sub_section.video_content.attach(video)
      end

      course = sub_section.section.course
      render json: {
        success: true,
        message: "Lecture updated successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def delete_sub_section
    begin
      sub_section_id = params[:subSectionId]
      section_id = params[:sectionId]
      
      sub_section = SubSection.find(sub_section_id)
      sub_section.destroy!

      section = Section.find(section_id)
      course = section.course
      
      render json: {
        success: true,
        message: "Lecture deleted successfully",
        data: format_course(course)
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def update_course_progress
    begin
      course_id = params[:courseId]
      sub_section_id = params[:subSectionId]

      if course_id.blank? || sub_section_id.blank?
        return render json: { success: false, message: "Missing fields" }, status: :bad_request
      end

      progress = CourseProgress.find_or_create_by!(
        user_id: @current_user.id,
        course_id: course_id
      )

      completed_video = CourseProgressVideo.find_by(
        course_progress_id: progress.id,
        sub_section_id: sub_section_id
      )

      if completed_video
        return render json: { success: true, message: "Already completed" }
      end

      progress.course_progress_videos.create!(sub_section_id: sub_section_id)

      render json: {
        success: true,
        message: "Lecture marked as completed"
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  private

  def format_course(course)
    course_json = course.as_json.merge("_id" => course.id)
    total_course_duration_seconds = 0
    
    course_json["courseContent"] = course.sections.map do |section|
      section_json = section.as_json.merge("_id" => section.id, "sectionName" => section.section_name)
      total_section_duration_seconds = 0
      
      section_json["subSection"] = section.sub_sections.map do |sub|
        # Use integer duration if available, fallback to parsing string
        duration_in_seconds = sub.duration || 0
        if duration_in_seconds == 0 && sub.time_duration.present?
          parts = sub.time_duration.split(':').map(&:to_i)
          duration_in_seconds = case parts.length
                               when 3 then parts[0]*3600 + parts[1]*60 + parts[2]
                               when 2 then parts[0]*60 + parts[1]
                               else parts[0].to_i
                               end
        end

        total_section_duration_seconds += duration_in_seconds
        
        sub_json = sub.as_json.merge(
          "_id" => sub.id, 
          "duration" => format_duration(duration_in_seconds),
          "durationSeconds" => duration_in_seconds
        )

        if sub.video_content.attached?
          begin
            sub_json["videoUrl"] = sub.video_content.url
          rescue ArgumentError
            sub_json["videoUrl"] = Rails.application.routes.url_helpers.rails_blob_url(sub.video_content, host: "http://localhost:3000")
          end
        end
        sub_json
      end
      
      section_json["totalDurationSeconds"] = total_section_duration_seconds
      section_json["totalDuration"] = format_duration(total_section_duration_seconds)
      total_course_duration_seconds += total_section_duration_seconds
      section_json
    end
    
    course_json["totalDurationSeconds"] = total_course_duration_seconds
    course_json["totalDuration"] = format_duration(total_course_duration_seconds)

    if course.thumbnail_image.attached?
      begin
        course_json["thumbnail"] = course.thumbnail_image.url
      rescue ArgumentError
        course_json["thumbnail"] = Rails.application.routes.url_helpers.rails_blob_url(course.thumbnail_image, host: "http://localhost:3000")
      end
    end

    # Parse JSON fields if they are strings
    ['instructions', 'tag', 'whatYouWillLearn'].each do |field|
      if course_json[field].is_a?(String)
        begin
          parsed = JSON.parse(course_json[field])
          course_json[field] = parsed
        rescue JSON::ParserError
          # Keep as string if not valid JSON
        end
      end
    end

    # Add completed lectures for the current user
    if @current_user
      progress = CourseProgress.find_by(user_id: @current_user.id, course_id: course.id)
      course_json["completedVideos"] = progress ? progress.course_progress_videos.pluck(:sub_section_id) : []
    else
      course_json["completedVideos"] = []
    end
    
    course_json
  end

  def update_lecture_duration
    begin
      sub_section = SubSection.find(params[:subSectionId])
      sub_section.update!(duration: params[:duration].to_i)
      
      render json: {
        success: true,
        message: "Duration updated successfully",
        data: sub_section.duration
      }
    rescue => e
      render json: { success: false, message: e.message }, status: :internal_server_error
    end
  end

  def format_duration(seconds)
    return "0s" if seconds <= 0
    hours = seconds / 3600
    minutes = (seconds % 3600) / 60
    secs = seconds % 60
    
    parts = []
    parts << "#{hours}h" if hours > 0
    parts << "#{minutes}m" if minutes > 0
    parts << "#{secs}s" if secs > 0 && hours == 0 # Only show seconds if less than an hour
    
    parts.join(" ")
  end
end
