function testLight(req, resp){
    var delay=100;
    ClearBlade.init({request:req});
	if (ClearBlade.isEdge()) {
	    for (var i=0; i<20; i++) {
            sendGet(uri="http://192.168.1.240/api/control?color=87654&buzzer=0&flash=0");
            wait(delay);
            sendGet(uri="http://192.168.1.240/api/control?color=48765&buzzer=0&flash=0");
            wait(delay);
            sendGet(uri="http://192.168.1.240/api/control?color=54876&buzzer=0&flash=0");
            wait(delay);
            sendGet(uri="http://192.168.1.240/api/control?color=65487&buzzer=0&flash=0");
            wait(delay);
            sendGet(uri="http://192.168.1.240/api/control?color=76548&buzzer=0&flash=0");
            wait(delay);
	    }   
	} else
	resp.success("Code can only execute on an edge");
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function sendGet(uri) {
     d = Q.defer();
    //get a Requests object
	var requestObject = Requests();
    var options = {
        uri:uri
    };
    requestObject.get(options,function(err, data){
        if(err){
             d.reject("Unable to HTTP GET: " + JSON.stringify(err));
        }
         d.resolve(data);
    });
    return d.promise;
}
