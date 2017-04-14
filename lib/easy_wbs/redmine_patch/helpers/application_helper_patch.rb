module EasyWbs
  module ApplicationHelperPatch

    def self.included(base)
      base.extend(ClassMethods)
      base.send(:include, InstanceMethods)

      base.class_eval do

        def link_to_project_with_easy_wbs(project, options = {})
          { controller: 'easy_wbs', action: 'index', project_id: project }
        end

      end
    end

    module InstanceMethods
    end

    module ClassMethods
    end

  end
end

RedmineExtensions::PatchManager.register_helper_patch 'ApplicationHelper', 'EasyWbs::ApplicationHelperPatch'
