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

ActiveRecord::Schema[8.1].define(version: 2026_04_29_120750) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "otps", force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", null: false
    t.string "email"
    t.datetime "expires_at"
    t.datetime "updated_at", null: false
    t.boolean "verified"
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
end
