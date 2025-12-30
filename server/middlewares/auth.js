import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    console.log("AUTH MIDDLEWARE HIT");
    console.log("PLAN FROM CLERK:", user.publicMetadata?.plan);

    // ✅ Normalize plan
    const plan = String(user.publicMetadata?.plan || "free").toLowerCase();

    // ✅ SET req.plan BEFORE using/logging it
    req.plan = plan;

    console.log("PLAN SET ON REQ:", req.plan);

    // ✅ Free usage logic
    if (plan !== "premium") {
      req.free_usage = Number(user.privateMetadata?.free_usage ?? 0);
    } else {
      if ((user.privateMetadata?.free_usage ?? 0) !== 0) {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: 0 },
        });
      }
      req.free_usage = 0;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication error",
    });
  }
};
