import bookingRepositories from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBookingFromAUserId(userId: number) {
    const booking = await bookingRepositories.listBooking(userId);
    if(!booking) {
        throw {name: "NotFound"}
    }

    return booking;
}

async function checkPostBooking(userId: number, roomId: number) {
    const room = await roomRepository.getRoomById(roomId);
    if(!room) {
        throw{name: "NotFound"}
    }
    const bookingForRoom = await bookingRepositories.listBookingForRoom(roomId);
    if(bookingForRoom.length >= room.capacity) {
        throw{name: "Forbidden"}
    }

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) {
        throw{name: "Forbidden"}
    }
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(ticket.TicketType.isRemote===true || ticket.TicketType.includesHotel===false || ticket.status === "RESERVED") {
        throw{name: "Forbidden"}
    }

    return await bookingRepositories.createBooking(userId, roomId);
}

async function checkPutBooking(userId: number, bookingId: number, roomId: number) {
    const booking = await bookingRepositories.getBookingById(bookingId);
    if(booking.userId !== userId) {
        throw {name: "Unauthorized"};
    }
    if(booking.roomId !== roomId) {
        const room = await roomRepository.getRoomById(roomId);
        if(!room) {
            throw{name: "NotFound"}
        }
        const bookingForRoom = await bookingRepositories.listBookingForRoom(roomId);
        if(bookingForRoom.length >= room.capacity) {
            throw{name: "Forbidden"}
        }
        await bookingRepositories.updateBooking(bookingId, roomId);
    }
}

const bookingServices = {
    getBookingFromAUserId,
    checkPostBooking,
    checkPutBooking
}

export default bookingServices;