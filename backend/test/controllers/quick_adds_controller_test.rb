require "test_helper"

class QuickAddsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get quick_adds_new_url
    assert_response :success
  end
end
