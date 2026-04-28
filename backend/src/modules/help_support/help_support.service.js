import db from '../../config/db.js';

export const getContactsService = async (role) => {
    let query = `SELECT id, role, name, 
                 COALESCE(NULLIF(email, ''), 'noemail') as email, 
                 country_code, 
                 COALESCE(NULLIF(phone_number, ''), 'No Phone') as phone_number, 
                 working_hours 
                 FROM help_support_contacts`;
    const values = [];
    
    if (role) {
        query += ' WHERE role = ?';
        values.push(role);
    }
    
    const [rows] = await db.query(query, values);
    return rows;
};

export const updateContactsService = async (role, contacts) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Delete existing ones for this role
        await connection.query(
            'DELETE FROM help_support_contacts WHERE role = ?', 
            [role]
        );
        
        // Insert new ones
        if (contacts && contacts.length > 0) {
            const values = contacts.map(c => [
                role,
                c.name || 'Shipzyy User',
                c.email || 'noemail',
                c.country_code,     // ✅ NEW
                c.phone_number,     // ✅ NEW
                c.working_hours   
            ]);

            await connection.query(
                `INSERT INTO help_support_contacts 
                (role, name, email, country_code, phone_number, working_hours) 
                VALUES ?`,
                [values]
            );
        }
        
        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
