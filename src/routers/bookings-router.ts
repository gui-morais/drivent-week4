import { getBooking, postBooking, putBooking } from "@/controllers/bookings-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingRouters = Router();

bookingRouters
    .all("/*", authenticateToken)
    .get("", getBooking)
    .post("", postBooking)
    .put("/:bookingId", putBooking)

export {bookingRouters};