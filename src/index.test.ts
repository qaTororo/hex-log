import { describe, test, expect } from "bun:test";
import app from "./index";

describe("Basic Routes", () => {
  test("GET / should return 200 and hello message", async () => {
    // app.request で擬似的なリクエストを送信
    const res = await app.request("/");

    // ステータスコードの確認
    expect(res.status).toBe(200);

    // レスポンスボディの確認
    const body = await res.text();
    expect(body).toBe("Hello Hex Log!");
  });
});
