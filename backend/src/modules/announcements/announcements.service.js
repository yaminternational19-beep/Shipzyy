import db from '../../config/db.js';

export const getAnnouncementsService = async (limit, skip, target_type) => {
    let queryParams = [];
    let whereClause = '';
    
    if (target_type) {
        whereClause = 'WHERE target_type = ? OR target_type = "ALL"'; // If filtered by Rider, show Rider + All
        queryParams.push(target_type);
    }
    
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM announcements ${whereClause}`, queryParams);
    
    const [rows] = await db.query(`SELECT * FROM announcements ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...queryParams, limit, skip]);
    return { announcements: rows, totalCount: total };
};

export const createAnnouncementService = async (data) => {
    const { title, message, target_type, target_detail, targeted_to, entity_id, entity_name } = data;
    const [result] = await db.query(
        `INSERT INTO announcements (title, message, target_type, target_detail, targeted_to, entity_id, entity_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, message, target_type, target_detail, targeted_to, entity_id || null, entity_name || null]
    );
    return result.insertId;
};

export const updateAnnouncementService = async (id, title, message) => {
    const [result] = await db.query(
        'UPDATE announcements SET title = ?, message = ? WHERE id = ?',
        [title, message, id]
    );
    return result.affectedRows > 0;
};

export const deleteAnnouncementService = async (id) => {
    const [result] = await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    return result.affectedRows > 0;
};
