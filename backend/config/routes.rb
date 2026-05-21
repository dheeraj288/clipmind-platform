Rails.application.routes.draw do
  get 'favorites/index'
  get 'collections/index'
  get 'collections/show'
  get 'clips/index'
  root "home#index"

  get "dashboard", to: "dashboard#index", as: :dashboard
  get "clips", to: "clips#index", as: :clips
  resources :collections, only: [:index, :show]
  get "favorites", to: "favorites#index"

  namespace :api do
    namespace :v1 do
      post :signup, to: "auth#signup"
      post :login,  to: "auth#login"
      get  :me,     to: "auth#me"

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