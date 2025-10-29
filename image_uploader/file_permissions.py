import frappe
from frappe import _

def has_file_permission(doc, user=None):
    """
    Check if user has permission to access File doctype for image uploader
    """
    if not user:
        user = frappe.session.user
    
    # Get user roles
    user_roles = frappe.get_roles(user)
    
    # Check if this is an image uploader file
    if doc.attached_to_doctype in ["image printer", "Image Folder Tree"]:
        # Only Image Uploader or Site Assessor role can edit/delete
        if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
            return True
        
        # Other users can only read
        return False
    
    # For other files, use default permission
    return True

def get_file_permission_query_conditions(user=None, doctype=None):
    """
    Add permission query conditions for File doctype
    """
    if not user:
        user = frappe.session.user
    
    user_roles = frappe.get_roles(user)
    
    # If user has Image Uploader or Site Assessor role, allow all access
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return ""
    
    # For other users, only allow read access to image uploader files
    return f"`tab{doctype}`.attached_to_doctype NOT IN ('image printer', 'Image Folder Tree') OR `tab{doctype}`.owner = '{user}'"

def check_file_upload_permission():
    """
    Check if current user can upload files to image uploader
    """
    user_roles = frappe.get_roles()
    
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return True
    
    return False

def check_file_edit_permission(doc):
    """
    Check if current user can edit/delete files in image uploader
    """
    user_roles = frappe.get_roles()
    
    # Only Image Uploader or Site Assessor role can edit/delete
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return True
    
    return False
