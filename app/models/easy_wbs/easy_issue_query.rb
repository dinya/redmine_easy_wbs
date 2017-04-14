module EasyWbs
  class EasyIssueQuery < ::EasyIssueQuery

    def easy_query_entity_controller
      'easy_wbs'
    end

    def easy_query_entity_action
      'index'
    end

    def entity_easy_query_path(options = {})
      project_easy_wbs_index_path(self.project)
    end

    def query_after_initialize
      super
      self.display_filter_sort_on_index, self.display_filter_columns_on_index, self.display_filter_group_by_on_index, self.display_filter_settings_on_index = false
    end

  end
end
