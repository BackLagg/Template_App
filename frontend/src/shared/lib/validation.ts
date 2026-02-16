export const MIN_DONATION_AMOUNT = 0.5;

export const isValidDonationAmount = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < MIN_DONATION_AMOUNT) return false;
    return true;
};

export const formatDonationAmount = (value: string): string => {
    let formatted = value.replace(/[^\d.]/g, '');
    const parts = formatted.split('.');
    if (parts.length > 2) {
        formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    const newParts = formatted.split('.');
    if (newParts.length === 2 && newParts[1].length > 9) {
        formatted = newParts[0] + '.' + newParts[1].substring(0, 9);
    }
    return formatted;
};

export interface ProductFormValidationError {
    field?: string;
    message: string;
}

export const validateProductForm = (form: {
    title: string;
    description: string;
    productUrl?: string;
    priceFbc: number;
    rewardFbc: number;
    categoryId?: string;
    newCategoryName?: string;
}): ProductFormValidationError | null => {
    if (!form.title.trim()) {
        return { field: 'title', message: 'Title is required' };
    }

    if (!form.categoryId) {
        return { field: 'categoryId', message: 'Category is required' };
    }

    if (form.categoryId === 'create-new' && !form.newCategoryName?.trim()) {
        return { field: 'newCategoryName', message: 'New category name is required' };
    }

    if (form.productUrl && form.productUrl.trim()) {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(form.productUrl.trim())) {
            return { field: 'productUrl', message: 'Product URL must start with http:// or https://' };
        }
    }

    if (form.priceFbc < 1) {
        return { field: 'priceFbc', message: 'Price must be at least 1 FBC' };
    }

    if (form.rewardFbc > form.priceFbc) {
        return { field: 'rewardFbc', message: 'Reward cannot exceed price' };
    }

    return null;
};

