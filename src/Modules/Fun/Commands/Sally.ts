import hyperion, {CommandContext, CommandResponse} from "../../../main";
import Command from "../../../Structures/Command";

export const sallys = [
    "https://cdn.discordapp.com/attachments/225182513465786369/660282554649149490/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/660188937704308778/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/660123365570510878/image0.jpg",
    "https://cdn.discordapp.com/attachments/648349778429739009/659358356376649728/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/659037176977162261/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/658698790710018065/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/658324331792695296/image0.jpg",
    "https://cdn.discordapp.com/attachments/648349778429739009/655913589785493534/sally8.JPG",
    "https://cdn.discordapp.com/attachments/648349778429739009/655913462177857567/sally11.JPG",
    "https://cdn.discordapp.com/attachments/225182513465786369/651987588999020544/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/642381074932039681/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/641096254558044161/image0.jpg",
    "https://media.discordapp.net/attachments/225182513465786369/664221237844770826/image0.jpg",
    "https://cdn.discordapp.com/attachments/410646817756151808/664847101187981322/image0.jpg",
    "https://cdn.discordapp.com/attachments/668889812333494273/694379108590682182/image3.jpg",
    "https://cdn.discordapp.com/attachments/668889812333494273/694379106430746714/image0.jpg",
    "https://cdn.discordapp.com/attachments/668889812333494273/691323183688843314/image0.jpg",
    "https://media.discordapp.net/attachments/698588216001036400/726518399823380490/cute.jpg",
    "https://media.discordapp.net/attachments/698588216001036400/726518457629147176/cute.jpg",
    "https://media.discordapp.net/attachments/698588216001036400/726518356659798046/cute.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/727656964703780894/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/727542599426244668/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/727182389511585832/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/726453042353799178/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/725733922457255936/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/724652180648493096/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/722462569649930300/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/721762743840931921/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/720701476787454033/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/719567818282107040/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/717362801840095322/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/717051025378377878/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/713850214175342592/image0.jpg",
    "https://cdn.discordapp.com/attachments/691695967615057990/707967184646701127/image0.jpg",
    "https://cdn.discordapp.com/attachments/691695967615057990/707968602405470279/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/704392957759062056/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/776478008692965376/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/775955563867144192/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/775931425718665236/image0.jpg",
    "https://cdn.discordapp.com/attachments/250829530346815488/774644970287923290/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/772824567189602314/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/771744802005581865/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/771077527418175538/image0.jpg",
    "https://cdn.discordapp.com/attachments/250829530346815488/769203257674956800/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/769200842217357372/image0.jpg",
    "https://cdn.discordapp.com/attachments/250829530346815488/766109797795627028/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/765746156080463882/image0.jpg",
    "https://cdn.discordapp.com/attachments/225182513465786369/764322144321536070/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/763745447960641536/image0.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/763745448611545118/image1.jpg",
    "https://cdn.discordapp.com/attachments/513025490760630272/763745449084715048/image2.jpg"
];

export default class Sally extends Command {
    constructor(Hyperion: hyperion, path: string) {
        super({
            name: "sally",
            module: "fun",
            help: {
                detail: "Sends Sally, a cute chocolate lab",
                usage: "{prefix}sally"
            }
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        return {success: true, literal: true, content: {
            embed: {
                description: "Found Sally!!!",
                color: this.Hyperion.colors.default,
                timestamp: new Date,
                footer: {text: "Sally uwu"},
                image: {url: sallys[(Math.floor(Math.random() * sallys.length))]}
            }
        }};
    }
}