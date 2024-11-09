import dbConnect from "../config/dbConnect.js";  // This will now import the Supabase client

// GET all blogs
export const getBlogs = async (req, res) => {
    try {
        // Set default values for page and limit if they aren't provided in the query
        const page = parseInt(req.query.page) || 1; // Default page is 1
        const limit = parseInt(req.query.limit) || 10; // Default limit is 10
        const offset = (page - 1) * limit;

        // Query to fetch paginated blogs
        const { data, error } = await dbConnect
            .from('blogs') // The table name
            .select('*')
            .range(offset, offset + limit - 1); // Implementing OFFSET and LIMIT

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching blogs",
                error: error.message
            });
        }

        // If no records found
        if (!data.length) {
            return res.status(404).json({
                success: false,
                message: "No blogs found",
            });
        }

        // Query to get the total count of blogs for pagination metadata
        const { data: totalCountData, error: totalCountError } = await dbConnect
            .from('blogs')
            .select('id', { count: 'exact' });

        if (totalCountError) {
            return res.status(500).json({
                success: false,
                message: "Error fetching total count",
                error: totalCountError.message
            });
        }

        const totalBlogs = totalCountData.length;
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
            error: error.message,
        });
    }
};

// Get single blog
export const getSingleBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await dbConnect
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();  // `.single()` returns only the first row (single blog)

        if (error) {
            return res.status(404).json({
                success: false,
                message: "No record found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog successfully fetched",
            data: data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in getting single blog',
            error: error.message,
        });
    }
};

// Create blog
// controllers/blogController.js
export const createBlog = async (req, res) => {
    try {
        const { title, content, image_url, video_url, meta_title, meta_description, tags, status } = req.body;

        // Validate input fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required',
            });
        }

        // Ensure the tags field is an array (if provided)
        const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [];

        // Create the blog object
        const blogData = {
            title,
            content,
            image_url: image_url || null,
            video_url: video_url || null,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
            tags: tagsArray,
            status: status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Insert the blog into the database
        const { data, error } = await dbConnect
            .from('blogs')
            .insert([blogData])
            .select(); // Add .select() to return the inserted data

        // Log for debugging
        console.log("Request Body:", req.body);
        console.log("Processed Blog Data:", blogData);
        console.log("Supabase Response:", { data, error });

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error creating blog",
                error: error.message
            });
        }

        // Check if data was returned
        if (!data || data.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Blog creation failed, no data returned",
                debug: { blogData, supabaseResponse: { data, error } }
            });
        }

        res.status(201).json({
            success: true,
            message: 'New blog successfully created',
            blog: data[0]
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({
            success: false,
            message: 'Error in creating blog',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image_url, video_url, meta_title, meta_description, tags, status } = req.body;

        // Ensure the blog ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required',
            });
        }

        // Handle tags properly based on input type
        let tagsArray;
        if (tags) {
            if (typeof tags === 'string') {
                // If tags is a string, split it
                tagsArray = tags.split(',').map(tag => tag.trim());
            } else if (Array.isArray(tags)) {
                // If tags is already an array, use it directly
                tagsArray = tags;
            } else {
                // If tags is neither string nor array, set to null
                tagsArray = null;
            }
        } else {
            tagsArray = null;
        }

        // Update the blog in the database
        const { data, error } = await dbConnect
            .from('blogs')
            .update({
                title: title || null,
                content: content || null,
                image_url: image_url || null,
                video_url: video_url || null,
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                tags: tagsArray,
                status: status || 'draft',
            })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error updating blog",
                error: error.message || error.details,
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found or no changes made',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in updating blog',
            error: error.message || error.details,
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Blog ID is required',
            });
        }

        // First check if blog exists
        const { data: existingBlog } = await dbConnect
            .from('blogs')
            .select()
            .eq('id', id)
            .single();

        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        // If blog exists, proceed with deletion
        const { error } = await dbConnect
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting blog",
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error in deleting blog',
            error: error.message,
        });
    }
};