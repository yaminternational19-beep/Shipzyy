import db from '../../config/db.js';

export const getPagesService = async () => {
    const [rows] = await db.query('SELECT * FROM manage_content');
    return rows;
};

export const updatePageService = async (key, content) => {
    const [result] = await db.query('UPDATE manage_content SET content = ? WHERE page_key = ?', [content, key]);
    return result.affectedRows > 0;
};

export const createPageService = async (page_key, title, content, type, icon) => {
    const [result] = await db.query(
        'INSERT INTO manage_content (page_key, title, content, type, icon, is_deletable) VALUES (?, ?, ?, ?, ?, ?)',
        [page_key, title, content, type, icon, true]
    );
    return result.insertId;
};

export const deletePageService = async (key) => {
    const [result] = await db.query('DELETE FROM manage_content WHERE page_key = ? AND is_deletable = TRUE', [key]);
    return result.affectedRows > 0;
};
