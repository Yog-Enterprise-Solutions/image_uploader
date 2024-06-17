import frappe 

def doc_link(doc,methods=None):
    name = doc.name

    file_url = f"https://yash.tranqwality.com/api/method/frappe.utils.print_format.download_pdf?doctype=image%20printer&name={name}&format=FIle%20Print&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en"

    doc.file_link = file_url