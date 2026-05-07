# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Category.find_or_create_by!(name: "Web Development", description: "Learn full-stack web development with modern technologies.")
Category.find_or_create_by!(name: "Data Science", description: "Master data analysis, machine learning, and visualization.")
Category.find_or_create_by!(name: "Mobile Development", description: "Build stunning iOS and Android apps.")
Category.find_or_create_by!(name: "UI/UX Design", description: "Create beautiful and user-friendly interfaces.")
Category.find_or_create_by!(name: "Cloud Computing", description: "Learn AWS, Azure, and Google Cloud.")
