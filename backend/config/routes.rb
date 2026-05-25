Rails.application.routes.draw do
  require "sidekiq/web"
  mount Sidekiq::Web => "/sidekiq"
  
  root "home#index"
  
  get    "login",  to: "auth/sessions#new",     as: :login
  post   "login",  to: "auth/sessions#create"
  delete "logout", to: "auth/sessions#destroy", as: :logout

  get  "signup", to: "auth/registrations#new",    as: :signup
  post "signup", to: "auth/registrations#create"

  get "dashboard", to: "dashboard#index", as: :dashboard

  delete "clips/clear_all", to: "clips#clear_all", as: :clear_all_clips

  resources :clips, only: [:index, :create, :destroy] do
    collection do
      get :quick_add
      post :quick_create
      patch :bulk_favorite
      patch :bulk_pin
      delete :bulk_delete
    end

    member do
      patch :toggle_favorite
      patch :update_collection
      patch :increment_copy
      patch :toggle_pin
      post :summarize
      post :save_ai_memory
      post :regenerate_summary
      post :hide_summary 
    end
  end

  get "settings", to: "settings#index", as: :settings
  get "profile", to: "profile#show", as: :profile
  get "prompts", to: "prompts#index", as: :prompts
  get "quick_add", to: "quick_adds#new", as: :quick_add
  get "exports/download", to: "exports#download", as: :export_clips
  get "ai_search", to: "ai_search#index", as: :ai_search
  get "ai_memory", to: "ai_memory#index", as: :ai_memory

  get "/ai_chat", to: "ai_chat#index"
  post "/ai_chat", to: "ai_chat#create"

  resources :collections, only: [:index, :show, :create]
  
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