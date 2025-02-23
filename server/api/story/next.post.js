import { generateCompletion } from "~/server/utils/complete";
import { fal } from "@fal-ai/client";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      message: "Unauthorised Access not allowed",
      statusCode: 401,
    });
  }
  
  fal.config({
    credentials: useRuntimeConfig().falKey
  });

  const { storyId, nextChapterNumber } = await readBody(event);
  if (!storyId || !nextChapterNumber) {
    throw createError({ message: "Missing storyId or nextChapterNumber", statusCode: 400 });
  }

  // Retrieve basic story details.
  const storyResult = await pool.query(
    "SELECT story_id, title, summary FROM stories WHERE story_id = $1",
    [storyId]
  );
  if (storyResult.rowCount === 0) {
    throw createError({ message: "Story not found", statusCode: 404 });
  }
  const story = storyResult.rows[0];

  // Check if the requested chapter already exists.
  const existingChapterResult = await pool.query(
    "SELECT chapter_number, content, image_urls FROM chapters WHERE story_id = $1 AND chapter_number = $2",
    [storyId, nextChapterNumber]
  );
  if (existingChapterResult.rowCount > 0) {
    const chapterData = existingChapterResult.rows[0];
    let parsedImages = [];
    try {
      parsedImages = JSON.parse(chapterData.image_urls);
    } catch (error) {
      console.error("Error parsing image_urls:", error);
      // If parsing fails, return empty array for images
      parsedImages = [];
    }
    return {
      success: true,
      chapter_number: chapterData.chapter_number,
      chapter: chapterData.content,
      images: parsedImages
    };
  }

  // Retrieve the last chapter for context.
  const lastChapterResult = await pool.query(
    "SELECT chapter_number, content FROM chapters WHERE story_id = $1 ORDER BY chapter_number DESC LIMIT 1",
    [storyId]
  );
  if (lastChapterResult.rowCount === 0) {
    throw createError({ message: "No chapters found for this story", statusCode: 404 });
  }
  const lastChapterRow = lastChapterResult.rows[0];
  const currentChapterNumber = lastChapterRow.chapter_number;

  // Generate the next chapter only if nextChapterNumber equals last chapter + 1.
  if (nextChapterNumber !== currentChapterNumber + 1) {
    throw createError({ message: "Invalid next chapter number", statusCode: 400 });
  }

  // Generate the next chapter.
  const chapterPrompt = `You are a narrative writer continuing an engaging story. 
Story Title: ${story.title}
Story Summary: ${story.summary}
Previous Chapter (Chapter ${currentChapterNumber}): ${lastChapterRow.content}

Continue the story by writing Chapter ${currentChapterNumber + 1} in a consistent narrative style. Do NOT use markdown formatting or quotes; simply return plain text.
If the story should be ended here based on the summary, please append the tag <end_story> at the very end of your response.`;
  
  const nextChapter = await generateCompletion(chapterPrompt);
  console.log(nextChapter);

  // Split nextChapter into segments with roughly equal number of sentences.
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  let sentences = nextChapter.match(sentenceRegex) || [nextChapter];
  const totalSegments = Math.min(7, sentences.length);
  const segmentSize = Math.ceil(sentences.length / totalSegments);
  const segments = [];
  for (let i = 0; i < sentences.length; i += segmentSize) {
    segments.push(sentences.slice(i, i + segmentSize).join(" ").trim());
  }

  // Generate image prompts for each segment.
  const imagePrompts = [];
  for (const segment of segments) {
    const imagePromptRequest = `Based on the following chapter segment, generate a vivid and detailed image description that captures key moments in 2-3 sentences only:

${segment}`;
    const promptResult = await generateCompletion(imagePromptRequest);
    imagePrompts.push(promptResult.trim());
  }

  // Generate images for each prompt.
  const imageUrls = [];
  try {
    // Generate first image using flux/schnell (text-to-image).
    const firstResult = await fal.subscribe("fal-ai/flux/dev", {
      input: { prompt: imagePrompts[0] },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    let previousImageUrl = firstResult.data.images[0].url;
    imageUrls.push(previousImageUrl);
  
    // Generate remaining images using flux-subject (image-to-image).
    for (let i = 1; i < imagePrompts.length; i++) {
      const result = await fal.subscribe("fal-ai/flux-subject", {
        input: {
          prompt: imagePrompts[i],
          image_url: previousImageUrl,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      previousImageUrl = result.data.images[0].url;
      imageUrls.push(previousImageUrl);
    }
  } catch (error) {
    console.error("Failed to generate images:", error);
  }
  console.log(imageUrls);

  // Concatenate segments with <horizon_separator> for storage.
  const chapterContent = segments.join("<horizon_separator>");

  // Insert the new chapter into the database.
  await pool.query(
    "INSERT INTO chapters (story_id, chapter_number, content, image_urls) VALUES ($1, $2, $3, $4)",
    [storyId, nextChapterNumber, chapterContent, JSON.stringify(imageUrls)]
  );

  return {
    success: true,
    chapter_number: nextChapterNumber,
    chapter: chapterContent,
    images: imageUrls,
  };
});