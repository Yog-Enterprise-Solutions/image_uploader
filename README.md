# Image Uploader Module

![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Frappe](https://img.shields.io/badge/Frappe-Framework-00A8E8)
![React](https://img.shields.io/badge/React-SPA-61DAFB?logo=react&logoColor=black)
![ERPNext](https://img.shields.io/badge/ERPNext-Integration-6C5CE7)

> A custom image and document management module built using **ReactJS** and integrated with **Frappe / ERPNext**.

---

## 📌 Overview

This project implements a **single-page image and document uploader** designed for **workflow-driven ERP applications**.  
The frontend is built as a **ReactJS SPA**, while backend integration is handled through **Frappe APIs**, enabling seamless communication with ERPNext.

The module is optimized for **site inspections, documentation workflows, and role-based access scenarios**.

---

## 🧩 Architecture Summary
flowchart TD
    A[User / ERPNext Screen] --> B[ReactJS SPA]
    B --> C[Comet React SDK]
    C --> D[Dopio Configuration Layer]
    D --> E[Frappe API Layer]
    E --> F[ERPNext Backend]
    F --> G[Database & File Storage]

    E -->|Permissions & Workflow| F
    F -->|Status Updates| B


---

## ✨ Key Features

- 📁 Folder-based image and document organization
- ⬆️ Bulk upload with previews
- ⬇️ Secure image download support
- 🔐 Role-based visibility and access control
- 🔄 Workflow-driven status updates
- 🔗 Seamless embedding within ERPNext screens

---

## 🧰 Tech Stack

### Frontend
- ReactJS (Single Page Application)
- Comet React SDK (ERP environment integration)

### Backend
- Python
- Frappe Framework
- ERPNext

### Integration
- Dopio (frontend–backend configuration & routing)
- REST APIs

---

## 🔄 Integration Details

- The React application is embedded into the ERPNext environment using **Dopio**
- **Comet React SDK** is used to:
  - Authenticate users
  - Access ERP context
  - Communicate securely with Frappe APIs
- Backend logic enforces permissions and workflow consistency

---

## 🏗️ Use Cases

- Site inspection image uploads
- Pre-install / post-install documentation
- Compliance and audit records
- ERP-linked document workflows

---

## 🔒 Data & Security

- Role-based access enforced at backend level
- Sanitized for public reference
- No production credentials or client data included

---

## 📎 Notes

This repository is a **sanitized reference implementation** intended to demonstrate:
- React + ERPNext integration
- SPA architecture within ERP systems
- Secure document management patterns

It is **not a complete production deployment**.

---

## 📬 Author

**Jay Sarna**  
Backend & ERP Platform Engineer  
LinkedIn: https://www.linkedin.com/in/jaysarna/




