import frappe

@frappe.whitelist()
def create_folders(doc,method=None):
    # --------------------create folder and subfolders for images--------------------------------
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
            'folder': 'Home'
        }).insert()

    # List of main folder types
    folder_types = ['Pre Install Folder', 'Post Install Folder']

    # Define the subfolder structure for 'Pre Install Folder'

    # frappe.db.get_single_value("Image Folder Tree","pre_install_folder_list")

    pre_install_subfolders = [
        {
            "name": "Roof Measurements",
            "subfolders": [
                "Complete with all the measurements",
                "Roof Obstructions",
                "Tilts of every plane"
            ]
        },
        {
            "name": "Electrical",
            "subfolders": [
                "MSP (wide-angle)",
                "MSP Cover",
                "MSP Main Breaker",
                "MSP (close-up, cover off)",
                "MSP Voltage",
                "Water main grounding",
                "Meter (close-up)",
                "Meter (wide-angle)",
                "Service Conduit",
                "Is there a sub-panel?",
                "Sub Panel",
                "Electrical Red Flags",
                "Ground rod or Clamp"
            ]
        },
        {
            "name": "Rafters and Attic",
            "subfolders": [
                "Size of Rafters",
                "Spacing of Rafters",
                "Attic Photos",
                "Rafter attic red flags",
                "Working space in attic?"
            ]
        },
        {
            "name": "Elevation",
            "subfolders": [
                "Aurora Layout Picture",
                "Front of Home",
                "Right Side of Home",
                "Left Side of Home",
                "Rear of Home",
                "Is there a detached structure?",
                "Detached structure photos",
                "Is there a sub-panel in the detached structure?",
                "Distance of trench",
                "Trench details",
                "Additional exterior comments"
            ]
        },
        {
            "name": "Roofing Material",
            "subfolders": [
                "Potential Shading Issues?",
                "Layers of shingle",
                "Shading Issues",
                "Roof condition passes?",
                "Roof red flags",
                "Additional roof comments"
            ]
        },
        {
            "name": "Miscellaneous Photos",
            "subfolders": [""]
        },
        {
            "name": "Existing System",
            "subfolders": [
                "Is there an existing system?",
                "Module Type and Quantity",
                "Inverter Type and Quantity"
            ]
        }
    ]

    # Define the subfolder structure for 'Post Install Folder'
    post_install_subfolders = [
        {
            "name": "Mechanical Assembly",
            "subfolders": [
                "All Array(s) clear photo",
                "Module Attachments",
                "Flashing",
                "Installed Rails & Mounts",
                "Conduit Run & Penetration",
                "Tilt of every roof",
                "Array(s) Tilt"
            ]
        },
        {
            "name": "Electrical",
            "subfolders": [
                "J-box or Conduit Entrance (open Box and Closed)",
                "Underneath Panel Array Wire Management",
                "Conduit Painted Red (NYC)",
                "BOS (wide)",
                "BOS (close)",
                "Equipment or Stickers",
                "AC Combiner Panel or Breakers",
                "AC Disconnect or Fuses",
                "String Voltages at AC Combiner",
                "Point of Interconnection (wide)",
                "Point of Interconnection (close)",
                "Labeled MSP",
                "Consumption CTs",
                "Home Grounding System (ground rod or Ufer)",
                "Layout or Microinverter Serial Numbers",
                "Completed Commissioning",
                "As-Built (Any changes mark on plans)"
            ]
        },
        {
            "name": "Battery",
            "subfolders": [
                "Battery and Inverter (step-back)",
                "Connections and Terminations",
                "Serial Number(s)",
                "Inverter Enclosure Connections",
                "Parallel Optimizer Connection",
                "DC Disconnect"
            ]
        },
        {
            "name": "Miscellaneous",
            "subfolders": [
                "EV Charger",
                "Empty 2 Pole breaker space",
                "Length of conduits from MSP to Garage or EV Install"
            ]
        }
    ]

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
                'folder': f'Home/{doc.name}'
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
                        'folder': f'Home/{doc.name}/Pre Install Folder'
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
                                'folder': f'Home/{doc.name}/Pre Install Folder/{subfolder["name"]}'
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
                        'folder': f'Home/{doc.name}/Post Install Folder'
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
                                'folder': f'Home/{doc.name}/Post Install Folder/{subfolder["name"]}'
                            }).insert()