export type Category = "men" | "women" | "kids";

export interface Product {
  id: number;
  title: string;
  category: Category;
  price: number;
  stock: number;
  image: string;
  description: string;
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  title: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  fullname: string;
  phone: string;
  address: string;
  postal_code: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

const CATEGORY_FA: Record<Category, string> = {
  men: "مردانه",
  women: "زنانه",
  kids: "بچگانه",
};

export function categoryFa(c: string): string {
  return CATEGORY_FA[c as Category] ?? c;
}
