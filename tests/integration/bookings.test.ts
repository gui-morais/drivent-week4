import app, { init } from "@/app"
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createRoomWithNoVacancies, createTicket, createTicketTypeRemote, createTicketTypeWithHotel, createTicketWithoutHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createBooking } from "../factories/bookings-factory";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
})

describe("when token is valid", () => {
    it("should respond with status 404 if user hasn't a booking", async () => {
        const token = await generateValidToken();

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data if user has a valid booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        // const enrollment = await createEnrollmentWithAddress(user);
        // const ticketType = await createTicketTypeWithHotel();
        // const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);


        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            Room: {
                ...room,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            }
        }));
    })
});

describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
});

describe("when token is valid", () => {
    it("should respond with status 400 if no roomId is given", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        
        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    })

    it("should respond with status 404 if roomId is not valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: faker.datatype.number()
        });
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it("should respond with status 403 if choosen room isn't avaliable", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithNoVacancies(hotel.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 403 if user hasn't enrollment",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        // const enrollment = await createEnrollmentWithAddress(user);
        // const ticketType = await createTicketTypeWithHotel();
        // const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 403 if ticket is remote type",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 403 if ticket hasn't hotel booking",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 403 if ticket hasn't be paid",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, "RESERVED");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 200 and booking id if all infos are correctly",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room.id
        });
    
        expect(response.status).toBe(httpStatus.OK);
    })
});

describe("PUT /booking/:bookingId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
});

describe("when token is valid", () => {
    it("should respond with status 400 if a invalid booking id is given",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const response = await server
        .put("/booking/"+faker.datatype.string)
        .set("Authorization", `Bearer ${token}`)
    
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    })

    it("should respond with status 404 if booking id is not valid",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);

        const response = await server
        .put("/booking/"+faker.datatype.number())
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room2.id
        });
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it("should respond with status 400 if no roomId is given", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);
        
        const response = await server
        .put("/booking/"+booking.id)
        .set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    })

    it("should respond with status 404 if roomId is not valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);

        const response = await server
        .put("/booking/"+booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: faker.datatype.number()
        });
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it("should respond with status 403 if choosen room isn't avaliable", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);
        const room2 = await createRoomWithNoVacancies(hotel.id);

        const response = await server
        .put("/booking/"+booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room2.id
        });
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with status 401 if user isn't owner of the booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithNoVacancies(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);
        const user2 = await createUser();
        const booking = await createBooking(user2.id, room.id);

        const response = await server
        .put("/booking/"+booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room2.id
        });
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    })

    it("should respond with status 200 and booking id if all infos are correctly",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const room2 = await createRoomWithHotelId(hotel.id);
        const booking = await createBooking(user.id, room.id);

        const response = await server
        .put("/booking/"+booking.id)
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId: room2.id
        });
    
        expect(response.status).toBe(httpStatus.OK);
    })
});

