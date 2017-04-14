Redmine::Plugin.register :easy_wbs do
  name 'Easy WBS plugin'
  author 'Easy Software Ltd'
  description 'new WBS tree hierarchy generator'
  version '2016-0.0'
  url 'www.easyredmine.com'
  author_url 'www.easysoftware.cz'
end

# unless Redmine::Plugin.installed?(:easy_hosting_services)
  require File.join(File.dirname(__FILE__), 'after_init')
# end
