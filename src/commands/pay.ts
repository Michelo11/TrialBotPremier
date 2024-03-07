import {
  ApplicationCommandOptionType,
  User,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { prisma } from "../main.js";

@Discord()
export class Pay {
  @Slash({
    description: "Pay another user some money",
    name: "pay",
  })
  async pay(
    @SlashOption({
      description: "user to pay",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      description: "amount to pay",
      name: "amount",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    interaction: CommandInteraction
  ): Promise<void> {
    if (amount <= 0) {
      await interaction.reply({
        content: "You can't pay a negative amount",
        ephemeral: true,
      });
      return;
    }

    if (interaction.user.id === user.id) {
      await interaction.reply({
        content: "You can't pay yourself",
        ephemeral: true,
      });
      return;
    }

    const sender = await prisma.user.findUnique({
      where: {
        userId_guildId: {
          guildId: interaction.guildId!,
          userId: interaction.user.id,
        },
      },
      select: {
        balance: true,
      },
    });

    if (!sender || sender.balance < amount) {
      await interaction.reply({
        content: "You don't have enough money",
        ephemeral: true,
      });
      return;
    }

    await prisma.$transaction([
      prisma.user.upsert({
        where: {
          userId_guildId: {
            guildId: interaction.guildId!,
            userId: user.id,
          },
        },
        update: {
          balance: {
            decrement: amount,
          },
        },
        create: {
          userId: user.id,
          guildId: interaction.guildId!,
          balance: amount,
        },
      }),

      prisma.user.update({
        where: {
          userId_guildId: {
            guildId: interaction.guildId!,
            userId: interaction.user.id,
          },
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
    ]);

    await interaction.reply({
      content: `You have paid ${user.username} ${amount}`,
      ephemeral: true,
    });
  }
}
