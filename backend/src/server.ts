import dotenv from "dotenv";
import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Review Analytics - Backend REST Server running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
