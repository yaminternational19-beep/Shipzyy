import db from '../../config/db.js';
import s3Service from '../../services/s3Service.js';
import { getPagination, getPaginationMeta } from '../../utils/pagination.js';

const createBanner = async (data, file) => {
  let bannerImageUrl = null;

  if (file) {
    const upload = await s3Service.uploadFile(file, "banners");
    bannerImageUrl = upload.url;
  }

  if (!bannerImageUrl) {
    throw new Error("Banner image is required");
  }

  const query = `
    INSERT INTO banners (banner_name, description, banner_image)
    VALUES (?, ?, ?)
  `;
  const values = [data.banner_name, data.description || "", bannerImageUrl];

  const [result] = await db.query(query, values);

  return {
    id: result.insertId,
    banner_name: data.banner_name,
    description: data.description || "",
    banner_image: bannerImageUrl
  };
};

const getBanners = async (queryParams) => {
  const { page, limit, skip } = getPagination(queryParams);
  let where = [];
  let values = [];

  if (queryParams.search) {
    where.push("banner_name LIKE ?");
    values.push(`%${queryParams.search}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countResult] = await db.query(`SELECT COUNT(*) as total FROM banners ${whereClause}`, values);
  const totalRecords = countResult[0].total;

  const [records] = await db.query(
    `SELECT * FROM banners ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  return {
    records,
    pagination: getPaginationMeta(page, limit, totalRecords)
  };
};

const updateBanner = async (id, data, file) => {
  const [rows] = await db.query(`SELECT * FROM banners WHERE id = ?`, [id]);

  if (rows.length === 0) {
    throw new Error("Banner not found");
  }

  const banner = rows[0];
  let bannerImageUrl = banner.banner_image;

  if (file) {
    const upload = await s3Service.uploadFile(file, "banners");
    bannerImageUrl = upload.url;
    
    // Optionally delete old image
    if (banner.banner_image) {
      try {
        const key = banner.banner_image.split(".amazonaws.com/")[1];
        if (key) await s3Service.deleteFile(key);
      } catch (err) {
        console.log("Warning: Old banner image deletion failed", err.message);
      }
    }
  }

  const query = `
    UPDATE banners 
    SET banner_name = ?, description = ?, banner_image = ?
    WHERE id = ?
  `;
  const values = [
    data.banner_name ?? banner.banner_name,
    data.description ?? banner.description,
    bannerImageUrl,
    id
  ];

  await db.query(query, values);

  return {
    id: banner.id,
    banner_name: data.banner_name ?? banner.banner_name,
    description: data.description ?? banner.description,
    banner_image: bannerImageUrl
  };
};

const deleteBanner = async (id) => {
  const [rows] = await db.query(`SELECT * FROM banners WHERE id = ?`, [id]);

  if (rows.length === 0) {
    throw new Error("Banner not found");
  }

  const banner = rows[0];

  if (banner.banner_image) {
    try {
      const key = banner.banner_image.split(".amazonaws.com/")[1];
      if (key) await s3Service.deleteFile(key);
    } catch (err) {
      console.log("Old banner image deletion failed:", err.message);
    }
  }

  await db.query(`DELETE FROM banners WHERE id = ?`, [id]);

  return { id: banner.id, message: "Deleted successfully" };
};

export default { createBanner, getBanners, updateBanner, deleteBanner };
