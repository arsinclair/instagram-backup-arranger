import { processStories } from "./process-stories.js";
import { processPosts } from "./process-posts.js";

const runScript = async () => {
    await processStories();
    await processPosts();
};

await runScript();