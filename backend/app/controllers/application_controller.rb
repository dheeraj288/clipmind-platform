class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception, unless: :api_request?

  before_action :authenticate_request!

  helper_method :current_user, :user_signed_in?

  private

  def authenticate_request!
    if api_request?
      authenticate_api_user!
    else
      authenticate_web_user!
    end
  end

  def api_request?
    request.path.start_with?("/api/")
  end

  def authenticate_api_user!
    header = request.headers["Authorization"]
    token = header&.split(" ")&.last

    if token.blank?
      render json: { error: "Missing token" }, status: :unauthorized
      return
    end

    decoded = Jwt::Decoder.call(token)
    @current_user = User.find(decoded[:user_id])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def authenticate_web_user!
    return if controller_path.start_with?("auth/")
    redirect_to login_path unless current_user
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def user_signed_in?
    current_user.present?
  end
end