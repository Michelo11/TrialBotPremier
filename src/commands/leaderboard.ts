import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { prisma } from "../main.js";

@Discord()
export class Leaderboard {
  @Slash({
    description: "View the leaderboard of the server",
    name: "leaderboard",
  })
  async leaderboard(interaction: CommandInteraction): Promise<void> {
    const users = await prisma.user.findMany({
      where: {
        guildId: interaction.guildId!,
      },
      select: {
        balance: true,
        userId: true,
      },
    });

    if (!users.length) {
      await interaction.reply({
        content: "No users found",
        ephemeral: true,
      });
      return;
    }

    users.sort((a, b) => b.balance - a.balance);
    const topUsers = users.slice(0, 10);
    const topUsersString = topUsers
      .map((user, index) => `${index + 1}. <@${user.userId}> - ${user.balance}`)
      .join("\n");

    await interaction.reply({
      content: `**Leaderboard**\n${topUsersString}`,
      ephemeral: true,
    });
  }
}
