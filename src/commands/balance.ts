import {
  ApplicationCommandOptionType,
  User,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { prisma } from "../main.js";

@Discord()
export class Balance {
  @Slash({
    description: "View balance of a user",
    name: "balance",
  })
  async balance(
    @SlashOption({
      description: "user to view balance",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: User | null,
    interaction: CommandInteraction
  ): Promise<void> {
    const userId = user ? user.id : interaction.user.id;
    const userBalance = await prisma.user.findUnique({
      where: {
        userId_guildId: {
          guildId: interaction.guildId!,
          userId: userId,
        },
      },
      select: {
        balance: true,
      },
    });

    await interaction.reply({
      content: `User has ${userBalance?.balance || 0} coins`,
      ephemeral: true,
    });
  }
}
