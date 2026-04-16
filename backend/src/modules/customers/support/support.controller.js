import ApiResponse from "../../../utils/apiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import supportService from "./support.service.js";

const getHelpSupport = asyncHandler(async (req, res) => {
  const result = await supportService.getHelpSupport();
  return ApiResponse.success(res, "Help support contacts fetched successfully", result);
});

const getContent = asyncHandler(async (req, res) => {
  const result = await supportService.getContent();
  return ApiResponse.success(res, "Content fetched successfully", result);
});

const getContentByKey = asyncHandler(async (req, res) => {
    const { page_key } = req.params;
    const contentData = await supportService.getContentByKey(page_key);
    
    if (!contentData) {
        throw new ApiError(404, "Page not found");
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${contentData.title}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px;
                }
                h1 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
                .content { margin-top: 24px; }
            </style>
        </head>
        <body>
            <h1>${contentData.title}</h1>
            <div class="content">
                ${contentData.content || "<p>No content available.</p>"}
            </div>
        </body>
        </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlContent);
});

export default { getHelpSupport, getContent, getContentByKey };
