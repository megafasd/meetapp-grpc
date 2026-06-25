import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const packageDef = protoLoader.loadSync(
  path.join(__dirname, "../proto/user.proto"),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const proto = grpc.loadPackageDefinition(packageDef) as any;
const client = new proto.user.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

function call<T = any>(method: string, request: any): Promise<T> {
  return new Promise((resolve, reject) => {
    client[method](request, (err: any, response: any) =>
      err ? reject(err) : resolve(response)
    );
  });
}

async function main() {
  console.log("--- Login ---");
  const loginResponse: any = await call("Login", {
    username: "alice",
    password: "password123",
  });
  console.log(loginResponse);

  // Wait 2 seconds so the new tokens have a different timestamp than the login ones
  await new Promise((r) => setTimeout(r, 2000));

  console.log("\n--- RefreshToken ---");
  const refreshResponse: any = await call("RefreshToken", {
    userId: loginResponse.user.id,
    refreshToken: loginResponse.refreshToken,
  });
  console.log(refreshResponse);

  console.log("\n--- Logout ---");
  const logoutResponse: any = await call("Logout", {
    refreshToken: refreshResponse.refreshToken,
  });
  console.log(logoutResponse);

  console.log("\n--- RefreshToken AFTER logout (should fail!) ---");
  try {
    await call("RefreshToken", {
      userId: loginResponse.user.id,
      refreshToken: refreshResponse.refreshToken,
    });
    console.log("⚠️ This should NOT have succeeded!");
  } catch (err: any) {
    console.log("✅ Correctly rejected:", err.message);
  }
}

main().catch((err) => console.error("Error:", err.message));