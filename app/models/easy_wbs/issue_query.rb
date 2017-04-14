module EasyWbs
  class IssueQuery < ::IssueQuery

    def from_params(params)
      build_from_params(params)
    end

    def entity
      Issue
    end

    def entity_scope
      scope = Issue.visible.preload(:project)
      if Project.column_names.include? 'easy_baseline_for_id'
        scope = scope.where(Project.table_name => {easy_baseline_for_id: nil})
      end
      scope
    end

    def create_entity_scope(options={})
      entity_scope.includes(options[:includes]).references(options[:includes]).preload(options[:preload]).where(statement)
    end

    def entities(options={})
      create_entity_scope(options).order(options[:order])
    end

    def to_partial_path
      'easy_wbs/easy_queries/show'
    end

  end
end
