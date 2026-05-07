# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_30_114354) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "course_progress_videos", force: :cascade do |t|
    t.bigint "course_progress_id", null: false
    t.datetime "created_at", null: false
    t.bigint "sub_section_id", null: false
    t.datetime "updated_at", null: false
    t.index ["course_progress_id"], name: "index_course_progress_videos_on_course_progress_id"
    t.index ["sub_section_id"], name: "index_course_progress_videos_on_sub_section_id"
  end

  create_table "course_progresses", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["course_id"], name: "index_course_progresses_on_course_id"
    t.index ["user_id"], name: "index_course_progresses_on_user_id"
  end

  create_table "courses", force: :cascade do |t|
    t.bigint "category_id", null: false
    t.text "course_description"
    t.string "course_name"
    t.datetime "created_at", null: false
    t.text "instructions"
    t.bigint "instructor_id", null: false
    t.integer "price"
    t.string "status"
    t.string "tag"
    t.string "thumbnail"
    t.datetime "updated_at", null: false
    t.text "what_you_will_learn"
    t.index ["category_id"], name: "index_courses_on_category_id"
    t.index ["instructor_id"], name: "index_courses_on_instructor_id"
  end

  create_table "enrollments", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["course_id"], name: "index_enrollments_on_course_id"
    t.index ["user_id"], name: "index_enrollments_on_user_id"
  end

  create_table "live_chat_messages", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "live_session_id", null: false
    t.text "message"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["live_session_id"], name: "index_live_chat_messages_on_live_session_id"
    t.index ["user_id"], name: "index_live_chat_messages_on_user_id"
  end

  create_table "live_sessions", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.datetime "end_time"
    t.string "session_name"
    t.datetime "start_time"
    t.string "status"
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_live_sessions_on_course_id"
  end

  create_table "otps", force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", null: false
    t.string "email"
    t.datetime "expires_at"
    t.datetime "updated_at", null: false
    t.boolean "verified"
  end

  create_table "profiles", force: :cascade do |t|
    t.text "about"
    t.string "contact_number"
    t.datetime "created_at", null: false
    t.string "date_of_birth"
    t.string "gender"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "rating_and_reviews", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.integer "rating"
    t.text "review"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["course_id"], name: "index_rating_and_reviews_on_course_id"
    t.index ["user_id"], name: "index_rating_and_reviews_on_user_id"
  end

  create_table "sections", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.string "section_name"
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_sections_on_course_id"
  end

  create_table "sub_sections", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "duration"
    t.bigint "section_id", null: false
    t.string "time_duration"
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "video_url"
    t.index ["section_id"], name: "index_sub_sections_on_section_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "account_type"
    t.boolean "active"
    t.boolean "approved"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "first_name"
    t.string "github_token"
    t.string "github_uid"
    t.string "google_token"
    t.string "google_uid"
    t.string "image"
    t.string "last_name"
    t.string "password_digest"
    t.datetime "reset_password_expires"
    t.string "token"
    t.datetime "updated_at", null: false
    t.index ["email", "account_type"], name: "index_users_on_email_and_account_type", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "course_progress_videos", "course_progresses"
  add_foreign_key "course_progress_videos", "sub_sections"
  add_foreign_key "course_progresses", "courses"
  add_foreign_key "course_progresses", "users"
  add_foreign_key "courses", "categories"
  add_foreign_key "courses", "users", column: "instructor_id"
  add_foreign_key "enrollments", "courses"
  add_foreign_key "enrollments", "users"
  add_foreign_key "live_chat_messages", "live_sessions"
  add_foreign_key "live_chat_messages", "users"
  add_foreign_key "live_sessions", "courses"
  add_foreign_key "profiles", "users"
  add_foreign_key "rating_and_reviews", "courses"
  add_foreign_key "rating_and_reviews", "users"
  add_foreign_key "sections", "courses"
  add_foreign_key "sub_sections", "sections"
end
