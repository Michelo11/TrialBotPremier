import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { prisma } from "../main.js";

@Discord()
export class Daily {
  @Slash({
    description: "Claim your daily reward",
    name: "daily",
  })
  async daily(interaction: CommandInteraction): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {
        userId_guildId: {
          guildId: interaction.guildId!,
          userId: interaction.user.id,
        },
      },
      select: {
        lastDaily: true,
      },
    });

    if (user?.lastDaily && user.lastDaily.getTime() + 86400000 > Date.now()) {
      await interaction.reply({
        content: `You can claim your next daily reward in ${new Date(
          user.lastDaily.getTime() + 86400000
        ).toLocaleString()}`,
        ephemeral: true,
      });
      return;
    }

    await prisma.user.upsert({
      where: {
        userId_guildId: {
          guildId: interaction.guildId!,
          userId: interaction.user.id,
        },
      },
      update: {
        lastDaily: new Date(),
      },
      create: {
        userId: interaction.user.id,
        guildId: interaction.guildId!,
        lastDaily: new Date(),
        balance: parseInt(process.env.DEFAULT_BALANCE!),
      },
    });

    await interaction.reply({
      content: "You have claimed your daily reward",
      ephemeral: true,
    });
  }
}
