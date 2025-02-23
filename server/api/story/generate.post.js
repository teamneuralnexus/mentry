import { generateCompletion } from "~/server/utils/complete";
import { fal } from "@fal-ai/client";

export default defineEventHandler(async (event) => {
    if (event.context.user) {
        const username = event.context.user.username;
        const userId = event.context.user.id;
        const body = await readBody(event)
        const mood = body.userEmoji
        const feeling = body.userFeeling
        fal.config({
            credentials: useRuntimeConfig().falKey
        });
        const prompt = `You are a therapist through story telling and is expert in that. Your job is to cheer up the person
        if they are feeling a little dull and maintain the energy if they are happy while generate the story.
        
        Mood: ${mood}
        Feeling: ${feeling}
        
        Generate the first chapter of the story along with the a detailed summary of complete story and title at first. Do NOT use bold or markdown just normal text without even quotes or anything just in the format I told you to.
        Format: 
        Title: <title of the story>
        Summary: <summary>
        First Chapter: <first_chapter>`;
        const result = await generateCompletion(prompt);
        console.log(result)
        const title = result.match(/Title: (.*?)Summary:/s)?.[1]?.trim();
        const summary = result.match(/Summary: (.*?)First Chapter:/s)?.[1]?.trim();
        const firstChapter = result.match(/First Chapter: (.*?)$/s)?.[1]?.trim();

        // Split firstChapter into segments with roughly equal number of sentences
        const sentenceRegex = /[^.!?]+[.!?]+/g;
        let sentences = firstChapter.match(sentenceRegex) || [firstChapter];
        const totalSegments = Math.min(7, sentences.length);
        const segmentSize = Math.ceil(sentences.length / totalSegments);
        const segments = [];
        for (let i = 0; i < sentences.length; i += segmentSize) {
            segments.push(sentences.slice(i, i + segmentSize).join(" ").trim());
        }

        // Generate image prompts for each segment
        const imagePrompts = [];
        for (const segment of segments) {
            const imagePromptRequest = `Based on the following story chapter segment, generate a vivid and detailed image description that captures key moments in 2-3 sentences only:
            
${segment}`;
            const promptResult = await generateCompletion(imagePromptRequest);
            imagePrompts.push(promptResult.trim());
        }

        // Generate and save images for each prompt
        const imageUrls = [];

        // Generate first image using flux/schnell (text-to-image)
        try {
            const firstResult = await fal.subscribe("fal-ai/flux/dev", {
                input: {
                    prompt: imagePrompts[0]
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                }
            });
            
            let previousImageUrl = firstResult.data.images[0].url;
            imageUrls.push(previousImageUrl);

            // Generate remaining images using flux-subject (image-to-image)
            for (let i = 1; i < imagePrompts.length; i++) {
                const result = await fal.subscribe("fal-ai/flux-subject", {
                    input: {
                        prompt: imagePrompts[i],
                        image_url: previousImageUrl
                    },
                    logs: true,
                    onQueueUpdate: (update) => {
                        if (update.status === "IN_PROGRESS") {
                            update.logs.map((log) => log.message).forEach(console.log);
                        }
                    }
                });
                
                previousImageUrl = result.data.images[0].url;
                console.log(previousImageUrl);
                imageUrls.push(previousImageUrl);
            }
        } catch (error) {
            console.error("Failed to generate images:", error);
        }

        console.log(imageUrls)
        
        // Add <horizon_separator> between chapter segments before saving
        const chapterContent = segments.join("<horizon_separator>");

        // Save story to database
        const storyResult = await pool.query(
            "INSERT INTO stories (user_id, title, summary, mood, feeling) VALUES ($1, $2, $3, $4, $5) RETURNING story_id",
            [userId, title, summary, mood, feeling]
        );

        const storyId = storyResult.rows[0].story_id;
        
        // Save chapter with images
        await pool.query(
            "INSERT INTO chapters (story_id, chapter_number, content, image_urls) VALUES ($1, $2, $3, $4)",
            [storyId, 1, chapterContent, JSON.stringify(imageUrls)]
        );

        return {
            success: true,
            story_id: storyId,
            images: imageUrls
        };
    } else {
        throw createError({
            message: "Unauthorised Access not allowed",
            statusCode: 401
        });
    }
});