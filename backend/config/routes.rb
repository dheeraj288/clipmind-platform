Rails.application.routes.draw do
  root "dashboard#index"
  get "dashboard", to: "dashboard#index"
  namespace :api do
    namespace :v1 do
      post :signup, to: 'auth#signup'
      post :login,  to: 'auth#login'
      get  :me,     to: 'auth#me'


      resources :collections do
        member do
          patch :toggle_pin
        end
      end

      resources :clips do
        member do
          patch :toggle_favorite
          patch :increment_copy
          patch :toggle_pin
          get :related
        end
        collection do
          get :trending
          get :ai_memory
          
          patch :bulk_update
          delete :bulk_delete
        end
      end
    end
  end
end