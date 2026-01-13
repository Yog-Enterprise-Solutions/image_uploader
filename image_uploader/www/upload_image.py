import frappe
from frappe import _

def get_context(context):
    """Context for the upload_image page"""
    context.title = _("Image Uploader")
    context.no_cache = 1
    
    # Don't redirect to login - let the SPA handle authentication
    # The SPA will check permissions via API calls
    
    return context
