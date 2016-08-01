import {
     ThorIO,CanInvoke,CanSet,ControllerProperties
} from "../src/thor-io"

// create a module for fale storage
module Fake {
  export class Storage {
    static Messages : any[] = []; //persist any kind of messages.
 }
}


@ControllerProperties("datasync",false)
export class DataSync extends ThorIO.Controller{
    private Person: any;
    constructor(client: ThorIO.Connection){
        super(client);
    
    }
}


export class ExampleController extends ThorIO.Controller {
    public alias: string;
    public clientInfo: any;

    
    public room: string;
    constructor(client: ThorIO.Connection) {

        super(client);
    
        this.room = "foo"; // this is used the the expression in the invokeTo call in send Message
        // properties such as "room" can be modified by calling i.e .SetProperty("room","bar") in the 
        // client.
        this.alias = "example";
    }
    sendMessage(data, controller, topic) {
        
        // add the message inbound to the fake 
        Fake.Storage.Messages.push(data);
        
        this.invoke(data, "chatMessage-one", this.alias); 
        this.invokeToAll(data, "chatMessage-all", this.alias);

        
        this.invokeTo((pre:ExampleController)=> {return pre.room === "foo"},
             data, "chatMessage-to", this.alias);
        this.publishToAll(data, "mySub", this.alias);
    }
    onopen() {
        // send the "history" preserved in the fake storage
        this.invoke(Fake.Storage.Messages,"history",this.alias);
    }
    onclose() {
    }
}