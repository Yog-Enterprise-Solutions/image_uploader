app_name = "image_uploader"
app_title = "Image Uploader"
app_publisher = "yash"
app_description = "its an app to upload images "
app_email = "yash@gmail"
app_license = "mit"
# required_apps = []

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/image_uploader/css/image_uploader.css"
# app_include_js = "/assets/image_uploader/js/image_uploader.js"

# include js, css files in header of web template
# web_include_css = "/assets/image_uploader/css/image_uploader.css"
# web_include_js = "/assets/image_uploader/js/image_uploader.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "image_uploader/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "image_uploader/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "image_uploader.utils.jinja_methods",
# 	"filters": "image_uploader.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "image_uploader.install.before_install"
# after_install = "image_uploader.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "image_uploader.uninstall.before_uninstall"
# after_uninstall = "image_uploader.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "image_uploader.utils.before_app_install"
# after_app_install = "image_uploader.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "image_uploader.utils.before_app_uninstall"
# after_app_uninstall = "image_uploader.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "image_uploader.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Lead": {
		"on_update": "image_uploader.override.lead.create_folders",
	},
	"image printer": {
		"validate": "image_uploader.override.image_printer.doc_link",
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"image_uploader.tasks.all"
# 	],
# 	"daily": [
# 		"image_uploader.tasks.daily"
# 	],
# 	"hourly": [
# 		"image_uploader.tasks.hourly"
# 	],
# 	"weekly": [
# 		"image_uploader.tasks.weekly"
# 	],
# 	"monthly": [
# 		"image_uploader.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "image_uploader.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "image_uploader.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "image_uploader.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["image_uploader.utils.before_request"]
# after_request = ["image_uploader.utils.after_request"]

# Job Events
# ----------
# before_job = ["image_uploader.utils.before_job"]
# after_job = ["image_uploader.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"image_uploader.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }
fixtures=[
     {"dt": "Custom Field", "filters": [
		[
			"name", "in", [
            "File-custom_custom_description_","File-custom_flag","File-custom_description"				]
		]
	]},
]

website_route_rules = [{'from_route': '/upload_image/<path:app_path>', 'to_route': 'upload_image'},]