import { safeParse } from "zod";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    // If validation fails, return a 400 response with the validation errors
    //result.success will be false if validation fails, and result.error will contain the validation errors
    // Use result.error.flatten().fieldErrors to get a more readable format of the errors
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }
    // If validation is successful, replace the request body with the validated data
    req.body = result.data;
    next();
  };
};
