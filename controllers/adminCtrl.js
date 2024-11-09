import dbConnect from "../config/dbConnect.js";

// GET all blogs
export const getBlogs = async (req, res) => {
    try {
        // Set default values for page and limit if they aren't provided in the query
        const page = parseInt(req.query.page) || 1; // Default page is 1
        const limit = parseInt(req.query.limit) || 10; // Default limit is 10
        const offset = (page - 1) * limit;

        // Query to fetch paginated blogs
        const query = `SELECT * FROM blogs LIMIT ? OFFSET ?`;
        const [data] = await dbConnect.query(query, [limit, offset]);

        // If no records found
        if (!data.length) {
            return res.status(404).json({
                success: false,
                message: "No blogs found",
            });
        }

        // Query to get the total count of blogs for pagination metadata
        const [totalCount] = await dbConnect.query(`SELECT COUNT(*) as count FROM blogs`);
        const totalBlogs = totalCount[0].count;
        const totalPages = Math.ceil(totalBlogs / limit);

        // Return paginated data along with metadata
        res.status(200).json({
            success: true,
            message: "All blogs",
            data: data,
            pagination: {
                totalBlogs,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in getting all blogs',
            error,
        });
    }
};


//Get single blog

export const getSingleBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await dbConnect.query(`SELECT * FROM blogs WHERE id =?`, [id]);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "no record found"
            })
        }

        res.status(200).json({
            success: true,
            message: "blog successfully fetched",
            data: data[0],
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in Get single blog',
            error,
        })
    }
}


// create blog
export const createBlog = async (req, res) => {
    try {
        const {
            title,
            content,
            image_url,
            video_url,
            meta_title,
            meta_description,
            tags,
            status } = req.body;
        // Validate input fields (ensure title and content are provided)
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required',
            });
        }

        const query = `
        INSERT INTO blogs (title, content, image_url, video_url, meta_title, 
            meta_description, tags, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            title,
            content,
            image_url || null,  // Optional field for image URL
            video_url || null,  // Optional field for video URL
            meta_title || null, // Optional field for meta title
            meta_description || null, // Optional field for meta description
            tags || null, // Optional field for tags
            status || 'draft', // Default status is 'draft'
        ];

        const data = await dbConnect.query(query, values)

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "error in insert query"
            })
        }

        res.status(201).json({
            success: true,
            message: 'new blog successfully created',
            blogId: data[0].insertId,
        })

    } catch (error) {

        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in creating blog',
            error,
        })
    }
};


export const updateBlog = async (req, res) => {
    try {
        // Get blog ID from URL parameters
        const { id } = req.params;

        // Get updated fields from request body
        const {
            title,
            content,
            image_url,
            video_url,
            meta_title,
            meta_description,
            tags,
            status
        } = req.body;

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required',
            });
        }

        // Prepare SQL query for updating the blog post
        const query = `
            UPDATE blogs SET 
                title = COALESCE(?, title),
                content = COALESCE(?, content),
                image_url = COALESCE(?, image_url),
                video_url = COALESCE(?, video_url),
                meta_title = COALESCE(?, meta_title),
                meta_description = COALESCE(?, meta_description),
                tags = COALESCE(?, tags),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const values = [
            title || null,
            content || null,
            image_url || null,
            video_url || null,
            meta_title || null,
            meta_description || null,
            tags || null,
            status || 'draft',
            id
        ];

        // Execute the query
        const [result] = await dbConnect.query(query, values);

        // Check if the blog was found and updated
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found or no changes made',
            });
        }

        // Respond with a success message
        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error in updating blog',
            error,
        });
    }
};


export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required',
            });
        }

        // SQL query to delete the blog post
        const query = `DELETE FROM blogs WHERE id = ?`;
        const [result] = await dbConnect.query(query, [id]);

        // Check if the blog post was found and deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        // Respond with a success message
        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error in deleting blog',
            error,
        });
    }
};
