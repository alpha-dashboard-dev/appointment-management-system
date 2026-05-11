// Load environment variables FIRST before any other imports,
// so every module that reads process.env gets the correct values.
import "dotenv/config";

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
