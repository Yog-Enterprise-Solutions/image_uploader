import frappe
import json

@frappe.whitelist()
def del_folders(doc,method=None):

    existing_parent_folder = frappe.get_all('File', filters={
        'attached_to_doctype':'Lead',
        'attached_to_name':doc.name
    }, fields=['name'])
    for row in existing_parent_folder:
        # frappe.db.delete("File", row)
        frappe.delete_doc("File", {"attached_to_name":doc.name})

    # frappe.throw(f"{existing_parent_folder}")

@frappe.whitelist()
def create_folders(doc,method=None):
    # --------------------create folder and subfolders for images--------------------------------
        # List of main folder types
    folder_types = ['Pre Install Folder', 'Post Install Folder']

    # Define the subfolder structure for 'Pre Install Folder'

    pre_install_subfolders_string=frappe.db.get_single_value("Image Folder Tree","pre_install_folder_list")
    post_install_subfolders_string=frappe.db.get_single_value("Image Folder Tree","post_install_folder_list")
    pre_install_subfolders=json.loads(pre_install_subfolders_string)
    post_install_subfolders=json.loads(post_install_subfolders_string)
    # Check if the parent folder exists
    existing_parent_folder = frappe.get_all('File', filters={
        'folder': 'Home',
        'file_name': doc.name
    }, fields=['name'])

    # Create parent folder if it doesn't exist
    if not existing_parent_folder:
        frappe.get_doc({
            'doctype': 'File',
            'file_name': doc.name,
            'is_folder': 1,
            'folder': 'Home',
            'attached_to_doctype':'Lead',
            'attached_to_name':doc.name
        }).insert()

        # Create folders for each type in folder_types
        for type in folder_types:
            # Check if the folder type exists
            existing_folder_type = frappe.get_all('File', filters={
                'folder': f'Home/{doc.name}',
                'file_name': type
            }, fields=['name'])
            
            if not existing_folder_type:
                # Create the main folder type
                folder = frappe.get_doc({
                    'doctype': 'File',
                    'file_name': type,
                    'is_folder': 1,
                    'folder': f'Home/{doc.name}',
                    'attached_to_doctype':'Lead',
                    'attached_to_name':doc.name
                }).insert()
            
                if type == 'Pre Install Folder':
                    # Create subfolders for 'Pre Install Folder'
                    for subfolder in pre_install_subfolders:
                        existing_subfolder = frappe.get_all('File', filters={
                            'folder': f'Home/{doc.name}/Pre Install Folder',
                            'file_name': subfolder['name']
                        }, fields=['name'])
                        if not existing_subfolder:
                            parent_folder = frappe.get_doc({
                                'doctype': 'File',
                                'file_name': subfolder['name'],
                                'is_folder': 1,
                                'folder': f'Home/{doc.name}/Pre Install Folder',
                                'attached_to_doctype':'Lead',
                                'attached_to_name':doc.name
                            }).insert()
                            
                        for subsubfolder in subfolder['subfolders']:
                            if subsubfolder:  # Check if subsubfolder name is not empty
                                filters = {
                                    'folder': f'Home/{doc.name}/Pre Install Folder/{subfolder["name"]}',
                                    'file_name': subsubfolder
                                }
                                existing_subsubfolder = frappe.get_all('File', filters=filters, fields=['name'])
                                # existing_subsubfolder = frappe.get_all('File', filters={
                                #     'folder': f'Home/{doc.name}/Pre Install Folder/{subfolder["name"]}',
                                #     'file_name': subsubfolder
                                # },fields=['name'])
                                if existing_subsubfolder:
                                    # frappe.msgprint(f"exist {existing_subsubfolder}")
                                    pass
                                else:
                                    # frappe.msgprint(f"not  {existing_subsubfolder}")
                                    pass
                                    frappe.get_doc({
                                        'doctype': 'File',
                                        'file_name': subsubfolder,
                                        'is_folder': 1,
                                        'folder': f'Home/{doc.name}/Pre Install Folder/{subfolder["name"]}',
                                        'attached_to_doctype':'Lead',
                                        'attached_to_name':doc.name
                                    }).insert()
                if type == 'Post Install Folder':
                    # Create subfolders for 'Pre Install Folder'
                    for subfolder in post_install_subfolders:
                        existing_subfolder = frappe.get_all('File', filters={
                            'folder': f'Home/{doc.name}/Post Install Folder',
                            'file_name': subfolder['name']
                        }, fields=['name'])
                        if not existing_subfolder:
                            parent_folder = frappe.get_doc({
                                'doctype': 'File',
                                'file_name': subfolder['name'],
                                'is_folder': 1,
                                'folder': f'Home/{doc.name}/Post Install Folder',
                                'attached_to_doctype':'Lead',
                                'attached_to_name':doc.name
                            }).insert()
                            
                        for subsubfolder in subfolder['subfolders']:
                            if subsubfolder:  # Check if subsubfolder name is not empty
                                filters = {
                                    'folder': f'Home/{doc.name}/Post Install Folder/{subfolder["name"]}',
                                    'file_name': subsubfolder
                                }
                                existing_subsubfolder = frappe.get_all('File', filters=filters, fields=['name'])
                                # existing_subsubfolder = frappe.get_all('File', filters={
                                #     'folder': f'Home/{doc.name}/Pre Install Folder/{subfolder["name"]}',
                                #     'file_name': subsubfolder
                                # },fields=['name'])
                                if existing_subsubfolder:
                                    # frappe.msgprint(f"exist {existing_subsubfolder}")
                                    pass
                                else:
                                    # frappe.msgprint(f"not  {existing_subsubfolder}")
                                    frappe.get_doc({
                                        'doctype': 'File',
                                        'file_name': subsubfolder,
                                        'is_folder': 1,
                                        'folder': f'Home/{doc.name}/Post Install Folder/{subfolder["name"]}',
                                        'attached_to_doctype':'Lead',
                                        'attached_to_name':doc.name
                                    }).insert()