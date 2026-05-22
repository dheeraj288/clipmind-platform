class AiChatController < ApplicationController
  def index
    @message = nil
    @response = nil
  end

  def create
    @message = params[:message]

    @response =
      MemoryChatService.new(
        user: current_user,
        message: @message
      ).call

    render :index, status: :ok
  end
end