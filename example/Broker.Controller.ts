import {
    ThorIO,CanInvoke,CanSet,ControllerProperties
} from "../src/thor-io"

class InstantMessage
{
    text: string;
}

class PeerConnection {
        context:string;
        peerId: string;
        constructor(context?:string,peerId?:string){
            this.context = context;
            this.peerId = peerId;
        }
}
class Signal {
    recipient:string;
    sender:string;
    message:string
    constructor(recipient:string,sender:string,message:string){
        this.recipient = recipient;
        this.sender = sender;
        this.message = message;
    }
}
@ControllerProperties("broker",false)
export class BrokerController  extends ThorIO.Controller
{
    public Connections:Array<PeerConnection>;
    public Peer:PeerConnection;
    public localPeerId:string;

    private createId():string{
        return Math.random().toString(36).substring(2);
    };
    
    constructor(connection:ThorIO.Connection){
        super(connection);
        this.alias = "broker";
        this.Connections = new Array<PeerConnection>();    
    }
    onopen(){
        this.Peer = new PeerConnection(this.createId(),this.connection.id);
        this.invoke(this.Peer,"contextCreated",this.alias);
    }

    @CanInvoke(true)
    instantMessage(data: any, topic: string, controller: string) {
        var expression = (pre: BrokerController) => {
            return pre.Peer.context >= this.Peer.context
        };
        this.invokeTo(expression, data, "instantMessage", this.alias);
    }
  
    @CanInvoke(true)
    changeContext(change:PeerConnection){
        this.Peer.context = change.context;
        this.invoke(this.Peer,"contextChanged",this.alias);
    }
    @CanInvoke(true)
    contextSignal(signal:Signal){
            let expression = (pre: BrokerController) => {
            return pre.connection.id === signal.recipient;
        };
        this.invokeTo(expression,signal,"contextSignal",this.alias);
    }
    @CanInvoke(true)
    connectContext(){
        let connections = this.getPeerConnections(this.Peer).map( (p:BrokerController) => {return p.Peer });
         this.invoke(connections,"connectTo",this.alias);
    }
 
    getPeerConnections(peerConnetion:PeerConnection):Array<BrokerController>{
            let match = this.findOn(this.alias,(pre:BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
                });
        return match;
    }
}