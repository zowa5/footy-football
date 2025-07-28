// Simple API test script for PES Football Management Backend
const BASE_URL = "http://localhost:5000";

// Test health check
const testHealth = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health:", data.status);
  } catch (error) {
    console.error("❌ Health failed:", error.message);
  }
};

// Test formations
const testFormations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/formations`);
    const data = await response.json();
    console.log(`✅ Formations: ${data.data.formations.length} items found`);
  } catch (error) {
    console.error("❌ Formations failed:", error.message);
  }
};

// Test register player
const testRegisterPlayer = async () => {
  try {
    const playerData = {
      username: "testplayer123",
      email: "player@test.com",
      password: "testpass123",
      role: "player",
      position: "ST",
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(
        `✅ Register Player: ${data.data.user.username} (${data.data.user.role})`
      );
      return data.data.token;
    } else {
      console.log(`⚠️  Register Player: ${data.error || "Failed"}`);
    }
  } catch (error) {
    console.error("❌ Register Player failed:", error.message);
  }
};

// Test register manager
const testRegisterManager = async () => {
  try {
    const managerData = {
      username: "testmanager123",
      email: "manager@test.com",
      password: "testpass123",
      role: "manager",
      clubName: "Test FC",
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(managerData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(
        `✅ Register Manager: ${data.data.user.username} (${data.data.user.managerData.clubName})`
      );
      return data.data.token;
    } else {
      console.log(`⚠️  Register Manager: ${data.error || "Failed"}`);
    }
  } catch (error) {
    console.error("❌ Register Manager failed:", error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log("🧪 Testing PES Football Management API...\n");

  await testHealth();
  await testFormations();

  console.log("\n--- Authentication Tests ---");
  await testRegisterPlayer();
  await testRegisterManager();

  console.log("\n✅ Tests completed!");
};

// Only run if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  runTests();
}

module.exports = {
  testHealth,
  testFormations,
  testRegisterPlayer,
  testRegisterManager,
};
