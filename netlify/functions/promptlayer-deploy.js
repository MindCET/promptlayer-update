exports.handler = async (event) => {
  try {
    // 1) אימות secret מה-URL
    const url = new URL(event.rawUrl);
    const secret = url.searchParams.get("secret");
    if (secret !== process.env.PROMPTLAYER_WEBHOOK_SECRET) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    // 2) לקרוא payload
    const payload = event.body ? JSON.parse(event.body) : null;
    if (!payload) {
      return { statusCode: 400, body: "Missing body" };
    }

    // ⭐ DEBUG זמני: לראות מה PromptLayer שולח
    console.log("WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));

    // 3) כאן נצטרך להתאים לפי המבנה האמיתי של payload
    // כרגע שמתי fallback פשוט:
    const prompt_key = payload.prompt_key || payload.key || payload.slug || payload.name;
    const version = payload.version || payload.prompt_version || payload.commit || null;
    const system = payload.system || payload.system_text || "";
    const user_template = payload.user_template || payload.template || payload.prompt || payload.user || "";

    if (!prompt_key || !user_template) {
      return { statusCode: 400, body: "Invalid payload (missing prompt_key or template)" };
    }

    // 4) עדכון Bubble (כרגע: CREATE. אחר כך נעשה UPSERT)
    const bubbleRes = await fetch(
      `https://${process.env.BUBBLE_APP}.bubbleapps.io/api/1.1/obj/Prompt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BUBBLE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: prompt_key,
          version,
          system_text: system,
          user_template,
          active: true,
        }),
      }
    );

    if (!bubbleRes.ok) {
      const err = await bubbleRes.text();
      console.error("Bubble error:", err);
      return { statusCode: 500, body: "Bubble update failed" };
    }

    return { statusCode: 200, body: "Prompt deployed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
