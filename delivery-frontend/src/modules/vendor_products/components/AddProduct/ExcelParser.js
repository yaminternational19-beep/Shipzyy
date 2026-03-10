import * as XLSX from 'xlsx';

export const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const validateProduct = (product) => {
    const errors = {};
    if (!product.name) errors.name = 'Name is required';
    if (!product.category) errors.category = 'Category is required';
    if (!product.price || product.price <= 0) errors.price = 'Price must be greater than 0';
    if (!product.stock && product.stock !== 0) errors.stock = 'Stock is required';
    if (!product.specification) errors.specification = 'Specification is required';
    if (!product.description) errors.description = 'Description is required';

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
