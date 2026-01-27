import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";

export class UserRepository {
    /**
     * Professional Repository Pattern implementation for User entity.
     * This isolates the database (Prisma) from the rest of the application,
     * following the Dependency Inversion Principle.
     */

    static async findById(id: string) {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    static async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    static async getFullUser(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                paymentRequests: {
                    orderBy: { createdAt: "desc" },
                },
                readHistory: {
                    orderBy: { updatedAt: "desc" },
                    include: {
                        chapter: {
                            include: {
                                manga: true
                            }
                        }
                    }
                },
                likes: {
                    include: {
                        manga: true
                    }
                }
            }
        });
    }

    static async count() {
        return prisma.user.count();
    }

    static async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    static async countSubscribed() {
        return prisma.user.count({
            where: {
                isSubscribed: true,
                subscriptionEnd: { gt: new Date() }
            }
        });
    }
}
