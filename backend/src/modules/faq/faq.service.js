import db from '../../config/db.js';

export const getFAQsService = async (category) => {
    let query = 'SELECT * FROM faqs';
    let params = [];
    
    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    return rows;
};

export const createFAQService = async (data) => {
    const { category, question, answer, status } = data;
    const [result] = await db.query(
        'INSERT INTO faqs (category, question, answer, status) VALUES (?, ?, ?, ?)',
        [category, question, answer, status || 'Active']
    );
    return result.insertId;
};

export const updateFAQService = async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    const [result] = await db.query(
        `UPDATE faqs SET ${fields} WHERE id = ?`,
        [...values, id]
    );
    return result.affectedRows > 0;
};

export const deleteFAQService = async (id) => {
    const [result] = await db.query('DELETE FROM faqs WHERE id = ?', [id]);
    return result.affectedRows > 0;
};
