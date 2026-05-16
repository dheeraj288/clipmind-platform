class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!

  private

  def authenticate_user!
    header = request.headers['Authorization']

    token = header.split(' ').last if header

    begin
      decoded = Jwt::Decoder.call(token)

      @current_user = User.find(decoded[:user_id])
    rescue
      render json: {
        error: 'Unauthorized'
      }, status: :unauthorized
    end
  end

  attr_reader :current_user
  # helper_method :current_user

end