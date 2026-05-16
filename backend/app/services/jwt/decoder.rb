module Jwt
  class Decoder
    SECRET_KEY = Rails.application.credentials.secret_key_base

    def self.call(token)
      decoded = JWT.decode(token, SECRET_KEY)[0]

      HashWithIndifferentAccess.new(decoded)
    end
  end
end