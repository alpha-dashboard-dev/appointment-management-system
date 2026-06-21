import cron from "node-cron";
import recurrenceExecutor from "../services/appointmentRecurrenceExecutor.service";

export function startRecurrenceJob() {

    cron.schedule("* * * * *", async () => {
        // console.log("Running recurrence engine...");

        try {
            await recurrenceExecutor.processRecurrences();
            // console.log("Recurrence job completed");
        } catch (err) {
            console.error("Recurrence job failed:", err);
        }
    });
}