import frappe
from frappe import _
import json

@frappe.whitelist(allow_guest=True)
def login():
    """Handle login for the SPA"""
    try:
        # Get the current user session
        if frappe.session.user and frappe.session.user != "Guest":
            return {
                "message": "Already logged in",
                "user": frappe.session.user,
                "full_name": frappe.get_value("User", frappe.session.user, "full_name"),
                "roles": frappe.get_roles(),
                "csrf_token": frappe.session.csrf_token
            }
        else:
            return {
                "message": "Not logged in",
                "user": None,
                "redirect_to": "/login"
            }
    except Exception as e:
        frappe.log_error(f"SPA Login Error: {str(e)}")
        return {
            "message": "Login failed",
            "error": str(e)
        }

@frappe.whitelist(allow_guest=True)
def get_spa_session():
    """Get session data for the SPA"""
    try:
        if frappe.session.user and frappe.session.user != "Guest":
            return {
                "user": frappe.session.user,
                "full_name": frappe.get_value("User", frappe.session.user, "full_name"),
                "roles": frappe.get_roles(),
                "csrf_token": frappe.session.csrf_token,
                "site_name": frappe.local.site
            }
        else:
            return {
                "user": None,
                "message": "Not logged in"
            }
    except Exception as e:
        frappe.log_error(f"SPA Session Error: {str(e)}")
        return {
            "user": None,
            "error": str(e)
        }

@frappe.whitelist(allow_guest=True)
def check_permissions():
    """Check user permissions for image uploader - ONLY Image Uploader or Site Assessor roles allowed"""
    try:
        # Use frappe.get_roles() since that's what's actually working
        user_roles = frappe.get_roles()
        
        # Debug: Print each role individually
        print(f"🔍 DEBUGGING ROLES:")
        for i, role in enumerate(user_roles):
            print(f"   Role {i}: '{role}' (type: {type(role)})")
            print(f"   Role {i} == 'Site Assessor': {role == 'Site Assessor'}")
            print(f"   Role {i} == 'Image Uploader': {role == 'Image Uploader'}")
        
        # ONLY allow users with Image Uploader OR Site Assessor roles
        # ALL OTHER ROLES (including System Manager) are RESTRICTED
        has_image_uploader = "Image Uploader" in user_roles
        has_site_assessor = "Site Assessor" in user_roles
        
        # Also try explicit comparison
        has_image_uploader_explicit = any(role == "Image Uploader" for role in user_roles)
        has_site_assessor_explicit = any(role == "Site Assessor" for role in user_roles)
        
        # User must have EITHER Image Uploader OR Site Assessor role
        # NO OTHER ROLES MATTER - even System Manager is restricted
        has_required_role = has_image_uploader or has_site_assessor or has_image_uploader_explicit or has_site_assessor_explicit
        
        # Deletion is allowed ONLY for Site Assessor
        permissions = {
            "can_upload": has_required_role,
            "can_edit": has_required_role,
            "can_delete": has_site_assessor or has_site_assessor_explicit,
            "can_view": has_required_role,  # Even viewing is restricted to these roles only
            "user_roles": user_roles,
            "has_image_uploader": has_image_uploader,
            "has_site_assessor": has_site_assessor,
            "has_image_uploader_explicit": has_image_uploader_explicit,
            "has_site_assessor_explicit": has_site_assessor_explicit,
            "has_required_role": has_required_role,
            "access_restricted": not has_required_role
        }
        
        # Force print to console for debugging
        print(f"🔍 RESTRICTIVE PERMISSIONS CHECK:")
        print(f"   User: {frappe.session.user}")
        print(f"   Roles: {user_roles}")
        print(f"   Has Image Uploader: {has_image_uploader}")
        print(f"   Has Site Assessor: {has_site_assessor}")
        print(f"   Has Image Uploader (explicit): {has_image_uploader_explicit}")
        print(f"   Has Site Assessor (explicit): {has_site_assessor_explicit}")
        print(f"   Has Required Role: {has_required_role}")
        print(f"   Access Restricted: {not has_required_role}")
        print(f"   Final Permissions: {permissions}")
        
        return permissions
    except Exception as e:
        print(f"❌ ERROR in check_permissions: {str(e)}")
        frappe.log_error(f"Permission Check Error: {str(e)}")
        return {
            "can_upload": False,
            "can_edit": False,
            "can_delete": False,
            "can_view": False,  # Even viewing is restricted on error
            "error": str(e),
            "access_restricted": True
        }
