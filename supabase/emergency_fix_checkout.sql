-- EMERGENCY FIX: Drop the foreign key constraint that is blocking checkout.
-- WARNING: This allows "ghost" items (deleted products) to be ordered. 
-- You may see orders with products that have no details in the Admin dashboard.

ALTER TABLE "order_items" 
DROP CONSTRAINT IF EXISTS "order_items_product_id_fkey";

-- OPTIONAL: If you want to add it back later (Clean data first!)
-- ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
