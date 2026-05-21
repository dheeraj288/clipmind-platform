class ApplicationController < ActionController::Base
  before_action :authenticate_user!

  attr_reader :current_user

  private

  def authenticate_user!
    header = request.headers['Authorization']

    token = header.split(' ').last if header.present?

    if token.blank?
      render json: {
        error: 'Missing token'
      }, status: :unauthorized and return
    end

    begin
      decoded = Jwt::Decoder.call(token)

      @current_user = User.find(decoded[:user_id])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: {
        error: 'Unauthorized'
      }, status: :unauthorized
    end
  end
end