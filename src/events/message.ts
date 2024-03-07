import { Client } from "discord.js";
import { Discord, On, ArgsOf } from "discordx";
import { prisma } from "../main.js";

@Discord()
export class Message {
  @On()
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    if (message.author.bot) return;

    await prisma.user.upsert({
      where: {
        userId_guildId: {
          guildId: message.guildId!,
          userId: message.author.id,
        },
      },
      update: {
        balance: {
          increment: 1,
        },
      },
      create: {
        guildId: message.guildId!,
        userId: message.author.id,
        balance: parseInt(process.env.DEFAULT_BALANCE!) + 1,
      },
    });
  }
}
