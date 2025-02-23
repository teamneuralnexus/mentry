export default defineEventHandler(async (event) => {
    if (!event.context.user) {
      throw createError({
        message: "Unauthorised Access",
        statusCode: 401,
      });
    }
    
    const userId = event.context.user.id;
    // Query total stories grouped by mood
    const result = await pool.query(
      `SELECT mood, COUNT(*) AS count 
       FROM stories 
       WHERE user_id = $1 
       GROUP BY mood`,
      [userId]
    );
    
    return {
      success: true,
      stats: result.rows,
    };
  });