require "test_helper"

class AiMemoryControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get ai_memory_index_url
    assert_response :success
  end
end
