class Api::V1::AuthController < Api::V1::BaseController
  skip_before_action :authenticate_request!, only: [:signup, :login]

 def signup
  user = User.new(user_params)

  if user.save
    token = Jwt::Encoder.call(user_id: user.id)

    render json: {
      status: "success",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }, status: :created
  else
    render json: {
      status: "error",
      errors: user.errors.full_messages
    }, status: :unprocessable_entity
  end
end

 def login
  user = User.find_by(email: params[:email].to_s.downcase.strip)

  if user&.authenticate(params[:password])
    token = Jwt::Encoder.call(user_id: user.id)

    render json: {
      status: "success",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }, status: :ok
    else
      render json: {
        status: "error",
        error: "Invalid email or password"
      }, status: :unauthorized
    end
  end

  def me
    render json: current_user
  end

  private

  def user_params
    params.require(:user).permit(
      :name,
      :email,
      :password,
      :password_confirmation
    )
  end
end