class HomeController < ApplicationController
  skip_before_action :authenticate_request!, only: [:index]

  def index
    render :index
  end
end