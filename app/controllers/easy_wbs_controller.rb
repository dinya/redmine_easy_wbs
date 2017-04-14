class EasyWbsController < ApplicationController
  accept_api_auth :index

  before_filter :find_project_by_project_id, :if => Proc.new { params[:project_id].present? }
  before_filter :find_query, :only => [:index]
  before_filter :authorize, :if => Proc.new{ @project.present? }
  before_filter :authorize_global, :if => Proc.new{ @project.nil? }

  menu_item :easy_wbs

  helper :queries
  include QueriesHelper
  if defined?(EasyExtensions)
    helper :easy_query
    include EasyQueryHelper
  end
  include SortHelper

  def index
    respond_to do |format|
      format.html { render(:layout => !request.xhr?) }
      format.api do
        find_issues
        find_projects
        find_trackers
        find_users
        find_versions
      end
    end
  end

  private

  def query_class
    EasyWbs::IssueQuery
  end

  def find_query
    if defined?(EasyIssueQuery)
      params[:force_use_from_session] = true
      retrieve_query(EasyWbs::EasyIssueQuery, :use_session_store => true)
      @query.export_formats = {}
      @query.display_filter_group_by_on_index = false
      @query.display_filter_settings_on_index = false
      @query.group_by = nil
    else
      find_query_from_params_or_session
    end
  end

  def find_query_from_params_or_session
    if !params[:query_id].blank?
      cond = 'project_id IS NULL'
      cond << " OR project_id = #{@project.id}" if @project
      @query = query_class.where(cond).find(params[:query_id])
      raise ::Unauthorized unless @query.visible?
      @query.project = @project
      session[:query] = {:id => @query.id, :project_id => @query.project_id}
      sort_clear
    elsif params[:set_filter] || session[:query].nil? || session[:query][:project_id] != (@project ? @project.id : nil)
      # Give it a name, required to be valid
      @query = query_class.new(:name => '_')
      @query.project = @project
      @query.build_from_params(params)
      session[:query] = {:project_id => @query.project_id, :filters => @query.filters, :group_by => @query.group_by, :column_names => @query.column_names}
    else
      # retrieve from session
      @query = nil
      @query = query_class.find_by_id(session[:query][:id]) if session[:query][:id]
      @query ||= query_class.new(:name => '_', :filters => session[:query][:filters], :group_by => session[:query][:group_by], :column_names => session[:query][:column_names])
      @query.project = @project
    end
  end

  def find_issues
    @issues = @query.entities(:order => :id)
  end

  def find_projects
    @projects = @project.self_and_descendants
  end

  def find_trackers
    @trackers = Setting.display_subprojects_issues? ? @project.rolled_up_trackers : @project.trackers
  end

  def find_users
    @users = @project.assignable_users_including_all_subprojects
  end

  def find_versions
    @versions = @projects.flat_map(&:shared_versions).uniq
  end
end
