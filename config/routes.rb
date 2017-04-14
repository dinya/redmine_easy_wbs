resources :projects do
  get 'easy_wbs(.:format)', :to => 'easy_wbs#index', :as => 'easy_wbs_index'
  #get 'easy_wbs/index(.:format)', :to => 'easy_wbs#index'#, :as => 'easy_gantt_issue'
end