module Jwt
  class Decoder
    def self.call(token)
      decoded = JWT.decode(token, secret_key, true, algorithm: "HS256")
      decoded.first.with_indifferent_access
    end

    def self.secret_key
      ENV["JWT_SECRET"].presence || Rails.application.secret_key_base
    end
  end
end