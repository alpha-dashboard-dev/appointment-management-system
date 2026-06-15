import "dotenv/config";
import app from "./app";
import { startRecurrenceJob } from "./jobs/recurrence.job";

const PORT = process.env.PORT || 5000;

startRecurrenceJob();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
