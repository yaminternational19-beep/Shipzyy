import db from "../../../config/db.js";

const getHelpSupport = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, country_code, phone_number, working_hours, created_at
     FROM help_support_contacts
     WHERE role = ?
     ORDER BY created_at DESC`,
    ['customer']
  );

  return {
    records: rows
  };
};

const getContent = async () => {
    const baseUrl = process.env.BASE_URL || "http://localhost:9000/api/v1";
    const [rows] = await db.query('SELECT page_key, title, content, type FROM manage_content');
    
    const formattedRecords = rows.map(item => {
        let contentUrl = "";
        if (item.type === "url") {
            contentUrl = item.content;
        } else if (item.type === "html") {
            contentUrl = `${baseUrl}/customers/content/${item.page_key}`;
        }

        return {
            page_key: item.page_key,
            title: item.title,
            content: item.type === "html" ? item.content : null,
            type: item.type,
            content_url: contentUrl
        };
    });

    return {
        records: formattedRecords
    };
};

const getContentByKey = async (pageKey) => {
    const [rows] = await db.query(
        'SELECT title, content FROM manage_content WHERE page_key = ? LIMIT 1',
        [pageKey]
    );
    
    if (!rows.length) return null;
    return rows[0];
};

export default { getHelpSupport, getContent, getContentByKey };
