import { Server } from "http";
import * as socketIo from "socket.io";
import { Event, ICommonSocketMessage } from "../../../../common/communication/webSocket/socketMessage";
import { ICommonUser } from "../../../../common/communication/webSocket/user";
import { SocketSubscriber } from "./socketSubscriber";

export class SocketHandler {
    private static instance: SocketHandler;

    private io: socketIo.Server;
    private idUsernames: Map<string, string>;
    private subscribers: Map<string, SocketSubscriber[]>;

    public static getInstance(): SocketHandler {
        if (!this.instance) {
            this.instance = new SocketHandler();
        }

        return this.instance;
    }

    public setServer(server: Server): SocketHandler {
        this.io = socketIo(server);
        this.init();

        return this;
    }

    public subscribe(event: Event, subscriber: SocketSubscriber): void {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        const sub: SocketSubscriber[] = this.subscribers.get(event) as SocketSubscriber[];
        sub.push(subscriber);
    }

    private constructor() {
        this.subscribers = new Map<string, SocketSubscriber[]>();
    }

    private init(): void {
        this.idUsernames = new Map<string, string>();
        this.io.on(Event.UserConnected, (socket: SocketIO.Socket) => {
            this.idUsernames.set(socket.id, "");

            this.setEventListeners(socket);
        });
    }

    private setEventListeners(socket: SocketIO.Socket): void {
        this.onUsernameConnected(socket);
        this.onUserDisconnected(socket);
        this.onPlaySoloGame(socket);
    }

    private onUsernameConnected(socket: SocketIO.Socket): void {
        socket.on(Event.UserConnected, (message: ICommonSocketMessage) => {
            const username: string = (message.data as ICommonUser).username;
            this.addUsername(socket.id, username);
            this.notifySubsribers(Event.UserConnected, message, username);
        });
    }

    private onUserDisconnected(socket: SocketIO.Socket): void {
        socket.on(Event.UserDisconnected, () => {
            const user: ICommonUser = {
                username: this.getUsername(socket.id),
            };
            this.removeUsername(socket.id);
            socket.broadcast.emit(Event.UserDisconnected, user);
        });
    }

    private onPlaySoloGame(socket: SocketIO.Socket): void {
        socket.on(Event.PlaySoloGame, (message: ICommonSocketMessage) => {
            this.notifySubsribers(Event.PlaySoloGame, message, this.getUsername(socket.id));
        });
    }

    private notifySubsribers(event: Event, message: ICommonSocketMessage, username: string): void {
        if (this.subscribers.has(event)) {
            const subscribers: SocketSubscriber[] = this.subscribers.get(event) as SocketSubscriber[];
            subscribers.forEach((subscriber: SocketSubscriber) => {
                subscriber.notify(event, message, username);
            });
        }
    }

    private addUsername(username: string, socketId: string): void {
        this.idUsernames.set(socketId, username);
    }

    private getUsername(socketId: string): string {
        return (this.idUsernames.get(socketId)) as string;
    }

    private removeUsername(socketId: string): void {
        this.idUsernames.delete(socketId);
    }
}
