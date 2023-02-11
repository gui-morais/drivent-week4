import { prisma } from "@/config";

async function listBooking(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId
        },
        select: {
            id: true,
            Room: true
        }
    })
}

async function listBookingForRoom(roomId: number) {
    return prisma.booking.findMany({
        where: {
            roomId
        }
    })
}

async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

async function getBookingById(id: number) {
    return prisma.booking.findFirst({
        where: {
            id
        }
    })
}

async function updateBooking(id: number, roomId: number) {
    return prisma.booking.update({
        where: {
            id
        },
        data: {
            roomId
        }
    })
}

const bookingRepositories = {
    listBooking,
    listBookingForRoom,
    createBooking,
    getBookingById,
    updateBooking
};

export default bookingRepositories;