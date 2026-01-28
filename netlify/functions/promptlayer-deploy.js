export default async (req) => {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.PROMPTLAYER_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ממשיכים רגיל
};

    const payload = await req.json();

    /**
     * payload צפוי (בערך):
     * {
     *   prompt_key: "course_builder",
     *   version: "v12",
     *   system: "...",
     *   user_template: "... {{topic}} ..."
     * }
     */

    const {
      prompt_key,
      version,
      system,
      user_template
    } = payload;

    if (!prompt_key || !user_template) {
      return new Response("Invalid payload", { status: 400 });
    }

    // 2️⃣ עדכון Bubble דרך Data API
    const bubbleRes = await fetch(
      `https://${process.env.BUBBLE_APP}.bubbleapps.io/api/1.1/obj/Prompt`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BUBBLE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: prompt_key,
          version,
          system_text: system,
          user_template,
          active: true
        })
      }
    );

    if (!bubbleRes.ok) {
      const err = await bubbleRes.text();
      console.error(err);
      return new Response("Bubble update failed", { status: 500 });
    }

    return new Response("Prompt deployed", { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
if (!payload.prompt || !payload.prompt.template) {
  return new Response("Invalid payload", { status: 400 });
}


};
