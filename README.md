# Redmine Easy WBS Plugin
* Version : 1.02
* Compatibility : Redmine 3.x (tested with Redmine 3.3.2)

Git mirror of the free version of Easy WBS Plugin, provided by EasyRedmine. This one is 100% compatible with Redmine, and Easy Redmine of course.

## Description (from easyredmine.com)
```
Work Breakdown Struture Plugin visualizes projects, issues and sub-issues in mind map like view - showing decomposition of the work to be executed by the project team. It further enables you to manage projects and issues using easy drag & drop while having clearest possible visualization of whole project. 

###Features :
* Mind map like visualization of the projects, issues, and sub-issues
* Drag & Drop sorting of issues and projects
* Creation of issues from the mind map
* Colour visualization of issues tackers
* Familiar keyboard shortcuts from other mind map tools
* Zoom out and zoom-in
* Step Back Button
* Compatible with Redmine 3.0+ 
```
More informations : https://www.easyredmine.com/redmine-wbs-plugin

## Install

* Make first a backup of the database.
* Run the following commands :
```
gem install redmine-installer
git clone https://github.com/StephDiRaimondo/redmine_easy_wbs.git ./plugins/easy_wbs
bundle install
rake db:migrate RAILS_ENV=production
bundle exec rake redmine:plugins:migrate RAILS_ENV=production
```
* Restart Redmine
* Go to the plugins menu of Redmine, *Easy WBS plugin* should be present in the list.
