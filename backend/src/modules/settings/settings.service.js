import db from '../../config/db.js';

const formatToHtml = (text) => {
    if (!text) return "";
    
    // If it already looks like HTML (starts with a tag), don't wrap it
    if (text.trim().startsWith("<") && text.trim().endsWith(">")) {
        return text;
    }

    // 1. Convert markdown-style bold (**text** or __text__)
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 2. Handle paragraphs and line breaks
    // Split by double newlines (paragraphs)
    return formatted
        .split(/\n\s*\n/)
        .filter(p => p.trim() !== "")
        .map(p => {
            // Replace single newlines with <br /> within the paragraph
            const inner = p.trim().replace(/\n/g, '<br />');
            return `<p>${inner}</p>`;
        })
        .join("");
};

const formatToPlain = (html) => {
    if (!html) return "";
    
    let plain = html
        // 1. Convert tags to markdown
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        // 2. Convert breaks
        .replace(/<br\s*\/?>/g, "\n")
        // 3. Convert paragraphs (add double newline between them)
        .replace(/<\/p>\s*<p>/g, "\n\n")
        // 4. Strip remaining <p> tags
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "");

    return plain.trim();
};

export const getPagesService = async () => {
    const [rows] = await db.query('SELECT * FROM manage_content');
    
    // Map records to convert HTML back to editable plain text
    return rows.map(item => ({
        ...item,
        content: item.type === 'html' ? formatToPlain(item.content) : item.content
    }));
};


export const updatePageService = async (key, content) => {
    // Check current type to decide if we should format
    const [rows] = await db.query('SELECT type FROM manage_content WHERE page_key = ?', [key]);
    let finalContent = content;
    
    if (rows.length > 0 && rows[0].type === 'html') {
        finalContent = formatToHtml(content);
    }

    const [result] = await db.query('UPDATE manage_content SET content = ? WHERE page_key = ?', [finalContent, key]);
    return result.affectedRows > 0;
};

export const createPageService = async (page_key, title, content, type, icon) => {
    const finalContent = type === 'html' ? formatToHtml(content) : content;
    
    const [result] = await db.query(
        'INSERT INTO manage_content (page_key, title, content, type, icon, is_deletable) VALUES (?, ?, ?, ?, ?, ?)',
        [page_key, title, finalContent, type, icon, true]
    );
    return result.insertId;
};

export const deletePageService = async (key) => {
    const [result] = await db.query('DELETE FROM manage_content WHERE page_key = ? AND is_deletable = TRUE', [key]);
    return result.affectedRows > 0;
};
