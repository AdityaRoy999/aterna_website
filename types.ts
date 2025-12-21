export interface ProductVariant {
  name: string;
  imageUrl: string;
  colorCode?: string; // For color swatches
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
  quantity?: number;
  color?: string;
  // Fix: Changed from specific literals to string to support combined/responsive classes
  span?: string;
  isNew?: boolean;
  variants?: ProductVariant[];
  variantType?: string; // e.g., "Finish", "Size", "Color"
}

export interface NavLink {
  label: string;
  href: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  productId?: string;
}