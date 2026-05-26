module Jwt
  class Encoder
    def self.call(payload)
      JWT.encode(payload, secret_key, "HS256")
    end

    def self.secret_key
      ENV["JWT_SECRET"].presence || Rails.application.secret_key_base
    end
  end
end