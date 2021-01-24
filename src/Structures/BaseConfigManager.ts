import hyperion, {roles} from "../main";

export default abstract class BaseConfigManager<T> {
    role: roles
    Hyperion: hyperion;
    path: string;
    constructor(data: Partial<BaseConfigManager<T>>, Hyperion: hyperion, path: string) {
        if(!data.role){throw new Error("Manager name or role is not provided");}
        this.role = data.role;
        this.Hyperion = Hyperion;
        this.path = path;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    format(data: Partial<T>, update?: boolean): T {
        throw new Error("unimplemented format");
    }

    save(data: Partial<T>, update?: true): T {
        throw new Error("nimplemented save");
    }
}