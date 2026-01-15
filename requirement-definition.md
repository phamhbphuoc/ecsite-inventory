# Requirement Definition Document (RDD)

**Project Name:** Hàng Nhật Nội Địa - Inventory Management System (IMS)
**Version:** 1.0
**Date:** January 14, 2026
**Target User:** Internal Staff (Data Entry)

## 1. Project Overview

The objective is to build a **Mobile-First CRUD Web Application** to act as the backend administration tool for a small retail business. This application allows authorized users to manually input, manage, and view product inventory data. This database will eventually serve as the source of truth for a future consumer-facing e-commerce site.

## 2. Technical Stack Specifications

The system must be built using the **Serverless MERN** architecture to ensure zero maintenance cost.

* **Framework:** Next.js 14+ (App Router, TypeScript).
* **Database:** MongoDB Atlas (M0 Free Tier).
* **ORM/ODM:** Mongoose.
* **Storage:** Cloudinary (Free Tier) for image hosting.
* **Styling:** Tailwind CSS + `shadcn/ui` components.
* **Deployment:** Vercel (Free Tier).
* **Validation:** Zod (for schema validation).

## 3. User Roles

* **Admin/Staff:** The sole user type. They have full access to Create, Read, Update, and Delete product records.

## 4. Functional Requirements

### 4.1 Authentication (Basic)

* **FR-01:** System must enforce a simple protection mechanism (e.g., Environment Variable PIN or NextAuth with a hardcoded credential) to prevent public write access.
* **FR-02:** Login session must persist to allow long periods of data entry without re-login.

### 4.2 Product Management (CRUD)

* **FR-03 Create Product:** User can input product details via a form.
* *Constraint:* Form must support image uploading directly to Cloudinary.


* **FR-04 Read/List:** User can view a list of all products in the database.
* *Requirement:* List items should show a thumbnail, title, selling price, and status tag.
* *Requirement:* Infinite scroll or Pagination (limit 20 items per load) to support M0 tier limits.


* **FR-05 Update Product:** User can edit any field of an existing product, including replacing images.
* **FR-06 Delete Product:** User can soft-delete or hard-delete a product (confirmation modal required).

### 4.3 Image Handling

* **FR-07:** Images must be uploaded directly from the client (browser) to Cloudinary to avoid serverless function timeouts.
* **FR-08:** The database stores only the secure URL returned by Cloudinary.

## 5. Data Model Requirements (Mongoose Schema)

The AI agent must implement the following Mongoose schema structure strictly.

| Field Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | String | Yes | - | Product name (e.g., "Glucosamine 900 Tablets") |
| `slug` | String | Yes | - | URL-friendly ID (auto-generated from title) |
| `description` | String | No | - | Full product details/marketing text |
| `price.original` | Number | No | - | Cost price in JPY (Input currency) |
| `price.selling` | Number | Yes | - | Selling price in VND (Input currency) |
| `images` | [String] | No | `[]` | Array of Cloudinary URLs |
| `category` | String | Yes | "Uncategorized" | e.g., Supplements, Cosmetics, Food |
| `stock` | Number | Yes | 0 | Quantity available |
| `status` | String | Yes | "draft" | Enum: `['draft', 'active', 'archived']` |
| `notes` | String | No | - | Private internal notes (e.g., Expiry Date) |
| `createdAt` | Date | Yes | `Date.now` | Creation timestamp |

## 6. Interface Requirements (UI/UX)

**Design Philosophy:** Mobile-First. The primary input device is a smartphone.

### 6.1 Input Form (Create/Edit)

* **UI-01:** "Sticky" Submit/Save button fixed at the bottom of the screen (thumb reachable).
* **UI-02:** Numeric fields (`price`, `stock`) must set `inputMode="numeric"` to trigger the mobile number pad.
* **UI-03:** Image uploader must show a preview of the selected image before submission.
* **UI-04:** Use large tap targets (minimum 44px height) for all buttons and inputs.

### 6.2 Dashboard / List View

* **UI-05:** "Card" layout for product list (not a data table).
* **UI-06:** Floating Action Button (FAB) (+) in the bottom right corner to add a new product.

## 7. Non-Functional Requirements

* **NFR-01 Performance:** Cold start for serverless functions must not break the UX. Use optimistic UI updates where possible (e.g., show "Saved" immediately while the background request finishes).
* **NFR-02 Cost:** The system must not incur any monthly infrastructure costs.
* **NFR-03 Security:** Database connection strings must be stored in Environment Variables, never hardcoded.

