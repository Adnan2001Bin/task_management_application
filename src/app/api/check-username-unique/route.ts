import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  name: usernameValidation,
});

export async function GET(request: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      name: searchParams.get("name"),
    };

    // Validate with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().name?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { name } = result.data;

    // Check for any user with the username, verified or not
    const existingUser = await UserModel.findOne({ name });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}