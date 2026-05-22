require "test_helper"

class ExportsControllerTest < ActionDispatch::IntegrationTest
  test "should get download" do
    get exports_download_url
    assert_response :success
  end
end
