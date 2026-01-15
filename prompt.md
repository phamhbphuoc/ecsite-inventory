@workspace /new

**Role:** You are a Senior Full-Stack Engineer specializing in the "Serverless MERN" stack (Next.js App Router, MongoDB, Mongoose).

**Project Goal:** Build a "Mobile-First Inventory Management System" for a small Japanese retail business. The app allows manual data entry of products with images.

**Tech Stack Constraints:**
- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Styling:** Tailwind CSS + `shadcn/ui` (assume I will run the init commands later).
- **Database:** MongoDB Atlas (M0 Free Tier) using **Mongoose** ODM.
- **Image Storage:** Cloudinary (Client-side unsigned uploads).
- **Validation:** Zod + React Hook Form.

**Project Structure:**
- `/app`: Pages and API routes.
- `/lib`: Database connection (`db.ts`) and utils.
- `/models`: Mongoose schemas.
- `/components`: Reusable UI components.

---

**Step 1: Data Model**
First, create the Mongoose schema at `models/Product.ts`.
- Fields: `title` (String, req), `description` (String), `price.original` (Number), `price.selling` (Number, req), `images` (Array of Strings), `category` (String, default 'General'), `stock` (Number, default 0), `status` (Enum: 'draft', 'active'), `createdAt` (Date).
- Ensure the model checks `mongoose.models.Product` before compiling to prevent "OverwriteModelError" in Next.js hot-reloading.

**Step 2: Database Connection**
Create `lib/db.ts`.
- Implement a cached connection pattern (using `global.mongoose`) to ensure we don't exhaust database connections during hot-reloading or serverless function execution. This is critical.

**Step 3: Backend API**
Create the API route at `app/api/products/route.ts`.
- **GET:** Fetch products (sort by `createdAt` desc).
- **POST:** Validate body with Zod, create a new Product in MongoDB, return the JSON.

**Step 4: Frontend Form (Mobile First)**
Create a component `components/forms/ProductForm.tsx`.
- Use `react-hook-form` and `zod`.
- **UI:** Mobile-friendly. Inputs should be large (h-12).
- **Image Upload:** Create a function that handles file selection, uploads directly to Cloudinary via `fetch` to their API (`https://api.cloudinary.com/v1_1/.../image/upload`), and returns the URL.
- **Logic:** On form submit, gather data + image URL and POST to our internal API.

**Step 5: Dashboard**
Create `app/page.tsx`.
- Fetch products from the API.
- Display them in a Grid layout (1 col mobile, 3 col desktop).
- Use a standard Card component.

**Action Required:**
Please scaffold the project structure and generate the code for **Step 1 (Model)**, **Step 2 (DB Connection)**, and **Step 3 (API Route)** first. I will ask for the Frontend components in the next turn.