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

ActiveRecord::Schema[7.1].define(version: 2026_05_20_104805) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "clip_copy_logs", force: :cascade do |t|
    t.bigint "clip_id", null: false
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["clip_id"], name: "index_clip_copy_logs_on_clip_id"
    t.index ["created_at"], name: "index_clip_copy_logs_on_created_at"
    t.index ["user_id"], name: "index_clip_copy_logs_on_user_id"
  end

  create_table "clips", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.datetime "copied_at"
    t.string "source"
    t.boolean "is_favorite"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "deleted_at"
    t.string "clip_type"
    t.string "language"
    t.string "source_url"
    t.string "page_title"
    t.integer "copy_count", default: 0, null: false
    t.bigint "collection_id"
    t.jsonb "tags", default: [], null: false
    t.boolean "is_pinned", default: false
    t.string "site_name"
    t.string "favicon_url"
    t.string "preview_image"
    t.text "page_description"
    t.string "content_kind"
    t.text "surrounding_text"
    t.index ["collection_id"], name: "index_clips_on_collection_id"
    t.index ["copy_count"], name: "index_clips_on_copy_count"
    t.index ["tags"], name: "index_clips_on_tags", using: :gin
    t.index ["user_id"], name: "index_clips_on_user_id"
  end

  create_table "collections", force: :cascade do |t|
    t.string "name"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_pinned", default: false, null: false
    t.index ["user_id"], name: "index_collections_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.string "refresh_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "clip_copy_logs", "clips"
  add_foreign_key "clip_copy_logs", "users"
  add_foreign_key "clips", "collections"
  add_foreign_key "clips", "users"
  add_foreign_key "collections", "users"
end
