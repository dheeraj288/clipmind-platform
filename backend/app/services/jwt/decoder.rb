class Jwt::Decoder
  SECRET_KEY = Rails.application.credentials.secret_key_base

  def self.call(token)
    body = JWT.decode(token, SECRET_KEY)[0]

    HashWithIndifferentAccess.new(body)
  end
end