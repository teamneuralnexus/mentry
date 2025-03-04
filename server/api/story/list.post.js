export default defineEventHandler(async (event) => {
    if (!event.context.user) {
      throw createError({
        message: "Unauthorised Access",
        statusCode: 401,
      });
    }
  
    const userId = event.context.user.id;
    // Retrieve stories for the authenticated user, ordered by creation date
    const result = await pool.query(
      `SELECT story_id, title, summary, mood, feeling, created_at
       FROM stories
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
  
    return {
      success: true,
      stories: result.rows,
    };
  });