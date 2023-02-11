import { AuthenticatedRequest } from "@/middlewares";
import bookingServices from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const {userId} = req;

    try {
        const booking = await bookingServices.getBookingFromAUserId(userId);
        return res.status(httpStatus.OK).send(booking);
    } catch(err) {
        if(err.name === "NotFound") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    const {userId} = req;
    const roomId = req.body.roomId as number;
    if(!roomId) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    try{
        const booking = await bookingServices.checkPostBooking(userId, roomId);
        return res.status(httpStatus.OK).send(booking.id);
    } catch(err) {
        if(err.name === "NotFound") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(err.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const {userId} = req;
    const roomId = req.body.roomId as number;
    const bookingId = Number(req.params.bookingId);
    if(!roomId || !bookingId) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    try {
        await bookingServices.checkPutBooking(userId, bookingId, roomId);
    } catch(err) {
        if(err.name === "NotFound") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if(err.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
        if(err.name === "Unauthorized") {
            return res.sendStatus(httpStatus.UNAUTHORIZED);
        }
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
}