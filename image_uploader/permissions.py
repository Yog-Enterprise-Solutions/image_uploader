import frappe
from frappe import _

def has_permission(doc, user=None):
    """
    Check if user has permission to access image uploader functionality
    """
    if not user:
        user = frappe.session.user
    
    # Get user roles
    user_roles = frappe.get_roles(user)
    
    # Allow users with Image Uploader or Site Assessor role
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return True
    
    # For other users (including System Manager), only allow read access
    return False

def get_permission_query_conditions(doctype, user=None):
    """
    Add permission query conditions for image uploader doctypes
    """
    if not user:
        user = frappe.session.user
    
    user_roles = frappe.get_roles(user)
    
    # If user has Image Uploader or Site Assessor role, allow all access
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return ""
    
    # For other users, only allow read access to their own records
    return f"`tab{doctype}`.owner = '{user}'"

def check_upload_permission():
    """
    Check if current user can upload images
    """
    user_roles = frappe.get_roles()

    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return True

    return False

def check_edit_permission(doc):
    """
    Check if current user can edit/delete images
    """
    user_roles = frappe.get_roles()

    # Only Image Uploader or Site Assessor role can edit/delete
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        return True

    return False

def get_image_uploader_permissions():
    """
    Get permissions for image uploader based on user role
    """
    user_roles = frappe.get_roles()
    
    permissions = {
        "can_upload": False,
        "can_edit": False,
        "can_delete": False,
        "can_view": True  # All users can view
    }
    
    if "Image Uploader" in user_roles or "Site Assessor" in user_roles:
        permissions.update({
            "can_upload": True,
            "can_edit": True,
            "can_delete": True
        })
    
    return permissions
