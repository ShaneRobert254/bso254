import { createContext, useContext, type ReactNode } from "react";
import { products as seedProducts, releases as seedReleases, type Product, type Release } from "@/lib/catalog";

export type ShopData = { releases: Release[]; products: Product[] };

const ShopContext = createContext<ShopData>({ releases: seedReleases, products: seedProducts });

export function ShopProvider({ value, children }: { value: ShopData; children: ReactNode }) {
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  return useContext(ShopContext);
}
