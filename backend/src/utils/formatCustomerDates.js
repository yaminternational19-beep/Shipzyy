/**
 * Standardize customer date fields into DD-MMM-YYYY format
 * @param {Object|Array} data - Single customer object or array of objects
 * @returns {Object|Array} Formatted data
 */
const formatCustomerDates = (data) => {
  if (!data) return data;

    const dateFields = ["created_at", "updated_at", "last_login_at", "joined", "status_date", "date"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    const format = (item) => {
      const newItem = { ...item };
      dateFields.forEach(field => {
        if (newItem[field]) {
          const d = new Date(newItem[field]);
          if (!isNaN(d.getTime())) {
          newItem[field] = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
          }
        }
      });
      return newItem;
    };

  if (Array.isArray(data)) {
    return data.map(format);
  }

  return format(data);
};

export default formatCustomerDates;
