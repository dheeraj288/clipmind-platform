class AiSearchController < ApplicationController
  def index
    @query = params[:q].to_s.strip
    @collections = current_user.collections.order(:name)

    @results = SmartSearchService.new(
      user: current_user,
      query: @query
    ).call

    @clips = @results
  end
end