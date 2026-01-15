# Mobile-First Inventory Management System

## Overview
This project is a Mobile-First Inventory Management System designed for a small Japanese retail business. It allows for manual data entry of products, including images, and is built using the Serverless MERN stack with Next.js, MongoDB, and Mongoose.

## Project Structure
```
inventory-app
├── app
│   ├── api
│   │   └── products
│   │       └── route.ts       # API routes for product management
│   └── page.tsx               # Main page for displaying products
├── components
│   └── forms
│       └── ProductForm.tsx     # Form for adding new products
├── lib
│   └── db.ts                   # Database connection setup
├── models
│   └── Product.ts              # Mongoose schema for Product model
├── next.config.js              # Next.js configuration
├── package.json                 # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Technologies Used
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + `shadcn/ui`
- **Database:** MongoDB Atlas (M0 Free Tier) using Mongoose ODM
- **Image Storage:** Cloudinary (Client-side unsigned uploads)
- **Validation:** Zod + React Hook Form

## Features
- Mobile-first design for easy product entry and management.
- API routes for fetching and creating products.
- Mongoose schema for structured product data.
- Integration with Cloudinary for image uploads.

## Getting Started
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd inventory-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your MongoDB Atlas database and update the connection string in `lib/db.ts`.
5. Run the development server:
   ```
   npm run dev
   ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.