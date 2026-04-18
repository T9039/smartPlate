export interface User {
    id: number;
    username: string;
    email: string;
}

export interface InventoryItem {
    id: number;
    user_id: number;
    name: string;
    category?: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    barcode?: string;
    created_at: string;
}

export interface WasteLog {
    id: number;
    user_id: number;
    item_name: string;
    quantity: number;
    action: 'consumed' | 'wasted';
    logged_at: string;
}

export interface Recipe {
    title: string;
    ingredients: string[];
    instructions: string[];
}
