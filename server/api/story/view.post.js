import { generateCompletion } from "~/server/utils/complete";

export default defineEventHandler(async (event) => {
    if (!event.context.user) {
        throw createError({
            message: "Unauthorised Access not allowed",
            statusCode: 401
        });
    }

    try {
        const body = await readBody(event);
        const storyId = body.story_id;
        const userId = event.context.user.id;
        
        // First get the story details
        const storyResult = await pool.query(`
            SELECT 
                story_id,
                title,
                summary,
                mood,
                feeling
            FROM stories
            WHERE story_id = $1 
            AND user_id = $2
        `, [storyId, userId]);

        if (storyResult.rows.length === 0) {
            throw createError({
                message: "Story not found or unauthorized",
                statusCode: 404
            });
        }

        const story = storyResult.rows[0];

        // Then get all chapters for this story
        const chaptersResult = await pool.query(`
            SELECT 
                chapter_number,
                content,
                image_urls
            FROM chapters
            WHERE story_id = $1
            ORDER BY chapter_number ASC
        `, [storyId]);

        // Process chapters and their image URLs
        const chapters = chaptersResult.rows.map(chapter => {
            let images = [];
            try {
                if (Array.isArray(chapter.image_urls)) {
                    images = chapter.image_urls;
                } else if (typeof chapter.image_urls === 'string') {
                    images = JSON.parse(chapter.image_urls);
                }
            } catch (parseError) {
                console.error("Error parsing image_urls:", parseError);
            }

            return {
                chapter_number: chapter.chapter_number,
                content: chapter.content,
                image_urls: images
            };
        });

        // Build the complete story object
        const sanitizedStory = {
            story_id: story.story_id,
            title: story.title,
            summary: story.summary,
            mood: story.mood,
            feeling: story.feeling,
            chapters: chapters
        };

        return {
            success: true,
            story: sanitizedStory
        };
    } catch (error) {
        console.error("Error fetching story:", error);
        throw createError({
            message: "Error fetching story",
            statusCode: 500
        });
    }
});