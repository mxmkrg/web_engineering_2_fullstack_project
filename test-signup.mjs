// Simple test to verify signup functionality
import fetch from "node-fetch";

const testSignup = async () => {
  try {
    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");
    formData.append("password", "testpassword123");

    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    console.log("Response status:", response.status);
    console.log("Response:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

testSignup();
