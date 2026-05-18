Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post :signup, to: 'auth#signup'
      post :login,  to: 'auth#login'
      get  :me,     to: 'auth#me'

      resources :clips do
        member do
          patch :toggle_favorite
          patch :increment_copy
        end
        collection do
          get :trending
        end
      end
    end
  end
end