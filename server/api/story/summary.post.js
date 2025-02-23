import { generateCompletion } from "~/server/utils/complete";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      message: "Unauthorised Access",
      statusCode: 401,
    });
  }

  const { storyId, newSummary } = await readBody(event);
  if (!storyId || !newSummary) {
    throw createError({
      message: "Missing storyId or newSummary",
      statusCode: 400,
    });
  }

  // Retrieve the current summary for context.
  const currentResult = await pool.query(
    "SELECT summary FROM stories WHERE story_id = $1 AND user_id = $2",
    [storyId, event.context.user.id]
  );

  if (currentResult.rowCount === 0) {
    throw createError({
      message: "Story not found or unauthorized",
      statusCode: 404,
    });
  }
  
  const oldSummary = currentResult.rows[0].summary || "";

  // Generate an updated summary using generateCompletion.
  const prompt = `You are an experienced editor updating a story summary while preserving its original beginning.
Original Summary: ${oldSummary}
New Addition: ${newSummary}
Generate an updated summary that maintains the original starting text and seamlessly incorporates the new addition. Just output the updated summary. no formatting nothing just text.`;
  
  const updatedSummary = await generateCompletion(prompt);

  // Update the story summary in the database and refresh updated_at.
  const updateResult = await pool.query(
    `UPDATE stories
     SET summary = $1, updated_at = CURRENT_TIMESTAMP
     WHERE story_id = $2 AND user_id = $3
     RETURNING summary`,
    [updatedSummary, storyId, event.context.user.id]
  );

  if (updateResult.rowCount === 0) {
    throw createError({
      message: "Story not found or unauthorized",
      statusCode: 404,
    });
  }

  return {
    success: true,
    summary: updateResult.rows[0].summary,
  };
});